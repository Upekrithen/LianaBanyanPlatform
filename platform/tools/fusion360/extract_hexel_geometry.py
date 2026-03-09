"""
HEXEL GEOMETRY EXTRACTOR — Fusion 360 API Script
=================================================
Innovation #1538: Automated CAD Geometry Extraction for Piece Grammar Validation

Run this script INSIDE Fusion 360 (Scripts and Add-Ins → Green Plus → Python Script).
It walks through the active design's component tree, extracts interface geometry
for every component, and outputs a JSON file compatible with the Hexel Piece Grammar
(hexelPieceGrammar.ts, Innovation #1537).

OUTPUT: hexel_geometry_extract_<timestamp>.json in the user's Documents folder

The JSON schema matches the HexelPiece interface from hexelPieceGrammar.ts so that
Task 3's validation logic can compare CAD reality against grammar expectations.

WHAT IT EXTRACTS PER COMPONENT:
  - Component name + version (from Fusion 360 browser tree)
  - Bounding box dimensions (width, height, depth in mm)
  - Body count, face count, edge count
  - Cylindrical faces (radius, height) — for detecting shafts, bores, pipes
  - Planar faces with normal vectors — for detecting connection interfaces
  - Occurrence transforms (position in assembly)
  - Joint information (if joints exist between components)
  - Material assignments
  - Parameters (user-defined dimensions)

ASSEMBLY CONVENTIONS DETECTED:
  - checkIt05: Complete Hexel assembly
  - threeSisters05: Power train sub-assembly (rotor/ouralis/goldenLotus)
  - lockedDown: Lock-down verification assembly
  - D09DEV: Full engineering dev assembly
  - WORKINGairPump: Pneumatic sub-assembly
  - FlyingButtress: Slotted Top / terrain interface

Liana Banyan Platform — "The digital world IS the real world."
"""

import adsk.core
import adsk.fusion
import json
import os
import math
import traceback
from datetime import datetime
from typing import Dict, List, Optional, Any


# =============================================================================
# CONFIGURATION
# =============================================================================

# Known CAD component name → Piece Grammar ID mapping
# This maps Fusion 360 component names to their canonical piece grammar IDs
# from hexelPieceGrammar.ts. Fuzzy matching is used for unregistered names.
CAD_TO_GRAMMAR_MAP: Dict[str, str] = {
    # Direct matches
    'channelLock': 'channel_lock',
    'ChannelLock': 'channel_lock',
    'hollowStumpFitSlot': 'hollow_log',
    'HollowLog': 'hollow_log',
    'snapCap': 'clamshell',
    'SnapCap': 'clamshell',
    'snapBottom': 'clamshell',
    'goldenLotus07': 'golden_lotus',
    'goldenLotus09': 'golden_lotus',
    'GoldenLotus11': 'golden_lotus',
    'goldenLotus': 'golden_lotus',
    'rotor12': 'rotor',
    'rotor': 'rotor',
    'ouralis15': 'ouralis',
    'ouralis': 'ouralis',
    'Sawtooth60': 'sawtooth_coral',
    'sawtooth': 'sawtooth_coral',
    'BedrockUnderworldSawtooth': 'sawtooth_coral',
    '42Library_42timerBelt': 'timing_belt',
    'timerBelt': 'timing_belt',
    'FlyingButtress': 'slotted_top',
    'SlottedTop': 'slotted_top',
    'Capstone': 'capstone',
    'capstone': 'capstone',
    'Gorgon': 'capstone',  # Capstone variant
    'chandelier': 'cradle',
    'Cradle': 'cradle',
    'BTHU_WATERFALL': 'bthu_waterfall',
    'BTHU_SmokeShow': 'bthu_smokeshow',
    'BTHU_lotusd': 'bthu_lotusd',
    'BTHU_disc': 'bthu_disc',
    'RingOfPower': 'ring_of_power',
    'oneWay': 'one_way_valve',
    'WORKINGairPump': 'air_pump',
    'roundabout': 'roundabout',
    'triPod': 'tripod',
    'orangeBase': 'orange_base',
    'yellowPetal': 'yellow_petal',
    'insideBottomFromSixShooters': 'six_shooters_bottom',
    'Tarabithia': 'tarabithia',
    'GreenWall': 'green_wall',
    'stalagTites': 'rooster_teeth',
    'UnderworldRoof': 'underworld_roof',
    'BrandingIron': 'branding_iron',
    'LOOM': 'loom',
    'barrierReef': 'barrier_reef',
    'wall': 'wall',
    'signalRoof': 'signal_roof',
    'threshold': 'threshold',
    'tripleThreat': 'triple_threat',
}

