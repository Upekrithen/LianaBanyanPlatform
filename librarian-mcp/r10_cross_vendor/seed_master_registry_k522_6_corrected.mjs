/**
 * K522.6 Phase A.5 SCOPE CORRECTION
 * Source of truth: FOUNDER_ANECDOTES_REGISTRY_MASTER.md (35 entries, 33 with full prose)
 * Skip: #24 (Walking Naked to Pool), #27 (5-Mile Walk Home) — PLACEHOLDER status
 * UPDATE: ids 4,5,6,7,9,10,12 — Hugo-seeded rows, now replaced with Master canonical prose
 * INSERT: 26 new Master Registry anecdotes not yet in Supabase
 * KEEP as-is: ids 1,2,3 (Shop/Triple/ToBlave → #36/#37/#38), ids 8,11,13 (Hugo-only)
 */
import { readFileSync } from 'fs';

const envPath = 'C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\Asteroid-ProofVault\\LockBox\\SDS.env';
const env = {};
readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const m = line.match(/^([A-Z_]+)=(.+)$/);
  if (m) env[m[1]] = m[2].trim();
});

const SUPABASE_URL = 'https://ruuxzilgmuwddcofqecc.supabase.co';
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;

// Fetch founder UUID
const userRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=upekrithen@gmail.com`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
});
const userData = await userRes.json();
const FOUNDER_ID = userData.users?.[0]?.id;
if (!FOUNDER_ID) { console.error('Cannot find founder UUID'); process.exit(1); }
console.log('Founder UUID found');

// ──────────────────────────────────────────────────────────────────────────────
// MASTER REGISTRY ANECDOTES
// Each entry: { num, title, body_markdown, when_it_happened, where_it_happened, update_id? }
// update_id = existing Supabase row id to PATCH instead of POST
// ──────────────────────────────────────────────────────────────────────────────

const anecdotes = [

  // ── UPDATE ROWS (Hugo-abbreviated → Master canonical) ──────────────────────

  {
    num: 1,
    update_id: 4,
    title: 'The Paper Route (Montana, Age 13)',
    when_it_happened: '1986-01-01',
    where_it_happened: 'Montana',
    body_markdown: `**Master Registry #1 | Economic Theory, Platform Ethics**

**Setting:** Montana, newspaper delivery route, age 13

> "I learned what extraction feels like delivering newspapers in Montana when I was thirteen. Labor laws wouldn't let me wash dishes until I was sixteen, but I could 'own my own business.' So twice a week, after school until after dark, I walked five hours through freezing temperatures in jeans. Buy the paper for sixteen cents, sell it for twenty-five cents. The newspaper company set the terms. I had no leverage to negotiate. I took what they offered because what choice did a kid have?"

**Key Details:**
- Age 13 — couldn't legally work as dishwasher until 16
- Loophole: could "own your own business"
- Twice a week, after school until after dark
- 5 hours walking in freezing Montana temperatures
- Just jeans — no proper cold weather gear

**Key Lesson:** Don't exploit other people, even when you have been exploited. "Don't muzzle the ox that treads the corn... The laborer is worthy of his hire."

**NOT the lesson:** The 36% margin being "fair" or "correct" — the margin was set by the company, not negotiated. The lesson is about recognizing extraction and refusing to replicate it.

**Best Used For:** Platform philosophy, empathy with creators, why Cost+20% matters, gig economy critique, ethical foundation`,
  },

  {
    num: 2,
    update_id: 5,
    title: 'The Intramural Giants (College)',
    when_it_happened: null,
    where_it_happened: 'College',
    body_markdown: `**Master Registry #2 | Teamwork, Cooperative Philosophy**

**Setting:** College social club intramural games

