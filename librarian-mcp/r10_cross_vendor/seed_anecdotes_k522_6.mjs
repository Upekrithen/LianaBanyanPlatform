// K522.6 Phase A.5: Seed 10 numbered Hugo anecdotes into Supabase anecdotes table
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const vars = {};
readFileSync(join(__dirname, '../../Asteroid-ProofVault/LockBox/SDS.env'), 'utf8').split('\n').forEach(l => {
  const m = l.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.+)$/);
  if (m) vars[m[1]] = m[2];
});

const SUPABASE_URL = 'https://ruuxzilgmuwddcofqecc.supabase.co';
const KEY = vars['SUPABASE_SERVICE_ROLE_KEY'];
const FOUNDER_ID = '86380080-9d6e-41f3-b67f-27d39e6dc6f1';
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };

const anecdotes = [
  {
    title: 'The Paper Route',
    body_markdown: `**Montana, Age 13**

> "I learned what extraction feels like delivering newspapers in Montana when I was thirteen. Labor laws wouldn't let me wash dishes until I was sixteen, but I could 'own my own business.' So twice a week, after school until after dark, I walked five hours through freezing temperatures in jeans. Buy the paper for sixteen cents, sell it for twenty-five cents. The newspaper company set the terms. I had no leverage to negotiate."

**Key Lesson:** Don't exploit other people, even when you have been exploited.`,
    when_it_happened: '1986-01-01',
    where_it_happened: 'Montana',
  },
  {
    title: 'The Intramural Giants',
    body_markdown: `**College**

> "One of my favorite memories is from college when I represented my social club in intramural games, in a challenge to place softball-sized hollow rubber balls into an institutional sized garbage can placed in the middle of the gym; guarded by two much larger than me (6'2? 6'6?) athletes of local notoriety from competing social clubs.
>
> I, 5'6, feinted left — they both shifted left. I feinted right; again, they shifted to block me (grabbing and wrestling allowed). The crowd of my social club in the stands behind me, the clock running down, I had no other option: I dropped my right shoulder (You should have SEEN THE LOOKS OF OPEN-EYED ASTONISHMENT) and plowed INTO AND THROUGH THEM.
>
> Or, that's what I tried. They were pretty big, and the best I could do was NOT QUIT and climb them and tip us all forward, as they grabbed me and turned me around so that when all three of us slammed to the ground on our backs, I got the wind knocked out of me.
>
> But my TEAMMATE? In the time I kept the giants busy, he walked over and dropped 6 balls into the goal, 1 more than the other team.
>
> **And that's how we win.**"

**Key Lesson:** You don't have to win. You have to create the opening for someone else to win.`,
    when_it_happened: '1991-01-01',
    where_it_happened: 'College — Intramural Gym',
  },
  {
    title: 'The Roommate Suit',
    body_markdown: `**College**

> "When I was in college, at one point I had two roommates at one time. One, we'll call him R, was rich—his family had 10 homes and owned a lake resort. The other we'll call S, was poor like me.
>
> R could never understand why we had to scramble and wait and plan to go to the movies, and asked us 'why don't you just have more money saved up?'
>
> At one point, when I needed a suit and didn't have the money to get one, **S gave me one of the two that he owned.** R offered one of his 15 after S gave me the one.
>
> That sacrifice has stuck with me for the last 30 years and still makes me cry."

**Key Lesson:** A little generosity from someone with little means everything. This is why the $5 membership matters. This is why the $50 microloans matter.`,
    when_it_happened: '1992-01-01',
    where_it_happened: 'College',
  },
  {
    title: 'Pizza for Ice Cream',
    body_markdown: `**College**

> "I was the assistant manager at a pizza place across the parking lot from a Dairy Queen. I knew the cost of our pizzas was about 10% of what we charged. So I called Dairy Queen and asked if they would be interested in pizza for dinner in exchange for ice cream for dessert."

**The Math:**
- $10 retail pizza = ~$1 cost
- $10 retail ice cream = ~$1 cost
- Trade at cost: Both sides get 10x value

**Key Lesson:** When you trade at cost instead of retail, everyone wins massively. **This 2010 insight became the Localcy Currency Program in 2011, which became Cost+20%.** The economics are 15 years refined.`,
    when_it_happened: '1993-01-01',
    where_it_happened: 'College — Pizza Place',
  },
  {
    title: 'The USAA Lifeline',
    body_markdown: `**Throughout Adult Life**

> "I have been in so many circumstances that I needed a mini-loan. And I thank God for USAA, because they were generous with their checking account system, that when I had at least one dollar in it, I could go to the gas pump and fill up, in order to drive and pick up the kids from school, and USAA would pay it, and charge my account no fee if I paid it back within a day.
>
> I don't remember, but I don't think I ever got charged a fee, and I had no other options, they seriously saved my life.
>
> THANK YOU USAA. For the free baby carseats, and always making funds available the second you know it's on the way even before you get it, and the dispute system that saved us $800—as a complimentary credit that we seriously would have been in dire straits without—when that van rental company tried to double charge us.
>
> And for having that program where I took our rent and got a CD with you and used it as the basis of having a credit card when my credit was shot, and then used the credit card to buy the things we would normally pay cash so we could use the cash for the rent. It let me get to a better level, where I could then put my kids as authorized users on my credit card that I buy necessities with and pay off every time I get paid, so that they started life with 700+ credit ratings and rented their first apartment without a cosigner and money from their own job. For us, that is a success.
>
> **A little generosity, just a tiny little bit, made ALL the difference in my life, and my wife and children's lives.**"

**Key Lesson:** This is WHY Village Savings & Loans exists. This is WHY the $50 microloans matter. Not because $50 changes the world—but because $50 at the right moment changes *someone's* world.`,
    when_it_happened: null,
    where_it_happened: 'Adult Life — Various Locations',
  },
  {
    title: 'The Bridge Builder',
    body_markdown: `**Dad's Story**

> "My dad referenced a story of a young man hiking a harrowing trail who came to a difficult stream to cross, with an old man just emerging from swimming across to the other side, who then started building a bridge back the way he had just come.
>
> The young man jumped in and swam through the strong currents to the other side and told the Old man he didn't need any help and asked the old man if he was going the same direction to the same destination, and when the old man replied yes, the young man asked him 'then why are you bothering to build a bridge back the way you came? I'm already over here.'
>
> The old man replied: 'Yes, you are strong enough to make it on your own, for now. **But behind you, there is someone even younger that doesn't have your strength or experience yet, and I'm building this bridge for them.**'"

**Key Lesson:** I'm the old man now. And Liana Banyan is the bridge.`,
    when_it_happened: null,
    where_it_happened: "Dad's Story — Parable",
  },
  {
    title: 'The Kurt Ikard Confrontation',
    body_markdown: `**High School Freshman**

> "Faced with daily misery from a bully two feet taller, I told him:
>
> 'Until you stop, I will fight you every single time I see you. And we both know I will lose. And the next time I see you, we will fight. And I will lose again. And the next. And the next. I will do that for as many times, and as long as it takes, until you stop. Because I will not ever give up. Ever. One way, or another, you WILL stop.'
>
> That's when he stopped. Not because I could beat him—I clearly could not. But because he realized I would NEVER stop trying, and the effort wasn't worth it to him."

**Key Lesson:** Whatever your hand finds to do, do it with your might.`,
    when_it_happened: '1984-01-01',
    where_it_happened: 'High School',
  },
  {
    title: "The Golden Eagle's Head",
    body_markdown: `**High School Pep Band**

> "Suddenly two audience members from the opposing side ran across the court during a timeout and grabbed the Golden Eagles head off of our cheerleader mascot.
>
> Seeing this, I unclipped my saxophone and laid it down, then jumped over two rows down the stands, then to the floor, and ran across with the football team, and then crowd, behind me.
>
> They cancelled the game. We got our Eagle's head back."

**Key Lesson:** When something wrong happens, ACT. Don't wait for someone else. The crowd will follow if you lead.`,
    when_it_happened: '1985-01-01',
    where_it_happened: 'High School — Gymnasium',
  },
  {
    title: 'Pet Antibiotics',
    body_markdown: `**Adulthood**

> "If you have ever gone to the pet supply store to buy antibiotics for your dog because you can't afford to take your daughter to the doctor, then we have something in common.
>
> The only time I ever had medical coverage in my life was when I was active duty. Or free clinics, who took out a couple of my teeth, over the years, once the infection spread to the top of my mouth and throat so I had to take 12 ibuprofen a day to be able to breathe past it.
>
> **So I know the hustle it takes to stay alive and take care of our loved ones. And I want a better way, and I can't find one, so we'll just have to make it ourselves.**"

**Key Lesson:** This is why LifeLine Medications exists. This is why LB MSA exists. Because the hustle shouldn't be required just to breathe.`,
    when_it_happened: null,
    where_it_happened: 'Adulthood — Various',
  },
  {
    title: 'The Squad Car Mannequin',
    body_markdown: `**Military Police Encounter**

> "I was on base and needed directions. I saw a squad car parked at an intersection, so I pulled over, parked my car, and walked up to it.
>
> There was a mannequin in the driver's seat.
>
> An MP watching from a distance (hmm — why?) called out to me that it was a dummy, and then gave me the directions I needed.
>
> **People slowed down at that intersection even though no cop was there. The UNCERTAINTY of whether someone was watching created the behavior.**
>
> This is how the Haruchai system works. Banner (our AI moderation) is always watching. But is a human behind Banner right now? Or did they step away and the AI is running autonomously? You don't know. And that uncertainty is enough.
>
> It's not deception — it's resource multiplication. The POSSIBILITY of human oversight multiplies the effectiveness of AI monitoring without requiring 24/7 human staffing."

**Key Lesson:** The perception of watchfulness is often as effective as actual watchfulness. This is why the Haruchai (AI moderation) works — you never know if Banner is alone or if a human is behind the eyes.`,
    when_it_happened: null,
    where_it_happened: 'Military Base — MP Intersection',
  },
];