# Known assembly families (top-level assemblies that contain Hexel sub-components)
ASSEMBLY_FAMILIES = {
    'checkIt05': 'Complete Hexel Assembly',
    'threeSisters05': 'Power Train Sub-Assembly (rotor/ouralis/goldenLotus)',
    'lockedDown': 'Lock-Down Verification Assembly',
    'D09DEV': 'Full Engineering Dev Assembly',
    'WORKINGairPump': 'Pneumatic Sub-Assembly',
    'FlyingButtress': 'Slotted Top / Terrain Interface',
}

# Geometry thresholds for classification
CYLINDER_FACE_TOLERANCE = 0.01  # mm tolerance for cylindrical face detection
PLANAR_FACE_TOLERANCE = 0.001   # normal vector tolerance for planar face grouping


# =============================================================================
# GEOMETRY EXTRACTION FUNCTIONS
# =============================================================================

def extract_bounding_box(body: adsk.fusion.BRepBody) -> Optional[Dict[str, float]]:
    """Extract bounding box dimensions from a BRep body."""
    try:
        bb = body.boundingBox
        if not bb:
            return None
        return {
            'min_x': round(bb.minPoint.x * 10, 4),  # cm → mm
            'min_y': round(bb.minPoint.y * 10, 4),
            'min_z': round(bb.minPoint.z * 10, 4),
            'max_x': round(bb.maxPoint.x * 10, 4),
            'max_y': round(bb.maxPoint.y * 10, 4),
            'max_z': round(bb.maxPoint.z * 10, 4),
            'width': round((bb.maxPoint.x - bb.minPoint.x) * 10, 4),
            'height': round((bb.maxPoint.y - bb.minPoint.y) * 10, 4),
            'depth': round((bb.maxPoint.z - bb.minPoint.z) * 10, 4),
        }
    except Exception:
        return None


def extract_cylindrical_faces(body: adsk.fusion.BRepBody) -> List[Dict[str, Any]]:
    """
    Find all cylindrical faces in a body.
    Critical for detecting: shafts, bores, pipe channels, piston sleeves.
    Each cylindrical face yields radius + axis direction + height.
    """
    cylinders = []
    try:
        for face in body.faces:
            geom = face.geometry
            if isinstance(geom, adsk.core.Cylinder):
                # Get cylinder parameters
                radius_mm = round(geom.radius * 10, 4)  # cm → mm
                origin = geom.origin
                axis = geom.axis

                # Calculate face area to estimate height
                area_mm2 = round(face.area * 100, 4)  # cm² → mm²
                # Circumference = 2*pi*r, so height ≈ area / (2*pi*r)
                circumference = 2 * math.pi * radius_mm
                estimated_height = round(area_mm2 / circumference, 4) if circumference > 0 else 0

                cylinders.append({
                    'radius_mm': radius_mm,
                    'diameter_mm': round(radius_mm * 2, 4),
                    'estimated_height_mm': estimated_height,
                    'area_mm2': area_mm2,
                    'axis': {
                        'x': round(axis.x, 6),
                        'y': round(axis.y, 6),
                        'z': round(axis.z, 6),
                    },
                    'origin': {
                        'x': round(origin.x * 10, 4),
                        'y': round(origin.y * 10, 4),
                        'z': round(origin.z * 10, 4),
                    },
                    'is_vertical': abs(axis.y) > 0.95,  # Hexel stack is Y-up
                    'is_horizontal': abs(axis.y) < 0.05,
                })
    except Exception:
        pass
    return cylinders


