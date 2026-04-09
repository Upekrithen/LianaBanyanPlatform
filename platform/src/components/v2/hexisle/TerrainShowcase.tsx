import { Card } from "@/components/ui/card";

function CanisterRenderMock() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.35),transparent_45%),radial-gradient(circle_at_70%_60%,rgba(16,185,129,0.25),transparent_40%)]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 420" fill="none">
        <g stroke="rgba(125,211,252,0.35)" strokeWidth="3">
          <path d="M105 220 L150 195 L195 220 L195 270 L150 295 L105 270 Z" />
          <path d="M190 170 L235 145 L280 170 L280 220 L235 245 L190 220 Z" />
          <path d="M275 220 L320 195 L365 220 L365 270 L320 295 L275 270 Z" />
          <path d="M360 170 L405 145 L450 170 L450 220 L405 245 L360 220 Z" />
        </g>
      </svg>
      <div className="absolute bottom-3 left-3 rounded bg-black/55 px-2 py-1 text-xs text-slate-200">
        Canister System render
      </div>
    </div>
  );
}

export function TerrainShowcase() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Physical terrain</h2>
      <div className="grid gap-5 md:grid-cols-2 md:items-center">
        <Card className="p-3">
          <CanisterRenderMock />
        </Card>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            The Canister System anchors physical terrain continuity. Tile assemblies remain stable for
            tabletop play while supporting island-map state across sessions.
          </p>
          <p>
            Terrain can be staged for solo play, cooperative encampments, or league formats without
            changing the core mechanical grammar.
          </p>
          <p>
            This layer is intentionally tactile: players can read the board state and handle terrain
            transitions directly.
          </p>
        </div>
      </div>
    </section>
  );
}
