import {
  Briefcase,
  CarFront,
  GraduationCap,
  Heart,
  Home,
  Shield,
  User,
} from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { THREAD_LABELS, ThreadType, WeekThreadEvent } from "./types";

type ThreadEventTileProps = {
  event: WeekThreadEvent;
};

const THREAD_STYLE: Record<ThreadType, { chip: string; dot: string; icon: ComponentType<{ className?: string }> }> = {
  personal: { chip: "bg-sky-100 text-sky-800", dot: "bg-sky-500", icon: User },
  family: { chip: "bg-rose-100 text-rose-800", dot: "bg-rose-500", icon: Home },
  business: { chip: "bg-violet-100 text-violet-800", dot: "bg-violet-500", icon: Briefcase },
  coalition: { chip: "bg-amber-100 text-amber-800", dot: "bg-amber-500", icon: Heart },
  route: { chip: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500", icon: CarFront },
  defense: { chip: "bg-indigo-100 text-indigo-800", dot: "bg-indigo-500", icon: Shield },
  education: { chip: "bg-cyan-100 text-cyan-800", dot: "bg-cyan-500", icon: GraduationCap },
};

export function ThreadEventTile({ event }: ThreadEventTileProps) {
  const style = THREAD_STYLE[event.thread];
  const Icon = style.icon;
  const hours = Math.max(0, event.endHour - event.startHour);

  return (
    <div className="rounded-md border bg-background p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-full", style.dot)} aria-hidden />
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", style.chip)}>
            <Icon className="h-3 w-3" />
            {THREAD_LABELS[event.thread]}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{hours}h</span>
      </div>
      <p className="mt-2 text-sm font-medium">{event.title}</p>
      <p className="text-xs text-muted-foreground">
        {event.startHour}:00 - {event.endHour}:00
        {event.location ? ` · ${event.location}` : ""}
      </p>
    </div>
  );
}