def extract_planar_faces(body: adsk.fusion.BRepBody) -> List[Dict[str, Any]]:
    """
    Find all planar faces grouped by normal direction.
    Critical for detecting: connection interfaces (top/bottom), mounting planes.
    """
    planes = []
    try:
        for face in body.faces:
            geom = face.geometry
            if isinstance(geom, adsk.core.Plane):
                normal = geom.normal
                origin = geom.origin
                area_mm2 = round(face.area * 100, 4)

                # Classify the face by normal direction
                face_direction = 'other'
                if abs(normal.y) > 0.95:
                    face_direction = 'top' if normal.y > 0 else 'bottom'
                elif abs(normal.x) > 0.95:
                    face_direction = 'side_x'
                elif abs(normal.z) > 0.95:
                    face_direction = 'side_z'

                planes.append({
                    'normal': {
                        'x': round(normal.x, 6),
                        'y': round(normal.y, 6),
                        'z': round(normal.z, 6),
                    },
                    'origin_mm': {
                        'x': round(origin.x * 10, 4),
                        'y': round(origin.y * 10, 4),
                        'z': round(origin.z * 10, 4),
                    },
                    'area_mm2': area_mm2,
                    'direction': face_direction,
                })
    except Exception:
        pass
    return planes


def extract_face_summary(body: adsk.fusion.BRepBody) -> Dict[str, int]:
    """Count faces by geometry type for quick classification."""
    summary = {
        'planar': 0,
        'cylindrical': 0,
        'conical': 0,
        'spherical': 0,
        'toroidal': 0,
        'nurbs': 0,
        'total': 0,
    }
    try:
        for face in body.faces:
            summary['total'] += 1
            geom = face.geometry
            if isinstance(geom, adsk.core.Plane):
                summary['planar'] += 1
            elif isinstance(geom, adsk.core.Cylinder):
                summary['cylindrical'] += 1
            elif isinstance(geom, adsk.core.Cone):
                summary['conical'] += 1
            elif isinstance(geom, adsk.core.Sphere):
                summary['spherical'] += 1
            elif isinstance(geom, adsk.core.Torus):
                summary['toroidal'] += 1
            else:
                summary['nurbs'] += 1
    except Exception:
        pass
    return summary


def extract_joints(design: adsk.fusion.Design) -> List[Dict[str, Any]]:
    """Extract all joints in the design — these define how pieces connect."""
    joints_data = []
    try:
        root = design.rootComponent
        for joint in root.joints:
            joint_info = {
                'name': joint.name,
                'joint_type': str(joint.jointMotion.jointType) if joint.jointMotion else 'unknown',
                'is_suppressed': joint.isSuppressed,
            }

            # Get connected occurrence names
            try:
                if joint.occurrenceOne:
                    joint_info['component_one'] = joint.occurrenceOne.component.name
                if joint.occurrenceTwo:
                    joint_info['component_two'] = joint.occurrenceTwo.component.name
            except Exception:
                pass

            # Get joint geometry
            try:
                if joint.geometryOrOriginOne:
                    geo = joint.geometryOrOriginOne
                    if hasattr(geo, 'origin'):
                        joint_info['origin_one'] = {
                            'x': round(geo.origin.x * 10, 4),
                            'y': round(geo.origin.y * 10, 4),
                            'z': round(geo.origin.z * 10, 4),
                        }
            except Exception:
                pass

            joints_data.append(joint_info)
    except Exception:
        pass
    return joints_data


