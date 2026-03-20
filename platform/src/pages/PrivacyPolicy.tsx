/**
 * PRIVACY POLICY
 * ==============
 * Public-facing privacy policy. Required by TikTok Developer Portal,
 * GDPR, CCPA, app store submissions, and general platform compliance.
 * Must be accessible from the homepage footer.
 *
 * NOTE: This is a professionally-structured template. The Founder
 * should have a licensed attorney review before final publication.
 */

import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout maxWidth="lg" xrayId="privacy-policy">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Last updated: March 8, 2026 &nbsp;|&nbsp; Effective: March 8, 2026
          </p>

          <section className="space-y-4">
            <h2>1. Introduction</h2>
            <p>
              Liana Banyan Corporation ("Company," "we," "us," or "our") respects
              your privacy and is committed to protecting your personal information.
              This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our platform at lianabanyan.com
              and all associated domains ("Platform").
            </p>
          </section>

          <section className="space-y-4">
            <h2>2. Information We Collect</h2>

            <h3>2a. Information You Provide</h3>
            <ul>
              <li>
                <strong>Account Information</strong> — Name, email address, and
                password when you register. If you use a third-party login (TikTok,
                Google, GitHub, Discord), we receive your display name, avatar URL,
                and email address from that provider.
              </li>
              <li>
                <strong>Profile Information</strong> — Bio, guild affiliations,
                skill tags, and other details you voluntarily add.
              </li>
              <li>
                <strong>Content</strong> — Posts, comments, documents, images, and
                other content you create or upload.
              </li>
              <li>
                <strong>Transaction Data</strong> — Records of Credit purchases,
                Mark earnings, Joule conversions, and marketplace transactions.
              </li>
              <li>
                <strong>Communications</strong> — Messages you send through the
                Platform and support inquiries.
              </li>
            </ul>

            <h3>2b. Information Collected Automatically</h3>
            <ul>
              <li>
                <strong>Usage Data</strong> — Pages visited, features used,
                discovery progression, and interaction patterns.
              </li>
              <li>
                <strong>Device Information</strong> — Browser type, operating system,
                and screen resolution (for responsive design).
              </li>
              <li>
                <strong>IP Ledger Stamps</strong> — Cryptographic hashes (SHA-256) of
                certain actions (arena entries, terms acceptance, acknowledgments).
                These stamps record THAT an action occurred, not the content of
                communications.
              </li>
            </ul>

            <h3>2c. Information from Third-Party Services</h3>
            <p>
              When you authenticate through a third-party service, we receive only the
              information you authorize. Specifically:
            </p>
            <ul>
              <li>
                <strong>TikTok Login Kit</strong> — Display name, avatar image URL,
                and public profile URL (scope: user.info.profile). We do NOT access
                your TikTok videos, followers, messages, or any other TikTok content.
              </li>
              <li>
                <strong>Google</strong> — Name, email, and avatar.
              </li>
              <li>
                <strong>GitHub / Discord</strong> — Username, email, and avatar.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2>3. How We Use Your Information</h2>
            <ul>
              <li>
                <strong>Account Management</strong> — To create and maintain your
                account, authenticate your identity, and provide customer support.
              </li>
              <li>
                <strong>Platform Operation</strong> — To operate the three-currency
                economy, guild system, marketplace, content pipeline, and discovery
                features.
              </li>
              <li>
                <strong>Communication</strong> — To send transactional emails
                (verification codes, receipts, alerts) from noreply@lianabanyan.com.
                We use Resend as our email delivery provider.
              </li>
              <li>
                <strong>Security</strong> — To detect fraud, enforce terms,
                administer freeze penalties, and protect the Platform and its users.
              </li>
              <li>
                <strong>Improvement</strong> — To understand usage patterns and
                improve Platform features.
              </li>
            </ul>
            <p>
              We do NOT sell your personal information. We do NOT use your data
              for targeted advertising. We do NOT share your information with
              data brokers.
            </p>
          </section>

          <section className="space-y-4">
            <h2>4. How We Share Your Information</h2>
            <p>We share your information only in these circumstances:</p>
            <ul>
              <li>
                <strong>With Other Users</strong> — Your public profile, guild
                memberships, marketplace listings, and Arena posts are visible to
                other Platform members as appropriate to the feature.
              </li>
              <li>
                <strong>Service Providers</strong> — We use Supabase (database and
                authentication), Firebase (hosting), and Resend (email delivery).
                These providers process data on our behalf under contractual
                data protection obligations.
              </li>
              <li>
                <strong>Legal Requirements</strong> — We may disclose information
                if required by law, court order, or to protect the rights, property,
                or safety of the Company, our users, or the public.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2>5. Third-Party Integrations — Detailed Scope Usage</h2>
            <p>
              The following explains exactly how each third-party integration and
              requested scope works within the Platform:
            </p>

            <h3>TikTok Login Kit (user.info.profile)</h3>
            <p><strong>What it does:</strong></p>
            <ul>
              <li>Allows you to sign in to Liana Banyan using your TikTok account</li>
              <li>Retrieves your TikTok display name and avatar image</li>
              <li>Creates a linked Liana Banyan account using your TikTok identity</li>
            </ul>
            <p><strong>What it does NOT do:</strong></p>
            <ul>
              <li>Does NOT post content to your TikTok account</li>
              <li>Does NOT access your TikTok videos, likes, or comments</li>
              <li>Does NOT access your TikTok followers or following lists</li>
              <li>Does NOT access your TikTok direct messages</li>
              <li>Does NOT share your TikTok data with any third party</li>
            </ul>
            <p><strong>Technical implementation:</strong></p>
            <p>
              Authentication uses OAuth 2.0 with PKCE (Proof Key for Code Exchange)
              for security. Your TikTok password is never transmitted to or stored
              by Liana Banyan. The authorization flow redirects you to TikTok&apos;s
              own authorization page, where you explicitly grant permission. An
              authorization code is exchanged for an access token, which is used
              once to retrieve your profile information. You may revoke access at
              any time through your TikTok account settings.
            </p>
          </section>

          <section className="space-y-4">
            <h2>6. Data Storage and Security</h2>
            <p>
              Your data is stored on servers provided by Supabase (PostgreSQL database)
              and Firebase (static hosting). All data transmission uses TLS encryption.
              Authentication tokens use SHA-256 hashing. Row-level security policies
              restrict database access.
            </p>
            <p>
              While we implement reasonable security measures, no internet transmission
              is completely secure. We cannot guarantee absolute security of your data.
            </p>
          </section>

          <section className="space-y-4">
            <h2>7. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. IP
              Ledger stamps are permanent by design (immutable audit trail). If you
              delete your account, we will remove your personal information within
              30 days, except for IP Ledger stamps (which contain only cryptographic
              hashes, not personal data) and any information we are legally required
              to retain.
            </p>
          </section>

          <section className="space-y-4">
            <h2>8. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccurate personal information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to or restrict processing of your information</li>
              <li>Data portability (receive your data in a structured format)</li>
              <li>Withdraw consent for data processing</li>
            </ul>
            <p>
              To exercise these rights, contact us at support@lianabanyan.com.
              We will respond within 30 days.
            </p>
          </section>

          <section className="space-y-4">
            <h2>9. Cookies and Local Storage</h2>
            <p>
              The Platform uses browser localStorage to track discovery progression
              for unauthenticated "Ghost" visitors, authentication tokens, and user
              preferences. We do not use third-party advertising cookies. Session
              management uses secure, httpOnly cookies where applicable.
            </p>
          </section>

          <section className="space-y-4">
            <h2>10. Children&apos;s Privacy</h2>
            <p>
              The Platform is not directed at children under 13. We do not knowingly
              collect personal information from children under 13. The Shirley Temple
              Protocol content classification system is designed to ensure
              age-appropriate content visibility, but it does not replace parental
              supervision.
            </p>
          </section>

          <section className="space-y-4">
            <h2>11. International Users</h2>
            <p>
              The Platform is operated from the United States. If you access the
              Platform from outside the U.S., your information will be transferred
              to and processed in the United States. By using the Platform, you
              consent to this transfer.
            </p>
          </section>

          <section className="space-y-4">
            <h2>12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Material changes will
              be communicated through the Platform. The "Last updated" date at the
              top reflects the most recent revision.
            </p>
          </section>

          <section className="space-y-4">
            <h2>13. Contact Us</h2>
            <p>
              For privacy-related questions or to exercise your rights:
              <br />
              <strong>Liana Banyan Corporation</strong>
              <br />
              Email: support@lianabanyan.com
              <br />
              Privacy inquiries: support@lianabanyan.com (subject: Privacy Request)
            </p>
          </section>
        </article>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© 2026 Liana Banyan Corporation</p>
          <nav className="mt-2 space-x-4">
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </nav>
        </div>
    </PortalPageLayout>
  );
}
