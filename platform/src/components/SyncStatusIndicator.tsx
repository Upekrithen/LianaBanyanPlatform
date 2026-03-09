import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

interface SyncStatus {
  lastSync: Date | null;
  status: 'synced' | 'syncing' | 'error' | 'pending';
  nextScheduledSync?: Date;
}

export function SyncStatusIndicator() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: null,
    status: 'pending',
  });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    checkSyncStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkSyncStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkSyncStatus = async () => {
    try {
      // Check when last EOI conversion ran by looking at updated_at
      const { data: eoiData, error } = await supabase
        .from('user_credits')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // If table doesn't exist or column missing, just show pending status
      if (error || !eoiData?.updated_at) {
        setSyncStatus({ lastSync: null, status: 'pending' });
        return;
      }

      const lastSync = new Date(eoiData.updated_at);
      const now = new Date();
      const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

      // Calculate next scheduled sync (daily at midnight)
      const nextSync = new Date(lastSync);
      nextSync.setDate(nextSync.getDate() + 1);
      nextSync.setHours(0, 0, 0, 0);

      setSyncStatus({
        lastSync,
        status: hoursSinceSync > 25 ? 'error' : 'synced',
        nextScheduledSync: nextSync,
      });
    } catch {
      // Silently handle errors - sync status is non-critical
      setSyncStatus({ lastSync: null, status: 'pending' });
    }
  };

  const manualSync = async () => {
    setIsSyncing(true);
    setSyncStatus(prev => ({ ...prev, status: 'syncing' }));

    try {
      const { error } = await supabase.functions.invoke('convert-eoi-daily');
      
      if (error) throw error;

      toast.success('Manual sync completed successfully');
      await checkSyncStatus();
    } catch (error) {
      console.error('Manual sync error:', error);
      toast.error('Manual sync failed');
      setSyncStatus(prev => ({ ...prev, status: 'error' }));
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus.status) {
      case 'synced':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'syncing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus.status) {
      case 'synced':
        return 'Synced';
      case 'syncing':
        return 'Syncing...';
      case 'error':
        return 'Sync Error';
      default:
        return 'Pending';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2">
          {getStatusIcon()}
          <span className="text-sm">{getStatusText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Sync Status</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              {syncStatus.lastSync && (
                <p>
                  Last sync: {syncStatus.lastSync.toLocaleString()}
                </p>
              )}
              {syncStatus.nextScheduledSync && (
                <p>
                  Next scheduled: {syncStatus.nextScheduledSync.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              <p>• EOI to credit conversion: Daily at midnight</p>
              <p>• Expired votes check: Every 6 hours</p>
              <p>• Industry pricing sync: Daily at 3 AM</p>
            </div>
          </div>

          <Button
            onClick={manualSync}
            disabled={isSyncing}
            className="w-full"
            size="sm"
          >
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Manual Sync
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
