/**
 * CSIAHybridChatPage (BP094 / Stage 1)
 * Route: /mnemosynec/csia-hybrid
 * Member-gated. Member gate enforced at component level in CSIAHybridChat.
 */
import { CSIAHybridChat } from '@/components/CSIAHybridChat';

export default function CSIAHybridChatPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #060b14 0%, #0c1220 50%, #060b14 100%)',
        padding: '0 16px',
      }}
    >
      <CSIAHybridChat />
    </div>
  );
}