> "When making decisions as an Entrepreneur, it's always a choice between payoff and risk. You have to consider, is this worth it? If it isn't; don't. If it is; hold nothing back. What your hand finds to do, do it with your Might.
>
> One of my favorite memories is from college when I represented my social club in intramural games, in a challenge to place softball-sized hollow rubber balls into an institutional sized garbage can placed in the middle of the gym; guarded by two much larger than me (6'2" 6'6"?) athletes of local notoriety from competing social clubs.
>
> I, 5'6, feinted left — they both shifted left. I feinted right; again, they shifted to block me (grabbing and wrestling allowed). The crowd of my social club in the stands behind me, the clock running down, I had no other option: I dropped my right shoulder (You should have SEEN THE LOOKS OF OPEN-EYED ASTONISHMENT) and plowed INTO AND THROUGH THEM.
>
> Or, that's what I tried. They were pretty big, and the best I could do was NOT QUIT and climb them and tip us all forward, as they grabbed me and turned me around so that when all three of us slammed to the ground on our backs, I got the wind knocked out of me.
>
> But my TEAMMATE? In the time I kept the giants busy, he walked over and dropped 6 balls into the goal, 1 more than the other team.
>
> And that's how we win."

**Key Lesson:** You don't have to win. You have to create the opening for someone else to win.

**Best Used For:** Cooperative philosophy, teamwork, platform as enabler`,
  },

  {
    num: 10,
    update_id: 9,
    title: 'The Bridge-Builder (Dad\'s Story)',
    when_it_happened: null,
    where_it_happened: 'Story told by father',
    body_markdown: `**Master Registry #10 | Patent Philosophy, Legacy**

**Setting:** Story told by father

> "My dad referenced a story of a young man hiking a harrowing trail who came to a difficult stream to cross, with an old man just emerging from swimming across to the other side, who then started building a bridge back the way he had just come, over the river toward the young man.
>
> The young man jumped in and swam through the strong currents to the other side and told the old man he didn't need any help and asked the old man if he was going the same direction as he to get to the same destination, and when the old man replied yes that he had the same destination goal as the young man, the young man asked him 'then why are you bothering to build a bridge back the way you came? I'm already over here.'
>
> The old man replied 'yes, you are strong enough to make it on your own, for now. But behind you, there is someone even younger that doesn't have your strength or experience yet, and I'm building this bridge for them.'"

**Key Lesson:** Build for those who follow. Every patent is a bridge.

**Best Used For:** Patent philosophy, why freely licensed, legacy thinking

**Reference:** Dad's recording timestamps: 1:16:34–1:19:04`,
  },

  {
    num: 14,
    update_id: 7,
    title: 'Pizza for Ice Cream (College)',
    when_it_happened: null,
    where_it_happened: 'College — pizza place across from Dairy Queen',
    body_markdown: `**Master Registry #14 | Cost+20% Origin Story**

**Setting:** College, assistant manager at a pizza place across the parking lot from a Dairy Queen

> "I was the assistant manager at a pizza place in college across the parking lot from a Dairy Queen. I knew the cost of our pizzas was about 10% of what we charged customers, and I really like ice cream, and so did the 12 employees I was in charge of. So I called up Dairy Queen, and told them who I was and asked if they would be interested in pizza for dinner in exchange for ice cream for dessert. I made a deal with their manager that we would provide X pizzas for Y ice cream, since their manager knew how much the ice cream cost. Then me and the other manager paid the supply costs and treated both our crews for each of our cost of pennies on the dollar, with the significant savings, AND the variety of food benefit to each party."

**The Math:**
- $10 retail pizza = ~$1 cost to make
- $10 retail ice cream = ~$1 cost to make
- Trade at cost: Both sides get 10x value
- No money changes hands — just margin

**Key Lesson:** When you trade at cost instead of retail, everyone wins massively. The margin is where the magic is.

**Connection to Platform:** This is the direct ancestor of Cost+20%. What worked between two parking lot neighbors scales to a global network of margin-based exchange.

**Best Used For:** Explaining Cost+20%, origin of economic thinking, cooperative commerce philosophy`,
  },

  {
    num: 15,
    update_id: 10,
    title: 'The Kurt Ikard Confrontation (High School Freshman)',
    when_it_happened: null,
    where_it_happened: 'High school, freshman year',
    body_markdown: `**Master Registry #15 | Persistence, Never Give Up**

**Setting:** Freshman year of high school

> "As a freshman in high school, there was a guy named Kurt who pulled out the short hairs on the back of my neck, saying 'Rooster Tail!' He was a full two feet taller than I and outweighed me by 40 pounds. There was nothing I could physically do.
>
> Faced with daily misery, I decided that if I could not win, I would rather lose on my own terms so I at least respected myself. So I told him:
>
> 'Until you stop, I will fight you every single time I see you. And we both know I will lose. And the next time I see you, we will fight. And I will lose again. And the next. And the next. I will do that for as many times, and as long as it takes, until you stop. Because I will not ever give up. Ever. One way, or another, you WILL stop.'
>
> That's when he stopped. Not because I could beat him — I clearly could not. But because he realized I would NEVER stop trying, and the effort wasn't worth it to him."

**Key Details:**
- Freshman year (not generic "high school")
- Kurt pulled out short hairs on back of neck ("Rooster Tail!")
- Kurt was 2 feet taller, 40 pounds heavier
- Daily occurrence, not one-time
- Decision: lose on own terms rather than accept daily misery

**Key Lesson:** "This desperate choice unlocked a strategy to me. 'Whatever your hand finds to do, do it with your might.' Whether failure or success, no effort is wasted."

**Connection to Platform:** This is the same energy behind 25 years of building. The system is designed to "let you try over and over with the smallest possible cost."

**Best Used For:** Persistence philosophy, underdog stories, refusing to quit, entrepreneurship mindset`,
  },

  {
    num: 30,
    update_id: 6,
    title: "The Roommate's Suit (College)",
    when_it_happened: null,
    where_it_happened: 'College',
    body_markdown: `**Master Registry #30 | $5 Membership, Seedling, Generosity from Scarcity**

**Setting:** College — two roommates, one rich, one poor

> "When I was in college, at one point I had two roommates at one time. One, we'll call him R, was rich — his family had 10 homes and owned a lake resort. The other we'll call S, was poor like me.
>
> R could never understand why we had to scramble and wait and plan to go to the movies, and asked us 'why don't you just have more money saved up?'
>
> At one point, when I needed a suit and didn't have the money to get one, **S gave me one of the two that he owned.** R offered one of his 15 after S gave me the one.
>
> That sacrifice has stuck with me for the last 30 years and still makes me cry."

**Key Lesson:** A little generosity from someone with little means EVERYTHING. The poor roommate's ONE suit meant more than the rich roommate's offer of one of fifteen.

**Connection to Platform:** This is WHY the Seedling system works — small sacrifices from people who understand struggle.

**Best Used For:** Why $5 membership matters, why $50 microloans matter, generosity from scarcity`,
  },

  {
    num: 32,
    update_id: 12,
    title: 'Pet Antibiotics for My Daughter',
    when_it_happened: null,
    where_it_happened: 'United States — adulthood',
    body_markdown: `**Master Registry #32 | Healthcare, MSA, LifeLine Medications**

**Setting:** Adulthood, desperate healthcare moment

> "If you have ever gone to the pet supply store to buy antibiotics for your dog because you can't afford to take your daughter to the doctor, then we have something in common.
>
> The only time I ever had medical coverage in my life was when I was active duty. Or free clinics, who took out a couple of my teeth, over the years, once the infection spread to the top of my mouth and throat so I had to take 12 ibuprofen a day to be able to breathe past it.
>
> **So I know the hustle it takes to stay alive and take care of our loved ones. And I want a better way, and I can't find one, so we'll just have to make it ourselves.**"

**Key Details:**
- Bought pet antibiotics because couldn't afford doctor
- Only had medical coverage during active duty
- Free dental clinic — waited 2 hours for tooth extraction
- Infection spread to mouth and throat
- 12 ibuprofen/day to breathe

**Key Lesson:** The hustle shouldn't be required just to breathe. This is why LifeLine Medications and LB MSA exist.

**Best Used For:** Healthcare initiative letters, MSA, LifeLine Medications, Jimmy Kimmel letter, empathy with struggling members`,
  },

  // ── NEW INSERTS (26 anecdotes not yet in Supabase) ─────────────────────────

  {
    num: 3,
    title: 'The Go-Kart Scar (Age 7, Brownsville TN)',
    when_it_happened: '1980-01-01',
    where_it_happened: 'Brownsville, Tennessee',
    body_markdown: `**Master Registry #3 | Planning, Iteration, Learning from Others**

**Setting:** Family home in Brownsville, Tennessee, age 7

> "When I was 7 in Brownsville, TN, my father — I told him I want to make a go-kart and he was like 'well you should plan it out and show me that and I'll help you do it' and I said I don't want to plan it out and he said 'alright Jonathan, you go ahead and make it, let me know how that turns out.'
>
> My amazing plan — because I didn't have any tires oddly enough — I started with the wheels because I was going to make them out of the top of the tin cans that the beans came in or coffee or something.
>
> I got the empty can and then I took the knife and then I was stamping stamp stamp stamp all the way around. I'm holding the can and you guessed it — I stabbed my hand while I was taking the tin can lid off.
>
> I have that scar still. After I had stabbed it I took the knife out and I was actually quite interested because there was no blood. I thought 'that's so weird, am I OK?' And then I opened it up a little bit because I could see it — just the skin right there and then you can literally see the sinew and the muscle and the bone.
>
> Experience is an excellent and wonderful teacher, but he is a fool who will learn from no other teacher than experience."

**Key Lesson:** Learn from others' experience, not just your own mistakes.

**Best Used For:** Planning philosophy, iteration, 1,200 prototypes context`,
  },

  {
    num: 4,
    title: 'The Pizza Morale Operation (OCS)',
    when_it_happened: null,
    where_it_happened: 'Officer Candidate School, Army',
    body_markdown: `**Master Registry #4 | Leadership, Resourcefulness**

**Setting:** Officer Candidate School, Army

> "I'm the morale officer in OCS. We had not eaten for about two days and there had been a lot of physical activity. We're out in the boondocks of nowhereville but we're still on post.
>
> I as the morale officer ordered pizza from the civilian city that was miles away. I told him 'look I will pay you whatever if you take our pizza order and bring some drinks — we need some morale and I'm the morale officer, I'm doing my job.'
>
> I spoke to one of our cadre, a Staff Sergeant, and I told him 'man, you know I'm just doing my job, right?' And he's like 'yeah' and 'we can't really let the rest of cadre learn about this.'
>
> He got the unmarked pizza delivery truck — which was actually a military vehicle — and he covered the pizzas with tarp and brought in the pizzas."

**Key Lesson:** Creative problem-solving within rules. Taking initiative. Taking care of your people.

**Best Used For:** Leadership stories, resourcefulness, military background`,
  },

  {
    num: 5,
    title: "Captain Lindy's Gortex (OCS)",
    when_it_happened: null,
    where_it_happened: 'Officer Candidate School, cold weather training',
    body_markdown: `**Master Registry #5 | Leadership vs Management, Caring for Teams**

**Setting:** Officer Candidate School, cold weather training

> "There was a certain captain who wore her gortex jacket. The appointed leader of the hour had forgotten to tell everybody to get their gortex jackets — and then because he forgot to do that but he had a gortex jacket on, she said 'everybody has to be the same — uniformity — so what is it, on or off?'
>
> He's flustered and says 'off.' She said 'you're the leader, everybody leave your jackets.' And then she kept her jacket.
>
> Captain Lindy, that's right, you did. I was there.
>
> So I'm the morale officer and we go on this thing and it's raining and it's cold and man we are cold. The only thing keeping us OK is that we are moving in the dark and then we stop and we're gonna be stopped there for about an hour and a half.
>
> I put down my gear, told my buddy 'take care of it,' and I went down the line and I gave everybody morale pills — which were of course Tic Tacs."

**Key Lesson:** Leadership vs management. Taking care of people even when leadership doesn't.

**Best Used For:** Leadership philosophy, caring for community, contrast with extractive platforms`,
  },

  {
    num: 6,
    title: 'The Deodorant Flight',
    when_it_happened: null,
    where_it_happened: 'Airport',
    body_markdown: `**Master Registry #6 | Humility, Check Everything Twice**

**Setting:** Airport, rushing to make a flight

> "One time at band camp, I booked an expensive flight, rushed to the airport and sprayed myself in the face with deodorant as I was repacking one of the bags so it met weight requirements while the rest of the line waited, mere minutes from takeoff, only to learn as I confidently approached the gate that I had accidentally scheduled the flight for exactly one month later."

**Key Lesson:** Check everything twice. Humility in mistakes.

**Best Used For:** Self-deprecating humor, relating to audience, admitting imperfection`,
  },

  {
    num: 7,
    title: 'NextAddress.com (2004–2006)',
    when_it_happened: '2004-01-01',
    where_it_happened: 'United States — early web development',
    body_markdown: `**Master Registry #7 | Persistence, Prior Art, Startup Landscape**

**Setting:** Early web development, pre-Google Maps ecosystem, 2004–2006

> "Around 2004 until 2006 I was building a site called NextAddress.com that used a cool algorithm to embed a new mapping feature called 'google maps.'
>
> Until in 2005, shortly after Google Maps launched, an enterprising programmer named Paul Rademacher developed a site called Housingmaps.com. He used a programming hack to combine apartment listings from Craigslist with Google Maps.
>
> The integration was not sanctioned by the listing services, but the innovative tool gained significant attention for its user-friendly approach to apartment hunting, and effectively ended the novel value of NextAddress.
>
> Following its popularity, Rademacher was hired by Google to work on the official Google Maps team."

**Key Lesson:** Being first doesn't guarantee success. Keep building. Persistence matters.

**Reference:** Wayback Machine screenshot available

**Best Used For:** Prior experience in tech, understanding of startup landscape, persistence`,
  },

  {
    num: 8,
    title: "Ylona's Kitten Proposal (Daughter, Age 10)",
    when_it_happened: null,
    where_it_happened: 'Family home',
    body_markdown: `**Master Registry #8 | Entrepreneurship, Courage, Expected No — Tried Anyway**

**Setting:** Family home — Ylona making a case for adopting a cat

> "Ylona had cleaned up her room and made space in preparation for Me and Diana granting permission for her to have a new cat, and made a convincing presentation for the purpose. She made a proposal called 'Reasons I think you should let me adopt Rocket', with 10 reasons listed like 'If my room is messy and not safe for a kitten, I would organize and clean it for him', with a picture of the kitten currently up for adoption that she had gone online to the pet shelter and found, as well as a picture she drew of him.
>
> Diana listened and saw it all, then gently told Ylona that the answer was no.
>
> Ylona cried during the explanations, and after the last part, she said: 'So the final answer is no?' And Diana confirmed that it was.
>
> Ylona cried a little more, and then wiped her tears and said 'It's ok. I need to learn through hearing more no's.'
>
> The reason she was so nervous to say anything to Diana about a cat is that she expected from the start that it would be a no. But that she had to try anyway."

**Key Lesson:** "Expected no, tried anyway." The entrepreneurial spirit.

**Reference:** Photo of proposal available

**Best Used For:** Entrepreneurship philosophy, family values, courage to pitch`,
  },

  {
    num: 9,
    title: 'The Grocery Pickup Pivot',
    when_it_happened: null,
    where_it_happened: 'Family errand planning',
    body_markdown: `**Master Registry #9 | Resilience, Adaptation, Keeping Perspective**

**Setting:** Family errand planning

> "When I was about to leave to pick up the very large grocery order, Diana frantically texted me that she accidentally set the pickup time for 9:30 PM not AM.
>
> I said 'hold on, we got this.' Because I learned a long time ago to 'never despair at the immediacy of your circumstance.' If you breathe, take it in, consider, and reset, it will all be good.
>
> Then I ran upstairs, and started talking to Diana by reminding her about how one time I booked an expensive flight... for exactly one month later.
>
> Then I reminded her that we will do the best we can with what we have, NOW, and not stress about what we cannot control.
>
> She laughed, I went to the store and got what we needed, and we rescheduled the normal grocery pickup."

**Key Lesson:** "Never despair at the immediacy of your circumstance."

**Best Used For:** Resilience, adaptation, keeping perspective`,
  },

  {
    num: 11,
    title: 'The Liana Banyan Name Origin',
    when_it_happened: null,
    where_it_happened: 'Childhood — book memory',
    body_markdown: `**Master Registry #11 | Brand Story, Mission, Origin**

**Setting:** Childhood memory of a book

> "One of my earliest memories is of having a book read to me about a kingdom in the sea — underneath the water level but open to the sky. In the story, this was made possible by mangroves, or banyan, whose roots interlocked so tightly as to keep out the ocean, even while the entire island was essentially in a large depression made possible by the surrounding wall of trees.
>
> A magical kingdom held together by trees. Protected by interconnection."

**Etymology:**
- **Liana:** A climbing vine that leans on other plants for support as it climbs upward
- **Banyan:** From Sanskrit via Gujarati, originally meaning "man of the trading caste" — the word has ALWAYS meant commerce and merchants gathering

**Key Lesson:** One tree becomes a forest. Interconnection creates protection.

**Best Used For:** Brand story, mission explanation, origin story`,
  },

  {
    num: 12,
    title: 'The Floating Cities (6th Grade)',
    when_it_happened: null,
    where_it_happened: 'Billings, Montana — 6th grade',
    body_markdown: `**Master Registry #12 | Long-Term Vision, Origin Story**

**Setting:** 6th grade school project, Billings, Montana

As a child, the founder created a project about floating modular cities that was featured in a newspaper with the headline "Wave of the Future." This childhood vision of interconnected, modular communities eventually evolved over 37 years into the platform architecture.

**Key Lesson:** Vision persists. Childhood ideas become adult reality.

**Best Used For:** Origin story, long-term vision, dedication to mission`,
  },

  {
    num: 13,
    title: 'The Africa Baobab Tree',
    when_it_happened: null,
    where_it_happened: 'Africa — missionary family childhood',
    body_markdown: `**Master Registry #13 | Growth Philosophy, Platform as Incubator**

**Setting:** Childhood in Africa (missionary family)

> "When the Jones family lived in Africa, Jonathan was impressed with the Baobab tree, which like the Banyan has a large central trunk that branches out, then has aerial roots that reach to the ground and create another trunk that then repeats the process.
>
> One tree becomes a forest. One business births many."

**Key Lesson:** Growth through replication. Platform incubator model.

**Best Used For:** Growth philosophy, platform as incubator, African heritage`,
  },

  {
    num: 16,
    title: 'The Megamind Lesson (Movie Reference)',
    when_it_happened: null,
    where_it_happened: 'Movie reference — Megamind (2010)',
    body_markdown: `**Master Registry #16 | Philosophy of Persistence, Embracing Failure**

**Setting:** The animated film *Megamind* (2010)

**The Quotes:**
> **Megamind:** "There's a benefit to losing: You get to learn from your mistakes."
>
> **Roxanne Ritchi:** "The Megamind I knew would never have run from a fight, even when he knew he had absolutely no chance of winning. It was your best quality."

**Founder's Application:**
> "One of my favorite animated films is Megamind, because of two quotes... I've made a lot more than a few [mistakes], and I've learned that Calvin Coolidge was right when he said 'Nothing in the world can take the place of persistence. Talent will not; nothing is more common than unsuccessful men with talent. Genius will not; unrewarded genius is almost a proverb. Education will not; the world is full of educated derelicts. Persistence and determination alone are omnipotent.'"

**Key Lesson:** Losing teaches. Fighting — even hopelessly — builds character. Persistence is omnipotent.

**Connection to Other Anecdotes:** Links directly to Kurt (never give up), Ylona's Kitten (expected no, tried anyway)

**Best Used For:** Philosophy of persistence, embracing failure, entrepreneurship`,
  },

  {
    num: 17,
    title: 'Brakeless (High School Bike)',
    when_it_happened: null,
    where_it_happened: 'High school — hometown streets',
    body_markdown: `**Master Registry #17 | Entrepreneurship, Plan Ahead, Get Back On**

**Setting:** High school, riding a homemade ten-speed bike with no brakes

> "When I was in high school I had a ten speed bike that I made from spare parts, which didn't have any brakes of any kind, because I painted it black and then thought it looked cool with a single gear and plain handlebars. I rode it all over town, down the huge hill in the middle of main street and back up multiple times.
>
> This taught me quickly the value of planning ahead, and reacting quickly with one of several hastily created plans — practice that did me well decades later as a TH-67 Kiowa Warrior helicopter aviator.
>
> Once, I was riding Brakeless to school and Carlene was driving her car behind me (I took pride in riding faster than traffic whenever possible, which was most of the time) when a dog appeared about 7 blocks in front of me racing down the middle of the road straight toward me, barking full speed attack mode.
>
> I had to go to school, and I didn't have brakes, so I pumped the pedals and tried yelling and veering left and right several times, but the dog matched me each time, until we hit head-on.
>
> I just remember flying through the air and sitting up to see the bike crash-land in front of me on the empty road. The dog was gone, and Carlene had gotten out of her car to laugh and laugh as she asked if I was okay. She said I hit that dog straight on and flipped over to land almost perfectly on my back.
>
> I was fine, so I got back on the bike and, of course, was late to school. I never hit another dog though."

**Key Lesson:** Plan ahead. React quickly with hastily created backup plans. Get back on the bike.

**Connection to Platform:** Building without a safety net. Planning ahead while moving fast. Getting back on after a collision.

**Best Used For:** Entrepreneurship (no brakes, full speed), iteration philosophy, learning by doing, military connection`,
  },

  {
    num: 18,
    title: 'Helicopter Navigation (Aviation Philosophy)',
    when_it_happened: null,
    where_it_happened: 'TH-67 Kiowa Warrior helicopter training',
    body_markdown: `**Master Registry #18 | Iteration, Long-Term Vision, Constant Correction**

**Setting:** TH-67 Kiowa Warrior helicopter training and flying

> "A helicopter never flies straight — it's always too far in this direction and then too far in the opposite, always needing correction. But still skilled pilots arrive at LZ 4 hours later within 30 seconds of ETA."

**Related:**
> "Autorotations take practice. And save lives."

**Key Lesson:** Constant correction is not failure — it's how you reach the destination. Perfection isn't the goal; arrival is.

**Technical Note:**
- TH-67 Kiowa Warrior = Army training helicopter
- LZ = Landing Zone
- ETA = Estimated Time of Arrival
- Autorotation = Emergency landing procedure when engine fails; helicopter uses rotor momentum to land safely

**Connection to Platform:**
- 25 years of building = constant correction, always arriving
- Cost+20% evolved through many iterations
- Platform will continue to need adjustment — that's not failure, that's flying

**Best Used For:** Iteration philosophy, platform development, responding to critics, long-term vision`,
  },

  {
    num: 19,
    title: 'The Green Metro (No Reverse, No A/C)',
    when_it_happened: null,
    where_it_happened: 'United States — early 20s',
    body_markdown: `**Master Registry #19 | Resourcefulness, Making Do, Adaptation**

**Setting:** Early 20s, driving a Chevy Metro

> "When I was in my 20s I drove a green Chevy Metro 4 cylinder car that, after I raced my mother to my sister's wedding in it, would no longer reverse. For the next four years, I made sure to park either on slight upward inclines or in places I could pull through to leave.
>
> It also had no air conditioning, and in the south, was an experience with what they called '4-90' — all four windows down and going 90."

**Key Details:**
- Reverse broke racing mom to sister's wedding
- 4 years of strategic parking
- No A/C in the South
- "4-90" cooling system: all four windows down, going 90

**Key Lesson:** Adapt. Work around limitations. Plan your exit before you park.

**Best Used For:** Resourcefulness, making do, entrepreneurship on a budget`,
  },

  {
    num: 20,
    title: 'The 1978 CJ-7 Jeep (No Gauges, Leaking Gas Tank)',
    when_it_happened: null,
    where_it_happened: 'United States — early adulthood',
    body_markdown: `**Master Registry #20 | Calculated Risk, Faith Under Pressure**

**Setting:** Second vehicle ever owned, early adulthood

> "My second vehicle ever was a 1978 CJ-7 Jeep with a bikini top and no working gauges except the speedometer, odometer, and radio. I kept a small gas can strapped to the back and remembered when I had filled up last and where I had gone. I actually never ran out of gas once.
>
> I DID however, drive home 18 miles from my job after I put my last $7 into the gas tank and started the jeep, ran in to pay the till, and when I came out a guy pointed out that my gas tank was leaking onto the tail pipe.
>
> I considered for a minute that I had no way of getting home, and even if I did, my Jeep would have to be towed, and I couldn't afford that. So I said a prayer and drove home anyway. Then I replaced the gas tank."

**Key Details:**
- Bikini top, no working gauges except speedometer/odometer/radio
- Small gas can strapped to back — never ran out of gas
- Last $7 in tank, leaking onto tailpipe
- Drove 18 miles home anyway
- Then replaced the tank himself

**Key Lesson:** Sometimes you have to drive home with a leaking gas tank because there's no other option. Then fix it.

**Best Used For:** Calculated risk, faith under pressure, resourcefulness, doing what you have to do`,
  },

  {
    num: 21,
    title: 'The Jeep That Fell Apart (20+ Breakdowns)',
    when_it_happened: null,
    where_it_happened: 'United States — same 1978 CJ-7 Jeep',
    body_markdown: `**Master Registry #21 | Learning by Doing, Iteration, School of Hard Knocks**

**Setting:** Same 1978 CJ-7 Jeep — ongoing saga

> "I ended up replacing over half of that car, since it was the first one I ever worked on, and it fell apart so often that I was literally left on the side of the road over 20 times.
>
> Once, my drive shaft fell off as I was driving and skidded across the road into the bushy marsh, never to be seen again. Battery failure, fuel line...
>
> Once, I drove home at 3 AM from work, and realizing that I was going to have to go get gas before going back to work in the morning, I turned around out of the driveway back to the stop sign half a block away and stopped. Then when I stepped on the gas, it roared in response, but didn't move. I hit the brakes, and the left rear wheel fell over onto the road, off the axle. The entire jeep tilted onto the bare axle, and I turned off the ignition and thought about how I had just been going 78 down the road minutes before."

**Key Details:**
- Replaced over half the car himself — first car he ever worked on
- Stranded 20+ times on the side of the road
- Drive shaft skidded into marsh, never recovered
- Wheel fell off at stop sign after going 78 mph minutes earlier
- Learned mechanics entirely by necessity

**Key Lesson:** You learn by things falling apart. The Jeep was a teacher. Every breakdown was a lesson.

**Connection to Platform:** "I ended up replacing over half of that car" = rebuilt this platform dozens of times. Same energy.

**Best Used For:** Learning by doing, iteration, the School of Hard Knocks, self-taught skills`,
  },

  {
    num: 22,
    title: 'Christmas Eve 1992 (Expelled, Homeless, Landing on Feet)',
    when_it_happened: '1992-12-24',
    where_it_happened: 'Montana → college town',
    body_markdown: `**Master Registry #22 | Origin Story, Resilience, Starting from Zero**

**Setting:** Christmas Eve 1992 — expelled from college

> "I was living there because I got kicked out of college on Christmas Eve, 1992. I was an R.A. since I was military, but I hadn't gone to class for reasons for about 5 weeks, and the people in charge were too chicken to tell me to my face.
>
> So I flew home to Montana for Christmas break, and the mail arrived Christmas Eve with a letter informing me that since I was being expelled for one semester due to failing grades, I also had to move out of the dorm, and my employment as a Residential Assistant was also therefore terminated.
>
> I opened the mail, so I was the only one in the family to know. All I had was my return ticket to college and my Jeep, still parked at college and my things in my dorm room.
>
> I had been recruited into the Army National Guard at 16, since that was the only way this Preacher's Kid was going to college, and I figured now, I had the choice of living with my parents or just taking the trip back and landing on my feet.
>
> So a few days later, the night before we drove me to the airport 2 hours away, I told one of my little sisters what had happened and where I was going. So that my family would know not to worry, and that I'd call them when I had the chance (since long distance then was quite expensive).
>
> I landed, got my things in my jeep, and spent 3 days sleeping in it until a friend lent me his couch for a week until I could get a job and then rent a one bedroom with a missing wall (covered with a taped tarp) since the landlord, a professor at the school, was still working on the house. It was $175 per month, which was about half of the money I made."

**Key Details:**
- Christmas Eve 1992
- Expelled for failing grades (hadn't gone to class for 5 weeks "for reasons")
- Lost dorm, lost R.A. job, lost everything at once
- Army National Guard since age 16 — only way preacher's kid could afford college
- Only told little sister, night before leaving
- Slept in Jeep for 3 days → friend's couch for a week → $175/month apartment with missing tarp wall

**Key Lesson:** Land on your feet. Start from nothing. Build from there.

**Connection to Platform:** This is WHY the $5 entry point matters. The founder WAS that person.

**Best Used For:** Origin story, resilience, starting from zero, understanding struggle`,
  },

  {
    num: 23,
    title: 'The $175 Apartment (Missing Wall, Half His Income)',
    when_it_happened: '1993-01-01',
    where_it_happened: 'College town — first apartment',
    body_markdown: `**Master Registry #23 | Humble Beginnings, Why $5 Matters**

**Setting:** Post-expulsion, first apartment

> "I rented a one bedroom with a missing wall (covered with a taped tarp) since the landlord, a professor at the school, was still working on the house. It was $175 per month, which was about half of the money I made."

**Key Details:**
- One bedroom apartment
- Missing wall covered with taped tarp
- Landlord was a professor, still renovating
- $175/month = approximately half of income
- First real housing after sleeping in Jeep

**Key Lesson:** A roof with a tarp wall is still a roof. Start somewhere.

**Best Used For:** Humble beginnings, empathy with struggling members, why $5 matters`,
  },

  {
    num: 25,
    title: 'Sinbad Uncurling His Fist (Movie Reference)',
    when_it_happened: null,
    where_it_happened: 'Movie reference — Sinbad: Legend of the Seven Seas (2003)',
    body_markdown: `**Master Registry #25 | Sacrifice, Doing Right Regardless of Outcome, Faith**

**Setting:** The animated film *Sinbad: Legend of the Seven Seas* (2003)

**Founder's Words:**
> "OH, and my fave fave? Sinbad. When he goes back to die, for his friend, because it PROVES HE DID THE RIGHT THING even when he wasn't going to. And won the Book of Peace, from Eris. What an amazing application, as he opens his hand, in resignation and acceptance of his fate, without knowing what would happen. Like the guy in William Wallace movie Braveheart that says he wants to BELIEVE like HE BELIEVES. Because I believe."
>
> "Instead of open hand, say uncurled fist for Sinbad, because he COULD HAVE fought, or ran, but he didn't."

**The Movie Context:**
- Sinbad is condemned to die for stealing the Book of Peace (which he didn't do)
- His friend Proteus offers to die in his place, believing in Sinbad's innocence
- Sinbad runs away at first — proving he ISN'T the hero
- But then he comes back to face execution — to save his friend
- Eris (goddess of chaos) expected him to run. When he doesn't, she loses the bet
- His "uncurled fist" — resignation, acceptance, doing the right thing even facing death

**Key Lesson:** Do the right thing even when you're going to lose. Especially when you're going to lose. The uncurled fist — you COULD fight, you COULD run, but you don't.

**Related Quote:**
> "I want to give hope to people who have very little or none at all. A chance that depends ON THEM for what they get... So that they do the right thing against all odds and it is REWARDED. Like the engineer that made the Death Star vulnerable on purpose. Like Schindler in Schindler's List. My heroes."

**Best Used For:** Philosophy of sacrifice, doing right regardless of outcome, courage, faith`,
  },

  {
    num: 26,
    title: "The 11th Birthday Party (Children's Home)",
    when_it_happened: null,
    where_it_happened: "Children's Home — age 11",
    body_markdown: `**Master Registry #26 | Origin of Empathy, Outsider Status**

**Setting:** Age 11, Children's Home where biological parents cared for foster kids

> "I invited my entire class to my 11th birthday party and not a single person came, because we lived in the Children's Home where my biological parents took care of foster kids in our home."

**Key Details:**
- Age 11
- Parents ran a Children's Home (foster care)
- Invited entire class
- No one came

**Key Lesson:** Rejection. Outsider status. The origin of empathy for the marginalized — why the platform is for everyone.

**Status:** Founder has core memory — full version to be completed (K522.7 Founder Pass)

**Best Used For:** Origin of empathy, understanding outsiders, why platform is for everyone`,
  },

  {
    num: 28,
    title: "Learning to Fight (The Children's Home)",
    when_it_happened: null,
    where_it_happened: "The Children's Home — school, fields, church yard",
    body_markdown: `**Master Registry #28 | Survival, Refusing to Be a Victim, Persistence Origin**

**Setting:** The Children's Home — school, fields at home, church yard

> "I learned to fight while we were at The Home — at school, at home in the fields away from adults, and at church in the yard before and after services. I slowly learned how, and started winning."

**Key Details:**
- Three locations: school, fields at home (away from adults), church yard (before/after services)
- Gradual process — "slowly learned"
- Eventually started winning

**Connection to Other Anecdotes:**
- Precursor to #15 (Kurt) — learned to fight at The Home, applied it in high school
- Context for #26 (11th Birthday) — same setting, same outsider status

**Key Lesson:** Survival. Earning respect. Refusing to be a victim.

**Status:** Founder to fill in full details (K522.7 Founder Pass)

**Best Used For:** Origin of persistence, fighting spirit, refusing to quit, background for Kurt story`,
  },

  {
    num: 29,
    title: 'Learning to Swim (Captain Kirk)',
    when_it_happened: null,
    where_it_happened: 'College — Advanced Swimming class',
    body_markdown: `**Master Registry #29 | It's Never Too Late, Jump In and Figure It Out**

**Status:** COMPLETE

**Setting:** College, Advanced Swimming class

> My parents had four children — one son (me) and three daughters. They believed in consistency: the same rules for everyone. No dating until 18. No wearing shorts, for modesty. And no swimming. We went "wading." Crossing rivers. In jeans.
>
> I didn't know how to swim. I almost drowned three times.
>
> The worst was in a pool. I'd learned a trick: push off hard from one wall, hold my breath (I could hold it over two minutes), and glide to the other side. It worked in short pools. But this time, I picked my head up to see if I was close to the wall. That slowed me down. I stopped *just* out of arm's reach of the edge.
>
> I couldn't swim. Not even a stroke. I was motionless in the water, my breath running out, unable to close that last two feet. I decided not to let the breath out of my body. I went still. I waited. Eventually my father noticed and asked someone to help me.
>
> In college, I decided this was unacceptable. I couldn't imagine getting married and not being able to save my wife if she fell in the water. The thought was intolerable.
>
> So I signed up for Advanced Swimming.
>
> First day, Coach Kirk (whom I immediately called "Captain," because of course I did) pulled me aside.
>
> "You don't know how to swim, do you?"
>
> "No, sir. But I'm a fast learner, and I don't quit."
>
> He explained that 9 of the 12 students in the class were already lifeguards. This wasn't just advanced swimming — it was a lifeguard certification course. He suggested I take a different class.
>
> I insisted.
>
> "Okay," he said. "If you can swim across the full length of the pool — Olympic length — you can stay."
>
> I thought about the moment I'd almost drowned. The stillness. The miscalculation. The two feet I couldn't close.
>
> I swam across the pool.
>
> I got an A in the course. **And I got my lifeguard certification.**
>
> A few months later, I got my scuba diving certification too.
>
> From "almost drowned three times" to certified lifeguard and scuba diver. Because **it's never too late to start.**

**Key Details:**
- Signed up for ADVANCED swimming without knowing how to swim
- Coach "Captain" Kirk — 9 of 12 students were already lifeguards
- Challenge: swim across Olympic-length pool to stay in class
- Result: Got an A, earned lifeguard certification, later scuba certification

**Key Lesson:** Jump in. Figure it out. Don't go around — go THROUGH. It's never too late to start.

**Best Used For:** Learning by doing, courage to start before you're ready, overcoming impossible odds`,
  },

  {
    num: 31,
    title: 'The Facebook Friend with Cancer',
    when_it_happened: null,
    where_it_happened: 'Social media — watching someone die',
    body_markdown: `**Master Registry #31 | SWOOP, MSA, Healthcare — Impossible Choice**

**Setting:** Social media connection, watching someone die

> "I was facebook friends with a woman who had cancer, and would post about it every week in vain attempt to stave off the long-term effects she knew it was going to have on her family. She wrote about how she felt about her children under ten and her husband, and the decisions they had to make about whether to try to save her by taking on lifelong debt that would outlast her by 50 years if it didn't work.
>
> And that last week before she died, with the half-measures of some chemo they managed to second mortgage the house for, and its effects, still trying to raise money with crowdfunding pleas for the debts she knew would ruin the future for them, still trying to work, were heart-wrenching.
>
> **No one should have to choose between trying to save their life and the livelihood of the survivors.**"

**Key Lesson:** The impossible choice — save yourself or protect your family from debt. This is broken. This is why SWOOP exists.

**Connection to Platform:** Direct origin of "Do the Swoop" — support families so patients can focus on what matters.

**Best Used For:** SWOOP initiative, MSA, LifeLine Medications, healthcare letters, Tatiana Schlossberg letter`,
  },

  {
    num: 33,
    title: "Grandpa's Bean Soup (The Depression Legacy)",
    when_it_happened: null,
    where_it_happened: 'Texas — 1950s family history',
    body_markdown: `**Master Registry #33 | Generational Poverty, Boaz Principle, Difficult Not Impossible**

**Setting:** Family history, Texas 1950s

> "My Father is famous in our family for eating jelly out of the jar with a spoon. As kids, we four made much of it, but as he will tell you, it's because he is the 6th of 13 children who were born to parents who lived through the 'Great' Depression, and never got much better off from there, so one spoonful was all they ever got.
>
> Grampa was a welder who had worked as a Foreman on the Texas Oil pipelines in the 1950s, and when a loaded truck rolled downhill and broke his back, he had no income and on bedrest for over 9 months. They had bean soup made on the fire in the back yard, with more or less beans, every afternoon as the daily meal, and the charity of church members and neighbors who weren't better off but had a little, helped them eke by.
>
> Grandma was a school teacher. The first woman to attend, and graduate, college at William and Mary college in North Carolina. She helped me with my pre-Calculus homework during a visit to us in Montana, but only after I did all of it first. That's the only week I ever did all my homework in all my classes. I told her I tested well, so I didn't have to do the home 'busy-work' as I called it. She pointed out that to whom much is given, much shall be required, and it was a shame that I wasn't giving all of the effort I could, especially since other people had to work harder to get the same results. Clearly, it made an impression.
>
> Grandpa died of cancer in 1993 from smoking the first 30 years of his life, or the welding rods that were stuck to his skin after 12 and 16 hour workdays. I was at the hospital with him in Tennessee my Junior Year of college, but he had dementia by then. Grandma died 3 months shy of her 100th birthday five years ago."

**Grandpa Story #1 — The Silent Burn:**
> Grandma told us that Grandpa was in the kitchen and slipped on a rag that had fallen to the floor as he was making breakfast. Since he was old and didn't want to break a hip, he grabbed the stove to save himself from falling — with his forearm across the hot eye.
>
> Grandma was sitting 12 feet away in the open dining room part of the same room, reading, and didn't hear anything (and she had good hearing until she died a couple months away from a century old). She only knew about it because when they were getting home from church he had a little blood on his white shirt after he took off his jacket, which had escaped from the bandage he didn't tell her he put on it.

**Grandpa Story #2 — Quitting Smoking:**
> He would always say that quitting smoking was the easiest thing he ever did. He'd done it thousands of times. Then he would tell about how he hated it so bad that he threw his pack away in the grass and two hours later would be on all fours searching for it. Until he finally quit.
>
> Which is why that poster about quitting smoking that just shows a broken-in-half cigarette with the words **"Difficult. Not Impossible"** hit so hard. I think of that a lot when I come up against a brick wall.

**Key Lesson:** Generational poverty. Community support. "To whom much is given, much shall be required." Stoic endurance. **Difficult. Not Impossible.**

**Key Details:**
- Father is 6th of 13 children
- Grandpa: welder, foreman, back broken by truck, 9 months bedrest
- Bean soup in backyard every day
- Grandma: first woman to graduate William & Mary (NC)
- Grandpa died 1993; Grandma died 3 months shy of 100

**Best Used For:** Origin story, why platform exists, generational wealth/poverty, Boaz Principle, persistence, "Difficult. Not Impossible" mantra`,
  },

  {
    num: 34,
    title: 'The Fire Chief Mantra',
    when_it_happened: null,
    where_it_happened: 'Story that has stayed 30 years',
    body_markdown: `**Master Registry #34 | Leadership Philosophy, Accept Responsibility, Put Others First**

**Setting:** Story that stuck for 30 years

> "One mantra has stayed with me for thirty years:
>
> **'I slipped. Is she okay?'**
>
> Those were the first words of an anonymous fire chief after falling from a three-story ladder while carrying a victim down.
>
> Three stories. Falling. Holding someone. And his first thought was about her, not himself.
>
> **This is the epitome of what I believe: Accept responsibility. Put others first.**"

**Key Lesson:** Accept responsibility. Put others first. Even when YOU are the one falling.

**Best Used For:** Leadership philosophy, platform values, selflessness`,
  },

  {
    num: 35,
    title: 'The Starfish Story (Hemingway Version)',
    when_it_happened: null,
    where_it_happened: 'Family reference story',
    body_markdown: `**Master Registry #35 | SWOOP, Individual Impact, No Effort Is Wasted**

**Setting:** Family reference story (commonly attributed to Loren Eiseley; the Jones family version attributes to Hemingway)

> "The starfish story. Which is how, in my family, we refer to the story told by Ernest Hemingway who during a walk saw a boy dancing erratically down the beach. Upon approaching him, Mr. Hemingway saw that the boy was picking up starfish and flinging them into the ocean to save them from the inevitable scorching death of the afternoon sun. When asked since there were literally thousands of starfish that he couldn't save, what did it matter, the boy replied as he threw another one **'It matters to THIS one.'**
>
> No effort is wasted."

**Key Lesson:** No effort is wasted. You can't save everyone, but you can save SOMEONE.

**Note:** Story is commonly attributed to Loren Eiseley, not Hemingway — but this is how the Jones family tells it.

**Best Used For:** SWOOP, individual impact, why small actions matter`,
  },

];

