/**
 * CREW FULFILLMENT — Mark as delivered (seller) / Confirm receipt + testimonial (backer).
 * data-xray-id: crew-fulfillment
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const MAX_TESTIMONIAL_LENGTH = 280;

export interface FulfillmentMember {
  id: string;
  offer_title: string;
  offer_price: number | null;
  status: string;
  backed_amount: number | null;
  display_name?: string | null;
}

/** Seller: "Mark as Delivered" for the order I was backed for */
export interface CrewFulfillmentSellerProps {
  member: FulfillmentMember;
  backerDisplayName?: string | null;
  onMarkDelivered: () => Promise<void>;
}

export function CrewFulfillmentSeller({
  member,
  backerDisplayName,
  onMarkDelivered,
}: CrewFulfillmentSellerProps) {
  const [loading, setLoading] = useState(false);
  const backerLabel = backerDisplayName || "A backer";
  return (
    <Card className="border-2 border-border" data-xray-id="crew-fulfillment">
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">
          {backerLabel} backed your offer: &quot;{member.offer_title}&quot; for $
          {member.backed_amount ?? member.offer_price ?? 0}
        </p>
        <p className="text-sm font-medium mt-1">Status: Awaiting your delivery</p>
        <Button
          className="mt-3"
          onClick={async () => {
            setLoading(true);
            try {
              await onMarkDelivered();
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          data-xray-id="crew-mark-delivered-btn"
        >
          {loading ? "Updating…" : "Mark as delivered"}
        </Button>
      </CardContent>
    </Card>
  );
}

/** Backer: Confirm receipt + optional testimonial (280 chars, 1–5 stars) */
export interface CrewFulfillmentBackerProps {
  member: FulfillmentMember;
  sellerDisplayName?: string | null;
  onConfirmReceipt: (testimonial?: { content: string; rating: number | null }) => Promise<void>;
}

export function CrewFulfillmentBacker({
  member,
  sellerDisplayName,
  onConfirmReceipt,
}: CrewFulfillmentBackerProps) {
  const [step, setStep] = useState<"confirm" | "testimonial">("confirm");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const sellerLabel = sellerDisplayName || "The maker";

  const handleConfirm = async (skipTestimonial: boolean) => {
    setLoading(true);
    try {
      if (skipTestimonial) {
        await onConfirmReceipt();
      } else {
        await onConfirmReceipt({
          content: content.slice(0, MAX_TESTIMONIAL_LENGTH),
          rating,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (step === "confirm") {
    return (
      <Card className="border-2 border-border" data-xray-id="crew-fulfillment">
        <CardContent className="p-4">
          <p className="text-sm">
            {sellerLabel} says they&apos;ve delivered &quot;{member.offer_title}&quot;
          </p>
          <p className="text-sm text-muted-foreground mt-1">Did you receive it?</p>
          <div className="flex gap-2 mt-3">
            <Button
              onClick={() => setStep("testimonial")}
              disabled={loading}
              data-xray-id="crew-confirm-receipt-btn"
            >
              Yes — Confirm receipt
            </Button>
            <Button variant="outline" disabled>
              There&apos;s an issue — Contact Crew Captain
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-border" data-xray-id="crew-fulfillment">
      <CardContent className="p-4 space-y-3">
        <p className="text-sm font-medium">Quick note about your experience (optional, 280 chars max)</p>
        <Textarea
          placeholder="How was your experience?"
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_TESTIMONIAL_LENGTH))}
          maxLength={MAX_TESTIMONIAL_LENGTH}
          className="min-h-[80px] resize-none"
          data-xray-id="crew-testimonial-input"
        />
        <p className="text-xs text-muted-foreground">
          {content.length}/{MAX_TESTIMONIAL_LENGTH}
        </p>
        <div className="flex items-center gap-1">
          <span className="text-sm mr-2">Rating:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(rating === star ? null : star)}
              className={cn(
                "text-lg leading-none transition-colors",
                (rating ?? 0) >= star
                  ? "text-yellow-500"
                  : "text-muted-foreground/50 hover:text-yellow-500/70"
              )}
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
            >
              ★
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleConfirm(false)}
            disabled={loading}
            data-xray-id="crew-testimonial-submit"
          >
            {loading ? "Submitting…" : "Submit"}
          </Button>
          <Button variant="outline" onClick={() => handleConfirm(true)} disabled={loading}>
            Skip
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
