/**
 * CampaignMapEditor — Drag-drop map editor for DM campaigns (K382).
 * Route: /hexisle/forge/:campaignId/map
 *
 * Freeform canvas where DMs place terrain, POIs, encounters, and objectives.
 * Map data persists to localStorage (keyed by campaignId) and will sync to
 * hexisle_campaigns.map_data JSONB once migrations are applied.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MuseumShell } from "@/components/museum/MuseumShell";
import { useXRay } from "@/components/museum/XRayContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Save, Trash2, RotateCcw, ZoomIn, ZoomOut,
  Mountain, TreePine, Droplets, Castle, Flame, Tent,
  Skull, Puzzle, User, MapPin, Flag, Key, Star,
  Gem, Signpost, Swords, Eye, ChevronRight, ChevronLeft,
  Move, MousePointer, Radio,
} from "lucide-react";
import { DMSummonPanel } from "@/components/museum/DMSummonPanel";

/* ─── Map element types ─── */

interface MapElement {
  id: string;
  type: string;
  category: "terrain" | "poi" | "encounter" | "objective";
  label: string;
  x: number;
  y: number;
  icon: string;
  color: string;
  notes: string;
}

interface MapData {
  elements: MapElement[];
  gridSize: number;
  campaignTitle: string;
  campaignType: string;
  lastSaved: string;
}

const PALETTE_ITEMS: Array<{
  type: string;
  category: MapElement["category"];
  label: string;
  icon: typeof Mountain;
  color: string;
}> = [
  // Terrain
  { type: "forest", category: "terrain", label: "Forest", icon: TreePine, color: "#6b8e23" },
  { type: "mountain", category: "terrain", label: "Mountain", icon: Mountain, color: "#8b8682" },
  { type: "water", category: "terrain", label: "Water", icon: Droplets, color: "#4a90d9" },
  { type: "fire", category: "terrain", label: "Fire", icon: Flame, color: "#e74c3c" },
  // POI
  { type: "town", category: "poi", label: "Town", icon: Castle, color: "#d4a855" },
  { type: "camp", category: "poi", label: "Camp", icon: Tent, color: "#c9a96e" },
  { type: "signpost", category: "poi", label: "Signpost", icon: Signpost, color: "#9b9b9b" },
  { type: "portal", category: "poi", label: "Portal", icon: Star, color: "#9b59b6" },
  // Encounters
  { type: "monster", category: "encounter", label: "Monster", icon: Skull, color: "#8b3a3a" },
  { type: "boss", category: "encounter", label: "Boss", icon: Swords, color: "#c0392b" },
  { type: "puzzle", category: "encounter", label: "Puzzle", icon: Puzzle, color: "#00bcd4" },
  { type: "npc", category: "encounter", label: "NPC", icon: User, color: "#27ae60" },
  // Objectives
  { type: "spawn", category: "objective", label: "Spawn", icon: MapPin, color: "#2ecc71" },
  { type: "finish", category: "objective", label: "Finish", icon: Flag, color: "#f39c12" },
  { type: "key", category: "objective", label: "Key", icon: Key, color: "#d4a855" },
  { type: "treasure", category: "objective", label: "Treasure", icon: Gem, color: "#e67e22" },
];

const CATEGORY_LABELS: Record<MapElement["category"], string> = {
  terrain: "Terrain",
  poi: "Points of Interest",
  encounter: "Encounters",
  objective: "Objectives",
};

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function loadMapData(campaignId: string): MapData {
  try {
    const raw = localStorage.getItem(`campaign_map_${campaignId}`);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }

  const campaignRaw = localStorage.getItem(`campaign_${campaignId}`);
  let title = "Untitled Campaign";
  let cType = "adventure";
  if (campaignRaw) {
    try {
      const c = JSON.parse(campaignRaw);
      title = c.title || title;
      cType = c.type || cType;
    } catch { /* ignore */ }
  }

  return {
    elements: [],
    gridSize: 24,
    campaignTitle: title,
    campaignType: cType,
    lastSaved: "",
  };
}

