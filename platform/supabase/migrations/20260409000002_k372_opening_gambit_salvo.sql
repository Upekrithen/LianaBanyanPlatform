-- K372: Opening Gambit Salvo — 14-day, 5-stream campaign (~57 posts)
-- Session: K372 / B091 | April 9, 2026
-- All posts inserted as 'draft' — Founder activates via The Battery

-- Add metadata column if not present (used by all Battery campaigns)
ALTER TABLE member_scheduled_posts ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Insert Stream 1: Platform Identity (14 posts, daily, Days 1-14)
INSERT INTO member_scheduled_posts (user_id, content, scheduled_for, status, platform, metadata)
SELECT auth.uid(), v.content, (current_date + (v.day - 1) * interval '1 day' + interval '8 hours'), 'draft', 'twitter', v.meta::jsonb
FROM (VALUES
  (1,  'Every platform has a margin. Ours is locked — permanently — at Cost + 20%. Not "up to." Not "starting at." Exactly 20% over actual cost, written into the operating agreement. #LianaBanyan', '{"campaign":"opening_gambit_salvo","stream":"platform-identity","day":1,"title":"Cost + 20%"}'::text),
  (2,  'On a $500 transaction, the creator keeps $416.67. 83.3%. Every time. Constitutionally locked. #LianaBanyan #CostPlus20', '{"campaign":"opening_gambit_salvo","stream":"platform-identity","day":2,"title":"Creators Keep 83.3%"}'),
  (3,  'It costs $5 a year to join Liana Banyan. Start a business. Sell your work. Access 16 initiatives. Five dollars. lianabanyan.com/join #LianaBanyan', '{"campaign":"opening_gambit_salvo","stream":"platform-identity","day":3,"title":"$5/Year Membership"}'),
  (4,  'Credits = spending money. Marks = earned contribution power. Joules = permanent record. None convert to cash. None can be speculated on. #LianaBanyan', '{"campaign":"opening_gambit_salvo","stream":"platform-identity","day":4,"title":"Three Currencies"}'),
  (5,  'When you contribute to Liana Banyan, you become an owner. Not metaphorical. Real — with governance weight and a permanent on-chain record. #LianaBanyan', '{"campaign":"opening_gambit_salvo","stream":"platform-identity","day":5,"title":"Cooperative Ownership"}'),
  (6,  '2,224 documented innovations. 202 survived with no prior art found — we call them Crown Jewels. Four decades of thinking. Nine years building. #LianaBanyan', '{"campaign":"opening_gambit_salvo","stream":"platform-identity","day":6,"title":"2,224 Innovations"}'),
  (7,  '12 provisional patent applications. ~2,393 formal claims. 99% utility patents. We built the thing, then we protected it. #LianaBanyan', '{"campaign":"opening_gambit_salvo","stream":"platform-identity","day":7,"title":"12 Provisional Patents"}'),
  (8,  '202 innovations with no prior art found across 130 deep-dive queries. 80% of the IP goes into the cooperative. #LianaBanyan', '{"campaign":"opening_gambit_salvo","stream":"platform-identity","day":8,"title":"202 Crown Jewels"}'),
  (9,  'Zero venture capital. Zero investors. Funded by $5 memberships and the Founder''s savings. Because VC demands 10x extraction. #LianaBanyan', '{"campaign":"opening_gambit_salvo","stream":"platform-identity","day":9,"title":"No VC"}'),
  (10, '"Fair" means the same deal for everyone. $50 earrings and $5,000 furniture get the same 83.3%. Cost + 20%. Same architecture. #LianaBanyan', '{"campaign":"opening_gambit_salvo","stream":"platform-identity","day":10,"title":"Fair Means Everyone"}'),
  (11, '"Help Each Other Help Ourselves." Not independence — interdependence. I help you, you help them, they help us. HEOHO. #LianaBanyan', '{"campaign":"opening_gambit_salvo","stream":"platform-identity","day":11,"title":"HEOHO"}'),
  (12, '16 initiatives. One cooperative. Let''s Make Dinner. JukeBox. Health Accords. Defense Klaus. All funded by architecture, not pledges. #LianaBanyan', '{"campaign":"opening_gambit_salvo","stream":"platform-identity","day":12,"title":"16 Initiatives"}'),
  (13, '35 production systems. Not "planned." Built. Deployed. Running. We build. Then we ship. Then we build more. #LianaBanyan', '{"campaign":"opening_gambit_salvo","stream":"platform-identity","day":13,"title":"35 Production Systems"}'),
  (14, '6 cold start pathways: Founding 300, HexIsle, Crown Letters, Red Carpet, Academic circuit, Opening Gambit media salvo. You''re watching #6. #LianaBanyan', '{"campaign":"opening_gambit_salvo","stream":"platform-identity","day":14,"title":"6 Cold Start Pathways"}')
) AS v(day, content, meta)
WHERE EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'));

