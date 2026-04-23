# Pudding #83 — The Guided Tour

*Why onboarding should feel like a museum docent, not a software tutorial.*

---

Most platforms onboard users with a checklist. Complete your profile. Connect your bank account. Invite three friends. The checklist exists because the platform needs you to do things that benefit it — fill in data fields, connect payment methods, generate network effects. The user's experience of discovery is secondary to the platform's activation metrics.

Liana Banyan's Guided Tour works differently. It is modeled on how a museum docent operates: walk visitors to six landmarks, explain what makes each one interesting, and then let them explore on their own.

The tour has a hard cap of six stops. Not because the platform only has six features — it has dozens of domains across 23 migrated systems — but because six is the threshold at which orientation becomes overwhelm. A docent who tries to show you every painting in the Louvre has failed at their job.

Each stop is a landmark — a page or feature that demonstrates a core principle. The Helm (your personal space). The Round Table (where your voice matters). The Marketplace (where cooperative economics are visible). The tour does not attempt to explain every mechanism. It provides enough context that the member understands the shape of the building and can navigate it independently.

The technical implementation uses a state machine with six stages, localStorage persistence, and a tooltip layer that highlights elements without blocking interaction. If you close the tour, it remembers where you stopped. If you come back tomorrow, it picks up at landmark four, not landmark one.

There is no completion reward. No badge. No gamification pressure. The tour ends with a simple message: you know where things are now. Go build something.

This is a deliberate design choice. Gamified onboarding creates a perverse incentive — users complete tasks to earn rewards rather than because the tasks are genuinely useful. When the rewards stop, engagement drops. The Guided Tour assumes members joined because they wanted to participate in a cooperative, not because they wanted to collect badges.

The constraint — six stops, no rewards, landmark-only scope — is the feature. It signals that the platform respects your time and trusts your judgment about what to explore next.

---

*Pudding #83 | Bishop B063 | April 2, 2026*
*Six landmarks. No badges. The docent trusts you to explore.*