// Check which titles already exist
const existing = await fetch(
  `${SUPABASE_URL}/rest/v1/anecdotes?select=title&order=id`,
  { headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Accept': 'application/json' } }
).then(r => r.json());

const existingTitles = new Set(existing.map(r => r.title));
console.log('Existing anecdotes:', [...existingTitles].join(', '));

let inserted = 0;
let skipped = 0;

for (const a of anecdotes) {
  if (existingTitles.has(a.title)) {
    console.log(`  SKIP (exists): ${a.title}`);
    skipped++;
    continue;
  }

  const payload = {
    author_id: FOUNDER_ID,
    title: a.title,
    body_markdown: a.body_markdown,
    privacy_level: 'public',
    when_it_happened: a.when_it_happened,
    where_it_happened: a.where_it_happened,
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/anecdotes`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  if (Array.isArray(data) && data[0]) {
    console.log(`  INSERT OK id=${data[0].id}: ${a.title}`);
    inserted++;
  } else {
    console.error(`  INSERT FAILED: ${a.title}`, JSON.stringify(data).substring(0, 200));
  }
}

console.log(`\nDone: ${inserted} inserted, ${skipped} skipped.`);

// Final count
const finalCount = await fetch(
  `${SUPABASE_URL}/rest/v1/anecdotes?select=id,title&order=id`,
  { headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Accept': 'application/json' } }
).then(r => r.json());

console.log(`\nFinal anecdotes count: ${finalCount.length}`);
finalCount.forEach(r => console.log(`  ${r.id} | ${r.title}`));