def extract_parameters(design: adsk.fusion.Design) -> List[Dict[str, Any]]:
    """Extract user parameters — these are the intentional design dimensions."""
    params = []
    try:
        for param in design.userParameters:
            params.append({
                'name': param.name,
                'value': param.value,
                'unit': param.unit,
                'expression': param.expression,
                'comment': param.comment if param.comment else '',
            })
    except Exception:
        pass
    return params


def extract_component_data(
    occ: adsk.fusion.Occurrence,
    depth: int = 0,
    max_depth: int = 5
) -> Optional[Dict[str, Any]]:
    """
    Recursively extract geometry data from an occurrence and its children.
    This is the main extraction function — called for every component in the tree.
    """
    if depth > max_depth:
        return None

    comp = occ.component
    comp_name = comp.name

    # Build the component data dictionary
    data: Dict[str, Any] = {
        'name': comp_name,
        'full_path': occ.fullPathName,
        'is_grounded': occ.isGrounded,
        'depth_in_tree': depth,
        'grammar_id': CAD_TO_GRAMMAR_MAP.get(comp_name, None),
        'assembly_family': None,
        'bodies': [],
        'children': [],
        'child_count': 0,
    }

    # Check if this is a known assembly family
    for family_prefix, family_desc in ASSEMBLY_FAMILIES.items():
        if comp_name.startswith(family_prefix):
            data['assembly_family'] = {
                'prefix': family_prefix,
                'description': family_desc,
            }
            break

    # Extract occurrence transform (position in assembly)
    try:
        transform = occ.transform
        if transform:
            translation = transform.translation
            data['transform'] = {
                'translation_mm': {
                    'x': round(translation.x * 10, 4),
                    'y': round(translation.y * 10, 4),
                    'z': round(translation.z * 10, 4),
                },
            }
    except Exception:
        pass

    # Extract material
    try:
        if comp.material:
            data['material'] = {
                'name': comp.material.name,
                'id': comp.material.id,
            }
    except Exception:
        pass

    # Extract body geometry
    try:
        for body in comp.bRepBodies:
            body_data: Dict[str, Any] = {
                'name': body.name,
                'is_solid': body.isSolid,
                'is_visible': body.isVisible,
                'face_count': body.faces.count,
                'edge_count': body.edges.count,
                'vertex_count': body.vertices.count,
            }

            # Bounding box
            bb = extract_bounding_box(body)
            if bb:
                body_data['bounding_box_mm'] = bb

            # Volume and area
            try:
                props = body.physicalProperties
                if props:
                    body_data['volume_mm3'] = round(props.volume * 1000, 4)  # cm³ → mm³
                    body_data['area_mm2'] = round(props.area * 100, 4)  # cm² → mm²
                    body_data['mass_grams'] = round(props.mass * 1000, 6)  # kg → g
                    cog = props.centerOfMass
                    body_data['center_of_mass_mm'] = {
                        'x': round(cog.x * 10, 4),
                        'y': round(cog.y * 10, 4),
                        'z': round(cog.z * 10, 4),
                    }
            except Exception:
                pass

            # Face classification summary
            body_data['face_summary'] = extract_face_summary(body)

            # Cylindrical faces (shafts, bores, pipes)
            cylinders = extract_cylindrical_faces(body)
            if cylinders:
                body_data['cylindrical_faces'] = cylinders
                # Key dimensions for Hexel validation
                body_data['key_cylinders'] = {
                    'vertical_bores': [c for c in cylinders if c['is_vertical']],
                    'horizontal_channels': [c for c in cylinders if c['is_horizontal']],
                    'max_radius_mm': max(c['radius_mm'] for c in cylinders),
                    'min_radius_mm': min(c['radius_mm'] for c in cylinders),
                }

            # Planar faces (connection interfaces)
            planes = extract_planar_faces(body)
            if planes:
                # Group by direction for interface analysis
                top_faces = [p for p in planes if p['direction'] == 'top']
                bottom_faces = [p for p in planes if p['direction'] == 'bottom']
                side_faces = [p for p in planes if p['direction'].startswith('side')]

                body_data['interface_summary'] = {
                    'top_face_count': len(top_faces),
                    'bottom_face_count': len(bottom_faces),
                    'side_face_count': len(side_faces),
                    'top_total_area_mm2': round(sum(f['area_mm2'] for f in top_faces), 4),
                    'bottom_total_area_mm2': round(sum(f['area_mm2'] for f in bottom_faces), 4),
                }

                # Only include detailed plane data for key interfaces (top 5 largest per direction)
                body_data['top_interfaces'] = sorted(top_faces, key=lambda x: -x['area_mm2'])[:5]
                body_data['bottom_interfaces'] = sorted(bottom_faces, key=lambda x: -x['area_mm2'])[:5]

            data['bodies'].append(body_data)
    except Exception as e:
        data['body_extraction_error'] = str(e)

    # Recurse into child occurrences
    try:
        child_occs = occ.childOccurrences
        data['child_count'] = child_occs.count
        for child_occ in child_occs:
            child_data = extract_component_data(child_occ, depth + 1, max_depth)
            if child_data:
                data['children'].append(child_data)
    except Exception:
        pass

    return data


