// COUNSEL-GATED: Do not route live until S-5 cleared.
// Held draft: DRAFT_HELD_HOW_YOU_HELP_YOUR_PEOPLE_SWEET16_BP071.md
// Canon: pearl_c075f24f (influence-not-profit) | canon_sponsor_influence_not_profit_sweet_16_bp071.eblet.md
// Pending: (1) counsel clearance of patent-sponsorship Howey posture and
//          (2) structural rebuild confirmed matching influence-not-profit model.

const FEATURE_HOW_YOU_HELP = import.meta.env.VITE_FEATURE_HOW_YOU_HELP === "true";

export default function HowYouHelpPage() {
  if (!FEATURE_HOW_YOU_HELP) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-12 text-foreground">
      {/* Header */}
      <header className="space-y-4">
        <h1 className="text-4xl font-bold leading-tight">How You Help Your People</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          There&rsquo;s a question worth sitting with.
        </p>
        <p className="text-lg leading-relaxed">
          Not &ldquo;what can I get?&rdquo; &mdash; you&rsquo;ve heard that pitch a thousand times.
          The question is simpler and older than that:
        </p>
        <p className="text-2xl font-semibold">
          How can I help a lot of people?
        </p>
        <p className="leading-relaxed">
          If you&rsquo;ve ever asked it &mdash; really asked it, not as a slogan but as a weight you
          carry &mdash; this page is for you.
        </p>
      </header>

      {/* What a Founding Sponsor Does */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">What a Founding Sponsor Does</h2>
        <p className="leading-relaxed">
          When you become a Founding Sponsor of the Liana Banyan cooperative, you make a
          $5,000 irrevocable donation through Upekrithen, LLC into the cooperative commons.
        </p>
        <p className="leading-relaxed">
          That&rsquo;s the full picture of what moves: five thousand dollars, given away, permanently.
          It does not come back to you as money.
        </p>
        <p className="leading-relaxed">What comes back to you is something more durable.</p>
        <p className="leading-relaxed">
          <strong>Influence.</strong> The capacity to direct where that support lands &mdash; which of
          the Sweet Sixteen cooperative initiatives your contribution helps bring forward. Let&rsquo;s Make
          Dinner. Let&rsquo;s Get Groceries. Harper Guild. Vouch Short Loans. The Family Table. The
          Tatiana Schlossburg Health Accords. Sixteen programs, each one built around a real question real
          families ask: <em>Can we eat? Can we stay housed? Can we get a little help without being made
          to feel small?</em>
        </p>
        <p className="leading-relaxed">
          You don&rsquo;t vote on the Founder&rsquo;s vision. You help choose how the commons is fed
          &mdash; which table gets set first, which neighborhood gets the first pod, which community gets
          the tool that makes their life a little less hard.
        </p>
        <p className="leading-relaxed font-medium">That&rsquo;s the influence. It belongs to you.</p>
      </section>

      {/* What You Receive */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">What You Receive</h2>
        <p className="leading-relaxed">
          You receive three things &mdash; none of them money, all of them real:
        </p>
        <div className="space-y-3 pl-4 border-l-2 border-muted">
          <p className="leading-relaxed">
            <strong>Recognition as a Founding Sponsor.</strong> The cooperative publicly acknowledges
            you as part of the founding class, the people who backed this before it was easy to back it.
            That record is permanent.
          </p>
          <p className="leading-relaxed">
            <strong>A Founding Medallion.</strong> A provenance receipt &mdash; a durable artifact that
            says: <em>this person was here at the beginning; this person helped.</em> Not a tradeable
            instrument. A record. Your name in the foundation.
          </p>
          <p className="leading-relaxed">
            <strong>A perpetual non-exclusive license</strong> to the cooperative&rsquo;s tools for
            your own use &mdash; access to the platform the community is building, in recognition of your
            role in building it.
          </p>
        </div>
        <p className="leading-relaxed">
          And the thing that isn&rsquo;t on a list: the knowledge that the money you gave went straight
          to the table. No extraction layer. No management fees compounding in the middle. Straight to the
          work.
        </p>
      </section>

      {/* Where the Money Goes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Where the Money Goes</h2>
        <p className="leading-relaxed">
          Your donation funds the Sweet Sixteen &mdash; the sixteen cooperative initiatives that are the
          whole reason this exists.
        </p>
        <ul className="space-y-1 leading-relaxed text-muted-foreground">
          <li>Let&rsquo;s Make Dinner so neighbors don&rsquo;t eat alone.</li>
          <li>Let&rsquo;s Get Groceries so a car doesn&rsquo;t determine what you can afford.</li>
          <li>Harper Guild so ethics and accountability have a home.</li>
          <li>Vouch Short Loans so a broken fridge doesn&rsquo;t become a financial catastrophe.</li>
          <li>The Tatiana Schlossburg Health Accords so you understand what the doctor just told you.</li>
          <li>Defense Klaus &mdash; &ldquo;for someone you love&rdquo; &mdash; so a family&rsquo;s hard year doesn&rsquo;t also become their worst year.</li>
          <li>Didasko so learning doesn&rsquo;t stop when school does.</li>
          <li>Power to the People so civic life is something you can actually reach.</li>
        </ul>
        <p className="leading-relaxed">
          Sixteen programs. One cooperative. Money going toward people &mdash; your neighbors, your
          people, the ones you&rsquo;d help if you could just figure out how to reach them.
        </p>
        <p className="leading-relaxed font-medium">Now you can reach them.</p>
      </section>

      {/* The Frame That Matters */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">The Frame That Matters</h2>
        <p className="leading-relaxed">
          This is not philanthropy at arm&rsquo;s length. It&rsquo;s not writing a check to an
          institution you&rsquo;ll never see again. It&rsquo;s directing help toward people you choose,
          through tools built by a community that has agreed to be accountable to each other.
        </p>
        <p className="leading-relaxed">
          The cooperative runs on a simple principle: more of us is better. A node that shares what it
          knows helps every node near it. A sponsor who directs support toward their community helps
          everyone in that community &mdash; and the next community, and the next.
        </p>
        <p className="leading-relaxed font-medium">You give once. The help compounds.</p>
      </section>

      {/* Who This Is For */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Who This Is For</h2>
        <p className="leading-relaxed">
          This is for the person who has a little and wants to do something with it that lasts.
        </p>
        <p className="leading-relaxed">
          It is for the local business owner who wants her neighborhood to stay a neighborhood. It is for
          the professional who knows his industry is leaving people behind and wants to put some of his
          good fortune to work. It is for the community organizer who has seen a hundred grant cycles come
          and go and wants to back something that belongs to the people it serves.
        </p>
        <p className="leading-relaxed">
          It is not for the person looking for a financial return. There is none here. The return is that
          people get helped.
        </p>
        <p className="leading-relaxed">
          If you want to know that your money went toward feeding someone, toward keeping someone housed,
          toward helping a parent understand their child&rsquo;s diagnosis &mdash; this is the right door.
        </p>
      </section>

      {/* How It Works */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">How It Works</h2>
        <ol className="space-y-3 list-decimal list-inside leading-relaxed">
          <li>
            You make a $5,000 irrevocable donation via Upekrithen, LLC &mdash; the
            cooperative&rsquo;s IP-holding vehicle &mdash; into the Liana Banyan commons.
          </li>
          <li>
            You indicate your area of influence: which Sweet Sixteen initiatives matter most to the
            people you&rsquo;re trying to reach.
          </li>
          <li>
            You receive your Founding Medallion and recognition in the founding-class record.
          </li>
          <li>The money goes to work in the cooperative&rsquo;s sixteen programs.</li>
        </ol>
        <p className="leading-relaxed">
          That&rsquo;s it. No ongoing obligation. No management decisions to make. You gave, you
          directed, you&rsquo;re recognized, the work continues.
        </p>
      </section>

      {/* Closing */}
      <footer className="border-t pt-8 space-y-3 text-muted-foreground italic">
        <p>
          <em>
            How you help your people: you back the table. You show up before anyone asks you to.
            You put your name on it.
          </em>
        </p>
        <p><em>That&rsquo;s what Founding Sponsors do.</em></p>
      </footer>

      {/* HELD — inquiry form placeholder */}
      {/* [HELD — Founding Sponsor inquiry form / contact — to be wired after counsel clearance] */}
    </div>
  );
}
