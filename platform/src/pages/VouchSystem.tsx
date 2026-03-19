import { Link } from 'react-router-dom';
import { ArrowLeft, UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function VouchSystem() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="text-center py-16">
          <UserCheck className="w-16 h-16 mx-auto mb-4 text-amber-400" />
          <h1 className="text-3xl font-bold mb-2">Vouch & Recommend</h1>
          <p className="text-slate-400 mb-8">Your word is your bond</p>
          <Card className="bg-slate-800/50 border-slate-700 max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <p className="text-amber-400 font-semibold">Coming Soon</p>
              <p className="text-slate-400 text-sm mt-2">This feature is being built right now. Check back shortly.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
