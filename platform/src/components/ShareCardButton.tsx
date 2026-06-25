/**
 * ShareCardButton.tsx
 * BP094 - Wildfire sendable card mechanism
 * No em-dashes anywhere. Hyphens only.
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface ShareCardButtonProps {
  cardId: string;
  cardTitle: string;
}

export default function ShareCardButton({ cardId, cardTitle }: ShareCardButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const senderId = user?.id ?? "anon";
  const deepLinkUrl = `https://mnemosynec.org/how-it-all-works/#card-${cardId}?send=${senderId}`;
  const tweetText = encodeURIComponent(
    `Check out "${cardTitle}" - a core concept of the cooperative substrate. ${deepLinkUrl}`
  );
  const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
  const emailSubject = encodeURIComponent(`How it all works: ${cardTitle}`);
  const emailBody = encodeURIComponent(
    `I thought you might find this interesting.\n\n"${cardTitle}" explains a core concept of the cooperative substrate:\n\n${deepLinkUrl}`
  );
  const mailtoUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`;
  const embedCode = `<iframe src="${deepLinkUrl}&embed=1" width="600" height="400" frameborder="0" title="${cardTitle} - cooperative substrate"></iframe>`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
          border: "none",
          borderRadius: 6,
          padding: "6px 14px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          marginTop: 8,
        }}
      >
        Send This Card
      </button>
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.55)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              background: "hsl(var(--background))",
              borderRadius: 12,
              padding: 28,
              maxWidth: 480,
              width: "100%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              border: "1px solid hsl(var(--border))",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700 }}>
              Send: {cardTitle}
            </h3>
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 12,
                  color: "hsl(var(--muted-foreground))",
                  marginBottom: 4,
                }}
              >
                Deep link (includes your attribution)
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  readOnly
                  value={deepLinkUrl}
                  style={{
                    flex: 1,
                    fontSize: 12,
                    padding: "6px 10px",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 6,
                    background: "hsl(var(--muted))",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <button
                  onClick={() => copyToClipboard(deepLinkUrl)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "1px solid hsl(var(--border))",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    background: copied
                      ? "hsl(var(--primary) / 0.15)"
                      : "hsl(var(--background))",
                    color: copied
                      ? "hsl(var(--primary))"
                      : "hsl(var(--foreground))",
                  }}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              <a
                href={twitterUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  borderRadius: 6,
                  background: "#1DA1F2",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                Share on X / Twitter
              </a>
              <a
                href={mailtoUrl}
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  borderRadius: 6,
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                  fontWeight: 600,
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                Send by Email
              </a>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 12,
                  color: "hsl(var(--muted-foreground))",
                  marginBottom: 4,
                }}
              >
                Embed code for blogs
              </div>
              <textarea
                readOnly
                value={embedCode}
                rows={3}
                style={{
                  width: "100%",
                  fontSize: 11,
                  padding: "6px 10px",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 6,
                  background: "hsl(var(--muted))",
                  color: "hsl(var(--foreground))",
                  resize: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                onClick={() => copyToClipboard(embedCode)}
                style={{
                  marginTop: 4,
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: "1px solid hsl(var(--border))",
                  cursor: "pointer",
                  fontSize: 11,
                  background: "hsl(var(--background))",
                }}
              >
                Copy embed code
              </button>
            </div>
            {!user && (
              <div
                style={{
                  fontSize: 12,
                  color: "hsl(var(--muted-foreground))",
                  marginBottom: 12,
                }}
              >
                Log in as a member to earn Marks when someone joins after clicking your link.
              </div>
            )}
            <button
              onClick={() => setOpen(false)}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: "1px solid hsl(var(--border))",
                cursor: "pointer",
                fontSize: 13,
                background: "hsl(var(--background))",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