// ──────────────────────────────────────────────────────────────────────────────
// EXECUTE: UPDATE and INSERT
// ──────────────────────────────────────────────────────────────────────────────

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

let updated = 0;
let inserted = 0;
const errors = [];

for (const a of anecdotes) {
  const payload = {
    title: a.title,
    body_markdown: a.body_markdown,
    privacy_level: 'public',
    ...(a.when_it_happened ? { when_it_happened: a.when_it_happened } : {}),
    ...(a.where_it_happened ? { where_it_happened: a.where_it_happened } : {}),
  };

  if (a.update_id) {
    // PATCH existing row
    const res = await fetch(`${SUPABASE_URL}/rest/v1/anecdotes?id=eq.${a.update_id}`, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    if (res.status >= 200 && res.status < 300) {
      updated++;
      console.log(`  ✓ UPDATE id=${a.update_id} → Master #${a.num}: "${a.title}"`);
    } else {
      errors.push(`UPDATE #${a.num}: ${text}`);
      console.error(`  ✗ UPDATE id=${a.update_id} → #${a.num}: ${res.status} ${text}`);
    }
  } else {
    // POST new row (check for existing by title first)
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/anecdotes?title=eq.${encodeURIComponent(a.title)}&select=id`,
      { headers },
    );
    const existing = JSON.parse(await checkRes.text());
    if (Array.isArray(existing) && existing.length > 0) {
      console.log(`  ~ SKIP (exists) #${a.num}: "${a.title}" → id=${existing[0].id}`);
      continue;
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/anecdotes`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify({ ...payload, author_id: FOUNDER_ID }),
    });
    const text = await res.text();
    if (res.status >= 200 && res.status < 300) {
      const created = JSON.parse(text);
      inserted++;
      console.log(`  ✓ INSERT #${a.num}: "${a.title}" → new id=${created[0]?.id}`);
    } else {
      errors.push(`INSERT #${a.num}: ${text}`);
      console.error(`  ✗ INSERT #${a.num}: ${res.status} ${text}`);
    }
  }
}