function saveMapData(campaignId: string, data: MapData) {
  data.lastSaved = new Date().toISOString();
  localStorage.setItem(`campaign_map_${campaignId}`, JSON.stringify(data));
}

const CampaignMapEditor = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const { xrayOn } = useXRay();
  const canvasRef = useRef<HTMLDivElement>(null);

  const [mapData, setMapData] = useState<MapData>(() => loadMapData(campaignId || "new"));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [activeTool, setActiveTool] = useState<"select" | "place">("select");
  const [placingItem, setPlacingItem] = useState<typeof PALETTE_ITEMS[number] | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [summonPanelOpen, setSummonPanelOpen] = useState(false);

  const accentColor = xrayOn ? "#22d3ee" : "#c9a96e";
  const gridColor = xrayOn ? "rgba(34,211,238,0.08)" : "rgba(201,169,110,0.06)";
  const selectedElement = mapData.elements.find((e) => e.id === selectedId) || null;

  const save = useCallback(() => {
    saveMapData(campaignId || "new", mapData);
  }, [campaignId, mapData]);

  useEffect(() => {
    const timer = setTimeout(save, 2000);
    return () => clearTimeout(timer);
  }, [mapData, save]);

  const addElement = useCallback(
    (canvasX: number, canvasY: number) => {
      if (!placingItem) return;
      const el: MapElement = {
        id: generateId(),
        type: placingItem.type,
        category: placingItem.category,
        label: placingItem.label,
        x: canvasX,
        y: canvasY,
        icon: placingItem.type,
        color: placingItem.color,
        notes: "",
      };
      setMapData((prev) => ({ ...prev, elements: [...prev.elements, el] }));
      setSelectedId(el.id);
    },
    [placingItem],
  );

  const deleteElement = useCallback(
    (id: string) => {
      setMapData((prev) => ({
        ...prev,
        elements: prev.elements.filter((e) => e.id !== id),
      }));
      if (selectedId === id) setSelectedId(null);
    },
    [selectedId],
  );

  const updateElement = useCallback((id: string, updates: Partial<MapElement>) => {
    setMapData((prev) => ({
      ...prev,
      elements: prev.elements.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  }, []);

  const clearMap = useCallback(() => {
    setMapData((prev) => ({ ...prev, elements: [] }));
    setSelectedId(null);
  }, []);

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || (e.button === 0 && activeTool === "select" && !draggingElement && !placingItem)) {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      return;
    }

    if (activeTool === "place" && placingItem && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const canvasX = (e.clientX - rect.left - pan.x) / zoom;
      const canvasY = (e.clientY - rect.top - pan.y) / zoom;
      addElement(canvasX, canvasY);
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setPan({
        x: panStart.current.panX + (e.clientX - panStart.current.x),
        y: panStart.current.panY + (e.clientY - panStart.current.y),
      });
      return;
    }

    if (draggingElement && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const canvasX = (e.clientX - rect.left - pan.x) / zoom - dragOffset.current.x;
      const canvasY = (e.clientY - rect.top - pan.y) / zoom - dragOffset.current.y;
      updateElement(draggingElement, { x: canvasX, y: canvasY });
    }
  };

  const handleCanvasPointerUp = () => {
    setIsPanning(false);
    setDraggingElement(null);
  };

  const handleElementPointerDown = (e: React.PointerEvent, el: MapElement) => {
    e.stopPropagation();
    setSelectedId(el.id);
    if (activeTool === "select") {
      setDraggingElement(el.id);
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseCanvasX = (e.clientX - rect.left - pan.x) / zoom;
        const mouseCanvasY = (e.clientY - rect.top - pan.y) / zoom;
        dragOffset.current = { x: mouseCanvasX - el.x, y: mouseCanvasY - el.y };
      }
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    }
  };

  const gridSizePx = mapData.gridSize * 40;

  const paletteByCategory = PALETTE_ITEMS.reduce<Record<string, typeof PALETTE_ITEMS>>((acc, item) => {
    (acc[item.category] ||= []).push(item);
    return acc;
  }, {});

  return (
    <MuseumShell>
      <div className="h-screen flex flex-col overflow-hidden relative">
        {/* ─── Top bar ─── */}
        <div
          className="flex items-center justify-between px-3 py-2 z-20 shrink-0"
          style={{
            background: "rgba(10,22,40,0.95)",
            borderBottom: `1px solid ${accentColor}18`,
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/hexisle/forge")}
              className="text-xs flex items-center gap-1 transition-colors"
              style={{ color: "rgba(250,245,235,0.4)" }}
              onMouseOver={(e) => (e.currentTarget.style.color = accentColor)}
              onMouseOut={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.4)")}
            >
              <ArrowLeft className="w-3 h-3" /> Forge
            </button>
            <span
              style={{
                fontFamily: "'Crimson Pro', Georgia, serif",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: accentColor,
              }}
            >
              {mapData.campaignTitle}
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.55rem",
                color: "rgba(250,245,235,0.25)",
                letterSpacing: "0.08em",
              }}
            >
              MAP EDITOR
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Tool mode */}
            <div
              className="flex rounded-md overflow-hidden"
              style={{ border: `1px solid ${accentColor}30` }}
            >
              <button
                onClick={() => { setActiveTool("select"); setPlacingItem(null); }}
                className="px-2 py-1 text-xs flex items-center gap-1"
                style={{
                  background: activeTool === "select" ? `${accentColor}20` : "transparent",
                  color: activeTool === "select" ? accentColor : "rgba(250,245,235,0.4)",
                  transition: "all 0.15s ease",
                }}
              >
                <MousePointer className="w-3 h-3" /> Select
              </button>
              <button
                onClick={() => setActiveTool("place")}
                className="px-2 py-1 text-xs flex items-center gap-1"
                style={{
                  background: activeTool === "place" ? `${accentColor}20` : "transparent",
                  color: activeTool === "place" ? accentColor : "rgba(250,245,235,0.4)",
                  transition: "all 0.15s ease",
                }}
              >
                <MapPin className="w-3 h-3" /> Place
              </button>
            </div>

            {/* Zoom */}
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.2, 3))}
              className="p-1 rounded"
              style={{ color: "rgba(250,245,235,0.4)" }}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span style={{ fontSize: "0.6rem", color: "rgba(250,245,235,0.3)", fontFamily: "'JetBrains Mono', monospace", minWidth: "2.5rem", textAlign: "center" }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.2, 0.3))}
              className="p-1 rounded"
              style={{ color: "rgba(250,245,235,0.4)" }}
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <div style={{ width: 1, height: 16, background: "rgba(250,245,235,0.08)" }} />

            {/* Actions */}
            <button
              onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }}
              className="p-1 rounded"
              style={{ color: "rgba(250,245,235,0.4)" }}
              title="Reset view"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={clearMap}
              className="p-1 rounded"
              style={{ color: "rgba(250,245,235,0.4)" }}
              title="Clear map"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSummonPanelOpen((p) => !p)}
              className="px-2 py-1 rounded text-xs flex items-center gap-1"
              style={{
                background: summonPanelOpen ? "rgba(249,115,22,0.15)" : "rgba(249,115,22,0.06)",
                border: `1px solid ${summonPanelOpen ? "rgba(249,115,22,0.4)" : "rgba(249,115,22,0.2)"}`,
                color: "#f97316",
                fontFamily: "'JetBrains Mono', monospace",
              }}
              title="DM Summoning Protocol"
            >
              <Radio className="w-3 h-3" /> Summon
            </button>
            <button
              onClick={save}
              className="px-2 py-1 rounded text-xs flex items-center gap-1"
              style={{
                background: `${accentColor}15`,
                border: `1px solid ${accentColor}30`,
                color: accentColor,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <Save className="w-3 h-3" /> Save
            </button>
          </div>
        </div>

        {/* ─── Main area ─── */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Palette sidebar */}
          <AnimatePresence>
            {paletteOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 180, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="shrink-0 overflow-y-auto z-10"
                style={{
                  background: "rgba(10,22,40,0.95)",
                  borderRight: `1px solid ${accentColor}12`,
                }}
              >
                <div className="p-2">
                  <div
                    className="text-center mb-2"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.55rem",
                      letterSpacing: "0.1em",
                      color: "rgba(250,245,235,0.3)",
                    }}
                  >
                    ELEMENTS
                  </div>

                  {Object.entries(paletteByCategory).map(([cat, items]) => (
                    <div key={cat} className="mb-3">
                      <div
                        style={{
                          fontSize: "0.55rem",
                          fontWeight: 700,
                          color: "rgba(250,245,235,0.25)",
                          fontFamily: "'JetBrains Mono', monospace",
                          letterSpacing: "0.06em",
                          marginBottom: "4px",
                          textTransform: "uppercase",
                        }}
                      >
                        {CATEGORY_LABELS[cat as MapElement["category"]]}
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {items.map((item) => {
                          const Icon = item.icon;
                          const isActive = placingItem?.type === item.type;
                          return (
                            <button
                              key={item.type}
                              onClick={() => {
                                setActiveTool("place");
                                setPlacingItem(isActive ? null : item);
                                if (isActive) setActiveTool("select");
                              }}
                              className="flex flex-col items-center py-1.5 px-1 rounded"
                              style={{
                                background: isActive ? `${item.color}20` : "rgba(255,255,255,0.02)",
                                border: `1px solid ${isActive ? `${item.color}50` : "rgba(250,245,235,0.06)"}`,
                                transition: "all 0.15s ease",
                              }}
                            >
                              <Icon className="w-4 h-4 mb-0.5" style={{ color: item.color }} />
                              <span style={{ fontSize: "0.5rem", color: "rgba(250,245,235,0.5)" }}>
                                {item.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Palette toggle */}
          <button
            onClick={() => setPaletteOpen((p) => !p)}
            className="absolute top-2 z-20 rounded-r-md py-2 px-0.5"
            style={{
              left: paletteOpen ? 180 : 0,
              background: "rgba(10,22,40,0.9)",
              border: `1px solid ${accentColor}20`,
              borderLeft: "none",
              color: "rgba(250,245,235,0.4)",
              transition: "left 0.2s ease",
            }}
          >
            {paletteOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>

          {/* ─── Canvas ─── */}
          <div
            ref={canvasRef}
            className="flex-1 overflow-hidden relative"
            style={{
              cursor: activeTool === "place" && placingItem
                ? "crosshair"
                : isPanning
                  ? "grabbing"
                  : "grab",
            }}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onWheel={(e) => {
              e.preventDefault();
              const delta = e.deltaY > 0 ? -0.1 : 0.1;
              setZoom((z) => Math.min(Math.max(z + delta, 0.3), 3));
            }}
          >
            {/* Pannable/zoomable layer */}
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
                width: `${gridSizePx}px`,
                height: `${gridSizePx}px`,
                position: "relative",
              }}
            >
              {/* Grid background */}
              <svg
                className="absolute inset-0 pointer-events-none"
                width={gridSizePx}
                height={gridSizePx}
              >
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke={gridColor}
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {/* Center crosshair */}
                <line
                  x1={gridSizePx / 2}
                  y1={0}
                  x2={gridSizePx / 2}
                  y2={gridSizePx}
                  stroke={gridColor}
                  strokeWidth="1"
                  strokeDasharray="4 8"
                />
                <line
                  x1={0}
                  y1={gridSizePx / 2}
                  x2={gridSizePx}
                  y2={gridSizePx / 2}
                  stroke={gridColor}
                  strokeWidth="1"
                  strokeDasharray="4 8"
                />
              </svg>

              {/* Map elements */}
              {mapData.elements.map((el) => {
                const paletteItem = PALETTE_ITEMS.find((p) => p.type === el.type);
                const Icon = paletteItem?.icon || MapPin;
                const isSelected = selectedId === el.id;
                return (
                  <motion.div
                    key={el.id}
                    className="absolute flex flex-col items-center"
                    style={{
                      left: el.x,
                      top: el.y,
                      transform: "translate(-50%, -50%)",
                      zIndex: isSelected ? 10 : 1,
                      cursor: activeTool === "select" ? "move" : "crosshair",
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onPointerDown={(e) => handleElementPointerDown(e, el)}
                  >
                    <div
                      className="rounded-full flex items-center justify-center"
                      style={{
                        width: 32,
                        height: 32,
                        background: `${el.color}20`,
                        border: `2px solid ${isSelected ? accentColor : `${el.color}60`}`,
                        boxShadow: isSelected
                          ? `0 0 12px ${accentColor}40, 0 0 4px ${accentColor}20`
                          : `0 0 8px ${el.color}20`,
                        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color: el.color }} />
                    </div>
                    <span
                      style={{
                        fontSize: "0.5rem",
                        color: "rgba(250,245,235,0.6)",
                        fontFamily: "'JetBrains Mono', monospace",
                        marginTop: 2,
                        textShadow: "0 1px 4px rgba(0,0,0,0.9)",
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                      }}
                    >
                      {el.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Placing indicator */}
            {activeTool === "place" && placingItem && (
              <div
                className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full"
                style={{
                  background: `${placingItem.color}20`,
                  border: `1px solid ${placingItem.color}40`,
                  color: placingItem.color,
                  fontSize: "0.65rem",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                Click to place: {placingItem.label}
              </div>
            )}
          </div>

          {/* ─── Properties panel (selected element) ─── */}
          <AnimatePresence>
            {selectedElement && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="shrink-0 overflow-y-auto z-10"
                style={{
                  background: "rgba(10,22,40,0.95)",
                  borderLeft: `1px solid ${accentColor}12`,
                }}
              >
                <div className="p-3">
                  <div
                    className="text-center mb-3"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.55rem",
                      letterSpacing: "0.1em",
                      color: "rgba(250,245,235,0.3)",
                    }}
                  >
                    PROPERTIES
                  </div>

                  {/* Element type indicator */}
                  <div className="flex items-center gap-2 mb-3">
                    {(() => {
                      const Icon = PALETTE_ITEMS.find((p) => p.type === selectedElement.type)?.icon || MapPin;
                      return (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            background: `${selectedElement.color}20`,
                            border: `1px solid ${selectedElement.color}40`,
                          }}
                        >
                          <Icon className="w-4 h-4" style={{ color: selectedElement.color }} />
                        </div>
                      );
                    })()}
                    <div>
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: selectedElement.color }}>
                        {selectedElement.label}
                      </div>
                      <div style={{ fontSize: "0.5rem", color: "rgba(250,245,235,0.3)", textTransform: "uppercase" }}>
                        {selectedElement.category}
                      </div>
                    </div>
                  </div>

                  {/* Label */}
                  <label
                    style={{
                      fontSize: "0.55rem",
                      color: "rgba(250,245,235,0.3)",
                      fontFamily: "'JetBrains Mono', monospace",
                      display: "block",
                      marginBottom: 2,
                    }}
                  >
                    LABEL
                  </label>
                  <input
                    value={selectedElement.label}
                    onChange={(e) => updateElement(selectedElement.id, { label: e.target.value })}
                    className="w-full mb-3 px-2 py-1 rounded text-xs"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${accentColor}20`,
                      color: "rgba(250,245,235,0.7)",
                      outline: "none",
                    }}
                  />

                  {/* Position */}
                  <label
                    style={{
                      fontSize: "0.55rem",
                      color: "rgba(250,245,235,0.3)",
                      fontFamily: "'JetBrains Mono', monospace",
                      display: "block",
                      marginBottom: 2,
                    }}
                  >
                    POSITION
                  </label>
                  <div className="flex gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <span style={{ fontSize: "0.55rem", color: "rgba(250,245,235,0.3)" }}>X</span>
                      <input
                        type="number"
                        value={Math.round(selectedElement.x)}
                        onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })}
                        className="w-14 px-1 py-0.5 rounded text-xs"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: `1px solid ${accentColor}15`,
                          color: "rgba(250,245,235,0.5)",
                          outline: "none",
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span style={{ fontSize: "0.55rem", color: "rgba(250,245,235,0.3)" }}>Y</span>
                      <input
                        type="number"
                        value={Math.round(selectedElement.y)}
                        onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })}
                        className="w-14 px-1 py-0.5 rounded text-xs"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: `1px solid ${accentColor}15`,
                          color: "rgba(250,245,235,0.5)",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <label
                    style={{
                      fontSize: "0.55rem",
                      color: "rgba(250,245,235,0.3)",
                      fontFamily: "'JetBrains Mono', monospace",
                      display: "block",
                      marginBottom: 2,
                    }}
                  >
                    DM NOTES
                  </label>
                  {editingNotes ? (
                    <textarea
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      onBlur={() => {
                        updateElement(selectedElement.id, { notes: notesText });
                        setEditingNotes(false);
                      }}
                      autoFocus
                      rows={4}
                      className="w-full px-2 py-1 rounded text-xs resize-none mb-3"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${accentColor}20`,
                        color: "rgba(250,245,235,0.7)",
                        outline: "none",
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setNotesText(selectedElement.notes);
                        setEditingNotes(true);
                      }}
                      className="w-full text-left px-2 py-1 rounded text-xs mb-3"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: `1px dashed ${accentColor}15`,
                        color: selectedElement.notes
                          ? "rgba(250,245,235,0.5)"
                          : "rgba(250,245,235,0.2)",
                        minHeight: "3rem",
                      }}
                    >
                      {selectedElement.notes || "Click to add notes..."}
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => deleteElement(selectedElement.id)}
                    className="w-full flex items-center justify-center gap-1 py-1.5 rounded text-xs"
                    style={{
                      background: "rgba(139,58,58,0.12)",
                      border: "1px solid rgba(139,58,58,0.3)",
                      color: "#8b3a3a",
                    }}
                  >
                    <Trash2 className="w-3 h-3" /> Remove Element
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── DM Summon Panel Overlay ─── */}
        <AnimatePresence>
          {summonPanelOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-14 right-4 z-30"
              style={{ width: "min(320px, 80vw)" }}
            >
              <DMSummonPanel
                campaignId={campaignId || "new"}
                campaignTitle={mapData.campaignTitle}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Status bar ─── */}
        <div
          className="flex items-center justify-between px-3 py-1 z-20 shrink-0"
          style={{
            background: "rgba(10,22,40,0.95)",
            borderTop: `1px solid ${accentColor}10`,
          }}
        >
          <div className="flex items-center gap-3">
            <span style={{ fontSize: "0.55rem", color: "rgba(250,245,235,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>
              <Move className="w-3 h-3 inline mr-1" style={{ verticalAlign: "middle" }} />
              {mapData.elements.length} element{mapData.elements.length !== 1 ? "s" : ""}
            </span>
            <span style={{ fontSize: "0.55rem", color: "rgba(250,245,235,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>
              Grid: {mapData.gridSize}×{mapData.gridSize}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {mapData.lastSaved && (
              <span style={{ fontSize: "0.5rem", color: "rgba(250,245,235,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>
                Saved {new Date(mapData.lastSaved).toLocaleTimeString()}
              </span>
            )}
            <span style={{ fontSize: "0.55rem", color: "rgba(250,245,235,0.15)", fontFamily: "'JetBrains Mono', monospace" }}>
              K382
            </span>
          </div>
        </div>
      </div>
    </MuseumShell>
  );
};

export default CampaignMapEditor;
