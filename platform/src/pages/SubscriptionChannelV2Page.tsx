import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import { useTourTarget } from "@/hooks/useTourTarget";
import { useAuth } from "@/contexts/AuthContext";
import { useWildfireRun } from "@/contexts/WildfireRunContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ChannelPreviewPanel,
  ChannelPreviewPost,
  CurrencyOptionSelector,
  RecentSubscriberStories,
  SubscribeConfirmation,
  SubscriberBenefitsRail,
  SubscriberStory,
  SubscriptionCurrency,
  SubscriptionEconomicsCard,
} from "@/components/v2/subscription-channel";

type SubscriptionChannelRow = {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  price: number;
  billing_cycle: string;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const WILDFIRE_POSTS: ChannelPreviewPost[] = [
  {
    id: "post-1",
    title: "Build Log: Week 14",
    excerpt: "How we tightened production timing while keeping quality stable.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "post-2",
    title: "Subscriber Q&A Digest",
    excerpt: "Answers to the top requests from this month's subscriber thread.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
];

const WILDFIRE_STORIES: SubscriberStory[] = [
  {
    id: "story-1",
    name: "Avery",
    role: "Member subscriber",
    quote: "The recurring updates help me follow the creator's process in real time.",
  },
  {
    id: "story-2",
    name: "Morgan",
    role: "Creator supporter",
    quote: "Choosing payment currency made subscribing fit my weekly rhythm.",
  },
];

export default function SubscriptionChannelV2Page() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { isRunning: isWildfireTour } = useWildfireRun();
  const navigate = useNavigate();
  const tourTarget = useTourTarget("subscription-channel");
  const [currency, setCurrency] = useState<SubscriptionCurrency>("marks");
  const [subscribed, setSubscribed] = useState(false);

  const channelQuery = useQuery({
    queryKey: ["subscription-channel-v2", slug],
    queryFn: async (): Promise<SubscriptionChannelRow | null> => {
      const { data, error } = await supabase
        .from("subscription_channels" as never)
        .select("*")
        .eq("active", true)
        .limit(200);
      if (error) return null;
      const rows = (data ?? []) as unknown as SubscriptionChannelRow[];
      return rows.find((row) => slugify(row.title) === slug) ?? null;
    },
    enabled: !!slug && !isWildfireTour,
  });

  const channel = channelQuery.data;
  const channelTitle = channel?.title ?? "Creator Channel";
  const creatorName = "Creator";
  const cycleLabel = channel?.billing_cycle ? `/${channel.billing_cycle.replace("_", " ")}` : "/month";
  const price = Number(channel?.price ?? 9);

  const previewPosts = isWildfireTour ? WILDFIRE_POSTS : [];
  const stories = isWildfireTour ? WILDFIRE_STORIES : [];

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        navigate("/auth");
        return;
      }
      if (!channel?.id) return;

      const { error } = await supabase
        .from("channel_subscriptions" as never)
        .insert({
          subscriber_id: user.id,
          channel_id: channel.id,
          currency,
          status: "active",
        } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      setSubscribed(true);
      toast.success("Subscription active.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not subscribe.");
    },
  });

  return (
    <AppShell
      xrayBase="subscription-channel"
      pageTitle="Subscription Channel"
      breadcrumbs={`Marketplace / ${creatorName}`}
      hero={
        <Hero
          variant="app"
          eyebrow="Subscription Channel"
          headline="Support the creator directly, inside the cooperative"
          body="A Subscription Channel is the creator's premium home for exclusive posts, recurring updates, and member-backed publishing. Subscribers can preview the channel, choose how to subscribe, and see the economics clearly."
          primaryCTA={{ label: "Subscribe Now", href: "#subscription-channel-subscribe-anchor" }}
          secondaryCTA={{ label: "Preview Recent Posts", href: "#subscription-channel-preview-anchor" }}
          proofStrip={["Creator keeps 83.3%", "All 4 currencies accepted", "Cancel any time"]}
        />
      }
    >
      <div className="space-y-6 pb-24">
        <div {...tourTarget} />
        <div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm" data-xray-id="subscription-channel-title">
          {creatorName} · {channelTitle}
        </div>

        <div id="subscription-channel-preview-anchor" data-xray-id="subscription-channel-tour-anchor" />
        <ChannelPreviewPanel posts={previewPosts} />

        <SubscriptionEconomicsCard price={price} cycleLabel={cycleLabel} />

        <div id="subscription-channel-subscribe-anchor" data-xray-id="subscription-channel-subscribe-anchor" />
        <CurrencyOptionSelector value={currency} onChange={setCurrency} />

        <SubscribeConfirmation
          selectedCurrency={currency}
          canSubscribe={!subscribeMutation.isPending}
          onSubscribe={() => subscribeMutation.mutate()}
          subscribed={subscribed}
        />

        <SubscriberBenefitsRail />
        <RecentSubscriberStories stories={stories} />
      </div>
      <StickyMobileCTA primary={{ label: "Subscribe Now", href: "#subscription-channel-subscribe-anchor" }} />
    </AppShell>
  );
}
