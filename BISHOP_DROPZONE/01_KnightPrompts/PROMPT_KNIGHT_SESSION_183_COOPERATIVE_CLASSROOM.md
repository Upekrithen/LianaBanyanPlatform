# KNIGHT SESSION 183 — Cooperative Classroom (#2103)
## Bishop B049 | New Feature Build
## Priority: MEDIUM — depends on K182 (Universal Subscriptions)
## PREREQUISITE: K182 must be deployed first

---

## CONTEXT

Innovation #2103: Cooperative Classroom — home teaching via Zoom with dual revenue (group subscriptions + individual tutoring). Teacher keeps 83.3%. Platform hosts zero video. Zoom handles delivery.

Rosario Vigil is the first candidate Home Teacher (Spanish, see B048 family Cue Cards).

See Pudding Article #20 ("The $5 Classroom") for full concept.

---

## DELIVERABLE 1: Home Teacher Profile & Schedule

### Teacher Setup in Helm

1. **Teacher Profile (`TeacherProfile.tsx`)**
   ```
   Fields:
   - Subject(s): multi-select (Spanish, English, Math, Music, Art, Cooking, etc.)
   - Qualifications: free text (degree, certifications, experience)
   - Languages: multi-select
   - Bio: 500 chars
   - Photo: existing member photo
   - Hourly rate (individual tutoring): number
   - Group class rate (per student/month): number
   - Zoom meeting link: URL (teacher provides their own Zoom)
   ```

2. **Schedule Builder (`TeacherSchedule.tsx`)**
   ```
   - Weekly calendar grid
   - Teacher marks available slots (30min, 60min, 90min blocks)
   - Color-coded: Group Class (blue), Individual Tutoring (green), Unavailable (gray)
   - Group classes: set recurring day/time, max students, title
   - Individual slots: bookable by students
   ```

3. **Database: `teacher_profiles` table**
   ```sql
   CREATE TABLE teacher_profiles (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     member_id UUID REFERENCES members(id) UNIQUE,
     subjects TEXT[] NOT NULL,
     qualifications TEXT,
     languages TEXT[] DEFAULT ARRAY['English'],
     bio TEXT,
     hourly_rate NUMERIC, -- individual tutoring
     group_rate NUMERIC, -- per student per month
     zoom_link TEXT,
     pioneer_number INTEGER, -- 1-10 if Founders' Circle, null otherwise
     active BOOLEAN DEFAULT true,
     created_at TIMESTAMPTZ DEFAULT now()
   );
   ```

4. **Database: `teacher_schedule` table**
   ```sql
   CREATE TABLE teacher_schedule (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     teacher_id UUID REFERENCES teacher_profiles(id),
     day_of_week INTEGER, -- 0=Sunday, 6=Saturday
     start_time TIME NOT NULL,
     end_time TIME NOT NULL,
     slot_type TEXT NOT NULL, -- 'group_class', 'individual', 'unavailable'
     group_class_title TEXT, -- "Tuesday Spanish Beginner"
     max_students INTEGER DEFAULT 15,
     recurring BOOLEAN DEFAULT true,
     created_at TIMESTAMPTZ DEFAULT now()
   );
   ```

---

## DELIVERABLE 2: Student Booking Flow

1. **Browse Teachers: `/classroom`**
   - Filter by: subject, language, price range, schedule (day/time), rating
   - Teacher cards with avatar, subjects, rate, availability indicator
   - "View Schedule" expands to weekly calendar

2. **Book Individual Session**
   - Click available green slot
   - Confirm: teacher, date, time, duration, rate
   - Select currency (Marks/Credits/Joules/Dollars)
   - Payment processed via K182 Universal Subscriptions engine
   - Zoom link revealed after payment

3. **Subscribe to Group Class**
   - Click blue group class slot
   - See: title, description, current enrollment, max students
   - "Subscribe" → monthly recurring via K182 engine
   - Zoom link revealed after subscription confirmed

4. **Database: `class_bookings` table**
   ```sql
   CREATE TABLE class_bookings (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     student_id UUID REFERENCES members(id),
     teacher_id UUID REFERENCES teacher_profiles(id),
     schedule_slot_id UUID REFERENCES teacher_schedule(id),
     booking_type TEXT NOT NULL, -- 'individual', 'group_subscription'
     subscription_id UUID REFERENCES member_subscriptions(id), -- from K182
     booking_date DATE, -- for individual sessions
     status TEXT DEFAULT 'confirmed', -- confirmed, completed, cancelled, no_show
     zoom_link TEXT, -- copied from teacher profile
     created_at TIMESTAMPTZ DEFAULT now()
   );
   ```

---

## DELIVERABLE 3: Home Teacher Cue Card

**Front:** "Home Teacher — Teach what you know. Keep 83.3% of every dollar."
**Back:**
- What you do: Teach from your living room via Zoom. Group classes or 1-on-1 tutoring.
- What you earn: $520-1,200/month at 11-20 hours/week
- What you need: A subject you know, a Zoom account (free tier works), a $5/year membership
- Monthly potential breakdown:
  - 3 group classes/week × 25 students × $25/month = $520 (after platform share)
  - 8 tutoring sessions/week × $25 × 4 weeks = $666 (after platform share)
- Time: 11-20 hours/week
- Pioneer bonus: First 10 get 50 Marks/month for 12 months + Pioneer Medallion

Add to `cue_card_templates` table.

---

## BUILD + DEPLOY CHECKLIST

```
[ ] teacher_profiles table migration
[ ] teacher_schedule table migration
[ ] class_bookings table migration
[ ] TeacherProfile.tsx setup component
[ ] TeacherSchedule.tsx calendar builder
[ ] /classroom browse + filter route
[ ] Individual booking flow with payment
[ ] Group class subscription flow (via K182 engine)
[ ] Zoom link reveal after payment
[ ] Home Teacher Cue Card template
[ ] Teacher stats in Helm (students, revenue, hours taught)
[ ] Pioneer tracking (first 10 teachers)
[ ] Build: zero errors
[ ] Deploy all 8 targets
```

---

*Knight Session 183 — Bishop (Foreman), B049*
*Innovation #2103 — Cooperative Classroom*
*PREREQUISITE: K182 (Universal Subscriptions) must be deployed first.*
*FOR THE KEEP!*
