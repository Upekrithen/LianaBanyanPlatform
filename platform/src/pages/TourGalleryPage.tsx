/**
 * TourGalleryPage — Theme Park Ride Menu
 * =======================================
 * /tour/packages — Grid of tour packages ("rides") the member can take.
 * Each card shows progress, difficulty, time, and Marks reward.
 *
 * K198 / Bishop B052
 */
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Ticket, Clock, Star, CheckCircle2, ChevronRight, ArrowLeft,
} from "lucide-react";
import { useTourPackages, useTourPackageProgress, type TourPackage, type TourPackageProgress } from "@/hooks/useTourPackages";

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  advanced: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

function PackageCard({
  pkg,
  progress,
  onStart,
}: {
  pkg: TourPackage;
  progress: TourPackageProgress | undefined;
  onStart: (slug: string) => void;
}) {
  const isCompleted = !!progress?.completed_at;
  const isStarted = !!progress && !isCompleted;
  const stopsTotal = pkg.stop_slugs.length;
  const stopsCompleted = progress?.completed_stops?.length ?? 0;
  const pct = stopsTotal > 0 ? Math.round((stopsCompleted / stopsTotal) * 100) : 0;

  return (
    <Card
      className={`group relative overflow-hidden transition-all hover:shadow-lg cursor-pointer ${
        isCompleted
          ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/10"
          : "hover:border-primary/40"
      }`}
      onClick={() => onStart(pkg.slug)}
    >
      {isCompleted && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        </div>
      )}

      <CardHeader className="pb-3 text-center">
        <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{pkg.icon}</div>
        <CardTitle className="text-lg">{pkg.title}</CardTitle>
        {pkg.subtitle && <CardDescription>{pkg.subtitle}</CardDescription>}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Badge className={DIFFICULTY_COLORS[pkg.difficulty] || DIFFICULTY_COLORS.beginner}>
            {pkg.difficulty}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" /> ~{pkg.estimated_minutes} min
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Star className="w-3 h-3 text-amber-500" /> {pkg.marks_reward} Marks
          </Badge>
        </div>

        <div className="text-xs text-center text-muted-foreground">
          {stopsTotal} stop{stopsTotal !== 1 ? "s" : ""}
        </div>

        {isStarted && (
          <div className="space-y-1">
            <Progress value={pct} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {stopsCompleted} of {stopsTotal} stops visited
            </p>
          </div>
        )}

        <Button
          className="w-full gap-2"
          variant={isCompleted ? "outline" : isStarted ? "secondary" : "default"}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Completed
            </>
          ) : isStarted ? (
            <>
              Continue <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <Ticket className="w-4 h-4" /> Start Tour
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function TourGalleryPage() {
  const navigate = useNavigate();
  const { data: packages = [], isLoading: loadingPkgs } = useTourPackages();
  const { progress, isLoading: loadingProgress } = useTourPackageProgress();

  const completedCount = useMemo(
    () => Object.values(progress).filter((p) => p.completed_at).length,
    [progress]
  );

  const totalMarksEarned = useMemo(
    () => packages.reduce((sum, pkg) => {
      const p = progress[pkg.slug];
      return sum + (p?.marks_awarded ? pkg.marks_reward : 0);
    }, 0),
    [packages, progress]
  );

  const handleStart = (slug: string) => {
    navigate(`/tour?package=${slug}`);
  };

  const loading = loadingPkgs || loadingProgress;

  return (
    <PortalPageLayout maxWidth="lg" xrayId="tour-gallery-page">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => navigate("/tour")}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Guided Tour
          </Button>

          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <Ticket className="w-8 h-8 text-primary" />
            Tour Packages
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Choose your ride. Each package is a themed journey through Liana Banyan — complete one and earn Marks toward your first 100.
          </p>
        </div>

        {/* Stats strip */}
        {(completedCount > 0 || totalMarksEarned > 0) && (
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="font-semibold">{completedCount}</span>
              <span className="text-muted-foreground">completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="font-semibold">{totalMarksEarned}</span>
              <span className="text-muted-foreground">Marks earned</span>
            </div>
          </div>
        )}

        {/* Package grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-8 pb-6 space-y-4">
                  <div className="w-12 h-12 bg-muted rounded-full mx-auto" />
                  <div className="h-5 bg-muted rounded w-2/3 mx-auto" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-10 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.slug}
                pkg={pkg}
                progress={progress[pkg.slug]}
                onStart={handleStart}
              />
            ))}
          </div>
        )}

        {/* Footer hint */}
        {!loading && packages.length > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            More packages unlock as the platform grows. Complete all four to earn up to{" "}
            <strong>{packages.reduce((s, p) => s + p.marks_reward, 0)} Marks</strong>.
          </p>
        )}
      </div>
    </PortalPageLayout>
  );
}
