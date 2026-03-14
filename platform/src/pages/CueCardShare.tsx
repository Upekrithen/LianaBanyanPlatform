/**
 * Cue Card Share — shareable card with front/back, QR, copy link, SMS, download
 * Route: /cue-cards/:cardType (dinner | grocery | ambassador | hexisle)
 */

import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Copy, MessageCircle, Download } from "lucide-react";

const CARD_TYPES = ["dinner", "grocery", "ambassador", "hexisle"] as const;
type CardType = (typeof CARD_TYPES)[number];

interface CardContent {
  frontTitle: string;
  frontSub: string;
  backCopy: string;
}

const CARD_CONTENT: Record<CardType, CardContent> = {
  dinner: {
    frontTitle: "Turn one recipe into rent money.",
    frontSub: "San Antonio's neighbor-to-neighbor dinner crews.",
    backCopy:
      "$15–$20/order, feeds 2–4 • Texas cottage-food law • 12-person Crews • Everyone gets a first customer",
  },
  grocery: {
    frontTitle: "Got a car? Turn errands into income.",
    frontSub: "Join a 12-person grocery Crew in San Antonio.",
    backCopy:
      "Short, local routes • Back one member, they back yours • Works alongside dinner Crews",
  },
  ambassador: {
    frontTitle: "Get Famous. Become a Liana Banyan Ambassador.",
    frontSub: "Earn rewards tied to our patent portfolio.",
    backCopy:
      "Guide 10 new members • Earn Marks by tier • Level up: Torch Bearer → Lamplighter → Beacon Master",
  },
  hexisle: {
    frontTitle: "Build the Game. Own the Story.",
    frontSub: "HexIsle: A tabletop game built by its community.",
    backCopy:
      "Transparent Cost+20% pricing • Pre-order funded • Public build journal • 27-piece hexel system",
  },
};

const INVITE_TEXT: Record<CardType, string> = {
  dinner:
    "Check out Liana Banyan's neighbor dinner crews — turn one recipe into rent money. San Antonio: https://lianabanyan.com/cue-cards/dinner",
  grocery:
    "Got a car? Turn errands into income with a 12-person grocery Crew. https://lianabanyan.com/cue-cards/grocery",
  ambassador:
    "Become a Liana Banyan Ambassador — earn rewards tied to our patent portfolio. https://lianabanyan.com/cue-cards/ambassador",
  hexisle:
    "HexIsle: A tabletop game built by its community. Transparent Cost+20%. https://lianabanyan.com/cue-cards/hexisle",
};

export default function CueCardShare() {
  const { cardType } = useParams<{ cardType: string }>();
  const type = (CARD_TYPES.includes(cardType as CardType) ? cardType : "dinner") as CardType;
  const content = CARD_CONTENT[type];

  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://lianabanyan.com";
  const cardUrl = `${baseUrl}/cue-cards/${type}`;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(cardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [cardUrl]);

  const handleShareText = useCallback(() => {
    const text = encodeURIComponent(INVITE_TEXT[type]);
    window.open(`sms:?body=${text}`, "_blank");
  }, [type]);

  const handleDownload = useCallback(async () => {
    const width = Math.round(3.375 * 300);
    const height = Math.round(2.125 * 300);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // QR on the right half
    try {
      const qrDataUrl = await QRCode.toDataURL(cardUrl, { width: 280, margin: 0 });
      const qrImg = new Image();
      await new Promise<void>((resolve, reject) => {
        qrImg.onload = () => {
          ctx.drawImage(qrImg, width - 340, (height - 280) / 2, 280, 280);
          resolve();
        };
        qrImg.onerror = reject;
        qrImg.src = qrDataUrl;
      });
    } catch {
      // ignore
    }

    // Back copy text on the left
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 32px system-ui, sans-serif";
    ctx.textAlign = "left";
    const lines = content.backCopy.split(" • ");
    const lineHeight = 44;
    const leftMargin = 40;
    let y = height / 2 - (lines.length * lineHeight) / 2 + lineHeight / 2;
    for (const line of lines) {
      ctx.fillText(line, leftMargin, y);
      y += lineHeight;
    }

    const link = document.createElement("a");
    link.download = `liana-banyan-cue-card-${type}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [cardUrl, type, content.backCopy]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6" data-xray-id="cue-card-share">
      <div className="w-full max-w-md space-y-6">
        {/* Card preview — CR80 aspect ratio 3.375:2.125 */}
        <div
          className="relative w-full mx-auto cursor-pointer select-none"
          style={{ aspectRatio: "3.375 / 2.125", maxWidth: "337.5px", perspective: "800px" }}
          onClick={() => setIsFlipped((f) => !f)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsFlipped((f) => !f);
            }
          }}
        >
          <div
            className="absolute inset-0 rounded-xl bg-white shadow-xl border border-slate-200 transition-transform duration-300"
            style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 rounded-xl flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-50 to-white border border-slate-200"
              style={{ backfaceVisibility: "hidden" }}
            >
              <h2 className="text-lg font-bold text-slate-800 leading-tight">{content.frontTitle}</h2>
              <p className="text-sm text-slate-600 mt-2">{content.frontSub}</p>
            </div>
            {/* Back */}
            <div
              className="absolute inset-0 rounded-xl flex flex-row items-center justify-between p-4 bg-white border border-slate-200"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <p className="text-xs text-slate-700 leading-snug flex-1 pr-2">{content.backCopy}</p>
              <div className="flex-shrink-0 w-20 h-20">
                <QRCodeSVG value={cardUrl} size={80} level="M" />
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-slate-500">Click card to flip</p>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            <Copy className="w-4 h-4 mr-1" />
            {copied ? "Copied!" : "Copy link"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShareText}>
            <MessageCircle className="w-4 h-4 mr-1" />
            Share via text
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-1" />
            Download for printing
          </Button>
        </div>
      </div>
    </div>
  );
}
