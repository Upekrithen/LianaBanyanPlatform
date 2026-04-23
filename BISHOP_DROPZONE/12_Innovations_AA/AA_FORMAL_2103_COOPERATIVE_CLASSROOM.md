# Acknowledgment & Assignment — Innovation #2103

**Date:** March 29, 2026
**Inventor:** Jonathan Jones
**Entity:** Liana Banyan Corporation (Wyoming C-Corp)
**Session:** Bishop 048
**Status:** FORMAL

---

## Innovation #2103 — Cooperative Classroom: Home-Based Teaching Marketplace with Dual Revenue (Subscription Classes + Individual Sessions)

### Classification

| Field | Value |
|-------|-------|
| Innovation # | 2103 |
| Name | Cooperative Classroom |
| Parent Initiative | Didasko (Education — Sal Khan, Chancellor) |
| Parent Innovations | #2102 (Universal Member Subscriptions), #1945 (Cue Card Campaign System), #1946 (Treasure Maps), #2015 (Guild Formation) |
| Category | Production System |
| Priority | HIGH |
| Status | DESIGNED — needs Knight build |

---

### Description

A system and method within a cooperative commerce platform wherein any qualified member can teach live classes from home via video conferencing (Zoom, Google Meet, etc.) with DUAL revenue streams:

