import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Heart,
  Share2,
  Copy,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  CheckCircle,
  MapPin,
  Users,
  Target,
  ExternalLink,
  QrCode,
} from "lucide-react";
import { toast } from "sonner";

interface SwoopProject {
  id: string;
  slug: string;
  title: string;
  recipient_name: string;
  recipient_location: string;
  medical_situation: string;
  category: string;
  goal_amount: number;
  current_amount: number;
  vote_count: number;
  status: string;
  verification_status: string;
  project_lead_name: string;
}

interface SwoopCueCardProps {
  project: SwoopProject;
  variant?: "compact" | "full" | "share";
  showShareButton?: boolean;
}

export function SwoopCueCard({
  project,
  variant = "full",
  showShareButton = true,
}: SwoopCueCardProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const progress = Math.min((project.current_amount / project.goal_amount) * 100, 100);
  const projectUrl = `https://lianabanyan.com/swoop/${project.slug}`;

  const shareText = `Help ${project.recipient_name} through a difficult time. ${project.title} - every dollar goes directly to the family. #DoTheSwoop`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(projectUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(projectUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(projectUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(projectUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareByEmail = () => {
    const subject = encodeURIComponent(`Help ${project.recipient_name} - ${project.title}`);
    const body = encodeURIComponent(`${shareText}\n\nLearn more and contribute: ${projectUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "medical":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "housing":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "disaster":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "funeral":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "medical":
        return "🏥";
      case "housing":
        return "🏠";
      case "disaster":
        return "🌪️";
      case "funeral":
        return "🕯️";
      default:
        return "💝";
    }
  };

  if (variant === "compact") {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-3xl">{getCategoryIcon(project.category)}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{project.title}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {project.recipient_location}
              </p>
              <div className="mt-2">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs mt-1">
                  <span>${project.current_amount.toLocaleString()}</span>
                  <span className="text-muted-foreground">of ${project.goal_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        ref={cardRef}
        className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-2"
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              <span className="font-semibold">Do The Swoop</span>
            </div>
            <Badge className="bg-white/20 text-white border-white/30">
              {project.verification_status === "verified" ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </>
              ) : (
                project.status
              )}
            </Badge>
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          {/* Category & Location */}
          <div className="flex items-center justify-between">
            <Badge className={getCategoryColor(project.category)}>
              {getCategoryIcon(project.category)} {project.category}
            </Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {project.recipient_location}
            </span>
          </div>

          {/* Title & Recipient */}
          <div>
            <h2 className="text-xl font-bold text-slate-900">{project.title}</h2>
            <p className="text-muted-foreground mt-1">
              Supporting <span className="font-medium text-slate-700">{project.recipient_name}</span>
            </p>
          </div>

          {/* Situation Summary */}
          <p className="text-sm text-slate-600 line-clamp-3">
            {project.medical_situation}
          </p>

          {/* Progress Section */}
          <div className="bg-slate-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-500" />
                <span className="font-medium">Funding Progress</span>
              </div>
              <span className="text-lg font-bold text-rose-600">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-3 bg-slate-200" />
            <div className="flex justify-between mt-2 text-sm">
              <span className="font-semibold text-slate-900">
                ${project.current_amount.toLocaleString()}
              </span>
              <span className="text-muted-foreground">
                goal: ${project.goal_amount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-around py-2 border-y">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-rose-500">
                <Users className="w-4 h-4" />
                <span className="font-bold">{project.vote_count}</span>
              </div>
              <span className="text-xs text-muted-foreground">Supporters</span>
            </div>
            <div className="text-center">
              <div className="font-bold text-slate-700">
                {project.project_lead_name?.split(" ")[0] || "Community"}
              </div>
              <span className="text-xs text-muted-foreground">Project Lead</span>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600">$0</div>
              <span className="text-xs text-muted-foreground">Platform Fee</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-2">
            <Button className="flex-1 bg-rose-500 hover:bg-rose-600">
              <Heart className="w-4 h-4 mr-2" />
              Contribute
            </Button>
            {showShareButton && (
              <Button
                variant="outline"
                onClick={() => setShareDialogOpen(true)}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground pt-2 border-t">
            <p>100% of donations go directly to the family</p>
            <p className="font-medium text-slate-600 mt-1">lianabanyan.com/swoop/{project.slug}</p>
          </div>
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share This Campaign</DialogTitle>
            <DialogDescription>
              Help spread the word about {project.recipient_name}'s campaign
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Quick Share Buttons */}
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-blue-50 hover:border-blue-300"
                onClick={shareToTwitter}
              >
                <Twitter className="w-5 h-5 text-blue-400" />
                <span className="text-xs">Twitter</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-blue-50 hover:border-blue-300"
                onClick={shareToFacebook}
              >
                <Facebook className="w-5 h-5 text-blue-600" />
                <span className="text-xs">Facebook</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-blue-50 hover:border-blue-300"
                onClick={shareToLinkedIn}
              >
                <Linkedin className="w-5 h-5 text-blue-700" />
                <span className="text-xs">LinkedIn</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-amber-50 hover:border-amber-300"
                onClick={shareByEmail}
              >
                <Mail className="w-5 h-5 text-amber-600" />
                <span className="text-xs">Email</span>
              </Button>
            </div>

            {/* Copy Link */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-md px-3 py-2 text-sm truncate">
                {projectUrl}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className={copied ? "bg-green-50 border-green-300" : ""}
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Share Message Preview */}
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Share message:</p>
              <p className="text-sm">{shareText}</p>
            </div>

            {/* Open in New Tab */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(projectUrl, "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Campaign Page
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function SwoopCueCardGrid({ projects }: { projects: SwoopProject[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <SwoopCueCard key={project.id} project={project} />
      ))}
    </div>
  );
}

export default SwoopCueCard;
