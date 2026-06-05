/**
 * DeckCueCard
 * Scope 29: Portable bounty summary card with QR code.
 * Print-ready index-card format for the Mikey-hire Bounty-Poster -> Marks test.
 */

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, Coins } from 'lucide-react';

export interface DeckCueCardProps {
  bountyId: string;
  title: string;
  description?: string;
  marks: number;
  category?: string;
  claimUrl: string;
  postedBy?: string;
  expiresAt?: string;
}

export function DeckCueCard({
  bountyId,
  title,
  description,
  marks,
  category,
  claimUrl,
  postedBy,
  expiresAt,
}: DeckCueCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printArea = cardRef.current;
    if (!printArea) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Deck Cue Card -- ${title}</title>
      <style>
        body { margin: 0; font-family: Georgia, serif; background: #fff; }
        .card { width: 5in; min-height: 3in; border: 2px solid #1e1b4b; border-radius: 8px; padding: 20px; display: flex; gap: 20px; box-sizing: border-box; }
        .left { flex: 1; }
        .badge { display: inline-block; background: #f59e0b; color: #fff; border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: bold; margin-bottom: 8px; }
        h2 { margin: 0 0 6px; font-size: 15px; color: #1e1b4b; }
        p { margin: 0 0 4px; font-size: 11px; color: #555; }
        .marks { font-size: 18px; font-weight: bold; color: #7c3aed; margin: 8px 0; }
        .footer { font-size: 9px; color: #999; margin-top: 10px; border-top: 1px solid #eee; padding-top: 6px; }
        .qr { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .qr-label { font-size: 9px; color: #999; text-align: center; }
      </style></head><body>
      ${printArea.outerHTML.replace(/class="[^"]*"/g, (m) => m)}
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div className="space-y-3">
      {/* The Card */}
      <div
        ref={cardRef}
        className="w-full max-w-xl border-2 border-indigo-900 rounded-lg p-5 bg-white flex gap-5 shadow-md font-serif"
        style={{ minHeight: '180px' }}
      >
        {/* Left: text content */}
        <div className="flex-1 min-w-0">
          {category && (
            <span className="inline-block bg-amber-500 text-white text-xs font-bold rounded px-2 py-0.5 mb-2">
              {category.toUpperCase()}
            </span>
          )}
          <h2 className="text-base font-bold text-indigo-900 leading-tight mb-1">{title}</h2>
          {description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-3">{description}</p>
          )}
          <div className="text-lg font-bold text-violet-700 flex items-center gap-1">
            <Coins className="h-4 w-4" />
            {marks} Marks
          </div>
          {postedBy && <p className="text-xs text-gray-500 mt-1">Posted by: {postedBy}</p>}
          {expiresAt && (
            <p className="text-xs text-gray-400 mt-0.5">
              Expires: {new Date(expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          )}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-[9px] text-gray-400 leading-tight">
              Liana Banyan Cooperative &bull; Marks = participation, not equity or investment returns.
            </p>
            <p className="text-[9px] text-gray-400 truncate">{claimUrl}</p>
          </div>
        </div>

        {/* Right: QR code */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <QRCodeSVG
            value={claimUrl}
            size={100}
            level="M"
            includeMargin={false}
            fgColor="#1e1b4b"
          />
          <p className="text-[10px] text-gray-400 text-center leading-tight">Scan to<br />claim bounty</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Print / Download
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground"
          onClick={() => {
            navigator.clipboard.writeText(claimUrl);
          }}
        >
          <Download className="h-4 w-4" />
          Copy Claim Link
        </Button>
      </div>
    </div>
  );
}