-- Insert Stream 3: Academic Tags (7 posts, days 1-7)
INSERT INTO member_scheduled_posts (user_id, content, scheduled_for, status, platform, metadata)
SELECT auth.uid(), v.content, (current_date + (v.day - 1) * interval '1 day' + interval '13 hours'), 'draft', 'twitter', v.meta::jsonb
FROM (VALUES
  (1, 'Platform cooperativism laid the groundwork. We built the architecture. Cost + 20%, locked. Creators keep 83.3%. 2,224 innovations. @TreborS #PlatformCooperativism', '{"campaign":"opening_gambit_salvo","stream":"academic-tag","day":1,"title":"Trebor Scholz"}'::text),
  (2, 'Can cooperatives scale digitally? We built the answer. Three-gear currency. Medallion governance. 16 initiatives. @ntnsndr #PlatformCooperativism', '{"campaign":"opening_gambit_salvo","stream":"academic-tag","day":2,"title":"Nathan Schneider"}'),
  (3, 'You coined "enshittification." We built the antidote. Margin locked in the operating agreement. Structurally impossible to enshittify. @doctorow', '{"campaign":"opening_gambit_salvo","stream":"academic-tag","day":3,"title":"Cory Doctorow"}'),
  (4, 'Commons-based peer production meets cooperative commerce. The commons has an engine now. @ybenkler #CooperativeEconomics', '{"campaign":"opening_gambit_salvo","stream":"academic-tag","day":4,"title":"Yochai Benkler"}'),
  (5, 'Doughnut Economics — what does a thriving economy look like? Cost + 20%. Creators keep 83.3%. The doughnut has a platform. @KateRaworth', '{"campaign":"opening_gambit_salvo","stream":"academic-tag","day":5,"title":"Kate Raworth"}'),
  (6, 'Team Human has a marketplace now. No VC. No IPO pathway. The cooperative owns itself. @Rushkoff #TeamHuman', '{"campaign":"opening_gambit_salvo","stream":"academic-tag","day":6,"title":"Douglas Rushkoff"}'),
  (7, 'Remove extraction architecturally and the surveillance business model collapses. The alternative is cooperative commerce. @ShoshanaZuboff', '{"campaign":"opening_gambit_salvo","stream":"academic-tag","day":7,"title":"Shoshana Zuboff"}')
) AS v(day, content, meta)
WHERE EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'));

-- Insert Stream 4: Medium Articles (4 posts, days 1/4/7/10)
INSERT INTO member_scheduled_posts (user_id, content, scheduled_for, status, platform, metadata)
SELECT auth.uid(), v.content, (current_date + (v.day - 1) * interval '1 day' + interval '9 hours'), 'draft', 'medium', v.meta::jsonb
FROM (VALUES
  (1,  '12 Patents, Zero Investors — How Four AI Agents Built a Cooperative Platform. One founder, four AI agents, 2,224 innovations. #LianaBanyan #AI', '{"campaign":"opening_gambit_salvo","stream":"medium-article","day":1,"title":"12 Patents Zero Investors"}'::text),
  (4,  'The 83.3% Platform: Why Cost+20% Changes Everything. On every platform, creators lose 30-50% to fees. #CooperativeEconomics', '{"campaign":"opening_gambit_salvo","stream":"medium-article","day":4,"title":"The 83.3% Platform"}'),
  (7,  'Political Expedition: What If Your Political Voice Had Economic Weight? Not voting. Economic expression. #CivicTech #Democracy', '{"campaign":"opening_gambit_salvo","stream":"medium-article","day":7,"title":"Political Expedition"}'),
  (10, 'The Ambassador of the Quan. The money + the love + the respect + the community. #LianaBanyan #TheQuan', '{"campaign":"opening_gambit_salvo","stream":"medium-article","day":10,"title":"Ambassador of the Quan"}')
) AS v(day, content, meta)
WHERE EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'));

-- Insert Stream 5: LinkedIn Deep Posts (4 posts, days 2/5/8/11)
INSERT INTO member_scheduled_posts (user_id, content, scheduled_for, status, platform, metadata)
SELECT auth.uid(), v.content, (current_date + (v.day - 1) * interval '1 day' + interval '10 hours'), 'draft', 'linkedin', v.meta::jsonb
FROM (VALUES
  (2,  'I''m a 53-year-old Army National Guard veteran. Father of eight. 21 years in IT. Nine years building Liana Banyan. Zero VC. Four AI agents. 2,224 innovations. $5/year to join. #CooperativeCommerce #VeteranEntrepreneur', '{"campaign":"opening_gambit_salvo","stream":"linkedin-deep","day":2,"title":"The Founders Story"}'::text),
  (5,  'Amazon charges 35%+. Etsy takes 30%. Uber takes 40%+. At Liana Banyan, the margin is locked at Cost + 20%. On $500: creator keeps $416.67. The math works because we have no investors demanding 10x returns. #CooperativeEconomics #CostPlus20', '{"campaign":"opening_gambit_salvo","stream":"linkedin-deep","day":5,"title":"The Economics"}'),
  (8,  '2,224 innovations. 12 provisional patents. ~2,393 formal claims. 202 Crown Jewels with no prior art. 80% of the IP goes into the cooperative. The IP fortress makes extraction impossible. #IntellectualProperty #Innovation', '{"campaign":"opening_gambit_salvo","stream":"linkedin-deep","day":8,"title":"The IP Fortress"}'),
  (11, 'The Opening Gambit: sacrifice material to gain position. 80% of the IP portfolio contributed to the cooperative. 300 founding memberships at $5/year. 500 members = break-even. 1,000 = profitable. lianabanyan.com/join #OpeningGambit #LianaBanyan', '{"campaign":"opening_gambit_salvo","stream":"linkedin-deep","day":11,"title":"The Launch"}')
) AS v(day, content, meta)
WHERE EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'));

-- NOTE: Stream 2 (Cue Card posts, 28 entries) is scheduled from the TypeScript
-- salvo script to avoid a massive SQL block. The script inserts them with
-- campaign='opening_gambit_salvo', stream='cue-card'.