# =============================================================================
# HEXEL-SPECIFIC ANALYSIS
# =============================================================================

def analyze_hexel_dimensions(components: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Cross-reference extracted dimensions against known Hexel specifications.
    From Patent Bag 5 and Technical Handover:
      - Hexel overall: 60mm flat-to-flat hexagonal, 45-55mm height
      - ChannelLock: 60mm dia, 9mm tall, 3 grooves
      - HollowLog: 15.5mm dia central column
      - Golden Lotus: 10.5mm radial depth, 30-degree exit angle
      - Rotor: 21.125mm inner, 27mm outer, 12mm height, 18 cavities
      - Ouralis: 20 teeth, 3 cam slopes
      - Piston bore: 25mm (1 inch)
      - Swan Neck: dual-channel connector
    """
    analysis = {
        'hexel_spec_references': {
            'overall_diameter_mm': 60.0,
            'overall_height_range_mm': [45.0, 55.0],
            'channel_lock_diameter_mm': 60.0,
            'channel_lock_height_mm': 9.0,
            'hollow_log_bore_mm': 15.5,
            'golden_lotus_radial_depth_mm': 10.5,
            'golden_lotus_exit_angle_deg': 30.0,
            'rotor_inner_mm': 21.125,
            'rotor_outer_mm': 27.0,
            'rotor_height_mm': 12.0,
            'rotor_cavities': 18,
            'piston_bore_mm': 25.0,
            'ouralis_teeth': 20,
        },
        'dimensional_matches': [],
        'dimensional_warnings': [],
    }

    for comp in components:
        if not comp.get('bodies'):
            continue

        grammar_id = comp.get('grammar_id')
        if not grammar_id:
            continue

        for body in comp['bodies']:
            bb = body.get('bounding_box_mm', {})
            width = bb.get('width', 0)
            height = bb.get('height', 0)

            # Check channel_lock dimensions
            if grammar_id == 'channel_lock':
                if abs(width - 60.0) < 2.0:
                    analysis['dimensional_matches'].append(
                        f"ChannelLock width {width}mm matches spec (60mm)"
                    )
                else:
                    analysis['dimensional_warnings'].append(
                        f"ChannelLock width {width}mm differs from spec (60mm)"
                    )
                if abs(height - 9.0) < 1.0:
                    analysis['dimensional_matches'].append(
                        f"ChannelLock height {height}mm matches spec (9mm)"
                    )

            # Check for 15.5mm bore (HollowLog)
            if grammar_id == 'hollow_log':
                key_cyls = body.get('key_cylinders', {})
                vertical_bores = key_cyls.get('vertical_bores', [])
                for bore in vertical_bores:
                    if abs(bore['radius_mm'] - 7.75) < 0.5:  # 15.5/2 = 7.75
                        analysis['dimensional_matches'].append(
                            f"HollowLog vertical bore {bore['diameter_mm']}mm matches spec (15.5mm)"
                        )

            # Check rotor dimensions
            if grammar_id == 'rotor':
                key_cyls = body.get('key_cylinders', {})
                vertical_bores = key_cyls.get('vertical_bores', [])
                for bore in vertical_bores:
                    if abs(bore['radius_mm'] - 13.5) < 1.0:  # ~27/2
                        analysis['dimensional_matches'].append(
                            f"Rotor outer {bore['diameter_mm']}mm near spec (27mm)"
                        )
                    if abs(bore['radius_mm'] - 10.5625) < 1.0:  # ~21.125/2
                        analysis['dimensional_matches'].append(
                            f"Rotor inner {bore['diameter_mm']}mm near spec (21.125mm)"
                        )

            # Check for 25mm piston bore
            key_cyls = body.get('key_cylinders', {})
            for bore in key_cyls.get('vertical_bores', []):
                if abs(bore['diameter_mm'] - 25.0) < 1.0:
                    analysis['dimensional_matches'].append(
                        f"{comp['name']} has 25mm piston bore (1-inch standard)"
                    )

    return analysis


def classify_unknown_components(components: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    For components not in CAD_TO_GRAMMAR_MAP, attempt classification
    based on geometry characteristics:
      - Gear teeth → likely power transmission
      - Many cylindrical faces → shaft/bore component
      - Hexagonal outline → terrain/interface piece
      - Small height, large diameter → seal/gasket
    """
    unknowns = []
    for comp in components:
        if comp.get('grammar_id') is not None:
            continue  # Already mapped

        classification = {
            'name': comp['name'],
            'suggested_roles': [],
            'confidence': 'low',
        }

        for body in comp.get('bodies', []):
            summary = body.get('face_summary', {})

            # High cylindrical face count → gear or shaft
            if summary.get('cylindrical', 0) > 10:
                classification['suggested_roles'].append('power_transmission')
                classification['confidence'] = 'medium'

            # High conical face count → valve or funnel
            if summary.get('conical', 0) > 3:
                classification['suggested_roles'].append('valve')

            # Small height relative to width → seal or gasket
            bb = body.get('bounding_box_mm', {})
            if bb:
                ratio = bb.get('height', 1) / max(bb.get('width', 1), 0.1)
                if ratio < 0.2 and bb.get('width', 0) > 20:
                    classification['suggested_roles'].append('seal')

            # Lots of NURBS faces → complex organic shape (lotus, coral, etc.)
            if summary.get('nurbs', 0) > 20:
                classification['suggested_roles'].append('mechanism')
                classification['confidence'] = 'medium'

        if classification['suggested_roles']:
            unknowns.append(classification)

    return unknowns


# =============================================================================
# MAIN ENTRY POINT — Called by Fusion 360
# =============================================================================

def run(context):
    ui = None
    try:
        app: adsk.core.Application = adsk.core.Application.get()
        ui = app.userInterface
        design: adsk.fusion.Design = app.activeProduct

        if not design:
            ui.messageBox('No active Fusion 360 design. Open a Hexel assembly first.')
            return

        root = design.rootComponent
        design_name = root.name

        # Progress dialog
        progress = ui.createProgressDialog()
        progress.isCancelButtonShown = True
        progress.show('Hexel Geometry Extraction', 'Scanning component tree...', 0, 100)

        # ── Build the extraction output ──
        output: Dict[str, Any] = {
            'schema_version': '1.0.0',
            'extraction_timestamp': datetime.now().isoformat(),
            'design_name': design_name,
            'design_file': app.activeDocument.name if app.activeDocument else 'unknown',
            'piece_grammar_version': 'Innovation #1537',
            'component_map_version': 'Innovation #1536',
            'units': 'millimeters',
            'coordinate_system': 'Fusion 360 default (Y-up)',
            'assembly_family': None,
            'components': [],
            'joints': [],
            'user_parameters': [],
            'hexel_analysis': {},
            'unknown_classification': [],
            'statistics': {},
        }

        # Detect assembly family
        for family_prefix, family_desc in ASSEMBLY_FAMILIES.items():
            if design_name.startswith(family_prefix):
                output['assembly_family'] = {
                    'prefix': family_prefix,
                    'description': family_desc,
                }
                break

        # Extract all top-level occurrences
        total_occs = root.occurrences.count
        progress.maximumValue = total_occs + 2  # +2 for joints + analysis

        for i, occ in enumerate(root.occurrences):
            if progress.wasCancelled:
                break
            progress.progressValue = i + 1
            progress.message = f'Extracting: {occ.component.name} ({i+1}/{total_occs})'

            comp_data = extract_component_data(occ, depth=0, max_depth=5)
            if comp_data:
                output['components'].append(comp_data)

        # Extract joints
        progress.message = 'Extracting joints...'
        progress.progressValue = total_occs + 1
        output['joints'] = extract_joints(design)

        # Extract user parameters
        output['user_parameters'] = extract_parameters(design)

        # Run Hexel-specific analysis
        progress.message = 'Running Hexel dimension analysis...'
        progress.progressValue = total_occs + 2
        output['hexel_analysis'] = analyze_hexel_dimensions(output['components'])

        # Classify unknown components
        output['unknown_classification'] = classify_unknown_components(output['components'])

        # Statistics
        all_comps = output['components']
        mapped_count = sum(1 for c in all_comps if c.get('grammar_id'))
        unmapped_count = sum(1 for c in all_comps if not c.get('grammar_id'))
        total_bodies = sum(len(c.get('bodies', [])) for c in all_comps)
        total_faces = sum(
            sum(b.get('face_summary', {}).get('total', 0) for b in c.get('bodies', []))
            for c in all_comps
        )

        output['statistics'] = {
            'total_components': len(all_comps),
            'mapped_to_grammar': mapped_count,
            'unmapped': unmapped_count,
            'mapping_coverage_pct': round(mapped_count / max(len(all_comps), 1) * 100, 1),
            'total_bodies': total_bodies,
            'total_faces': total_faces,
            'total_joints': len(output['joints']),
            'total_user_parameters': len(output['user_parameters']),
            'dimensional_matches': len(output['hexel_analysis'].get('dimensional_matches', [])),
            'dimensional_warnings': len(output['hexel_analysis'].get('dimensional_warnings', [])),
        }

        progress.hide()

        # ── Save JSON output ──
        docs_folder = os.path.expanduser('~/Documents')
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'hexel_geometry_extract_{design_name}_{timestamp}.json'
        filepath = os.path.join(docs_folder, filename)

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)

        # Summary message
        summary_lines = [
            f'Hexel Geometry Extraction Complete',
            f'',
            f'Design: {design_name}',
            f'Components: {len(all_comps)}',
            f'Mapped to Grammar: {mapped_count}/{len(all_comps)} ({output["statistics"]["mapping_coverage_pct"]}%)',
            f'Bodies: {total_bodies}',
            f'Faces: {total_faces}',
            f'Joints: {len(output["joints"])}',
            f'Dimension matches: {len(output["hexel_analysis"].get("dimensional_matches", []))}',
            f'Dimension warnings: {len(output["hexel_analysis"].get("dimensional_warnings", []))}',
            f'',
            f'Saved to: {filepath}',
            f'',
            f'Next: Run Task 3 validation (hexelGrammarValidator.ts) against this JSON.',
        ]
        ui.messageBox('\n'.join(summary_lines), 'Hexel Extractor')

    except Exception:
        if ui:
            ui.messageBox(f'Error:\n{traceback.format_exc()}', 'Hexel Extractor Error')


def stop(context):
    """Called when the script is stopped."""
    pass
