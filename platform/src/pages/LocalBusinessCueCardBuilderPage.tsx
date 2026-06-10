/**
 * WAVE B: LOCAL BUSINESS CUE CARD BUILDER PAGE (BP079)
 * =====================================================
 * Thin wrapper for the CueCardBuilder component with 'local-business' node type.
 * Route: /cue-card/build/local-business/:id?
 */

import { CueCardBuilder } from '@/components/CueCardBuilder';

export default function LocalBusinessCueCardBuilderPage() {
  return <CueCardBuilder nodeType="local-business" nodeTypeName="Local Business" />;
}
