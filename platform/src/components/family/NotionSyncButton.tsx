/**
 * NOTION SYNC BUTTON
 * ==================
 * Button to sync a gift list with a Notion database.
 * Supports importing items and exporting claims.
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  RefreshCw, Link, Check, AlertCircle, ExternalLink,
  Download, Upload, ArrowLeftRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface NotionSyncButtonProps {
  listId: string;
  notionDatabaseId?: string;
  lastSyncedAt?: string;
  isOwner: boolean;
}

export function NotionSyncButton({
  listId,
  notionDatabaseId,
  lastSyncedAt,
  isOwner,
}: NotionSyncButtonProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const [showDialog, setShowDialog] = useState(false);
  const [databaseId, setDatabaseId] = useState(notionDatabaseId || "");
  const [direction, setDirection] = useState<'import' | 'export' | 'both'>('import');

  const syncNotion = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gift-sync-notion`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            listId,
            notionDatabaseId: databaseId,
            direction,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to sync with Notion');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gift-list-items', listId] });
      queryClient.invalidateQueries({ queryKey: ['family-gift-lists'] });
      toast.success(data.message);
      setShowDialog(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Extract database ID from Notion URL
  const parseNotionUrl = (url: string) => {
    // Notion URLs look like:
    // https://www.notion.so/workspace/Database-Name-abc123def456
    // The database ID is the last 32 characters (without dashes)
    const match = url.match(/([a-f0-9]{32}|[a-f0-9-]{36})(?:\?|$)/);
    if (match) {
      return match[1].replace(/-/g, '');
    }
    return url; // Assume it's already a database ID
  };

  const handleUrlChange = (value: string) => {
    if (value.includes('notion.so')) {
      setDatabaseId(parseNotionUrl(value));
    } else {
      setDatabaseId(value);
    }
  };

  // Only owners can sync
  if (!isOwner) {
    return null;
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {notionDatabaseId ? 'Sync Notion' : 'Connect Notion'}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Sync with Notion
          </DialogTitle>
          <DialogDescription>
            Import items from your Notion wishlist database, or export claim status back to Notion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Connection Status */}
          {notionDatabaseId && lastSyncedAt && (
            <Alert className="bg-emerald-500/10 border-emerald-500/30">
              <Check className="h-4 w-4 text-emerald-400" />
              <AlertDescription className="text-sm">
                Connected. Last synced: {new Date(lastSyncedAt).toLocaleString()}
              </AlertDescription>
            </Alert>
          )}

          {/* Database ID/URL */}
          <div className="space-y-2">
            <Label htmlFor="notionDb">
              <Link className="h-4 w-4 inline mr-1" />
              Notion Database
            </Label>
            <Input
              id="notionDb"
              placeholder="Paste Notion database URL or ID"
              value={databaseId}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Share your Notion database with our integration first, then paste the URL here.
            </p>
          </div>

          {/* Sync Direction */}
          <div className="space-y-2">
            <Label>Sync Direction</Label>
            <Select value={direction} onValueChange={(v: any) => setDirection(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="import">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Import from Notion
                  </div>
                </SelectItem>
                <SelectItem value="export">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Export claims to Notion
                  </div>
                </SelectItem>
                <SelectItem value="both">
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="h-4 w-4" />
                    Both directions
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Setup Instructions */}
          <Alert className="bg-white/5 border-white/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm space-y-2">
              <p><strong>Setup required:</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Go to your Notion database</li>
                <li>Click "..." → "Add connections"</li>
                <li>Search for "Liana Banyan" and add it</li>
                <li>Copy the database URL and paste above</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Expected Properties */}
          <div className="text-xs text-muted-foreground">
            <p><strong>Expected Notion properties:</strong></p>
            <p>Name/Title, Description, URL/Link, Price, Priority, Claimed (checkbox)</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => syncNotion.mutate()}
            disabled={!databaseId || syncNotion.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {syncNotion.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
