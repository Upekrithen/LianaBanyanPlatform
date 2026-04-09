import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2, Send, ShieldCheck, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface FormState {
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  sender_organization: string;
  subject: string;
  message_body: string;
}

const INITIAL: FormState = {
  sender_name: "",
  sender_email: "",
  sender_phone: "",
  sender_organization: "",
  subject: "",
  message_body: "",
};

export function ContactForm() {
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!user) return;
    const email = user.email || "";
    const name = user.user_metadata?.full_name || user.user_metadata?.name || "";
    setForm(prev => ({
      ...prev,
      sender_name: prev.sender_name || name,
      sender_email: prev.sender_email || email,
    }));
  }, [user]);

  const update = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.sender_name || !form.sender_email || !form.message_body) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("gatekeeper-triage", {
        body: { ...form, member_id: user?.id ?? null },
      });

      if (error) throw error;
      if (data?.success === false) throw new Error(data.error);

      setSent(true);
      toast.success("Message sent! MoneyPenny will take it from here.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send. Please try again.";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <Card className="border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
          <h3 className="text-xl font-semibold">Message Received</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            MoneyPenny has your message and will ensure it gets to the right
            person. If your inquiry warrants a priority response, you'll hear
            from us within 48 hours.
          </p>
          <Button variant="outline" onClick={() => { setSent(false); setForm(INITIAL); }}>
            Send Another Message
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Send to MoneyPenny
        </CardTitle>
        <CardDescription>
          MoneyPenny screens all inbound messages and routes them appropriately.
        </CardDescription>
        {user && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            <UserCheck className="w-3.5 h-3.5" />
            Signed in — your message will be fast-tracked as a known member.
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={form.sender_name}
                onChange={update("sender_name")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.sender_email}
                onChange={update("sender_email")}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="org">Organization</Label>
              <Input
                id="org"
                placeholder="Company or organization"
                value={form.sender_organization}
                onChange={update("sender_organization")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(optional)"
                value={form.sender_phone}
                onChange={update("sender_phone")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="What is this regarding?"
              value={form.subject}
              onChange={update("subject")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Tell us what's on your mind..."
              rows={6}
              value={form.message_body}
              onChange={update("message_body")}
              required
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            MoneyPenny uses AI to screen messages. Your data is handled per our Privacy Policy.
          </div>

          <Button type="submit" disabled={sending} className="w-full sm:w-auto">
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send to MoneyPenny
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