**(a) Subscription access** — students subscribe (Marks, Credits, Joules, or Dollars per #2102) for recurring weekly class access, AND

**(b) Per-session booking** — individual students book one-on-one tutoring sessions at a per-session rate,

all at Cost+20%, with the teacher keeping 83.3% of every transaction. The platform handles scheduling, payments, student management, and discovery. The teacher handles teaching.

### The Architecture

```
TEACHER (any qualified member)
    │
    ├── Creates a Cooperative Classroom:
    │   "Spanish with [Name] — Conversational Spanish for Beginners"
    │   
    ├── Sets two offerings:
    │   │
    │   ├── SUBSCRIPTION CLASS (recurring group sessions):
    │   │   • "Tuesday & Thursday 7-8 PM CST — Beginner Spanish"
    │   │   • 20 Marks/month (or Credits/Joules/$20 Stripe)
    │   │   • Max 15 students per session (teacher sets cap)
    │   │   • Zoom link auto-generated per session
    │   │   • Recorded for subscribers who miss a session
    │   │   
    │   └── INDIVIDUAL TUTORING (per-session booking):
    │       • "1-on-1 Spanish Tutoring — 30 min or 60 min"
    │       • 15 Marks per 30 min / 25 Marks per 60 min
    │       • Student books from teacher's available time slots
    │       • Zoom link auto-generated per booking
    │
    └── Revenue at Cost+20%:
        ├── Group class: 15 students × 20/month = 300/month → teacher keeps 249.90
        ├── Individual: 10 sessions/week × 25/session = 1,000/month → teacher keeps 833
        └── TOTAL: 1,082.90/month from a spare bedroom
```

### Why This Is Different from Udemy/Coursera/iTalki

| Feature | Udemy | Coursera | iTalki | Preply | **LB Cooperative Classroom** |
|---------|-------|---------|--------|--------|---------------------------|
| Teacher keeps | ~37% | ~varies | ~85% but fees | ~67% | **83.3% (Cost+20%)** |
| Live classes | No (recorded only) | Limited | Yes (1-on-1) | Yes (1-on-1) | **Yes — group AND 1-on-1** |
| Subscriptions | No | Platform-level | No | No | **Teacher-level subscriptions** |
| Payment in cooperative currency | No | No | No | No | **Yes — Marks/Credits/Joules/Dollars** |
| Group classes from home | No | Institutional only | No | No | **Yes — any member** |
| Guild support | No | No | No | No | **Yes — Teachers Guild** |
| ADAPT Score quality tracking | No | Limited | Ratings only | Ratings only | **Yes — 6-dimension scoring** |
| Minimum qualification | None | Institutional partner | "Experience" | "Experience" | **Member-set (degree, cert, or community vote)** |
| Platform fee | 63% (!) | varies | 15% | 33% | **16.7% (fixed forever)** |

**The killer differentiator:** Udemy takes 63 cents of every dollar. LB takes 16.7 cents. On a $1,000/month teaching income, that's the difference between keeping $370 (Udemy) and keeping $833 (LB). That's $5,556/year more in the teacher's pocket.

### The Zoom Integration

Teachers use their OWN Zoom account (free tier = 40 min meetings, Pro = unlimited). The platform doesn't host video — it schedules, bills, and routes students.

```
STUDENT subscribes or books a session
    │
    ├── Platform generates unique Zoom meeting link (via Zoom API or teacher's PMI)
    ├── Platform sends calendar invite to student + teacher
    ├── Platform sends reminder 1 hour before and 10 minutes before
    ├── Student joins Zoom → class happens
    ├── Platform records attendance (student confirmed present)
    └── Marks/Credits transferred automatically after session
```

**Zero video hosting cost.** Zoom handles the video. LB handles the commerce. Same pattern as photos (#2100) — the platform is the REGISTRAR, not the HOST.

### The Subscription Model (via #2102)

Group class subscriptions use the Universal Member Subscription system:

| What Student Gets | Price/Month | Teacher Keeps (83.3%) |
|------------------|-----------|---------------------|
| 1 class/week (4 sessions) | 15/month | 12.50 |
| 2 classes/week (8 sessions) | 25/month | 20.83 |
| Unlimited classes + recordings | 40/month | 33.32 |

**All four currencies accepted:** Student pays whichever they have — Marks, Credits, Joules, or Dollars via Stripe. Teacher doesn't care. Equal value.

### The Individual Tutoring Model

Per-session booking through the platform's scheduling system:

| Session Length | Price | Teacher Keeps (83.3%) |
|---------------|-------|---------------------|
| 30 minutes | 15 | 12.50 |
| 60 minutes | 25 | 20.83 |
| 90 minutes (intensive) | 35 | 29.16 |

**Booking flow:**
1. Student visits teacher's Classroom page
2. Sees available time slots (teacher sets their own schedule)
3. Books a slot → pays in chosen currency
4. Both get calendar invite + Zoom link
5. Session happens
6. Student rates → ADAPT Score updates

### Income Modeling

**Part-time teacher (1 group class + 5 individual sessions/week):**
```
Group: 12 students × 25/month = 300 → keeps 249.90/month
Individual: 5 sessions × 25 × 4 weeks = 500 → keeps 416.50/month
TOTAL: 666.40/month — teaching 7 hours/week from the couch
```

**Active teacher (2 group classes + 10 individual sessions/week):**
```
Group: 25 students × 25/month = 625 → keeps 520.63/month
Individual: 10 sessions × 25 × 4 weeks = 1,000 → keeps 833/month
TOTAL: 1,353.63/month — teaching 14 hours/week
```

**Full-time teacher (daily group + 20 individual sessions/week):**
```
Group: 50 students × 40/month = 2,000 → keeps 1,666/month
Individual: 20 sessions × 25 × 4 weeks = 2,000 → keeps 1,666/month
TOTAL: 3,332/month — teaching 25 hours/week, full-time income
```

### The Cue Card Template: "Home Teacher"

```
┌──────────────────────────────────────────┐
│  🎓 HOME TEACHER                         │
│  "Your knowledge. Your schedule.         │
│   Your living room."                     │
│                                          │
│  WHO THIS IS FOR:                        │
│  Anyone who knows something well enough  │
│  to teach it. Degree, certification, or  │
│  life experience.                        │
│                                          │
│  WHAT YOU DO:                            │
│  Teach live classes via Zoom from home.  │
│  Set your own schedule.                  │
│  Group classes + individual tutoring.    │
│                                          │
│  WHAT YOU NEED:                          │
│  Computer/phone. Zoom (free or Pro).     │
│  $5/year LB membership.                 │
│  Knowledge worth sharing.               │
│                                          │
│  WHAT YOU EARN:                          │
│  You keep 83.3% of everything.           │
│  Part-time (7 hrs/wk): $650+/month     │
│  Active (14 hrs/wk): $1,350+/month     │
│  Full-time (25 hrs/wk): $3,300+/month  │
│                                          │
│  ⚡ START TEACHING →                     │
└──────────────────────────────────────────┘
```

### What Can Be Taught (The Replicable Model)

The Spanish class is the FIRST instance. The template works for everything:

| Subject | Teacher Profile | Unique Value |
|---------|---------------|-------------|
| **Spanish** | Degreed teacher, native-level | Conversational focus, cultural context, small groups |
| **English (ESL)** | Any fluent English speaker | Massive global demand — billions of potential students |
| **Guitar/Piano/Music** | Any competent musician | Live instruction beats YouTube tutorials |
| **Math tutoring** | College student, retired teacher | SAT prep, homework help, college prep |
| **Cooking** | Home cook, professional chef | Ties into Let's Make Dinner + Family Table Cookbook |
| **Coding** | Developer, CS student | Ties into Didasko + HexIsle technical skills |
| **Fitness/Yoga** | Certified instructor | Live classes from garage/living room |
| **Art/Drawing** | Any skilled artist | Live demonstrations + critique |
| **Business/Entrepreneurship** | Any Captain or business owner | Ties into Cold Start Hub + Treasure Maps |
| **Trades** | Plumber, electrician, carpenter | "How to" for homeowners — massive demand |
| **Test prep** | Tutor with track record | SAT, GRE, LSAT, MCAT — premium pricing |
| **Language (any)** | Native speaker or degreed | Mandarin, Arabic, French, Japanese — global demand |

### The Teachers Guild

Natural Guild formation:

- **Language Teachers Guild** — shared curriculum resources, scheduling coordination, student referrals
- **STEM Teachers Guild** — math/science/coding instructors pooling resources
- **Arts Teachers Guild** — music, visual art, writing, performance

Guild benefits cascade (#2018):
- 5 teachers → shared curriculum library
- 10 teachers → guild-branded class listings ("LB Language Academy")
- 25 teachers → group Zoom Pro licenses at cooperative rate
- 50 teachers → guild-negotiated marketing, student recruitment campaigns
- 100 teachers → guild-level subscription bundles ("All Languages, One Price")

### The Didasko Connection

This IS Didasko — Sal Khan's education initiative — made real at the grassroots level. Khan Academy proved education can be free and global. Cooperative Classroom proves it can also be INCOME for the teacher:

- Khan Academy: free to students, funded by philanthropy
- LB Cooperative Classroom: affordable to students (Cost+20%), income for teachers (83.3%)
- Both: accessible from anywhere, any device, any time zone

### Quality & Trust

| Quality Signal | How It Works |
|---------------|-------------|
| **Qualifications** | Teacher lists degree/certification/experience on profile. Community can verify. |
| **Student ratings** | 1-5 stars after each session. Visible on Classroom page. |
| **ADAPT Score** | 6-dimension quality tracking (Effectiveness = student outcomes, Durability = retention) |
| **TasteMaker badge** | If teacher also backs projects (SAA 500+), the trust signal carries over |
| **Trial class** | Teachers can offer 1 free session — "try before you subscribe" |
| **Guild endorsement** | Guild-reviewed teachers get a badge: "Language Teachers Guild Verified" |

### Patent Relevance: HIGH

A cooperative commerce platform with a home-based teaching marketplace wherein:

(a) Any qualified member creates a Cooperative Classroom offering BOTH subscription group classes AND per-session individual tutoring,

(b) Live instruction delivered via third-party video conferencing (Zoom) with platform handling scheduling, billing, student management, and quality tracking — zero video hosting cost,

(c) Students pay in any of four currencies (Marks, Credits, Joules, Dollars) per #2102,

(d) Teachers keep 83.3% (Cost+20% fixed margin) vs. 37-67% on competing platforms,

(e) Replicable Cue Card template enables any subject to launch with identical infrastructure,

(f) Teacher Guilds provide collective resources, shared curriculum, and quality verification,

represents a novel cooperative education marketplace with dual-revenue teaching, multi-currency payment, and zero-infrastructure video delivery.

**No existing platform** combines:
1. Dual revenue (subscription group classes + per-session individual tutoring) in one teacher profile
2. Four-currency payment (cooperative + fiat)
3. Cost+20% fixed margin (vs. 63% Udemy, 33% Preply)
4. Guild-based teacher organization with benefit cascades
5. ADAPT Score quality tracking for education
6. Cue Card-based replicable templates for any subject
7. Zero video hosting (Zoom as infrastructure layer)

---

### Connection Map

```
#2103 Cooperative Classroom
  ├── #2102 Universal Member Subscriptions (subscription billing for group classes)
  ├── #1945 Cue Card Campaign System (Home Teacher template)
  ├── #1946 Treasure Maps (education pathway in business plan guides)
  ├── #2015 Guild Formation (Teachers Guild, Language Guild, STEM Guild)
  ├── #2018 Guild Benefit Cascade (shared Zoom licenses, curriculum, marketing)
  ├── #1937 ADAPT Score (teacher quality tracking)
  ├── #1976 Captain's Apprentice (mentorship model applied to teacher training)
  ├── Didasko Initiative (Sal Khan — education Crown)
  ├── Let's Make Dinner (cooking classes = Cooperative Classroom + LMD)
  ├── #1972 Universal Business Onboarding (teacher onboarding = business onboarding)
  └── Commerce Engine (per-session payments at Cost+20%)
```

---

**ACKNOWLEDGED AND ASSIGNED**

Inventor: Jonathan Jones
Entity: Liana Banyan Corporation

**Innovation #2103 — Cooperative Classroom: Home-Based Teaching Marketplace with Dual Revenue (Subscription Classes + Individual Sessions)**

Innovation count: **2,103** (chain end updated)

**FOR THE KEEP!**
