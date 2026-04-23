# Pudding #91 — The Dispatch

*How one outbound messaging system handles letters, emails, social posts, and push notifications without becoming spam.*

---

Most platforms have a notifications problem. They send too many messages, across too many channels, with too little respect for the recipient's attention. The result is that users disable notifications entirely, and the platform's communication channel becomes useless.

Liana Banyan's Dispatch system — internally called MoneyPenny — is built on a different premise: every outbound message costs the sender something. Not money. Attention. Each message requires a Steward Stamp — a deliberate acknowledgment that this message is worth sending and worth receiving.

The Dispatch Compose page is where outbound communications are drafted. It handles multiple message types: transactional emails (receipts, confirmations), operational notifications (your coalition hit the volume threshold), Cue Card outreach (personalized invitations), and Battery Dispatch sequences (timed content drops). Each type has guardrails. Transactional messages go immediately. Operational notifications batch. Outreach messages respect per-platform rate limits.

The Dispatch Queue shows everything in the pipeline — scheduled, sent, failed, pending retry. Per-platform rate limit remaining is visible. Connection status indicators show which channels are live. Cancel, retry, and send-now actions give the sender granular control.

The guardrails are not suggestions. They are enforced in code. A member cannot send more than X outreach messages per day per platform. The Steward Stamp requirement means that mass-blast campaigns are structurally impossible — each message must be individually stamped, which means each message must be individually considered.

This is inefficient by design. A platform optimized for message volume would remove the stamp requirement, increase rate limits, and add bulk-send tools. Liana Banyan optimized for message quality. Fewer messages, each one deliberate, each one worth the recipient's time.

The Dispatch system does not have an unsubscribe rate problem because it does not have a spam problem. When every message costs the sender a moment of deliberate attention, the messages that get sent are the ones that matter.

---

*Pudding #91 | Bishop B063 | April 2, 2026*
*Every message stamped. Every send deliberate. Attention is not free.*
