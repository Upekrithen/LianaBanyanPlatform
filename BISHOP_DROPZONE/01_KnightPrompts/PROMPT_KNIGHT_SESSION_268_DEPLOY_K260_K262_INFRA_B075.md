# KNIGHT SESSION 268 — Deploy K260/K262 Infrastructure to Supabase + Firebase
## Bishop B075 | April 4, 2026

---

## MISSION

Deploy the new migrations and edge functions created in K260 (News Slot) and K262 (Preface+Burst) to production Supabase, then deploy the updated frontend to Firebase hosting:main.

---

## STEP 1: Deploy Migrations (Sequential)

```bash
cd platform
npx supabase db push
```

New migrations to apply:
- `20260404000011_compilation_status.sql` (K261)
- `20260404000012_preface_burst_dispatch.sql` (K262)
- Any news slot migration from K260 (check for `distribution_news_slots`)

**Verify all tables exist:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_name IN (
  'compilation_status',
  'episode_preface_templates',
  'dispatch_platform_config',
  'distribution_news_slots'
);
```

---

## STEP 2: Deploy Edge Functions

```bash
cd platform

# Updated function
npx supabase functions deploy dispatch-crewman-episode

# New functions from K260
npx supabase functions deploy generate-daily-stats
npx supabase functions deploy bump-news-slot
```

**Verify each returns 200:**
```bash
curl -s -o /dev/null -w "%{http_code}" https://YOUR_SUPABASE_URL/functions/v1/dispatch-crewman-episode -H "Authorization: Bearer ANON_KEY"
curl -s -o /dev/null -w "%{http_code}" https://YOUR_SUPABASE_URL/functions/v1/generate-daily-stats -H "Authorization: Bearer ANON_KEY"
curl -s -o /dev/null -w "%{http_code}" https://YOUR_SUPABASE_URL/functions/v1/bump-news-slot -H "Authorization: Bearer ANON_KEY"
```

---

## STEP 3: Run Dry-Run Dispatch Test

```powershell
cd platform
.\scripts\test-dispatch-burst.ps1 -AssertExpected
```

Should pass all assertions: Twitter 3 episodes, LinkedIn 1, prefaces correct, all simulated.

---

## STEP 4: Deploy Frontend

```bash
cd platform
npm run build
npx firebase deploy --only hosting:main
```

---

## STEP 5: Run Canonical Stats Sync (K264)

Execute the SQL updates from K264 to sync platform_canonical with B075 production totals.

---

## STEP 6: Verify

1. `/staff/launch-schedule` — News Slot panel visible
2. `/staff/social-media` — Dashboard loads (K265, if built)
3. `/admin/compilation` — Shows populated rows from K259
4. Dispatch dry-run test passes all assertions
5. Landing page shows: 12 Patents, 2,144 Innovations, 182 Crown Jewels

---

## ACCEPTANCE CRITERIA

- [ ] All new tables exist in production Supabase
- [ ] All 3 edge functions deployed and responding
- [ ] Dry-run dispatch test passes assertions
- [ ] Frontend deployed to Firebase hosting:main
- [ ] Canonical stats updated
- [ ] `npm run build` passes

## DO NOT

- Run live dispatch (dry_run only for testing)
- Change viewing schedule access from 'private'
- Modify any episode content
