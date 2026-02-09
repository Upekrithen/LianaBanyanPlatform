import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, CheckCircle2, XCircle, Scan, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function MedallionQRVerification() {
  const { toast } = useToast();
  const [qrData, setQrData] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const verifyQRCode = async () => {
    setVerifying(true);
    setVerificationResult(null);

    try {
      // Parse QR data - expecting format: lb://medallion/{projectId}/{userId}
      const url = new URL(qrData.startsWith('http') ? qrData : `lb://${qrData}`);
      const parts = url.pathname.split('/').filter(Boolean);

      if (parts[0] !== 'medallion') {
        throw new Error('Invalid QR code format');
      }

      const [, projectId, userId] = parts;

      // Verify medallion eligibility
      const { data: eligibility, error } = await supabase
        .from('medallion_eligibility')
        .select(`
          *,
          projects:project_id (
            name,
            project_sku,
            medallion_funded
          ),
          profiles:user_id (
            full_name,
            display_name
          )
        `)
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!eligibility) {
        setVerificationResult({
          valid: false,
          error: 'No medallion record found',
        });
      } else {
        setVerificationResult({
          valid: true,
          data: eligibility,
          isLegitimate: eligibility.medallion_minted && eligibility.is_eligible,
        });
      }
    } catch (error) {
      setVerificationResult({
        valid: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      });
      toast({
        title: 'Verification Failed',
        description: 'Could not verify QR code',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  const getBlockchainExplorerUrl = (txHash: string) => {
    return `https://basescan.org/tx/${txHash}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Medallion QR Verification
          </CardTitle>
          <CardDescription>
            Verify the authenticity of physical medallions and badges
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Scan or paste QR code data (lb://medallion/...)"
                value={qrData}
                onChange={(e) => setQrData(e.target.value)}
              />
              <Button
                onClick={verifyQRCode}
                disabled={!qrData || verifying}
              >
                <Scan className="w-4 h-4 mr-2" />
                Verify
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Expected format: lb://medallion/[project-id]/[user-id]
            </p>
          </div>

          {verificationResult && (
            <Alert className={verificationResult.valid && verificationResult.isLegitimate
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : verificationResult.valid
              ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }>
              <AlertDescription>
                {verificationResult.valid && verificationResult.isLegitimate ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-900 dark:text-green-100">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-semibold">Verified Authentic Medallion</span>
                    </div>

                    <div className="grid gap-3 text-sm">
                      <div>
                        <span className="font-medium">Project:</span>{' '}
                        {verificationResult.data.projects?.name}
                        {verificationResult.data.projects?.project_sku && (
                          <Badge variant="outline" className="ml-2">
                            {verificationResult.data.projects.project_sku}
                          </Badge>
                        )}
                      </div>

                      <div>
                        <span className="font-medium">Holder:</span>{' '}
                        {verificationResult.data.profiles?.display_name || 
                         verificationResult.data.profiles?.full_name || 
                         'Unknown'}
                      </div>

                      <div>
                        <span className="font-medium">Contribution:</span> $
                        {verificationResult.data.contribution_amount?.toFixed(2) || '0.00'}
                      </div>

                      <div>
                        <span className="font-medium">Medallion Tier:</span>{' '}
                        <Badge>
                          Tier {verificationResult.data.medallion_tier || 'N/A'}
                        </Badge>
                      </div>

                      {verificationResult.data.mint_transaction_hash && (
                        <div>
                          <span className="font-medium">Blockchain:</span>{' '}
                          <a
                            href={getBlockchainExplorerUrl(verificationResult.data.mint_transaction_hash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                          >
                            View on BaseScan
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {verificationResult.data.projects?.medallion_funded && (
                        <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-medium">
                              Project successfully funded and medallion minted
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : verificationResult.valid ? (
                  <div className="space-y-2 text-amber-900 dark:text-amber-100">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      <span className="font-semibold">Medallion Record Found</span>
                    </div>
                    <p className="text-sm">
                      This medallion exists in the system but has not been minted to the blockchain yet.
                      {!verificationResult.data.is_eligible && ' User may not be eligible.'}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-900 dark:text-red-100">
                    <XCircle className="w-5 h-5" />
                    <div>
                      <span className="font-semibold">Verification Failed</span>
                      <p className="text-sm mt-1">{verificationResult.error}</p>
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generate Medallion QR Code</CardTitle>
          <CardDescription>
            Create a QR code for testing or offline verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-center p-6 bg-muted rounded-lg">
              <QRCodeSVG
                value={qrData || 'lb://medallion/example/example'}
                size={200}
                level="H"
                includeMargin
              />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              {qrData || 'Enter medallion data to generate QR code'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
