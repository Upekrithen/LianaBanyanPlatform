# Pudding #30: Twenty-Five Dashboards, One Component
## How a Cooperative Builds Software Differently

---

### At a Glance (~50 words)
Liana Banyan has 25 member roles — Captain, Steward, Chef, Photographer, Driver, Teacher, and 19 more. Each role needs its own dashboard. Most platforms would build 25 separate pages. We built one component that configures itself from a single definition file. That's cooperative engineering.

---

### More Info (~300 words)

When you join Liana Banyan, you don't pick one job. You might be a Chef who also drives for Local Wheels and teaches Spanish through Cooperative Classroom. Three roles, three sets of earnings, three performance metrics, three dashboards.

In a venture-backed startup, each role would get its own team, its own codebase, its own timeline. The Chef dashboard ships in Q2. The Driver dashboard ships in Q3. The Teacher dashboard? Maybe next year, if the metrics look good.

We don't have that luxury — or that waste. The cooperative's development team is four AI agents and one human. So instead of building 25 dashboards, we built one: the RoleDashboardTemplate.

It works like this. Every role in the platform is defined in a single configuration file: its name, its icon, its accent color, its earning rules, its performance metrics, and the database tables it queries. When a member opens their Captain dashboard, the template reads the Captain configuration and renders the right charts, the right numbers, the right actions. When they switch to their Chef view, the same template reads the Chef configuration and renders differently.

One component. Twenty-five dashboards. Zero duplication.

This isn't clever engineering for its own sake. It's a direct consequence of cooperative economics. When every transaction runs at Cost+20% and the creator keeps 83.3%, there's no margin for bloated engineering teams. The platform has to be efficient because the model demands it. The constraint produces better architecture — not because we chose minimalism, but because waste would violate the economics.

Every role gets a dashboard. Every dashboard stays current. And nobody waited until next year.

---

### Full Detail

The RoleDashboardTemplate is a case study in what happens when economic constraints force architectural decisions. Most of the software industry treats "build it fast" and "build it right" as opposing goals. In cooperative engineering, they're the same thing — because the economic model won't tolerate the alternative.

**The problem: 25 roles, each with unique data**

Liana Banyan isn't a marketplace with buyers and sellers. It's a cooperative with {{innovationCount}} innovations across food, manufacturing, services, housing, governance, and entertainment. Members wear multiple hats. A single member might earn Credits as a Chef, accumulate Marks through Steward work, and track Joules from Pioneer activity — all in the same week.

Each role has different:
- **Earning rules**: Chefs earn per order. Captains earn from territory volume. Photographers earn per bounty.
- **Performance metrics**: ADAPT scores (Availability, Dependability, Accuracy, Professionalism, Timeliness) apply differently by role.
- **Action panels**: A Captain needs pipeline management. A Teacher needs class scheduling. A Driver needs route optimization.
- **Query tables**: Different Supabase tables, different joins, different filters.

In a traditional architecture, this produces 25 page components, each with its own data fetching, its own layout, its own maintenance burden. When the platform ships a design update, 25 pages need to change. When a new role is added, a developer builds page #26 from scratch.

**The solution: configuration over code**

The RoleDashboardTemplate takes a different approach. Every role is defined as a configuration object:

```
{
  key: "captain",
  label: "Captain",
  icon: Anchor,
  accentColor: "blue-600",
  earningRules: { source: "territory_volume", split: 0.833 },
  queryTables: ["storefronts", "menu_orders", "captain_territories"],
  metrics: ["revenue", "fulfillment_rate", "territory_coverage"],
  actions: ["manage_pipeline", "view_territory", "photo_coverage"]
}
```

The template component reads this object and renders the appropriate dashboard. Cards, charts, action buttons, and data queries are all driven by the configuration. Adding a new role means adding a new object to the definitions file — not building a new page.

**Why this matters for cooperatives**

Venture-backed platforms can afford to build 25 dashboards because they have 25 engineers and a $10M runway. They can also afford to maintain 25 dashboards — until they can't, at which point they raise another round.

Cooperative platforms run on Cost+20%. Every dollar of engineering overhead comes out of the margin that keeps membership at $5/year and creator payouts at 83.3%. If the codebase bloats, either the membership price goes up or the creator payout goes down. Neither is acceptable.

The RoleDashboardTemplate isn't just efficient software. It's economic infrastructure. It's the reason we can support 25 roles without 25 engineers. It's the reason a new role can launch in hours instead of sprints. It's the reason the platform can grow without the engineering cost growing proportionally.

**The broader principle: constraint as architecture**

Every architectural decision in the platform traces back to one question: does this honor the Cost+20% model? If a feature requires a dedicated team to maintain, it fails the test. If a component can only serve one purpose, it fails the test. If adding capability requires proportional engineering cost, it fails the test.

The RoleDashboardTemplate passes the test. Twenty-five dashboards. One component. One definition file. And when role #26 arrives, the definition file gets one more object.

That's what cooperative engineering looks like. Not because we're idealists, but because the economics demand it.

---

*Pudding #30 — Bishop B058*
*SEC-safe. Stats use {{variableName}} template syntax.*
*Content Pipeline stage: ARTICLE*
*FOR THE KEEP!*
