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
          
          {/* Door 1: Play & Collect */}
          <div 
            className="group relative bg-card border-2 border-border hover:border-blue-500 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
            onClick={() => navigate('/hexisle')}
          >
            <div className="bg-blue-500/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
              <Gamepad2 className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Play & Collect</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Explore HexIsle, collect physical miniatures, and experience the tactile Water Table.
            </p>
            <div className="flex items-center text-blue-500 font-semibold text-sm">
              Enter the Game <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Door 2: Make & Print */}
          <div 
            className="group relative bg-card border-2 border-border hover:border-orange-500 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
            onClick={() => window.open('https://the2ndsecond.com', '_blank', 'noopener,noreferrer')}
          >
            <div className="bg-orange-500/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition-colors">
              <Printer className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Make & Print</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Got a 3D printer? Get free STLs, join a Prototyper Guild, and earn by testing designs.
            </p>
            <div className="flex items-center text-orange-500 font-semibold text-sm">
              Go to the2ndSecond <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
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

        {/* The Legal/Economic Shield (TestNet Explainer) */}
        <div className="mt-16 max-w-4xl mx-auto">
          <TestNetExplainer />
        </div>

      </div>
    </div>
  );
}
