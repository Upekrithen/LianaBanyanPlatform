export type SchedulingTarget =
  | "helm-calendar"
  | "distribution-grid"
  | "cue-card-dispatch";

export type ContentType =
  | "pudding"
  | "bst_episode"
  | "spoonful"
  | "skipping_stone"
  | "paper"
  | "cue_card"
  | "distribution_post";

export interface SchedulingEntry {
  id?: string;
  contentType: ContentType;
  contentId: string;
  contentTitle: string;
  scheduledAt: Date;
  reminderOffset?: string | null;
  recurrenceRule?: string | null;
  label?: string | null;
  target: SchedulingTarget;
  contentUrl?: string;
}

export type ReminderOption = {
  value: string;
  label: string;
  interval: string | null;
};
