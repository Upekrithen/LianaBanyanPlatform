export type ChannelPreviewPost = {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
};

export type SubscriptionCurrency = "marks" | "credits" | "joules" | "dollars";

export type SubscriberStory = {
  id: string;
  name: string;
  quote: string;
  role: string;
};
