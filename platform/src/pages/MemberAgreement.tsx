import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function MemberAgreement() {
  return (
    <PortalPageLayout variant="stage" maxWidth="lg" xrayId="member-agreement">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="text-center py-16">
          <FileText className="w-16 h-16 mx-auto mb-4 text-amber-400" />
          <h1 className="text-3xl font-bold mb-2">Member Agreement</h1>
          <p className="text-slate-400 mb-8">The cooperative compact — plain language, real commitment</p>
          <Card className="bg-slate-800/50 border-slate-700 max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <p className="text-amber-400 font-semibold">Coming Soon</p>
              <p className="text-slate-400 text-sm mt-2">This feature is being built right now. Check back shortly.</p>
            </CardContent>
          </Card>
        </div>
    </PortalPageLayout>
  );
}
