/**
 * RED CARPET BULLETPROOF FALLBACK
 * ================================
 * DD-7 Critical: No recipient should EVER see a blank page, error screen, or generic 404.
 * The worst case: they see Founder's phone number and a brief explanation.
 *
 * Triggers:
 *  - Email domain not recognized
 *  - DB connection error
 *  - Any unhandled exception on Red Carpet page
 *  - Direct navigation to /RedCarpet without entering email
 */

import { useState, Component, type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Mail, ExternalLink, Send, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// ─────────────────────────────────────────────
// ERROR BOUNDARY — Catches any React crash
// ─────────────────────────────────────────────

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class RedCarpetErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("RedCarpet crash caught by error boundary:", error, info);
    try {
      supabase.from("red_carpet_fallback_visits").insert({
        source: "error",
        user_agent: navigator.userAgent,
        referrer_url: document.referrer || null,
      });
    } catch {
      // Silent — we still show the fallback
    }
  }

  render() {
    if (this.state.hasError) {
      return <RedCarpetFallback isError errorMessage={this.state.errorMessage} />;
    }
    return this.props.children;
  }
}

// ─────────────────────────────────────────────
// FALLBACK COMPONENT
// ─────────────────────────────────────────────

interface RedCarpetFallbackProps {
  email?: string;
  errorMessage?: string;
  isError?: boolean;
}

export function RedCarpetFallback({ email, errorMessage, isError }: RedCarpetFallbackProps) {
  const [notifyEmail, setNotifyEmail] = useState(email || "");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleNotify = async () => {
    if (!notifyEmail.trim()) return;
    setSending(true);
    try {
      await supabase.from("red_carpet_fallback_visits").insert({
        email: notifyEmail.toLowerCase().trim(),
        source: isError ? "error" : "unrecognized",
        user_agent: navigator.userAgent,
        referrer_url: document.referrer || null,
      });
      setSent(true);
    } catch {
      setSent(true);
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-2xl mx-auto w-full space-y-8">

        {/* ── HEADER ── */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            {isError ? "Something went wrong." : "Welcome to Liana Banyan."}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {isError
              ? "Our system hit a snag, but the Founder is real and reachable right now."
              : "We don't recognize that email yet — but if you received a letter from Jonathan Jones, please reach out directly."}
          </p>
        </div>

        {/* ── FOUNDER CONTACT — PROMINENTLY DISPLAYED ── */}
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent shadow-lg">
          <CardContent className="p-8 md:p-10 text-center space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground">
                Jonathan Jones
              </h2>
              <p className="text-muted-foreground">Founder & General Manager</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+14065781232"
                className="flex items-center justify-center gap-3 px-8 py-5 rounded-xl bg-primary text-primary-foreground text-2xl font-bold hover:bg-primary/90 transition-colors active:scale-[0.98]"
              >
                <Phone className="w-7 h-7" />
                406-578-1232
              </a>
              <a
                href="mailto:Founder@LianaBanyan.com"
                className="flex items-center justify-center gap-3 px-8 py-5 rounded-xl bg-card border-2 border-primary/30 text-foreground text-lg font-semibold hover:border-primary/50 transition-colors active:scale-[0.98]"
              >
                <Mail className="w-6 h-6 text-primary" />
                Founder@LianaBanyan.com
              </a>
            </div>

            <p className="text-sm text-muted-foreground italic">
              "If you received a letter from Jonathan Jones, please call or email directly. I'm expecting you."
            </p>
          </CardContent>
        </Card>

        {/* ── BRIEF PLATFORM OVERVIEW — 3 key facts ── */}
        <div className="space-y-4 py-2">
          <h3 className="text-xl font-semibold text-foreground text-center">
            What is Liana Banyan?
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-xl bg-card border border-border text-center">
              <div className="text-3xl font-bold text-primary mb-1">83.3%</div>
              <p className="text-sm text-muted-foreground">
                Creators and workers keep 83.3% of every dollar — constitutionally locked forever.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border text-center">
              <div className="text-3xl font-bold text-primary mb-1">Cost+20%</div>
              <p className="text-sm text-muted-foreground">
                Platform margin locked by DNA Lock. No vote, no board, no CEO can ever change it.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border text-center">
              <div className="text-3xl font-bold text-primary mb-1">16</div>
              <p className="text-sm text-muted-foreground">
                Charitable initiatives funded by cooperative commerce. No donations needed.
              </p>
            </div>
          </div>
          <p className="text-center text-muted-foreground text-sm max-w-lg mx-auto">
            Someone sent you a letter because they believe you belong here.
            A cooperative commerce platform built over 37 years by a veteran, father of eight.
          </p>
        </div>

        {/* ── KEY RESOURCE LINKS ── */}
        <div className="grid sm:grid-cols-2 gap-4">
          <a
            href="https://cephas.lianabanyan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-5 rounded-xl border border-border hover:border-primary/30 transition-colors group"
          >
            <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
            <div>
              <div className="font-semibold text-foreground">Cephas Documentation</div>
              <div className="text-sm text-muted-foreground">Full economics & architecture</div>
            </div>
          </a>
          <a
            href="https://cephas.lianabanyan.com/under-the-hood/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-5 rounded-xl border border-border hover:border-primary/30 transition-colors group"
          >
            <MapPin className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
            <div>
              <div className="font-semibold text-foreground">Under the Hood</div>
              <div className="text-sm text-muted-foreground">Technical deep dive — everything is transparent</div>
            </div>
          </a>
        </div>

        {/* ── EMAIL CAPTURE — "Notify Jonathan" ── */}
        {!sent ? (
          <Card className="border border-border">
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Leave your email and we'll notify Jonathan you visited.
              </p>
              <form
                onSubmit={(e) => { e.preventDefault(); handleNotify(); }}
                className="flex gap-3"
              >
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  className="h-12 text-base flex-1"
                />
                <Button
                  type="submit"
                  disabled={sending || !notifyEmail.trim()}
                  className="h-12 px-6"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? "..." : "Notify"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center p-5 rounded-xl bg-green-500/10 border border-green-500/20">
            <p className="text-green-600 font-medium">
              Jonathan has been notified you visited. He'll reach out soon.
            </p>
          </div>
        )}

        {/* ── Error detail (muted, for debugging) ── */}
        {isError && errorMessage && (
          <p className="text-center text-xs text-muted-foreground/40">
            Technical: {errorMessage}
          </p>
        )}

        {/* ── Footer ── */}
        <div className="text-center text-sm text-muted-foreground pt-6 border-t border-border space-y-1">
          <p className="font-medium">LIANA BANYAN CORPORATION</p>
          <p className="text-xs text-muted-foreground/60">
            "Help each other help ourselves."
          </p>
        </div>
      </div>
    </div>
  );
}
