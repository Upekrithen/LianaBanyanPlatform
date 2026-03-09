import React, { useState } from "react";
import { useLogbook } from "./LogbookContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Download,
  Mail,
  Clock,
  MapPin,
  Package,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export function LogbookDisplay() {
  const {
    session,
    isMember,
    exportLogbook,
    emailLogbook,
    sessionStats,
  } = useLogbook();

  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [email, setEmail] = useState("");

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleExport = () => {
    const markdown = exportLogbook();
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logbook-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Logbook exported!");
  };

  const handleEmail = async () => {
    if (!email) return;
    await emailLogbook(email);
    toast.success(`Logbook sent to ${email}`);
    setEmailDialogOpen(false);
    setEmail("");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-500" />
              Your Logbook
            </CardTitle>
            <CardDescription>
              Session started {formatDuration(sessionStats.duration)} ago
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Email Your Logbook</DialogTitle>
                  <DialogDescription>
                    Send a copy of your logbook to your email address
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button onClick={handleEmail} className="w-full">
                    Send Logbook
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!isMember && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-amber-200">
                  Your logbook will fade when you leave
                </p>
                <p className="text-sm text-amber-200/70 mt-1">
                  Half of your items, notes, and discoveries will be lost.
                  Export now or become a member ($5/year) to keep everything.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <Clock className="h-5 w-5 mx-auto mb-1 text-slate-400" />
            <div className="text-lg font-bold">{formatDuration(sessionStats.duration)}</div>
            <div className="text-xs text-muted-foreground">Duration</div>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <FileText className="h-5 w-5 mx-auto mb-1 text-blue-400" />
            <div className="text-lg font-bold">{sessionStats.entriesCount}</div>
            <div className="text-xs text-muted-foreground">Entries</div>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <Package className="h-5 w-5 mx-auto mb-1 text-green-400" />
            <div className="text-lg font-bold">{sessionStats.itemsCount}</div>
            <div className="text-xs text-muted-foreground">Items</div>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <MapPin className="h-5 w-5 mx-auto mb-1 text-purple-400" />
            <div className="text-lg font-bold">{sessionStats.areasCount}</div>
            <div className="text-xs text-muted-foreground">Areas</div>
          </div>
        </div>

        <Tabs defaultValue="journal">
          <TabsList className="w-full">
            <TabsTrigger value="journal" className="flex-1">Journal</TabsTrigger>
            <TabsTrigger value="inventory" className="flex-1">Inventory</TabsTrigger>
            <TabsTrigger value="discoveries" className="flex-1">Discoveries</TabsTrigger>
          </TabsList>

          <TabsContent value="journal">
            <ScrollArea className="h-64">
              {session.entries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No journal entries yet</p>
                  <p className="text-sm">Your journey will be recorded here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {session.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{entry.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {entry.timestamp.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="inventory">
            <ScrollArea className="h-64">
              {session.collected.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No items collected yet</p>
                  <p className="text-sm">Explore to find treasures</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {session.collected.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.name}</span>
                        <Badge>{item.quantity}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.type}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="discoveries">
            <ScrollArea className="h-64">
              {session.areasDiscovered.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No areas discovered yet</p>
                  <p className="text-sm">Navigate to uncover new places</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {session.areasDiscovered.map((area) => (
                    <div
                      key={area}
                      className="flex items-center gap-2 p-2 bg-slate-800/30 rounded-lg"
                    >
                      <MapPin className="h-4 w-4 text-purple-400" />
                      <span>{area}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        ✓
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default LogbookDisplay;
