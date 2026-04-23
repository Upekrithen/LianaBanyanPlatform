# Pudding Article #24 — No Effort Is Wasted
## The Liana Banyan Promise
## Bishop B052

---

**Slug**: `no-effort-is-wasted`
**Category**: Economics / Member Experience
**Pudding Number**: 24
**Depth Levels**: All 6 (Glimpse through To-Go)

---

## SQL Insert

```sql
INSERT INTO cephas_content (
  slug, title, subtitle, category, content_type,
  glimpse, peek, tell_me_more, sample, show_me, to_go,
  is_published, created_by, pudding_number
) VALUES (
  'no-effort-is-wasted',
  'No Effort Is Wasted',
  'The Liana Banyan Promise',
  'economics',
  'pudding',

  -- GLIMPSE (surface hook)
  'Everything you do on this platform earns Marks. Nothing disappears. Every Mark you earn is backed up, recorded, and permanent.',

  -- PEEK (key points)
  'Three things make this different: (1) Everything is prepaid — Cost + 20% means the economics work before you start. (2) Your Marks build on themselves — they''re payment, reputation, voting rights, and purchasing power combined. (3) Substitution is built in — what you''ve done proves what you can do next, and the cooperative matches your skills to funded work.',

  -- TELL ME MORE (full context)
  'Marks are effort-differential tokens representing real work. Photograph a business? Marks. Log a deal? Marks. Teach a class? Marks. Prep meals? Marks. These aren''t just currency — they''re your resume inside the cooperative. When you earn 100 Photography Marks, those qualify you for Captain''s Pitch decks, Treasure Map visuals, and paid shoots. When a funded project needs a photographer, your proven track record is your ticket in. The cooperative runs at Cost + 20%, so every transaction has margin built in. You''re never gambling that someone will pay — the system guarantees payment at a rate that covers cost plus surplus. $5 per year membership. Everything else, you earn.',

  -- SAMPLE (try it)
  'Here''s how it works in practice: A member joins for $5/year. They photograph 10 local businesses through Bounty Photography — earning Photography Marks for each. A Captain launching a new cooperative venture needs product photos for their pitch deck. The platform matches the photographer''s proven Marks to the Captain''s funded need. The photographer gets paid in Marks (spendable within the cooperative) or Credits (dollar-equivalent). Their Photography Marks also count toward voting rights in creative Guild decisions. Nothing was wasted — every photo built credentials, currency, and community standing simultaneously.',

  -- SHOW ME (guided walkthrough)
  'The treasure map of effort accumulation: Photography Marks unlock Captain''s Pitch decks, Treasure Maps, and paid shoots. Pearl Diver Marks unlock cooperative purchasing, grocery planning, and paid scouting. Classroom Marks unlock recurring students, course subscriptions, and workshop invites. Freezer Node Marks unlock Family Table orders, catering, and meal subscriptions. General participation Marks unlock voting rights, project access, and community standing. Every line earned by doing something real. No shortcuts. No pay-to-play. No premium tier. You control how much you get paid by controlling how much you accomplish.',

  -- TO-GO (homework / action items)
  'Action items: (1) Pick your first role — photographer, pearl diver, teacher, cook, or general member. (2) Complete your first task to earn your first Marks. (3) Check your Helm to see your Mark balance and what doors they''ve opened. (4) Look at the Treasure Map for your role to see the full progression path. (5) Remember: the more roles you fill, the more Marks you earn, the more doors open. Every Mark is a brick. You''re building something that''s yours.',

  true,
  'bishop-b052',
  24
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  glimpse = EXCLUDED.glimpse,
  peek = EXCLUDED.peek,
  tell_me_more = EXCLUDED.tell_me_more,
  sample = EXCLUDED.sample,
  show_me = EXCLUDED.show_me,
  to_go = EXCLUDED.to_go,
  pudding_number = EXCLUDED.pudding_number,
  updated_at = now();
```

---

*Pudding #24 — No Effort Is Wasted*
*Every Mark is a brick. You're building something that's yours.*
*FOR THE KEEP!*