console.log(`\n════════════════════════════════════════`);
console.log(`Updated:  ${updated} rows (Hugo prose → Master canonical)`);
console.log(`Inserted: ${inserted} new Master Registry anecdotes`);
console.log(`Errors:   ${errors.length}`);
if (errors.length) errors.forEach(e => console.error('  ', e));

// Cross-check flags
console.log(`\n── Cross-Check: Not-in-Master rows (flag for K522.7) ──`);
console.log(`  id=1  "The Shop That Fixed My Son's Car"  → Proposed Master #36`);
console.log(`  id=2  "Hit the Triple Double"             → Proposed Master #37`);
console.log(`  id=3  "The 'To Blave' Technique"          → Proposed Master #38`);
console.log(`  id=8  "The USAA Lifeline"                 → Hugo-only (no Master equiv)`);
console.log(`  id=11 "The Golden Eagle's Head"           → Hugo-only (no Master equiv)`);
console.log(`  id=13 "The Squad Car Mannequin"           → Hugo-only (no Master equiv)`);

// Placeholder flags
console.log(`\n── Placeholders SKIPPED (flag for Founder fill-in) ──`);
console.log(`  Master #24 "Walking Naked to Pool"        → PLACEHOLDER, await Founder prose`);
console.log(`  Master #27 "5-Mile Walk Home (Dar es Salaam)" → PLACEHOLDER, await Founder prose`);

console.log(`\n── K522.7 Flag ──`);
console.log(`  Registry "Last Updated: February 21, 2026" — needs Founder pass to add:`);
console.log(`  - "The To Blave Technique" (B127 April 2026)`);
console.log(`  - Any other 2026 B-session anecdotes`);
console.log(`  - Full prose for #24 and #27`);
console.log(`  - Full prose for #26 (11th Birthday) and #28 (Learning to Fight)`);
