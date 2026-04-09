import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FocusShell } from "@/components/shells";
import { StickyMobileCTA } from "@/components/v2";
import {
  AlternativeActions,
  NextStepsStrip,
  PledgeSummaryCard,
  PrepopulatedStorefrontPreview,
  RedCarpetHero,
  SectionFrame,
  VouchesGrid,
  WindowFAQ,
  type FAQItem,
  type PreviewProduct,
  type StepItem,
  type Vouch,
} from "@/components/v2/red-carpet";
import { useTourTarget } from "@/hooks/useTourTarget";
import { useAuth } from "@/contexts/AuthContext";

const EMPTY_VOUCHES: Vouch[] = [];
const EMPTY_PRODUCTS: PreviewProduct[] = [];

const TOUR_VOUCHES: Vouch[] = [
  {
    id: "vouch-1",
    quote: "This draft already feels true to your voice. You should bring it live.",
    name: "M. Patel",
    role: "Neighborhood organizer",
    relationship: "Peer vouch",
  },
  {
    id: "vouch-2",
    quote: "Your first offers are clear, practical, and easy to trust.",
    name: "A. Rivera",
    role: "Local member",
    relationship: "First customer",
  },
  {
    id: "vouch-3",
    quote: "I can help with copy edits if you want a second pass before publish.",
    name: "J. Kim",
    role: "Design partner",
    relationship: "Collaborator",
  },
];

const TOUR_PRODUCTS: PreviewProduct[] = [
  { id: "p1", name: "Weekly Meal Prep Plan", category: "Service", priceLabel: "$42" },
  { id: "p2", name: "Family Pantry Starter Kit", category: "Bundle", priceLabel: "$28" },
  { id: "p3", name: "Community Dinner Session", category: "Experience", priceLabel: "$18" },
];

const NEXT_STEPS: StepItem[] = [
  { id: "review", title: "Review", description: "Check draft details and invitation context." },
  { id: "edit", title: "Edit", description: "Adjust titles, categories, and draft products." },
  { id: "confirm", title: "Confirm $5", description: "Complete membership confirmation to publish." },
  { id: "live", title: "Go Live", description: "Publish your storefront and share your link." },
];

const WINDOW_FAQ: FAQItem[] = [
  {
    id: "faq-window",
    question: "What is the 90-day invitation window?",
    answer:
      "Your invitation stays active for ninety days so you can review, ask questions, and decide with no rush.",
  },
  {
    id: "faq-refund",
    question: "What if I decide not to continue?",
    answer:
      "If you do not continue within the window, the pending support context is released automatically and no penalty is applied.",
  },
  {
    id: "faq-pressure",
    question: "Is this a hard-sell flow?",
    answer:
      "No. This page is a respectful entry point designed for clarity, not pressure. You can pause and return later.",
  },
];

function toPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.floor(parsed));
}

export default function RedCarpetLandingV2Page() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const tourAnchor = useTourTarget("red-carpet");

  const creatorName = params.get("creator")?.trim() || "Your sponsor";
  const businessName = params.get("business")?.trim() || "your storefront";
  const pledgeCount = toPositiveInt(params.get("pledges"), 0);
  const pledgeTotal = toPositiveInt(params.get("total"), 0);
  const expiryDate = params.get("expires") || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  const wildfireTourMode = params.get("tour") === "wildfire" || params.get("wildfire") === "1";

  const vouches = wildfireTourMode ? TOUR_VOUCHES : EMPTY_VOUCHES;
  const products = wildfireTourMode ? TOUR_PRODUCTS : EMPTY_PRODUCTS;

  const authRedirectHref = useMemo(
    () => `/auth?redirect=${encodeURIComponent("/tools/storefront-builder?source=red-carpet")}`,
    [],
  );

  const handleClaimStorefront = () => {
    if (user) {
      navigate("/tools/storefront-builder?source=red-carpet");
      return;
    }
    navigate(authRedirectHref);
  };

  const scrollToPreview = () => {
    const target = document.getElementById("red-carpet-preview");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <FocusShell
      xrayBase="red-carpet"
      seo={{
        title: "Red Carpet Landing | Liana Banyan",
        description: "Invitation landing page to claim and launch a pre-populated storefront.",
      }}
      hero={
        <>
          <StickyMobileCTA
            primary={{ label: "Claim My Storefront", onClick: handleClaimStorefront }}
            secondary={{ label: "Explore What They Built", onClick: scrollToPreview }}
          />
          <div {...tourAnchor}>
            <RedCarpetHero
              creatorName={creatorName}
              businessName={businessName}
              primaryCTA={{ label: "Claim My Storefront", onClick: handleClaimStorefront }}
              secondaryCTA={{ label: "Explore What They Built", onClick: scrollToPreview }}
            />
          </div>
        </>
      }
    >
      <SectionFrame>
        <PledgeSummaryCard pledgeCount={pledgeCount} pledgeTotal={pledgeTotal} expiryDate={expiryDate} />

        <VouchesGrid vouches={vouches} />

        <PrepopulatedStorefrontPreview
          businessName={businessName}
          products={products}
          draftNote="This is a starting point. You can revise every section before publish."
        />

        <NextStepsStrip steps={NEXT_STEPS} />

        <WindowFAQ items={WINDOW_FAQ} />

        <AlternativeActions
          onRemindLater={() => navigate("/welcome")}
          onShareWithPartner={() => window.open(window.location.href, "_blank", "noopener,noreferrer")}
          onAskQuestion={() => navigate("/contact")}
        />
      </SectionFrame>
    </FocusShell>
  );
}
