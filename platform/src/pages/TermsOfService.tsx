/**
 * TERMS OF SERVICE
 * ================
 * Public-facing legal page. Required by TikTok Developer Portal,
 * app store submissions, and general platform compliance.
 * Must be accessible from the homepage footer.
 *
 * NOTE: This is a professionally-structured template. The Founder
 * should have a licensed attorney review before final publication.
 */

import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout maxWidth="lg" xrayId="terms-of-service">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Last updated: March 8, 2026 &nbsp;|&nbsp; Effective: March 8, 2026
          </p>

          <section className="space-y-4">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Liana Banyan platform ("Platform"), operated by
              Liana Banyan Corporation ("Company," "we," "us," or "our"), you agree to be
              bound by these Terms of Service ("Terms"). If you do not agree to these Terms,
              do not use the Platform.
            </p>
            <p>
              The Platform includes all websites operated under lianabanyan.com,
              lianabanyan.biz, lianabanyan.org, lianabanyan.net, the2ndsecond.com,
              hexislo.com, and all associated subdomains, mobile applications,
              and services.
            </p>
          </section>

          <section className="space-y-4">
            <h2>2. Description of Services</h2>
            <p>
              Liana Banyan is a membership-based cooperative platform that provides:
            </p>
            <ul>
              <li>
                <strong>Community Membership</strong> — Tiered membership with
                progressive discovery and participation features.
              </li>
              <li>
                <strong>Three-Currency Economy</strong> — Credits (purchased with fiat,
                closed-loop), Marks (effort-based, earned through participation), and Joules
                (surplus storage with locked exchange rates). All three currencies share equal
                value within the Platform: 1 Credit = 1 Mark = 1 Joule. Credits are not
                redeemable for cash.
              </li>
              <li>
                <strong>Guild System</strong> — Collaborative workgroups organized by
                skill and interest.
              </li>
              <li>
                <strong>Marketplace</strong> — Seller-set pricing with a Cost+20%
                minimum floor.
              </li>
              <li>
                <strong>Content Pipeline</strong> — Structured content development
                from seed to publication.
              </li>
              <li>
                <strong>Discussion Arenas</strong> — Designated spaces for political,
                religious, and debate discourse under the Switzerland Rule (see Section 8).
              </li>
              <li>
                <strong>Charitable Initiatives</strong> — Community-driven charitable
                action through various platform initiatives.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2>3. Account Registration</h2>
            <p>
              You may explore the Platform as a "Ghost" (unauthenticated visitor) with
              limited access. To access full features, you must create an account. You
              are responsible for maintaining the confidentiality of your account credentials
              and for all activities under your account.
            </p>
            <p>
              Account creation is available through email/password registration or through
              third-party authentication providers (see Section 10 for details on
              third-party integrations).
            </p>
          </section>

          <section className="space-y-4">
            <h2>4. Intellectual Property and the IP Ledger</h2>
            <p>
              The Platform maintains an immutable IP Ledger that records acknowledgment
              stamps using SHA-256 cryptographic hashes. When you interact with the Platform
              in certain ways (entering Arenas, accepting terms, contributing content), a
              permanent, timestamped record is created.
            </p>
            <p>
              Content you create on the Platform remains your intellectual property. By
              posting content, you grant the Company a non-exclusive, royalty-free license
              to display, distribute, and promote your content within the Platform. This
              license terminates when you remove your content, except for copies reasonably
              necessary for backup or archival purposes.
            </p>
            <p>
              The Platform&apos;s own content, design, code, branding, and innovations are
              the property of Liana Banyan Corporation and are protected by applicable
              intellectual property laws.
            </p>
          </section>

          <section className="space-y-4">
            <h2>5. Currency and Transaction Terms</h2>
            <p>
              <strong>Credits</strong> are purchased with U.S. dollars at a fixed rate of
              $1.00 = 1 Credit. Credits are non-refundable and cannot be exchanged for cash.
              Credits may be used for any transaction on the Platform.
            </p>
            <p>
              <strong>Marks</strong> are earned through participation and effort. Marks
              emerge from differential contribution only and are never granted as gifts.
              Marks are restricted to essential categories (food, medical, housing).
            </p>
            <p>
              <strong>Joules</strong> are a surplus storage currency with a "forever stamp"
              mechanic that locks the exchange rate at the time of acquisition.
            </p>
            <p>
              Sellers on the Platform set their own prices. The Platform enforces a
              Cost+20% minimum pricing floor to prevent predatory undercutting.
            </p>
          </section>

          <section className="space-y-4">
            <h2>6. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Platform for any unlawful purpose</li>
              <li>Harass, threaten, or doxx other users</li>
              <li>Attempt to circumvent security measures, authentication systems, or moderation controls</li>
              <li>Impersonate another person or entity</li>
              <li>Distribute malware or engage in phishing</li>
              <li>Violate the Switzerland Rule by carrying Arena discourse into the main Platform</li>
              <li>Use automated systems to scrape, mine, or extract data from the Platform without authorization</li>
              <li>Manipulate currency systems, exploit pricing floors, or engage in fraudulent transactions</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2>7. Content Standards and the Shirley Temple Protocol</h2>
            <p>
              The Platform uses a content classification system (the "Shirley Temple
              Protocol") with three visibility levels to ensure age-appropriate content
              delivery. Users must accurately classify their content. Misclassification
              may result in content removal and account restrictions.
            </p>
          </section>

          <section className="space-y-4">
            <h2>8. The Switzerland Rule and Arena Terms</h2>
            <p>
              The Platform maintains a strict separation between its main services and
              designated discussion Arenas (Political Expedition, Areopagus, Crucible).
              Political and religious discourse is permitted ONLY within these Arenas.
            </p>
            <p>
              Entering an Arena requires acknowledgment of Arena-specific terms, recorded
              as an immutable stamp on the IP Ledger. Violating the Switzerland Rule
              (carrying Arena behavior to the main Platform) results in freeze penalties:
            </p>
            <ul>
              <li>Yellow: 4-hour freeze</li>
              <li>Orange: 24-hour freeze (50 Credits to resolve early)</li>
              <li>Red: 7-day freeze (200 Credits to resolve early)</li>
              <li>Black: 30-day freeze (500 Credits to resolve early)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2>9. Marketplace and Seller Terms</h2>
            <p>
              Sellers on the Platform are independent operators. The Company does not
              guarantee the quality, safety, or legality of goods or services offered.
              All marketplace transactions are between buyers and sellers, with the
              Platform serving as facilitator.
            </p>
            <p>
              The Platform&apos;s universal transaction confirmation phrase is
              &quot;As You Wish.&quot; This phrase serves as acknowledgment of transaction
              terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2>10. Third-Party Integrations</h2>
            <p>
              The Platform integrates with third-party services to enhance user experience.
              Each integration accesses only the minimum data required:
            </p>
            <h3>TikTok Login Kit</h3>
            <p>
              The Platform uses TikTok&apos;s Login Kit to allow users to authenticate
              using their TikTok account. This integration requests the following scope:
            </p>
            <ul>
              <li>
                <strong>user.info.profile</strong> — Accesses your TikTok display name,
                avatar, and profile URL. This data is used solely to create and display
                your Liana Banyan profile and to identify you within the Platform.
                We do not post to your TikTok account, access your TikTok content,
                followers, or messages, or share your TikTok data with third parties.
              </li>
            </ul>
            <p>
              <strong>How TikTok Login Kit works within the Platform:</strong> When you
              choose to sign in with TikTok, you are redirected to TikTok&apos;s
              authorization page. After you grant permission, TikTok sends an authorization
              code back to the Platform. We exchange this code for an access token using
              PKCE (Proof Key for Code Exchange) for security, then retrieve your basic
              profile information to create or link your account. Your TikTok credentials
              are never stored on our servers.
            </p>
            <h3>Other Authentication Providers</h3>
            <p>
              The Platform may also offer authentication through Google, GitHub, Discord,
              and other providers. Each provider integration accesses only basic profile
              information (name, email, avatar) for authentication purposes.
            </p>
          </section>

          <section className="space-y-4">
            <h2>11. Disclaimers</h2>
            <p>
              The Platform is provided &quot;as is&quot; and &quot;as available&quot; without
              warranties of any kind. We do not guarantee uninterrupted access,
              error-free operation, or that the Platform will meet your specific needs.
            </p>
            <p>
              Nothing on the Platform constitutes financial, investment, legal, or medical
              advice. The three-currency system is a utility token system for Platform
              services only — Credits, Marks, and Joules are not securities, investments,
              or financial instruments.
            </p>
          </section>

          <section className="space-y-4">
            <h2>12. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Liana Banyan Corporation shall not
              be liable for any indirect, incidental, special, consequential, or punitive
              damages arising from your use of the Platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2>13. Modifications</h2>
            <p>
              We may update these Terms at any time. Material changes will be communicated
              through the Platform. Continued use after changes constitutes acceptance of
              the updated Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2>14. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the State of Oklahoma, United States
              of America. Any disputes shall be resolved in the courts of Oklahoma.
            </p>
          </section>

          <section className="space-y-4">
            <h2>15. Contact</h2>
            <p>
              For questions about these Terms, contact us at:
              <br />
              <strong>Liana Banyan Corporation</strong>
              <br />
              Email: support@lianabanyan.com
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
