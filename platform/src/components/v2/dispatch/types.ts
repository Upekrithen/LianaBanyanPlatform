export type DispatchWorkflowState = "Draft" | "Review" | "Scheduled" | "Dispatched" | "Archived";

export type DispatchChannelId =
  | "email_broadcast"
  | "sms_broadcast"
  | "in_app_notification"
  | "oob_auto_post"
  | "beacon"
  | "treasure_map_nudge"
  | "crew_call_feed"
  | "guild_channel"
  | "tribe_channel"
  | "family_table"
  | "helm_broadcast";

export type DispatchScope = "all_members" | "guild";

export interface DispatchChannel {
  id: DispatchChannelId;
  name: string;
  maxChars: number;
  ctaStyle: "short" | "standard";
}

export interface QueueDispatchItem {
  id: string;
  status: string;
  content: string;
  platform: string;
  createdAt: string;
  scheduledFor: string | null;
}
