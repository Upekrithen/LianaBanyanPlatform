/**
 * PORTAL GATEWAY — The "Dell-Style" Progressive Disclosure Gateway
 * ================================================================
 * Replaces the old Ghost/Real world binary with a 4-door open world approach.
 * Users choose their path based on their immediate interest, but all paths
 * eventually expose them to the full ecosystem.
 */

import { useNavigate } from 'react-router-dom';
import { Gamepad2, Printer, Rocket, Landmark, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TestNetExplainer } from '@/components/TestNetExplainer';
import './PortalGateway.css';

export default function PortalGateway() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            What do you want to do today?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your path. Every door leads to the same cooperative ecosystem, 
            but you get to start exactly where you want.
          </p>
        </div>

        {/* The 4 Doors (Dell-Style Routing) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Door 1: I Want to Earn Money → Treasure Map */}
          <div 
            className="group relative bg-card border-2 border-border hover:border-green-500 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
            onClick={() => navigate('/treasure-map?source=earn')}
          >
            <div className="bg-green-500/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
              <Gamepad2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">I Want to Earn Money</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Answer a few questions and we'll show you 3 ways to start earning in the next 7–14 days.
            </p>
            <div className="flex items-center text-green-500 font-semibold text-sm">
              Find My Path <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Door 2: I Want to Build Something → Treasure Map */}
          <div 
            className="group relative bg-card border-2 border-border hover:border-amber-500 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
            onClick={() => navigate('/treasure-map?source=build')}
          >
            <div className="bg-amber-500/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
              <Printer className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">I Want to Build Something</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Tell us your skills and tools — we'll match you to a product or initiative you can start this week.
            </p>
            <div className="flex items-center text-amber-500 font-semibold text-sm">
              Find My Path <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Door 3: Launch & Build */}
          <div 
            className="group relative bg-card border-2 border-border hover:border-green-500 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
            onClick={() => navigate('/launch')}
          >
            <div className="bg-green-500/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
              <Rocket className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Launch & Build</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Have an idea? Launch it. Want to run something? Pick an initiative and start a node.
            </p>
            <div className="flex items-center text-green-500 font-semibold text-sm">
              Get Started <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Door 4: Sponsor & Support */}
          <div 
            className="group relative bg-card border-2 border-border hover:border-purple-500 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
            onClick={() => navigate('/sponsor')}
          >
            <div className="bg-purple-500/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
              <Landmark className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Sponsor & Support</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Back projects, fund initiatives, and earn Platform Service Vouchers (Joules) for the future.
            </p>
            <div className="flex items-center text-purple-500 font-semibold text-sm">
              View Opportunities <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <button
            type="button"
            className="hover:underline hover:text-foreground transition-colors"
            onClick={() => navigate("/treasure-map")}
          >
            Join a Crew — find your path in 3 minutes
          </button>
        </p>

        {/* The Legal/Economic Shield (TestNet Explainer) */}
        <div className="mt-16 max-w-4xl mx-auto">
          <TestNetExplainer />
        </div>

      </div>
    </div>
  );
}
