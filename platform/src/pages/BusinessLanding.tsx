/**
 * BusinessLanding — lianabanyan.biz entry experience
 * HR, positions, project management, task system, workshops.
 */
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Briefcase, Users, ListChecks, FolderKanban,
  Hammer, LayoutDashboard, ArrowRight
} from "lucide-react";

const FEATURES = [
  { icon: Briefcase, title: "Contract Positions", desc: "Post and manage positions within the Cost+20% model. Workers keep 83.3% of every dollar.", href: "/positions" },
  { icon: FolderKanban, title: "Project Management", desc: "Create projects, assign tasks, and track deliverables across your crew.", href: "/create-project" },
  { icon: ListChecks, title: "Task System", desc: "Kanban boards, task logs, and progress tracking for every workstation.", href: "/task-list" },
  { icon: Hammer, title: "Workshop", desc: "Build campaign materials, storefronts, and product listings from your workbench.", href: "/workshop" },
  { icon: Users, title: "Member Resources", desc: "Access training, documents, and collaboration tools for your team.", href: "/member-resources" },
] as const;

export default function BusinessLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
            <Briefcase className="w-4 h-4" />
            lianabanyan.biz
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-blue-400">Business</span> Portal
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
            HR, project management, and task systems — all running on Cost+20%.
            Creators keep 83.3% of every transaction. No extraction. No hidden fees.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white">
                Sign In / Join — $5/year
              </Button>
            </Link>
            <Link to="/browse">
              <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300">
                Browse Businesses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <Link key={f.href} to={f.href}>
              <Card className="bg-zinc-900/60 border-zinc-800 hover:border-blue-500/40 transition-all h-full cursor-pointer group">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-zinc-200 group-hover:text-blue-400 transition-colors">
                    <f.icon className="w-5 h-5 text-blue-400" />
                    {f.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-500">{f.desc}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-blue-400 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <ArrowRight className="w-3 h-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Cross-portal link */}
        <div className="text-center mt-12">
          <a
            href="https://lianabanyan.com"
            className="text-sm text-zinc-500 hover:text-blue-400 transition-colors"
          >
            ← Return to Marketplace (lianabanyan.com)
          </a>
        </div>
      </section>
    </div>
  );
}
