import React from 'react';
import { useBuilderMode } from './BuilderModeContext';
import { X, Upload, Coins, ShieldCheck, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const LarkSidePanel: React.FC = () => {
  const { isBuilderModeActive, activeLarkPanel, closeLarkPanel } = useBuilderMode();

  if (!isBuilderModeActive || !activeLarkPanel) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={closeLarkPanel}
      />
      
      {/* Side Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-950 border-l border-slate-800 z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div>
            <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
              Submit a Lark
            </h2>
            <p className="text-sm text-slate-400">Target: {activeLarkPanel}</p>
          </div>
          <button 
            onClick={closeLarkPanel}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <Card className="bg-cyan-950/30 border-cyan-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-cyan-300 flex items-center gap-2">
                <Coins className="w-5 h-5" />
                The Bounty
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-cyan-100/80 space-y-2">
              <p>
                If your Lark (improvement) is accepted by the community, you earn the attached Credits. 
              </p>
              <div className="bg-slate-900 p-3 rounded-md border border-slate-800 flex items-start gap-3 mt-4">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300">
                <strong>Backed by Real IP:</strong> 50 Credits is real economic value. Not a made-up valuation, not a guess — we have the receipts. We spent $525,000 over 9 years developing the IP that backs this platform. You are earning fractional participation in that proven value.
              </p>
            </div>
                      <div className="bg-slate-900 p-3 rounded-md border border-slate-800 flex items-start gap-3 mt-2">
                        <FileText className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-300">
                          <strong>SEC Compliance & Crowdfunding:</strong> When we use third-party sites like Kickstarter, we are offering <em>Rewards</em> (Joules/Utility Vouchers). Kickstarter strictly prohibits offering securities or fractional IP participation. To legally offer fractional IP participation under Regulation Crowdfunding (Reg CF) of the JOBS Act, we must use registered crowdfunding portals (like Wefunder or Republic) who handle the SEC Form C filings, or manage it internally through our compliant cooperative revenue-share structure.
                        </p>
                      </div>
          </CardContent>
        </Card>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-200">How to submit:</h3>
            <ol className="list-decimal list-inside text-sm text-slate-400 space-y-3">
              <li>Fork the component code or design file.</li>
              <li>Make your improvements (better UI, cleaner code, clearer copy).</li>
              <li>Upload your submission here for Star Chamber review.</li>
            </ol>
          </div>

          <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:bg-slate-900/50 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-300">Drop your files here</p>
            <p className="text-xs text-slate-500 mt-1">or click to browse</p>
          </div>

          <Button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white">
            Submit for Review
          </Button>

          <div className="pt-4 border-t border-slate-800 text-center">
            <a href="/public-ledger" className="text-xs text-cyan-500 hover:text-cyan-400 flex items-center justify-center gap-1">
              <FileText className="w-3 h-3" />
              View the "Fly on the Wall" Bank Transaction Proofs
            </a>
          </div>

        </div>
      </div>
    </>
  );
};
