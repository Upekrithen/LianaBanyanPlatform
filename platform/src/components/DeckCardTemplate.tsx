import { cn } from "@/lib/utils";

type DeckCardVariant = "bst_episode" | "skipping_stone";
type DeckCardSide = "front" | "back";

type DeckCardTemplateProps = {
  variant: DeckCardVariant;
  side: DeckCardSide;
  title: string;
  subtitle?: string;
  hookText?: string;
  episodeNumber?: number;
  qrCodeData?: string;
  className?: string;
};

const baseClasses =
  "relative overflow-hidden rounded-md border border-zinc-300 bg-white text-zinc-900 shadow-sm print:shadow-none";

const printSizeStyle = {
  width: "3.5in",
  height: "2in",
} as const;

function QrPlaceholder({ qrCodeData }: { qrCodeData?: string }) {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded border border-zinc-300 bg-zinc-50 p-2 text-[10px] leading-tight text-zinc-500">
      {qrCodeData ? "QR" : "QR pending"}
    </div>
  );
}

export function DeckCardTemplate({
  variant,
  side,
  title,
  subtitle,
  hookText,
  episodeNumber,
  qrCodeData,
  className,
}: DeckCardTemplateProps) {
  const isBst = variant === "bst_episode";
  const logoLabel = isBst ? "BST" : "Skipping Stone";

  if (side === "front") {
    return (
      <article className={cn(baseClasses, "p-3", className)} style={printSizeStyle}>
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="rounded bg-zinc-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
              {logoLabel}
            </span>
            {isBst && typeof episodeNumber === "number" ? (
              <span className="text-xs font-semibold">Episode {episodeNumber}</span>
            ) : null}
          </div>

          <div className="space-y-1">
            <h3 className="line-clamp-2 text-sm font-semibold leading-tight">{title}</h3>
            {subtitle ? <p className="line-clamp-1 text-[11px] text-zinc-600">{subtitle}</p> : null}
            {hookText ? <p className="line-clamp-3 text-[11px] text-zinc-700">{hookText}</p> : null}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={cn(baseClasses, "p-3", className)} style={printSizeStyle}>
      <div className="flex h-full items-center justify-between gap-3">
        <QrPlaceholder qrCodeData={qrCodeData} />
        <div className="flex-1 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{logoLabel}</p>
          <p className="text-xs font-medium leading-tight">
            {isBst ? "Scan to read the full story" : "The Proof is in the Pudding"}
          </p>
          <p className="text-[10px] text-zinc-500">
            {isBst ? "#CrewmanSix" : "lianabanyan.com"}
          </p>
        </div>
      </div>
    </article>
  );
}
