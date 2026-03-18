import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Mail, CheckSquare, Megaphone, Scan, ArrowLeft, Settings, Plus, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function MoneyPenny() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            MoneyPenny Briefing
          </h1>
          <p className="text-muted-foreground">Your virtual administrative assistant</p>
        </div>
        <Button variant="default" className="gap-2" onClick={() => navigate('/moneypenny/briefing')}>
          <Calendar className="h-4 w-4" /> Morning Briefing
        </Button>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" /> Configure
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto">
          <TabsTrigger value="overview" className="py-3">Overview</TabsTrigger>
          <TabsTrigger value="invitations" className="py-3">Invitations</TabsTrigger>
          <TabsTrigger value="communications" className="py-3">Comms Log</TabsTrigger>
          <TabsTrigger value="publications" className="py-3">Publications</TabsTrigger>
          <TabsTrigger value="tasks" className="py-3">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-500" />
                  Recent Invitations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm"><strong>Bill and Wendy</strong> validated their email domain, looked at 9 pages for 2 minutes and 53 seconds and read one paper. Bill became a member and left a suggestion, Wendy did not.</p>
                  </div>
                  <Button variant="link" className="px-0" onClick={() => setActiveTab("invitations")}>View all invitations &rarr;</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Scan className="h-5 w-5 text-green-500" />
                  ATTI Campaign (Cue Cards)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm"><strong>57 people</strong> have logged in to the HexIsle Cue Card you sent Wednesday at 1445 CST, <strong>23 signed up</strong>.</p>
                  </div>
                  <Button variant="link" className="px-0" onClick={() => navigate("/bifrost")}>View ATTI Analytics &rarr;</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-purple-500" />
                  Publication Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">You have received <strong>9 messages</strong> from publications you submitted to. 7 are standard response rejections, <strong>2 are asking for more information</strong>.</p>
                  </div>
                  <Button variant="link" className="px-0" onClick={() => setActiveTab("publications")}>Manage publications &rarr;</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-amber-500" />
                  Task Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">You have <strong>45 Tasks</strong> this week. For Friday you need to review 3 Salt Mine bounties and finalize the SlottedTop STL.</p>
                  </div>
                  <Button variant="link" className="px-0" onClick={() => setActiveTab("tasks")}>View task board &rarr;</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Tasks</h2>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Task</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {[
                  { title: "Review SlottedTop STL", due: "Today", priority: "High", source: "Manual" },
                  { title: "Approve 3 Salt Mine Bounties", due: "Tomorrow", priority: "Medium", source: "Salt Mines" },
                  { title: "Follow up with Wired Magazine", due: "Friday", priority: "High", source: "Publications" },
                ].map((task, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-5 w-5 rounded border border-primary/50 flex items-center justify-center cursor-pointer hover:bg-primary/20"></div>
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{task.source}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> {task.due}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={task.priority === "High" ? "destructive" : "secondary"}>{task.priority}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would be fully fleshed out in subsequent phases */}
        <TabsContent value="invitations">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Detailed invitation tracking will appear here.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Aggregated communication logs will appear here.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publications">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Publication submission tracking will appear here.
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
