/**
 * AMBASSADOR CHAIN PAGE — /ambassador/chain (public read-only chain tree).
 */

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AmbassadorChainTree } from "@/components/ambassador/AmbassadorChainTree";
import { ArrowLeft } from "lucide-react";

export default function AmbassadorChainPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate("/portal")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Portal
        </Button>
        <AmbassadorChainTree />
      </div>
    </div>
  );
}
