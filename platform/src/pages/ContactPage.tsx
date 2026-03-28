import { ContactForm } from "@/components/ContactForm";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Shield, Clock, Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <PortalPageLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Mail className="w-8 h-8" />
            Contact Us
          </h1>
          <p className="text-muted-foreground mt-2">
            Have a question, partnership inquiry, or just want to say hello?
            MoneyPenny — our AI receptionist — screens all messages and ensures
            the right people see yours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200/50">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-semibold">MoneyPenny Screens All Messages</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Every message is analyzed by our AI assistant to ensure it
                  reaches the right person at the right priority.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="shrink-0 bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400">
                      Tier 1
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      VIPs and known contacts — immediate SMS alert to the Founder
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="shrink-0 bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400">
                      Tier 2
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      Press, partnerships, notable inquiries — flagged for priority review
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="shrink-0 bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400">
                      Tier 3
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      General messages — reviewed and responded to in order
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium">Response Times</h4>
                </div>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li>Priority contacts: within 48 hours</li>
                  <li>General inquiries: within 1 week</li>
                  <li>Press / media: prioritized for same-day review</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium">Privacy Notice</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Liana Banyan is a member-owned cooperative. We do not sell data,
                  run ads, or share your information with third parties. Your
                  message is processed by our AI assistant and stored securely.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PortalPageLayout>
  );
}
