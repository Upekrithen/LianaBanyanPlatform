import { Badge } from "@/components/ui/badge";

type ActiveBookingStatusBarProps = {
  bookingCount: number;
};

export function ActiveBookingStatusBar({ bookingCount }: ActiveBookingStatusBarProps) {
  if (bookingCount <= 0) return null;

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="bg-amber-600 text-white">Active booking</Badge>
        <p className="text-sm text-amber-900 dark:text-amber-200">
          You currently have {bookingCount} active crew booking{bookingCount === 1 ? "" : "s"}.
        </p>
      </div>
    </div>
  );
}
