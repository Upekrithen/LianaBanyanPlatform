/**
 * WAVE B: FOOD NODE CUE CARD BUILDER PAGE (BP079)
 * ================================================
 * Thin wrapper for the CueCardBuilder component with 'food' node type.
 * Route: /cue-card/build/food/:id?
 */

import { CueCardBuilder } from '@/components/CueCardBuilder';

export default function FoodCueCardBuilderPage() {
  return <CueCardBuilder nodeType="food" nodeTypeName="Food Truck" />;
}
