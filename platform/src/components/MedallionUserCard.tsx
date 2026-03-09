import { Award, CheckCircle2, Clock, Gift, Shield, ExternalLink, QrCode } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface MedallionUserCardProps {
  projectId: string;
  userId: string;
}

export function MedallionUserCard({ projectId, userId }: MedallionUserCardProps) {
  const { data: eligibility } = useQuery({
    queryKey: ['medallion-eligibility', projectId, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('member_medallion_collection')
        .select(`
          *,
          projects:project_id (
            name,
            project_sku
          )
        `)
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const isEligible = eligibility?.is_eligible;
  const isMinted = eligibility?.medallion_minted;
  const totalContribution = eligibility?.total_contribution || 0;
  const contractAddress = eligibility?.token_contract_address;
  const tokenId = eligibility?.medallion_token_id;
  const txHash = eligibility?.minted_tx_hash;
  const projectName = eligibility?.projects?.name || 'Project';

  // Construct blockchain explorer URLs (BaseScan)
  const getExplorerUrl = (type: 'address' | 'token' | 'tx', value?: string) => {
    if (!value) return null;
    const baseUrl = 'https://basescan.org';
    switch (type) {
      case 'address':
        return `${baseUrl}/address/${value}`;
      case 'token':
        return `${baseUrl}/token/${contractAddress}?a=${tokenId}`;
      case 'tx':
        return `${baseUrl}/tx/${value}`;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${
            isMinted 
              ? 'bg-green-100 dark:bg-green-900/30' 
              : 'bg-amber-100 dark:bg-amber-900/30'
          }`}>
            <Award className={`w-8 h-8 ${
              isMinted 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-amber-600 dark:text-amber-400'
            }`} />
          </div>
          <div className="flex-1">
            <CardTitle className="text-2xl">Your Project Medallion</CardTitle>
            <CardDescription>
              A digital badge of your contribution and support
            </CardDescription>
          </div>
          {isMinted && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Active
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* What is it section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            What is a Medallion?
          </h3>
          <p className="text-muted-foreground">
            A medallion is your permanent digital badge of honor for supporting this project early. 
            Think of it like a collectible coin that proves you were here from the beginning and 
            believed in this project's success.
          </p>
        </div>

        <Separator />

        {/* Status section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            {isMinted ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <Clock className="w-5 h-5 text-amber-600" />
            )}
            Your Status
          </h3>
          
          {isMinted ? (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="font-medium text-green-900 dark:text-green-100">
                🎉 Congratulations! You've earned your medallion
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                Your contribution of ${totalContribution.toFixed(2)} has been permanently recorded. 
                This medallion is yours forever and recognizes your early support.
              </p>
            </div>
          ) : isEligible ? (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="font-medium text-amber-900 dark:text-amber-100">
                🎯 You're eligible for a medallion!
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
                Your contribution of ${totalContribution.toFixed(2)} qualifies you for a medallion. 
                It will be created and assigned to you automatically when the project reaches its 
                production milestone.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">Not yet eligible</p>
              <p className="text-sm text-muted-foreground mt-2">
                Support the project to become eligible for a medallion and join the founding community.
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Benefits section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Why It Matters
          </h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <span><strong>Permanent Recognition:</strong> Your support is recorded forever</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <span><strong>Founding Member Status:</strong> Join an exclusive group of early supporters</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <span><strong>Verifiable Proof:</strong> Your medallion is secured by blockchain technology</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <span><strong>Project Updates:</strong> Priority access to news and developments</span>
            </li>
          </ul>
        </div>

        {/* Blockchain verification and explorer links */}
        {isMinted && contractAddress && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm mb-1">Blockchain Verified</p>
                  <p className="text-xs text-muted-foreground">
                    Secured on Base Network
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <QrCode className="w-4 h-4 mr-2" />
                      View QR Code
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{projectName} Medallion</DialogTitle>
                      <DialogDescription>
                        Scan this QR code to view your medallion on the blockchain
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 p-6">
                      {getExplorerUrl('token', contractAddress) && (
                        <QRCodeSVG
                          value={getExplorerUrl('token', contractAddress)!}
                          size={200}
                          level="H"
                          includeMargin
                        />
                      )}
                      <p className="text-xs text-center text-muted-foreground">
                        Token #{tokenId || 'N/A'}
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {contractAddress && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start h-auto py-2"
                    onClick={() => window.open(getExplorerUrl('address', contractAddress) || '#', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2 shrink-0" />
                    <div className="text-left overflow-hidden">
                      <p className="text-xs font-medium">Contract Address</p>
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {contractAddress.slice(0, 12)}...{contractAddress.slice(-10)}
                      </p>
                    </div>
                  </Button>
                )}
                {txHash && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start h-auto py-2"
                    onClick={() => window.open(getExplorerUrl('tx', txHash) || '#', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2 shrink-0" />
                    <div className="text-left overflow-hidden">
                      <p className="text-xs font-medium">Mint Transaction</p>
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {txHash.slice(0, 12)}...{txHash.slice(-10)}
                      </p>
                    </div>
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}