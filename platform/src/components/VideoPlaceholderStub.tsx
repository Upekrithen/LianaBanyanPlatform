/**
 * VideoPlaceholderStub — Wave 16 AAA (SC 1.2.1 / SC 1.2.3)
 * ===========================================================
 * Wraps video placeholder divs with proper ARIA semantics and a
 * transcript stub. When actual video content is embedded, replace
 * this component with a real <video> element (or iframe) that includes:
 *   - <track kind="captions" src="captions.vtt" srclang="en" label="English" default>
 *   - A linked or adjacent full transcript
 *
 * Usage:
 *   <VideoPlaceholderStub
 *     title="Understanding Volume Production & Pricing"
 *     transcriptStub="This video will explain how volume-based pricing works..."
 *   >
 *     <PlayCircle className="..." />
 *   </VideoPlaceholderStub>
 *
 * BP073-W16 / AAA
 */

import React, { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

interface VideoPlaceholderStubProps {
  /** Accessible title describing the video content */
  title: string;
  /** Brief transcript stub describing what the video will cover */
  transcriptStub?: string;
  /** Additional CSS classes for the placeholder container */
  className?: string;
  children?: React.ReactNode;
}

export function VideoPlaceholderStub({
  title,
  transcriptStub,
  className = "",
  children,
}: VideoPlaceholderStubProps) {
  const [showTranscript, setShowTranscript] = useState(false);
  const defaultStub = `[Transcript pending — this video will cover: ${title}. A full transcript will be provided when the video is embedded.]`;
  const transcriptText = transcriptStub ?? defaultStub;

  return (
    <div className={className}>
      {/* Video placeholder — role="img" with descriptive label for screen readers */}
      <div
        role="img"
        aria-label={`Video placeholder: ${title}. Video not yet embedded — transcript stub available below.`}
        className="aspect-video bg-muted rounded-lg flex items-center justify-center relative"
      >
        {children}
      </div>

      {/* Caption/transcript stub — SC 1.2.1 / 1.2.3 compliance stub */}
      <div className="mt-2">
        <button
          type="button"
          onClick={() => setShowTranscript((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[44px] px-1"
          aria-expanded={showTranscript}
          aria-controls="video-transcript-stub"
        >
          <FileText className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Transcript stub</span>
          {showTranscript ? (
            <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </button>
        {showTranscript && (
          <div
            id="video-transcript-stub"
            role="region"
            aria-label={`Transcript for: ${title}`}
            className="mt-1 p-3 rounded border text-xs text-muted-foreground bg-muted/50 leading-relaxed"
          >
            {transcriptText}
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoPlaceholderStub;
