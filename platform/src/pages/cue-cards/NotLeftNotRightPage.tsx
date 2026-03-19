import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, ChevronRight, Shield, Anchor, HeartHandshake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotLeftNotRightPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-emerald-500/30">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium border border-emerald-500/20 mb-4">
            <Anchor className="w-4 h-4" />
            <span>Formal Invitation</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
            Not Left or Right. <span className="text-emerald-400">Forward.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto">
            Tired of being divided? Here's your formal invitation to BETTER.
          </p>
          <div className="mt-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl max-w-2xl mx-auto">
            <p className="text-slate-300 italic text-lg leading-relaxed">
              "One ship sails East,<br />
              And another West,<br />
              By the self-same winds that blow,<br />
              'Tis the set of the sails<br />
              And not the gales,<br />
              That tells the way we go."
            </p>
            <p className="text-emerald-400 text-sm mt-4 font-medium">— Ella Wheeler Wilcox</p>
          </div>
        </motion.div>
      </section>

      {/* Op-Ed Content */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto pb-24">
        <motion.article 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert prose-emerald lg:prose-lg max-w-none"
        >
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-12 shadow-xl">
            <p className="text-lg italic text-slate-400 mb-0">Op‑Ed — January 2026</p>
            
            <p className="mt-6">Something is broken in how we talk to each other.</p>
            <p>Every issue gets sorted into two boxes. Every solution gets labeled before it's understood. Every person gets assigned a team.</p>
            <p>And while we argue about which box things belong in, the actual problems keep getting worse.</p>
            
            <p>I spent 37 years developing this system. And I've watched people dismiss it — from both sides — because they think they know what box it belongs in.</p>
            <p>It doesn't belong in any box.</p>
            <p>It's not a liberal project. It's not a conservative project.</p>
            <p className="text-xl font-semibold text-white">It's infrastructure. And infrastructure doesn't have a political party.</p>

            <h3 className="text-2xl font-bold text-white mt-12 mb-6">What We Actually Built</h3>
            <p>Liana Banyan is a cooperative commerce platform where creators keep 83.3% of every transaction.</p>
            <p>That's it. That's the core.</p>
            <p>On a $500 sale, the creator receives $416.67. The platform takes Cost + 20%. The margin is fixed in the operating agreement — it literally cannot increase.</p>
            <p>Our commercial portals (<code>lianabanyan.com</code>, <code>.biz</code>, <code>.net</code>, and <code>the2ndsecond.com</code>) generate revenue. That revenue permanently funds charitable initiatives focused on food security, healthcare access, education, financial inclusion, crisis response, and intergenerational connection.</p>
            <p>Participation is distributed through verified contribution. Everyone who contributes earns a position and allocation in the system proportional to their work.</p>
            <p>Is that liberal? Is that conservative?</p>
            <p>It's neither. It's just... sensible.</p>

            <h3 className="text-2xl font-bold text-white mt-12 mb-6">Why People Keep Missing It</h3>
            <ul className="space-y-4 list-none pl-0">
              <li className="flex gap-3"><Shield className="w-6 h-6 text-emerald-500 shrink-0" /> <span>When I explain the cooperative participation model, some people hear "socialism" and tune out.</span></li>
              <li className="flex gap-3"><Shield className="w-6 h-6 text-emerald-500 shrink-0" /> <span>When I explain the fixed margins and business incubator, some people hear "capitalism" and tune out.</span></li>
              <li className="flex gap-3"><Shield className="w-6 h-6 text-emerald-500 shrink-0" /> <span>When I explain the charitable initiatives, some people hear "welfare" and tune out.</span></li>
              <li className="flex gap-3"><Shield className="w-6 h-6 text-emerald-500 shrink-0" /> <span>When I explain the individual participation and earned allocation, some people hear "libertarian fantasy" and tune out.</span></li>
            </ul>
            <p className="mt-6 font-medium text-emerald-300">Everyone's so ready to reject ideas from the "other side" that they can't see something that doesn't have a side.</p>

            <h3 className="text-2xl font-bold text-white mt-12 mb-6">The Actual Values</h3>
            <p>Here's what we actually believe:</p>
            <ul className="space-y-2">
              <li><strong>People should keep most of what they earn.</strong> On this platform, they keep 83.3%.</li>
              <li><strong>Charity should be sustainable.</strong> Our charitable initiatives are permanently funded through commerce, not donations.</li>
              <li><strong>Participation should be distributed.</strong> Everyone who contributes earns a stake.</li>
              <li><strong>Rules should be clear and fixed.</strong> The margin is locked. No bait‑and‑switch.</li>
              <li><strong>Opportunity should be accessible.</strong> $5/year gets you in as a member; everything else is earned through participation.</li>
              <li><strong>Competition is healthy.</strong> We compete on quality, not margin manipulation.</li>
              <li><strong>Community matters.</strong> Sixteen initiatives connect neighbors, families, and generations.</li>
              <li><strong>Individual achievement matters.</strong> Ruprecht — authority earned through demonstrated competence — is how you advance.</li>
            </ul>
            <p className="mt-6">Which party owns those values? Neither. Both. Does it matter?</p>

            <h3 className="text-2xl font-bold text-white mt-12 mb-6">The Fire Chief Principle</h3>
            <p>There's a story I keep coming back to.</p>
            <p>A fire chief fell from a three‑story ladder while carrying a victim. Barely conscious on the ground, his first words were:</p>
            <blockquote className="border-l-4 border-emerald-500 pl-4 italic text-xl">"I slipped. Is she okay?"</blockquote>
            <p>That's not a political position. That's character.</p>
            <p>Accept responsibility. Put others first. Build systems that help people instead of extracting from them.</p>
            <p>That's what this platform tries to do. Not because it's liberal or conservative. Because it's right.</p>

            <h3 className="text-2xl font-bold text-white mt-12 mb-6">The Sixteen Initiatives</h3>
            <p>Here’s what that looks like in practice:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
              <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800"><strong>1. Let's Make Dinner</strong> — Neighbors feeding neighbors</div>
              <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800"><strong>2. Let's Get Groceries</strong> — Volume purchasing power</div>
              <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800"><strong>3. Let's Go Shopping</strong> — Cooperative buying</div>
              <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800"><strong>4. Household Concierge</strong> — Stackable shared local services</div>
              <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800"><strong>5. The Family Table</strong> — Intergenerational connection</div>
              <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800"><strong>6. Health Accords</strong> — Affordable prescriptions</div>
              <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800"><strong>7. MSA</strong> — Medical savings accounts</div>
              <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800"><strong>8. Defense Klaus</strong> — Personal safety and legal defense</div>
              <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800"><strong>9. Rally Group</strong> — Crisis response everywhere</div>
              <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800"><strong>10. VSL</strong> — Voucher short loans & community finance</div>
              <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800"><strong>11. Let's Make Bread</strong> — Cooperative manufacturing</div>
              <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800"><strong>12. Harper Guild</strong> — HR, ethics, and truth-telling</div>
              <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800"><strong>13. JukeBox</strong> — Fair music licensing</div>
              <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800"><strong>14. Didasko</strong> — K‑12 curriculum and education</div>
              <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800"><strong>15. Power to the People</strong> — Political expedition</div>
              <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800"><strong>16. Brass Tacks</strong> — Manufacturing business</div>
            </div>

            <p>Some of these sound "progressive." Some sound "traditional." All of them are practical.</p>
            <p>Food security. Healthcare access. Financial inclusion. Intergenerational connection. Crisis response. Personal safety. Global cooperation.</p>
            <p>These aren't partisan issues. They're human issues.</p>
            <p>The point of these sixteen initiatives is not to express an ideology; it is to give ordinary people the tools that both sides claim to care about, without making access to those tools depend on which party happens to be in power.</p>
            <p>In practice, "power to the people" here is very literal. Economic power lives in an 83.3% payout and a non‑speculative credit system, not in a stock chart or token price. Governance power lives in The 300 — Captains, Commodores, Admirals, and Crowns sorted by what you contribute and how you show up, not by party registration. Service power lives in these sixteen concrete initiatives, funded by everyday commerce instead of election cycles or fundraising campaigns, so that food, medicine, legal defense, and community finance sit in community hands regardless of who is in office.</p>

            <h3 className="text-2xl font-bold text-white mt-12 mb-6">Who I Am</h3>
            <p>I'm a 52‑year‑old ARNG veteran (Infantry 11B and Aviation 15A). Helicopter pilot. Father of eight. I spent 21 years in IT development.</p>
            <p>I voted for candidates from both parties. I've been frustrated with both parties. I've watched both parties promise things and deliver gridlock.</p>
            <p>I stopped waiting for politics to fix things.</p>
            <p>I built something instead.</p>
            <p>Not because I think I have all the answers. Because I think the answers aren't going to come from the boxes we've put ourselves in.</p>
            <p>They're going to come from people who are willing to step forward — not left, not right — and build something that actually works.</p>

            <div className="mt-12 p-8 bg-emerald-950/30 border border-emerald-500/20 rounded-xl">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <HeartHandshake className="w-8 h-8 text-emerald-400" />
                The Invitation
              </h3>
              <p>THE 300 — our founding members — aren't sorted by political affiliation.</p>
              <p>They're sorted by willingness to try something different. Leadership is earned through the Ruprecht Principle — authority through demonstrated competence.</p>
              <p>If you're tired of being divided, this is your invitation.</p>
              <p>Not to agree on everything. We won't.</p>
              <p>But to build something together that helps people — regardless of which box they've been sorted into.</p>
              <p className="text-xl font-bold text-emerald-400 mt-6">Help each other help ourselves.</p>
              <p className="text-xl font-bold text-white">Not left or right. Forward.</p>
              
              <div className="mt-8 pt-8 border-t border-emerald-500/20">
                <p className="font-semibold text-white mb-0">Jonathan Jones</p>
                <p className="text-sm text-slate-400 mb-0">Founder, Liana Banyan Corporation</p>
                <p className="text-sm text-slate-400">Founder@LianaBanyan.com | 406‑578‑1232</p>
              </div>

              <div className="mt-8 pt-8 border-t border-emerald-500/20 text-center">
                <p className="text-slate-400 italic">"But you can still argue about it in Political Expedition: and choose the set of your sails regardless of where the wind blows."</p>
              </div>
            </div>
          </div>
        </motion.article>

        {/* Call to Action - Little Red Hen */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="my-16"
        >
          <div className="bg-gradient-to-br from-red-950/40 to-orange-900/20 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
            <h3 className="text-3xl font-bold text-white mb-4">See How It Works</h3>
            <p className="text-lg text-red-200/80 mb-8 max-w-xl mx-auto">
              "Who will help me bake the bread? Who gets to eat it?" Experience the Little Red Hen flipbook to understand the 83.3% Creator Share and Cost+20% Platform Margin.
            </p>
            <button 
              onClick={() => navigate('/red-carpet')}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
            >
              <BookOpen className="w-6 h-6" />
              Open the Little Red Hen Flipbook
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </motion.div>

        {/* HexIsle Academic Paper Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 pt-16 border-t border-slate-800"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">The Physical Engine</h2>
            <p className="text-xl text-slate-400">
              This isn't just software. It's a physical, mechanical system designed to teach the economics and governance rules of the platform.
            </p>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-700 p-8 prose prose-invert prose-emerald max-w-none">
            <h2 className="text-white border-b border-slate-700 pb-4">It's Not Ambitious — It's Reality</h2>
            <h3 className="text-emerald-400 mt-2">HexIsle, Tereno, and the Physical Engine Beneath a Cooperative Economy</h3>
            
            <p>For most people, a "big idea" is an app, a feature, or a pitch deck. For me, it has been a 37-year engineering project: a single, coherent system that turns gravity, plastic, and water into a programmable surface—and then uses that surface to teach the economics, governance, and cooperation rules of an entirely different kind of platform.</p>
            
            <p>This paper sits on top of that work. It is not a vision document. It is the technical spine of a system that already exists in lithographic detail: twist-lock couplers, compliant seals, Tesla-valve rotors, escapement geometries, torque margins, and manufacturing tolerances have all been designed, checked, and folded into provisional patent filings.</p>

            <h4>From abstract constraints to physical rules</h4>
            <p>HexIsle and the Tereno Hydraulic Gaming System were built to answer a simple question: what if the rules of an economy were not just sentences in a terms-of-service, but physical constraints you could see, touch, and feel?</p>
            
            <p>Three nested reservoirs (X, Y, Z) and a central water-wheel escapement form a closed hydraulic circuit that uses water purely as a working fluid to drive and regulate mechanical waves, currents, and tides across 420 modular Hexels—no pumps, motors, or external power required.</p>
            
            <p>Each tile contains a Golden Lotus mechanism that converts alternating hydraulic flow into unidirectional rotation with a 6x torque safety margin.</p>
            
            <p>Root geometries and Biome sockets enforce what textbooks struggle to convey: industry requires infrastructure, crops require the right conditions, and illegal moves simply don't fit.</p>
            
            <p className="font-bold text-white bg-slate-800/50 p-4 rounded-lg border-l-4 border-emerald-500 my-6">
              The result is a table that behaves like a living system: when you stop the clock, you literally stop the ocean.
            </p>

            <h4>Integrated with the rest of the platform, by design</h4>
            <p>HexIsle is not a side project. It is one of the physical engines beneath the Liana Banyan platform described in the Comprehensive Provisional Patent Application and the accompanying series of academic papers.</p>
            
            <p>The Credits / Marks / Joules architecture uses closed-loop, non-security service credits to keep value with the people doing the work, following the five-principle framework in Platform Service Credits as Non-Securities.</p>
            
            <p>The IP Load Balancing and Margin-Sacrifice Mutual Credit mechanisms govern how ideas and revenue move across initiatives so that derivatives feed their sources rather than extract from them.</p>
            
            <p>The Ghost / Material / HexIsle realms and the 300 Framework tie game states, cooperative positions, and governance roles together so that what happens on the table can matter in the wider ecosystem without ever turning play into a security or a bet.</p>
            
            <p>In other words, HexIsle is a tangible interface for a cooperative economy that has already been legally and architecturally mapped.</p>

            <h4>Why this paper matters</h4>
            <p>This particular document focuses on one narrow question: can a self-sustaining, gravity-driven hydraulic oscillation system, with 420 independently actuated tiles, operate safely, predictably, and manufacturably in a home environment?</p>
            
            <p>The answer, shown by the calculations that follow, is yes:</p>
            <ul>
              <li>A 3-foot head height yields ~1.30 psi operating pressure, which in turn produces ~3.0 in-lb net torque per Hexel versus ~0.5 in-lb required (6x safety margin).</li>
              <li>Pressure and volume analysis shows stable operation with ~36:1 volume overhead and ~95% pressure retention at the furthest tile.</li>
              <li>A total system weight of ~320 lbs, flat-pack shipping geometry, and standard 5-gallon jug integration make the system practical for consumer use and distributed manufacturing.</li>
            </ul>
            
            <p>This is why the title is not hyperbole. The rest of this paper does the unglamorous work: deriving the pressure, torque, oscillation, and manufacturing constraints that make HexIsle real.</p>
            
            <div className="mt-8 pt-8 border-t border-slate-700">
              <button 
                onClick={() => navigate('/hexisle')}
                className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-2"
              >
                Explore HexIsle Platform <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default NotLeftNotRightPage;
