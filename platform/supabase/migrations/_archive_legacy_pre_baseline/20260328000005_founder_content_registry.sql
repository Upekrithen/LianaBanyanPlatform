-- =============================================================================
-- MIGRATION: 20260328000005_founder_content_registry
-- PURPOSE:   Seed all Founder anecdotes, origin story, philosophy, and creed
--            into cephas_content_registry so /cephas/founder/* routes serve content.
--            Also adds 'founder' and 'under_the_hood' to category CHECK.
--            Hugo source at Cephas/cephas-hugo/content/founder/_index.md is PRESERVED
--            as the canonical reference — this migration mirrors it into the DB.
-- DATE:      2026-03-28  |  Knight 148+
-- =============================================================================

-- ─── Fix category CHECK to include all used values ──────────────────────────
DO $$ BEGIN
  ALTER TABLE public.cephas_content_registry
    DROP CONSTRAINT IF EXISTS cephas_content_registry_category_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE public.cephas_content_registry
  ADD CONSTRAINT cephas_content_registry_category_check
  CHECK (category IN (
    'academic_paper', 'academic', 'crown_letter', 'outreach_letter', 'open_letter',
    'system_design', 'initiative', 'innovation', 'hexisle',
    'article', 'vault_archive', 'reference',
    'under_the_hood', 'founder'
  ));

-- ─── 1. Founder Anecdotes (the canonical page) ─────────────────────────────
INSERT INTO public.cephas_content_registry (
  slug, title, category, subcategory, style,
  source_path, technical_summary, implementation_status,
  innovation_ids, bishop_session, creation_context,
  content_markdown
) VALUES (
  'anecdotes',
  'The Founder: Verified Anecdotes',
  'founder',
  'authenticity-proof',
  'pudding',
  'Cephas/cephas-hugo/content/founder/_index.md',
  'Stories with proof. Minimal exposure. Maximum authenticity. Personal stories from the Founder — lessons learned from paper routes, intramural games, 25,000 chess losses, helicopter navigation, and 37 years of building.',
  'live',
  ARRAY['1016'],
  'K148+',
  'Migrated from Hugo founder/_index.md — canonical authenticity proof page with 20+ anecdotes and 13 photo references',
$founder_anecdotes$
# The Founder

> *"I don't know where I'm going, but I know what I'm looking for, and in time, I will find both."*

---

## Why This Page Exists

If I received any of the letters I'm sending out, I would absolutely research the person who sent them. This page exists to make that vetting process easier.

**What you'll find here:** Specific stories with photographic proof. Not a biography — just evidence that the claims are real.

**What you won't find:** My home address, my children's names, or anything that makes my family less safe.

---

## 📊 The Numbers (Verified)

### Chess Statistics

| Metric | Value |
|--------|-------|
| **Highest Rating** | 2118 on a good day - nowadays I hover in the 2080s when I take a chess break from work (Top 0.4% worldwide) |
| **Total Games** | 25,399 (on this ONE account) |
| **Win Rate** | 46% (11,701 won) |
| **Draw Rate** | 4% (1,121 drawn) |
| **Loss Rate** | 50% (12,577 lost) |

![Chess Statistics Screenshot](/images/founder/chess-stats.png)
*Chess.com statistics — verified January 2026*

> *"As you can see, I have lost more times than I have won. Yet my rating is 2118 on a good day - nowadays I hover in the 2080s when I take a chess break from work - in the top 0.4% of chess players in the world. So how do we win if we lose half the time? By playing a different game, and learning from our mistakes."*

---

## 🖼️ Anecdotes with Photos

### "My Dad Reading to Me" — The Origin

**The claim:** Ideas dating back to 1975, when a child read about an underwater kingdom protected by interlocking mangrove roots.

![My Dad reading to me](/images/founder/dad-reading.jpg)
*My father reading to me before Christmas, 1975.*

> "One of my earliest memories is of having a book read to me about a kingdom in the sea - underneath the water level but open to the sky. In the story, this was made possible by mangroves, or banyan, whose roots interlocked so tightly as to keep out the ocean, even while the entire island was essentially in a large depression made possible by the surrounding wall of trees.
>
> A magical kingdom held together by trees. Protected by interconnection."

**The lesson:** One tree becomes a forest. Interconnection creates protection.

---

### "Me and Great-Grandpa Arthur Merritt"

**The claim:** Multi-generational family with deep American roots.

![Me and Great-Grandpa](/images/founder/great-grandpa.jpg)
*Me as a child with one of my sisters and our great-grandfather, Arthur Merritt.*

**The lesson:** We build on what came before. The bridge-builder doesn't cross his own bridge.

---

### "Fort Benning Basic Training, 1989"

**The claim:** U.S. ARNG veteran (, 11B/15A) • Army Aviation Helicopter Pilot with FAA Commercial Rotary Wing IFR rating — military service, persistence through adversity. (IFR certification is exceptionally difficult to obtain and maintain, requiring instrument-only flight proficiency.)

![Fort Benning Basic Training](/images/founder/fort-benning.jpg)
*My Basic Training photo, Fort Benning, 1989.*

**The lesson:** Discipline matters. So does learning to follow before you lead.

---

### "Mom and One Little Sister in Tanzania"

**The claim:** Raised internationally, perspective shaped by living abroad.

![Mom and One Little Sister in Tanzania](/images/founder/mom-hannah-tanzania.jpg)
*My mother and one little sister in Tanzania — we left on the last flight before Idi Amin's invasion.*

**The lesson:** The world is bigger than any one country. Build for everyone.

---

### "Go-Kart Scar" — Learning the Hard Way

**The claim:** Willing to take hits and keep going.

![Go-Kart Scar](/images/founder/gokart-scar.jpg)
*The scar from building a go-kart. Still here.*

> "When I was 7 in Brownsville, TN, my father—I told him I want to make a go-kart and he was like 'well you should plan it out and show me that and I'll help you do it' and I said I don't want to plan it out and he said 'alright Jonathan, you go ahead and make it, let me know how that turns out.'
>
> My amazing plan—because I didn't have any tires oddly enough—I started with the wheels because I was going to make them out of the top of the tin cans that the beans came in or coffee or something.
>
> I got the empty can and then I took the knife and then I was stamping stamp stamp stamp all the way around. I'm holding the can and you guessed it—I stabbed my hand while I was taking the tin can lid off.
>
> I have that scar still. After I had stabbed it I took the knife out and I was actually quite interested because there was no blood. I thought 'that's so weird, am I OK?' And then I opened it up a little bit because I could see it—just the skin right there and then you can literally see the sinew and the muscle and the bone.
>
> **Experience is an excellent and wonderful teacher, but he is a fool who will learn from no other teacher than experience.**"

---

### "Grade School Designing"

**The claim:** Been designing and building things since childhood.

![Grade School Designing](/images/founder/grade-school-designing.jpg)
*Sketches from grade school. The urge to build never stopped.*

**The lesson:** Start early. Keep going. The seeds you plant as a child grow into forests.

---

### "Family Drawing by Caleb"

**The claim:** Family of 10 — two parents, eight children.

![Family Drawing](/images/founder/family-drawing.jpg)
*Our family of 10, drawn by my son Caleb.*

**The lesson:** Build something worth passing down. This is for them.

---

## 📜 The Full Anecdotes

### THE PAPER ROUTE (Montana, Age 13)

> "I learned what extraction feels like delivering newspapers in Montana when I was thirteen. Labor laws wouldn't let me wash dishes until I was sixteen, but I could 'own my own business.' So twice a week, after school until after dark, I walked five hours through freezing temperatures in jeans. Buy the paper for sixteen cents, sell it for twenty-five cents. The newspaper company set the terms. I had no leverage to negotiate. I took what they offered because what choice did a kid have?"

**Key Lesson:** Don't exploit other people, even when you have been exploited. "Don't muzzle the ox that treads the corn... The laborer is worthy of his hire."

---

### THE INTRAMURAL GIANTS (College)

> "When making decisions as an Entrepreneur, it's always a choice between payoff and risk. You have to consider, is this worth it? If it isn't; don't. If it is; hold nothing back. What your hand finds to do, do it with your Might.
>
> One of my favorite memories is from college when I represented my social club in intramural games, in a challenge to place softball-sized hollow rubber balls into an institutional sized garbage can placed in the middle of the gym; guarded by two much larger than me (6'2? 6'6?) athletes of local notoriety from competing social clubs.
>
> I, 5'6, feinted left — they both shifted left. I feinted right; again, they shifted to block me (grabbing and wrestling allowed). The crowd of my social club in the stands behind me, the clock running down, I had no other option: I dropped my right shoulder (You should have SEEN THE LOOKS OF OPEN-EYED ASTONISHMENT) and plowed INTO AND THROUGH THEM.
>
> Or, that's what I tried. They were pretty big, and the best I could do was NOT QUIT and climb them and tip us all forward, as they grabbed me and turned me around so that when all three of us slammed to the ground on our backs, I got the wind knocked out of me.
>
> But my TEAMMATE? In the time I kept the giants busy, he walked over and dropped 6 balls into the goal, 1 more than the other team.
>
> **And that's how we win.**"

**Key Lesson:** You don't have to win. You have to create the opening for someone else to win.

---

### THE ROOSTER TAIL CONFRONTATION (High School Freshman)

> "As a freshman in high school, there was a guy named Kurt who pulled out the short hairs on the back of my neck, saying 'Rooster Tail!' He was a full two feet taller than I and outweighed me by 40 pounds. There was nothing I could physically do.
>
> Faced with daily misery, I decided that if I could not win, I would rather lose on my own terms so I at least respected myself. My voice trembled as I told him:
>
> 'Until you stop, I will fight you every single time I see you. And we both know I will lose. And the next time I see you, we will fight. And I will lose again. And the next. And the next. I will do that for as many times, and as long as it takes, until you stop. Because I will not ever give up. Ever. One way, or another, you WILL stop.'
>
> That's when he stopped. Not because I could beat him—I clearly could not. But because he realized I would NEVER stop trying, and the effort wasn't worth it to him."

**Key Lesson:** "This desperate choice unlocked a strategy to me. 'Whatever your hand finds to do, do it with your might.' Whether failure or success, no effort is wasted."

---

### PIZZA FOR ICE CREAM (College)

> "I was the assistant manager at a pizza place in college across the parking lot from a Dairy Queen. I knew the cost of our pizzas was about 10% of what we charged customers, and I really like ice cream, and so did the 12 employees I was in charge of. So I called up Dairy Queen, and told them who I was and asked if they would be interested in pizza for dinner in exchange for ice cream for dessert. I made a deal with their manager that we would provide X pizzas for Y ice cream, since their manager knew how much the ice cream cost. Then me and the other manager paid the supply costs and treated both our crews for each of our cost of pennies on the dollar, with the significant savings, AND the variety of food benefit to each party."

**The Math:**
- $10 retail pizza = ~$1 cost to make
- $10 retail ice cream = ~$1 cost to make
- Trade at cost: Both sides get 10x value
- No money changes hands — just margin

**Key Lesson:** When you trade at cost instead of retail, everyone wins massively. The margin is where the magic is. **This is the direct ancestor of Cost+20%.**

---

### THE PIZZA MORALE OPERATION (OCS)

> "I'm the morale officer in OCS. We had not eaten for about two days and there had been a lot of physical activity. We're out in the boondocks of nowhereville but we're still on post.
>
> I as the morale officer ordered pizza from the civilian city that was miles away. I told him 'look I will pay you whatever if you take our pizza order and bring some drinks—we need some morale and I'm the morale officer, I'm doing my job.'
>
> I spoke to one of our cadre, a Staff Sergeant, and I told him 'man, you know I'm just doing my job, right?' And he's like 'yeah' and 'we can't really let the rest of cadre learn about this.'
>
> He got the unmarked pizza delivery truck—which was actually a military vehicle—and he covered the pizzas with tarp and brought in the pizzas."

**Key Lesson:** Creative problem-solving within rules. Taking initiative. Taking care of your people.

---

### CAPTAIN LINDY'S GORTEX (OCS)

> "There was a certain captain who wore her gortex jacket. The appointed leader of the hour had forgotten to tell everybody to get their gortex jackets—and then because he forgot to do that but he had a gortex jacket on, she said 'everybody has to be the same—uniformity—so what is it, on or off?'
>
> He's flustered and says 'off.' She said 'you're the leader, everybody leave your jackets.' And then she kept her jacket.
>
> Captain Lindy, that's right, you did. I was there.
>
> So I'm the morale officer and we go on this thing and it's raining and it's cold and man we are cold. The only thing keeping us OK is that we are moving in the dark and then we stop and we're gonna be stopped there for about an hour and a half.
>
> I put down my gear, told my buddy 'take care of it,' and I went down the line and I gave everybody morale pills—which were of course Tic Tacs."

**Key Lesson:** Leadership vs management. Taking care of people even when leadership doesn't.

---

### THE DEODORANT FLIGHT

> "One time at band camp, I booked an expensive flight, rushed to the airport and sprayed myself in the face with deodorant as I was repacking one of the bags so it met weight requirements while the rest of the line waited, mere minutes from takeoff, only to learn as I confidently approached the gate that I had accidentally scheduled the flight for exactly one month later."

**Key Lesson:** Check everything twice. Humility in mistakes.

---

### NEXTADDRESS.COM (2004-2006)

> "Around 2004 until 2006 I was building a site called NextAddress.com that used a cool algorithm to embed a new mapping feature called 'google maps.'
>
> Until in 2005, shortly after Google Maps launched, an enterprising programmer named Paul Rademacher developed a site called Housingmaps.com. He used a programming hack to combine apartment listings from Craigslist with Google Maps.
>
> The integration was not sanctioned by the listing services, but the innovative tool gained significant attention for its user-friendly approach to apartment hunting, and effectively ended the novel value of NextAddress.
>
> Following its popularity, Rademacher was hired by Google to work on the official Google Maps team."

**Key Lesson:** Being first doesn't guarantee success. Keep building. Persistence matters.

---

### YLONA'S KITTEN PROPOSAL (Daughter, Age 10)

> "Ylona had cleaned up her room and made space in preparation for Me and Diana granting permission for her to have a new cat, and made a convincing presentation for the purpose. She made a proposal called 'Reasons I think you should let me adopt Rocket', with 10 reasons listed like 'If my room is messy and not safe for a kitten, I would organize and clean it for him', with a picture of the kitten currently up for adoption that she had gone online to the pet shelter and found, as well as a picture she drew of him.
>
> Diana listened and saw it all, then gently told Ylona that the answer was no.
>
> Ylona cried during the explanations, and after the last part, she said: 'So the final answer is no?' And Diana confirmed that it was.
>
> Ylona cried a little more, and then wiped her tears and said 'It's ok. I need to learn through hearing more no's.'
>
> The reason she was so nervous to say anything to Diana about a cat is that she expected from the start that it would be a no. **But that she had to try anyway.**"

**Key Lesson:** "Expected no, tried anyway." The entrepreneurial spirit.

---

### THE GROCERY PICKUP PIVOT

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

---

### THE BRIDGE-BUILDER (Dad's Story)

> "My dad referenced a story of a young man hiking a harrowing trail who came to a difficult stream to cross, with an old man just emerging from swimming across to the other side, who then started building a bridge back the way he had just come, over the river toward the young man.
>
> The young man jumped in and swam through the strong currents to the other side and told the old man he didn't need any help and asked the old man if he was going the same direction as he to get to the same destination, and when the old man replied yes that he had the same destination goal as the young man, the young man asked him 'then why are you bothering to build a bridge back the way you came? I'm already over here.'
>
> The old man replied 'yes, you are strong enough to make it on your own, for now. But behind you, there is someone even younger that doesn't have your strength or experience yet, and I'm building this bridge for them.'"

**Key Lesson:** Build for those who follow. Every patent is a bridge.

---

### BRAKELESS (High School Bike)

> "When I was in high school I had a ten speed bike that I made from spare parts, which didn't have any brakes of any kind, because I painted it black and then thought it looked cool with a single gear and plain handlebars. I rode it all over town, down the huge hill in the middle of main street and back up multiple times.
>
> This taught me quickly the value of planning ahead, and reacting quickly with one of several hastily created plans—practice that did me well decades later as a TH-67 Kiowa Warrior helicopter aviator.
>
> Once, I was riding Brakeless to school and Carlene was driving her car behind me (I took pride in riding faster than traffic whenever possible, which was most of the time) when a dog appeared about 7 blocks in front of me racing down the middle of the road straight toward me, barking full speed attack mode.
>
> I had to go to school, and I didn't have brakes, so I pumped the pedals and tried yelling and veering left and right several times, but the dog matched me each time, until we hit head-on.
>
> I just remember flying through the air and sitting up to see the bike crash-land in front of me on the empty road. The dog was gone, and Carlene had gotten out of her car to laugh and laugh as she asked if I was okay. She said I hit that dog straight on and flipped over to land almost perfectly on my back.
>
> I was fine, so I got back on the bike and, of course, was late to school. **I never hit another dog though.**"

**Key Lesson:** Plan ahead. React quickly with hastily created backup plans. Get back on the bike.

---

### HELICOPTER NAVIGATION (Aviation Philosophy)

> "A helicopter never flies straight—it's always too far in this direction and then too far in the opposite, always needing correction. But still skilled pilots arrive at LZ 4 hours later within 30 seconds of ETA."
>
> "Autorotations take practice. And save lives."

**Key Lesson:** Constant correction is not failure—it's how you reach the destination. Perfection isn't the goal; arrival is.

---

### THE GREEN METRO (No Reverse, No A/C)

> "When I was in my 20s I drove a green Chevy Metro 4 cylinder car that, after I raced my mother to my sister's wedding in it, would no longer reverse. For the next four years, I made sure to park either on slight upward inclines or in places I could pull through to leave.
>
> It also had no air conditioning, and in the south, was an experience with what they called '4-90' — all four windows down and going 90."

**Key Lesson:** Adapt. Work around limitations. Plan your exit before you park.

---

### THE 1978 CJ-7 JEEP (No Gauges, Leaking Gas Tank)

> "My second vehicle ever was a 1978 CJ-7 Jeep with a bikini top and no working gauges except the speedometer, odometer, and radio. I kept a small gas can strapped to the back and remembered when I had filled up last and where I had gone. I actually never ran out of gas once.
>
> I DID however, drive home 18 miles from my job after I put my last $7 into the gas tank and started the jeep, ran in to pay the till, and when I came out a guy pointed out that my gas tank was leaking onto the tail pipe.
>
> I considered for a minute that I had no way of getting home, and even if I did, my Jeep would have to be towed, and I couldn't afford that. **So I said a prayer and drove home anyway.** Then I replaced the gas tank."

**Key Lesson:** Sometimes you have to drive home with a leaking gas tank because there's no other option. Then fix it.

---

### THE JEEP THAT FELL APART (20+ Breakdowns)

> "I ended up replacing over half of that car, since it was the first one I ever worked on, and it fell apart so often that I was literally left on the side of the road over 20 times.
>
> Once, my drive shaft fell off as I was driving and skidded across the road into the bushy marsh, never to be seen again. Battery failure, fuel line...
>
> Once, I drove home at 3 AM from work, and realizing that I was going to have to go get gas before going back to work in the morning, I turned around out of the driveway back to the stop sign half a block away and stopped. Then when I stepped on the gas, it roared in response, but didn't move. I hit the brakes, and the left rear wheel fell over onto the road, off the axle. The entire jeep tilted onto the bare axle, and I turned off the ignition and thought about how I had just been going 78 down the road minutes before."

**Key Lesson:** You learn by things falling apart. The Jeep was a teacher. Every breakdown was a lesson.

---

### CHRISTMAS EVE 1992 (Expelled, Homeless, Landing on Feet)

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

**Key Lesson:** Land on your feet. Start from nothing. Build from there. **This is WHY the $5 entry point matters.**

---

### SINBAD UNCURLING HIS FIST (Movie Reference)

> "OH, and my fave fave? Sinbad. When he goes back to die, for his friend, because it PROVES HE DID THE RIGHT THING even when he wasn't going to. And won the Book of Peace, from Eris. What an amazing application, as he opens his hand, in resignation and acceptance of his fate, without knowing what would happen. Like the guy in William Wallace movie Braveheart that says he wants to BELIEVE like HE BELIEVES. Because I believe."
>
> "Instead of open hand, say uncurled fist for Sinbad, because he COULD HAVE fought, or ran, but he didn't."

**Key Lesson:** Do the right thing even when you're going to lose. Especially when you're going to lose. The uncurled fist — you COULD fight, you COULD run, but you don't.

---

### THE MEGAMIND LESSON

> **Megamind:** "There's a benefit to losing: You get to learn from your mistakes."
>
> **Roxanne Ritchi:** "The Megamind I knew would never have run from a fight, even when he knew he had absolutely no chance of winning. It was your best quality."

**And as Calvin Coolidge said:**

> "Nothing in the world can take the place of persistence. Talent will not; nothing is more common than unsuccessful men with talent. Genius will not; unrewarded genius is almost a proverb. Education will not; the world is full of educated derelicts. **Persistence and determination alone are omnipotent.**"

---

## 🔄 Design Evolution: 2003 → 2025

**The claim:** This isn't a startup idea from last year. I've been building this for over two decades.

### 2003 — Active Duty Prototypes

While serving as an Army Aviation officer, I was designing game components in SolidWorks during my off-duty hours. These are the original files:

![2003 Mold Illustration](/images/founder/2003-mold-illustration.jpg)
*Original mold illustration from 2003 — designed while on active duty.*

![2003 Septahex Design](/images/founder/2003-septahex-prototype.png)
*The "Septahex" modular hex design from 2003 — the ancestor of today's Hexel.*

**SolidWorks files from 2003:**
- Base12.SLDPRT (the foundation piece)
- Infantry.SLDPRT (game pieces)
- TreBase3.SLDPRT (tree base — yes, trees have been part of this from the beginning)
- Water.SLDPRT (water dynamics were always the vision)
- Game1.SLDASM (the complete assembly)

### 2025 — Modern Production

Twenty-two years later, the same vision — now in Fusion 360, with 1,200+ design files and 150+ innovations:

![Modern Parts Desk](/images/founder/parts-desk-2025.jpg)
*Parts desk, January 2026 — from SolidWorks to Fusion 360 to physical production.*

![Modern HexIsle Concepts](/images/founder/hexisle-concepts.jpg)
*Modern HexIsle concept art — the evolved vision.*

### The Evolution

| **2003 (Active Duty)** | **2025 (Now)** |
|------------------------|----------------|
| SolidWorks on a laptop | Fusion 360 with 1,200+ files |
| Mold illustrations | SLA 3D printing production |
| One designer (me) | Cooperative manufacturing network |
| A dream | A platform with 150+ innovations |

**The lesson:** I didn't pivot to this last year because it's trendy. I've been building toward this moment for 22 years. The SolidWorks files prove it.

---

## 👫 Us (Represented)

**The claim:** My wife Diana has believed in this from the beginning.

![Lego Representation](/images/founder/lego-representation.jpg)
*Me and Diana, as Lego minifigures — because we protect our family's privacy, but wanted you to see us together.*

**The lesson:** Behind every founder is someone who believes in them when nobody else does. Diana is mine.

---

## 🎯 The Founder's Creed

> "For my own part, I feel keenly Lloyd's line in Dumb and Dumber: **'I'm sick and tired of having to eke my way through life.'** But in forging a pathway to success, I must also in good conscience burn a permanent pathway into the jungle of life for any who dare; charting the pitfalls and resources on my treasure map."

> "**I don't know where I'm going, but I know what I'm looking for, and in time, I will find both.**"

> "I want to give hope to people who have very little or none at all. A chance that depends ON THEM for what they get... So that they do the right thing against all odds and it is REWARDED. Like the engineer that made the Death Star vulnerable on purpose. Like Schindler in Schindler's List. My heroes."

> "Join me. Let's make this bread. And change the world, for good."

---

## 📝 Favorite Quotes

- "Expected no, tried anyway."
- "Never despair at the immediacy of your circumstance."
- "Experience is an excellent and wonderful teacher, but he is a fool who will learn from no other teacher than experience."
- "What your hand finds to do, do it with your Might."
- "Help each other, help ourselves."
- "One tree becomes a forest."
- "Captains wanted. Oars welcome."
- "You don't have to win. You have to create the opening for someone else to win."
- "I will not ever give up. Ever."
- "A helicopter never flies straight—it's always too far in this direction and then too far in the opposite, always needing correction. But still skilled pilots arrive at LZ 4 hours later within 30 seconds of ETA."
- "I never hit another dog though."
- "4-90: All four windows down and going 90."
- "So I said a prayer and drove home anyway."
- "Land on your feet."
- "A roof with a tarp wall is still a roof."
- "Don't exploit other people, even when you have been exploited."
- "And for the record, I believe we have EVERY chance of winning."

---

## 📞 Press Inquiries

For press kit with high-resolution photos, contact: [Support@LianaBanyan.org](mailto:support@lianabanyan.org)

**Photos available in press kit:**
- ✅ Childhood photos (Tanzania, USA)
- ✅ Military service documentation
- ✅ Chess rating screenshots
- ✅ Family photos (children's faces may be redacted on request)
- ✅ Early design work
- ✅ Go-kart scar (persistence proof!)

---

*🏰 FOR THE KEEP! ⚔️*

*Full S.T.E.A.M. Ahead!*
$founder_anecdotes$
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  style = EXCLUDED.style,
  source_path = EXCLUDED.source_path,
  technical_summary = EXCLUDED.technical_summary,
  implementation_status = EXCLUDED.implementation_status,
  innovation_ids = EXCLUDED.innovation_ids,
  bishop_session = EXCLUDED.bishop_session,
  creation_context = EXCLUDED.creation_context,
  content_markdown = EXCLUDED.content_markdown,
  updated_at = now();

-- ─── 2. Founder Origin Story ────────────────────────────────────────────────
INSERT INTO public.cephas_content_registry (
  slug, title, category, subcategory, style,
  source_path, technical_summary, implementation_status,
  bishop_session, content_markdown
) VALUES (
  'origin-story',
  'Origin Story: 37 Years of Building',
  'founder',
  'biography',
  'pudding',
  'Cephas/cephas-hugo/content/founder/_index.md',
  'How 37 years of lived experience became Liana Banyan — from paper routes to patents, from SolidWorks in 2003 to Fusion 360 in 2025.',
  'live',
  'K148+',
$founder_origin$
# Origin Story: From Paper Routes to Patents

> *"I don't know where I'm going, but I know what I'm looking for, and in time, I will find both."*

## The Beginning (1975)

One of my earliest memories is of having a book read to me about a kingdom in the sea — underneath the water level but open to the sky. In the story, this was made possible by mangroves, or banyan, whose roots interlocked so tightly as to keep out the ocean. A magical kingdom held together by trees. Protected by interconnection.

That image never left.

## The Newspaper Route Principle (Montana, Age 13)

I learned what extraction feels like delivering newspapers in Montana when I was thirteen. Buy the paper for sixteen cents, sell it for twenty-five cents. The newspaper company set the terms. I had no leverage to negotiate.

**The principle:** Don't exploit other people, even when you have been exploited. This became the foundation of Cost+20%.

## Military Service (1989–)

Enlisted in the Army National Guard at 16 — the only way a preacher's kid was getting to college. Infantry 11B, then Aviation 15A. FAA Commercial Rotary Wing IFR rating. Learned that a helicopter never flies straight, but skilled pilots arrive within 30 seconds of ETA.

## The Pizza-for-Ice-Cream Insight (College)

As assistant manager at a pizza place across from Dairy Queen, I discovered that when you trade at cost instead of retail, everyone wins massively. $10 pizza costs $1 to make. $10 ice cream costs $1 to make. Trade at cost: both sides get 10x value. **This is the direct ancestor of Cost+20%.**

## The 22-Year Design Journey (2003 → 2025)

While serving as an Army Aviation officer, I was designing game components in SolidWorks during off-duty hours. Base12.SLDPRT. Infantry.SLDPRT. TreBase3.SLDPRT (trees have been part of this from the beginning). Twenty-two years later, the same vision — now in Fusion 360, with 1,200+ design files.

## Christmas Eve 1992 — Why $5 Matters

Expelled from college on Christmas Eve. Spent 3 days sleeping in a Jeep. Rented a room with a missing wall covered by a tarp for $175/month. Started from nothing. Built from there. **This is WHY the $5 entry point matters.**

## The Platform (2017 → Now)

Nine years of building. 37 years of thinking. 1,979 innovations. 10 provisional patent applications. ~1,511 formal claims. 127 Crown Jewels. 21 production systems. 16 initiatives. One mission: **Help each other help ourselves.**

---

*🏰 FOR THE KEEP!*
$founder_origin$
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  style = EXCLUDED.style,
  source_path = EXCLUDED.source_path,
  technical_summary = EXCLUDED.technical_summary,
  implementation_status = EXCLUDED.implementation_status,
  bishop_session = EXCLUDED.bishop_session,
  content_markdown = EXCLUDED.content_markdown,
  updated_at = now();

-- ─── 3. Founder Philosophy (Under the Hood) ────────────────────────────────
INSERT INTO public.cephas_content_registry (
  slug, title, category, subcategory, style,
  source_path, technical_summary, implementation_status,
  bishop_session, content_markdown
) VALUES (
  'founder-philosophy',
  'Founder Philosophy & Anecdotes',
  'under_the_hood',
  'philosophy',
  'pudding',
  'Asteroid-ProofVault/7Holy/KNOW THIS/A Considered Approach to Sustained Universal Economic Prosperity.md',
  'The principles that guide Liana Banyan, told through stories — from the Montana Newspaper Route Principle to Cost+20%, from the Pizza-for-Ice-Cream insight to the Bridge-Builder parable.',
  'live',
  'K148+',
$founder_philosophy$
# Founder Philosophy & Anecdotes

> *"Help each other help ourselves."*

## The Montana Newspaper Route Principle

The Founder's experience delivering newspapers in Montana revealed a fundamental truth about economic relationships. As a young person managing a newspaper route, the experience crystallized into a core principle: **only offer others what you would accept as a genuine benefit yourself.**

**Applied to Platform Design:**
- Nodes accept Cost+20% for guaranteed volume (predictable, fair margins enabling business planning)
- 50% capacity reservation ensures business autonomy without dependency
- Backup node payments from original contracts ensure reliability partners
- Full training and resources provided upfront (never held accountable for what hasn't been taught)

**Applied to Three-Gear Currency:**
- Would I accept Marks if I were from a weak-currency economy? Yes — because I get full purchasing power immediately
- Would I accept Joules if I were from a strong-currency economy? Yes — because my surplus is protected
- Would I accept Credits regardless of origin? Yes — because the system treats all participants fairly

## The Pizza-for-Ice-Cream Principle

When you trade at cost instead of retail, everyone wins massively. A $10 pizza costs ~$1 to make. A $10 ice cream costs ~$1 to make. Trade at cost: both sides get 10x value. No money changes hands — just margin.

**This is Cost+20%.** The margin is where the magic is. The platform keeps exactly 20% of cost. The creator keeps 83.3%. Always.

## The Bridge-Builder Principle

An old man builds a bridge back the way he came, even though he already crossed. When asked why: "Behind you, there is someone even younger that doesn't have your strength or experience yet, and I'm building this bridge for them."

**Applied to Patents:** Every patent is a bridge. Every innovation is a path others can follow.

## The Intramural Giants Principle

You don't have to win. You have to create the opening for someone else to win. Drop your shoulder, charge the giants, and while they're busy with you, your teammate walks six balls into the goal.

**Applied to Platform Architecture:** The Founder builds the infrastructure. Captains recruit the businesses. Members do the work. Everyone wins together.

## The Rooster Tail Principle

"I will fight you every single time I see you. And we both know I will lose. And the next time I see you, we will fight. And I will lose again. I will do that for as many times, and as long as it takes, until you stop. Because I will not ever give up. Ever."

**Applied to Persistence:** 25,399 chess games. 12,577 losses. Top 0.4% worldwide. You win by not quitting.

## The Helicopter Navigation Principle

A helicopter never flies straight — it's always too far in this direction and then too far in the opposite, always needing correction. But skilled pilots arrive at LZ 4 hours later within 30 seconds of ETA.

**Applied to Development:** Constant correction is not failure — it's how you reach the destination. Perfection isn't the goal; arrival is.

## The Christmas Eve Principle

Land on your feet. Start from nothing. Build from there. A roof with a tarp wall is still a roof. $175/month was half the money I made, but it was enough.

**Applied to $5 Membership:** Everyone starts somewhere. The entry point must be so low that ANYONE can begin.

## The Founder's Creed

> "For my own part, I feel keenly Lloyd's line in Dumb and Dumber: **'I'm sick and tired of having to eke my way through life.'** But in forging a pathway to success, I must also in good conscience burn a permanent pathway into the jungle of life for any who dare; charting the pitfalls and resources on my treasure map."

> "I want to give hope to people who have very little or none at all. A chance that depends ON THEM for what they get... So that they do the right thing against all odds and it is REWARDED."

---

*🏰 FOR THE KEEP!*
$founder_philosophy$
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  style = EXCLUDED.style,
  source_path = EXCLUDED.source_path,
  technical_summary = EXCLUDED.technical_summary,
  implementation_status = EXCLUDED.implementation_status,
  bishop_session = EXCLUDED.bishop_session,
  content_markdown = EXCLUDED.content_markdown,
  updated_at = now();

-- ─── 4. The Founder's Story (Under the Hood) ───────────────────────────────
INSERT INTO public.cephas_content_registry (
  slug, title, category, subcategory, style,
  source_path, technical_summary, implementation_status,
  bishop_session, content_markdown
) VALUES (
  'founder-story',
  'The Founder''s Story',
  'under_the_hood',
  'biography',
  'pudding',
  'Cephas/cephas-hugo/content/founder/_index.md',
  '37 years of thinking, 9 years of building, one mission — Help each other help ourselves. The complete biographical timeline.',
  'live',
  'K148+',
$founder_story$
# The Founder's Story

> *"37 years of thinking. 9 years of building. One mission."*

## By the Numbers

| Fact | Detail |
|------|--------|
| **Age** | 53 |
| **Military** | ARNG veteran — Infantry 11B + Aviation 15A |
| **Aviation** | FAA Commercial Rotary Wing IFR rating |
| **Family** | Father of eight |
| **IT Career** | 21 years development |
| **Chess** | Top 0.4% globally (2080s rating), 25,399 games |
| **Platform** | 37 years developing this system (1989–2026) |
| **Innovations** | 1,979 documented through 9 provisional applications |
| **Patent Claims** | ~1,511 across 10 provisional applications |
| **Crown Jewels** | 127 filed across provisionals |

## The Timeline

**1975** — A child hears a story about a kingdom in the sea, protected by interlocking banyan roots. The seed is planted.

**1983** — In sixth grade, designs floating modular cities for a school project. The local newspaper runs a headline: "Wave of the Future."

**1986** — Recruited into the Army National Guard at 16. The only way a preacher's kid is getting to college.

**1989** — Fort Benning, Basic Training. Infantry 11B. Learns to follow before leading.

**1992** — Expelled from college on Christmas Eve. Sleeps in a Jeep for 3 days. Rents a room with a tarp wall for $175/month. Lands on his feet.

**~1993** — Discovers the Pizza-for-Ice-Cream insight: trade at cost, everyone wins 10x. The direct ancestor of Cost+20%.

**2003** — While serving as an Army Aviation officer, begins designing game components in SolidWorks. Base12.SLDPRT. The ancestor of the Hexel.

**2004–2006** — Builds NextAddress.com, an early Google Maps integration. Learns that being first doesn't guarantee success.

**2017** — Begins building the Liana Banyan platform in earnest. Nine years of continuous development.

**2025** — Fusion 360 with 1,200+ design files. SLA 3D printing production. 150+ innovations documented.

**2026** — 1,979 innovations. 10 provisional patents. ~1,511 claims. 127 Crown Jewels. 21 production systems. 16 initiatives. The platform launches.

## The Mission

**Help each other help ourselves.**

Not charity. Not extraction. A system where doing the right thing is rewarded. Where the laborer is worthy of his hire. Where one tree becomes a forest.

---

*🏰 FOR THE KEEP!*
$founder_story$
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  style = EXCLUDED.style,
  source_path = EXCLUDED.source_path,
  technical_summary = EXCLUDED.technical_summary,
  implementation_status = EXCLUDED.implementation_status,
  bishop_session = EXCLUDED.bishop_session,
  content_markdown = EXCLUDED.content_markdown,
  updated_at = now();
