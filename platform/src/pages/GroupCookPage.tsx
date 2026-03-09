/**
 * GROUP COOK PAGE
 * ================
 * Find and join group cooking sessions at community kitchens.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Sparkles, MapPin, Calendar } from "lucide-react";
import { GroupCookSessionFinder } from "@/components/GroupCookSessionFinder";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function GroupCookPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleJoinSession = (session: any) => {
    setSelectedSession(session);
    setShowConfirmDialog(true);
  };

  const confirmJoin = () => {
    toast({
      title: "Session Joined!",
      description: `You're signed up for ${selectedSession?.title}`,
    });
    setShowConfirmDialog(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/?view=initiatives')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Initiatives</span>
          </button>

          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-400" />
            <span className="font-bold text-white">Group Cook Sessions</span>
          </div>

          <button
            onClick={() => navigate('/initiatives/family-table/host-session')}
            className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 text-sm font-medium hover:bg-purple-500/30 transition-all"
          >
            Host a Session
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/40 mb-4">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-purple-300 text-sm">Part of The Family Table</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Cook Together, Eat Together
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Join group cooking sessions at community kitchens near you. Share the work, learn new skills, and take home multiple meals.
          </p>

          {/* Quick Stats */}
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">47</div>
              <div className="text-xs text-white/50">Sessions This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">23</div>
              <div className="text-xs text-white/50">Verified Kitchens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">156</div>
              <div className="text-xs text-white/50">Active Hosts</div>
            </div>
          </div>
        </motion.div>

        {/* Session Finder */}
        <GroupCookSessionFinder onJoinSession={handleJoinSession} />
      </main>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-slate-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Join Session</DialogTitle>
            <DialogDescription className="text-white/60">
              Confirm your spot at this cooking session
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/15">
                <h3 className="font-bold text-white text-lg mb-2">
                  {selectedSession.title}
                </h3>
                <div className="space-y-2 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedSession.startTime} - {selectedSession.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedSession.facility?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Host: {selectedSession.host?.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <span className="text-white/80">Cost per person</span>
                <span className="text-xl font-bold text-white">${selectedSession.costPerPerson}</span>
              </div>

              {selectedSession.bringYourBox && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300">
                  💡 Bring your Grocery Box for this session!
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmJoin}
                  className="flex-1 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-all"
                >
                  Confirm & Pay
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="py-8 text-center text-white/40 text-sm border-t border-white/10">
        <p>© 2026 Liana Banyan Corporation</p>
        <p className="mt-1">Part of the Meal Ecosystem</p>
      </footer>
    </div>
  );
}
