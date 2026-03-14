import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Construction, Users, Briefcase, Gift, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export function DevelopmentBadge() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/') return null;

  return (
    <>
      {/* Fixed position badge - bottom right */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 bg-gradient-to-r from-amber-500/90 to-orange-500/90 hover:from-amber-500 hover:to-orange-500 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
        >
          {/* Pulsing dot */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <span className="font-semibold text-sm">LIVE — ALPHA RELEASE</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Join the Crew Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Construction className="w-6 h-6 text-amber-500" />
              Join the Crew
            </DialogTitle>
            <DialogDescription>
              We're building something different. Want in?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Hiring Bounties - PROMINENT */}
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/help-wanted");
              }}
              className="w-full group relative overflow-hidden rounded-lg border-2 border-amber-500 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4 hover:from-amber-500/20 hover:to-orange-500/20 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-amber-500/20 p-2">
                  <Briefcase className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">Hiring Bounties</span>
                    <Badge variant="secondary" className="bg-amber-500 text-white text-xs">
                      PAID
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get paid to help build. Credits + MARKS + Joules for completed work.
                  </p>
                  <div className="mt-2 text-xs text-amber-600 font-medium">
                    Video Editor • Developer • Designer • Writer • More →
                  </div>
                </div>
              </div>
            </button>

            {/* Become a Member */}
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/auth?mode=signup");
              }}
              className="w-full group rounded-lg border p-4 hover:bg-accent/50 transition-all text-left"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Become a Member</span>
                    <Badge variant="outline" className="text-xs">$5/year</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Join the cooperative. Keep 83.3% of what you create.
                  </p>
                </div>
              </div>
            </button>

            {/* Red Carpet */}
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/RedCarpet");
              }}
              className="w-full group rounded-lg border p-4 hover:bg-accent/50 transition-all text-left"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-red-500/10 p-2">
                  <Gift className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Red Carpet Access</span>
                    <Badge variant="outline" className="text-xs border-red-500 text-red-500">INVITE</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Have an invitation code? Claim your reserved position.
                  </p>
                </div>
              </div>
            </button>

            {/* Explore as Ghost */}
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/ghost");
              }}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Just looking? Explore as a Ghost →
            </button>
          </div>

          <div className="border-t pt-4 text-center text-xs text-muted-foreground">
            <p>Built in public since October 2025</p>
            <p className="mt-1">1,614 innovations • 1,336 patent claims • Member-owned</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
