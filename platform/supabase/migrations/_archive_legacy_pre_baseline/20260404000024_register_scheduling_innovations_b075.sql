-- K278 / B075: Register Temporal Content Architecture innovations #2145-#2148.
-- Crown Jewel designation is intentionally NOT set here (Founder decision pending).

INSERT INTO innovation_log (innovation_number, title, category, description, status, session_tag, created_at)
VALUES
  (
    2145,
    'Scheduled Viewing Beacon',
    'Content Infrastructure',
    'Member-controlled content scheduling primitive that lets platform members schedule future viewing of any content (Puddings, BST Episodes, Spoonfuls, Skipping Stones, Papers) with tooltip-style entry box (time, date, recurrence, reminder offset, label). Beacons auto-sync to member''s Helm Calendar. Transforms content consumption from passive feed-scrolling into deliberate learning.',
    'documented',
    'B075/K278',
    NOW()
  ),
  (
    2146,
    'Shared Scheduling Primitive (Three-Surface Architecture)',
    'Platform Architecture',
    'Single scheduling UI component pattern deployed across three distinct user roles: Staff (broadcast schedule), Creators (cue card dispatch), and Members (viewing beacons). Same underlying code, same UI pattern, different target contexts. Architectural coherence across operator, creator, and consumer roles without sacrificing each role''s unique needs.',
    'documented',
    'B075/K278',
    NOW()
  ),
  (
    2147,
    'All the Pudding TV Guide (Temporal Content Discovery)',
    'Content Discovery',
    'Cephas content displayed as programming schedule — old TV Guide metaphor applied to cooperative platform content. Horizontal time axis, vertical channel lanes (BST / Spoonfuls / Puddings / Skipping Stones / News Slot), visual programming blocks with titles, durations, spice tags, and currently airing indicators. Members can toggle between Listings / Schedule / Calendar views; each block offers Schedule Viewing to create a beacon.',
    'documented',
    'B075/K278',
    NOW()
  ),
  (
    2148,
    'Temporal Content Architecture',
    'Platform Theory',
    'Design pattern where scheduling is a shared primitive exposed to three distinct user roles — transforming content consumption from algorithmic feed colonization into member-controlled appointment-based learning. Breaks the operator monopoly on temporal decisions (what appears when, for whom, in what order). Each role (operator, creator, consumer) has equal access to the scheduling primitive, differing only in target context.',
    'documented',
    'B075/K278',
    NOW()
  )
ON CONFLICT (innovation_number) DO NOTHING;

UPDATE platform_canonical
SET value = 2148, updated_at = NOW()
WHERE key = 'innovation_count';
