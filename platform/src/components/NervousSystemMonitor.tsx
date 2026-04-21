/**
 * Nervous System Monitor
 *
 * Dashboard component for monitoring platform health, sync status,
 * and critical metrics across the Liana Banyan ecosystem.
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getNervousSystemStatus,
  CRITICAL_NUMBERS,
  getSyncStatusSummary,
  getLettersNeedingSync
} from '@/lib/nervous-system';
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  FileText,
  Database,
  BarChart3,
  Link2
} from 'lucide-react';

interface NervousSystemStatus {
  ipLedger: {
    totalEntries: number;
    chainValid: boolean;
    entriesByType: Record<string, number>;
  };
  contentVersioning: {
    totalVersions: number;
    uniqueContent: number;
    recentActivity: number;
  };
  platformMetrics: {
    innovationCount: number;
    patentClaims: number;
    platformMargin: number;
  };
  cephasSync: {
    total: number;
    synced: number;
    pending: number;
    outdated: number;
  };
  overallHealth: 'healthy' | 'warning' | 'critical';
  lastChecked: string;
}

export function NervousSystemMonitor() {
  const [status, setStatus] = useState<NervousSystemStatus | null>(null);
  const [lettersNeedingSync, setLettersNeedingSync] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const [systemStatus, letters] = await Promise.all([
        getNervousSystemStatus(),
        getLettersNeedingSync()
      ]);
      setStatus(systemStatus);
      setLettersNeedingSync(letters);
    } catch (err) {
      setError('Failed to fetch Nervous System status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getHealthBadge = (health: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      healthy: 'default',
      warning: 'secondary',
      critical: 'destructive'
    };
    return (
      <Badge variant={variants[health] || 'outline'}>
        {health.toUpperCase()}
      </Badge>
    );
  };

  if (loading && !status) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Loading Nervous System status...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8 text-red-500">
          <XCircle className="h-6 w-6 mr-2" />
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Nervous System Monitor
          </CardTitle>
          <div className="flex items-center gap-2">
            {status && getHealthIcon(status.overallHealth)}
            {status && getHealthBadge(status.overallHealth)}
            <Button variant="ghost" size="sm" onClick={fetchStatus} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Last checked: {status ? new Date(status.lastChecked).toLocaleString() : 'Never'}
          </p>
        </CardContent>
      </Card>

      {/* Critical Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5" />
            Critical Numbers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{CRITICAL_NUMBERS.INNOVATIONS}</div>
              <div className="text-xs text-muted-foreground">Innovations</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{CRITICAL_NUMBERS.PATENT_CLAIMS}</div>
              <div className="text-xs text-muted-foreground">Patent Claims</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{CRITICAL_NUMBERS.CREATOR_KEEPS}%</div>
              <div className="text-xs text-muted-foreground">Creator Keeps</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">${CRITICAL_NUMBERS.MEMBERSHIP_COST}</div>
              <div className="text-xs text-muted-foreground">Membership/Year</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* IP Ledger */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5" />
              IP Ledger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Entries</span>
                <span className="font-medium">{status?.ipLedger.totalEntries || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Chain Integrity</span>
                <Badge variant={status?.ipLedger.chainValid ? 'default' : 'destructive'}>
                  {status?.ipLedger.chainValid ? 'VALID' : 'BROKEN'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Versioning */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Content Versioning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Versions</span>
                <span className="font-medium">{status?.contentVersioning.totalVersions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Unique Content</span>
                <span className="font-medium">{status?.contentVersioning.uniqueContent || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">24h Activity</span>
                <span className="font-medium">{status?.contentVersioning.recentActivity || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cephas Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Link2 className="h-5 w-5" />
              Cephas Sync Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Synced</span>
                <Badge variant="default">{status?.cephasSync.synced || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pending</span>
                <Badge variant="secondary">{status?.cephasSync.pending || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Outdated</span>
                <Badge variant="destructive">{status?.cephasSync.outdated || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Letters Needing Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Letters Needing Sync
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lettersNeedingSync.length === 0 ? (
              <p className="text-sm text-muted-foreground">All letters synced!</p>
            ) : (
              <ul className="text-sm space-y-1">
                {lettersNeedingSync.slice(0, 5).map((letter, i) => (
                  <li key={i} className="text-muted-foreground truncate">
                    {letter.split('/').pop()}
                  </li>
                ))}
                {lettersNeedingSync.length > 5 && (
                  <li className="text-muted-foreground">
                    +{lettersNeedingSync.length - 5} more...
                  </li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default NervousSystemMonitor;
