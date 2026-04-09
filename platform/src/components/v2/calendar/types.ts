export type ThreadType =
  | "personal"
  | "family"
  | "business"
  | "coalition"
  | "route"
  | "defense"
  | "education";

export type WeekThreadEvent = {
  id: string;
  title: string;
  dayIndex: number;
  startHour: number;
  endHour: number;
  thread: ThreadType;
  location?: string;
};

export const THREAD_ORDER: ThreadType[] = [
  "personal",
  "family",
  "business",
  "coalition",
  "route",
  "defense",
  "education",
];

export const THREAD_LABELS: Record<ThreadType, string> = {
  personal: "Personal",
  family: "Family",
  business: "Business",
  coalition: "Coalition",
  route: "Route",
  defense: "Defense",
  education: "Education",
};
