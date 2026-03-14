/**
 * San Antonio Landing — cold-start landing for SATX
 * Route: /sanantonio
 */

import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SanAntonioLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" data-xray-id="sa-landing-page">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Hero */}
        <section className="text-center mb-12" data-xray-id="sa-landing-hero">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            San Antonio, let's help each other eat and earn.
          </h1>
          <p className="text-lg text-slate-600 mb-6 max-w-xl mx-auto">
            Join a 12-person Crew, back one neighbor's offer for about $20, and end the month with your own first customer.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/treasure-map"
              className="inline-flex items-center justify-center rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 transition-colors"
            >
              Start the Treasure Map
            </Link>
            <Link
              to="/crew?focus=dinner"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              See active Crews in San Antonio
            </Link>
          </div>
        </section>

        {/* Three path tiles */}
        <section className="space-y-6 mb-12">
          <Card>
            <CardHeader className="pb-2">
              <span className="text-2xl">🍽️</span>
              <h2 className="text-xl font-bold text-slate-900">Let's Make Dinner — Neighbor Dinners</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-600 text-sm leading-relaxed">
                Pre-order a family-style meal from a home cook in your neighborhood. Each cook joins a 12-person Crew, lists one small dinner ($15–$20), backs one other member's meal, and delivers within 4 weeks.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/crew/new?focus=dinner"
                  className="text-green-600 font-medium text-sm hover:underline"
                >
                  I want to cook or host dinners →
                </Link>
                <span className="text-slate-400">|</span>
                <Link
                  to="/crew?focus=dinner"
                  className="text-slate-600 text-sm hover:underline"
                >
                  I just want to buy dinners →
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-2xl">🛒</span>
              <h2 className="text-xl font-bold text-slate-900">Let's Get Groceries — Errands into Income</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-600 text-sm leading-relaxed">
                Have a car or a good walking route? Join a grocery Crew that keeps our dinner Crews stocked. Each member takes short routes, shares tips, and backs one other member's offer.
              </p>
              <Link
                to="/crew/new?focus=grocery"
                className="text-green-600 font-medium text-sm hover:underline"
              >
                I want to run grocery routes →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-2xl">🎲</span>
              <h2 className="text-xl font-bold text-slate-900">Build Something: HexIsle & Projects</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-600 text-sm leading-relaxed">
                Want to make more than meals? Back and build real products like HexIsle—a tabletop game with transparent costs and a public build journal—and learn how to launch your own listing.
              </p>
              <Link
                to="/hexisle"
                className="text-green-600 font-medium text-sm hover:underline"
              >
                See HexIsle Founding Run →
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* How it works */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4">How it works in San Antonio</h2>
          <ol className="space-y-4 list-none">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center">1</span>
              <div>
                <strong className="text-slate-900">Take the Treasure Map</strong>
                <p className="text-slate-600 text-sm mt-1">
                  In about 5 minutes we'll ask about your time, tools, and comfort level, then suggest 1–3 starting plays.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center">2</span>
              <div>
                <strong className="text-slate-900">Join or start a Crew</strong>
                <p className="text-slate-600 text-sm mt-1">
                  Crews are 12 people in San Antonio. Each lists one small offer ($15–$20), backs one other member, and has 4 weeks to complete their first run.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center">3</span>
              <div>
                <strong className="text-slate-900">Complete your first run</strong>
                <p className="text-slate-600 text-sm mt-1">
                  When your Crew finishes, you'll have at least one real customer, a story page you can share, and a clear next step.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* Why San Antonio first */}
        <section className="mb-12 p-4 rounded-xl bg-slate-100/80">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Why San Antonio first?</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Joint Base San Antonio, working-class families on the West Side, and home cooks all over
            the city already know how to make a little stretch a long way. Let's Make Dinner and
            Let's Get Groceries are designed so that the same $15–$20 you might spend on a single
            corporate meal can instead become a neighbor's first sale — and a full dinner for more
            than one person.
          </p>
        </section>

        {/* Trust & compliance */}
        <section className="mb-12 space-y-2 text-sm text-slate-600">
          <p>• Texas cottage-food compliant; we follow the state's list of allowed foods and labeling rules.</p>
          <p>• This is not an investment. You're backing real products and services from real people.</p>
          <p>• Transparent 20% platform margin funds charitable initiatives and keeps Liana Banyan running.</p>
        </section>

        {/* Meal comparison table */}
        <section className="overflow-x-auto" data-xray-id="sa-meal-comparison">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Meal comparison</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>$/meal</TableHead>
                <TableHead>Who cooks</TableHead>
                <TableHead>Local?</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>FitFoodieSA</TableCell>
                <TableCell>$8–12</TableCell>
                <TableCell>Local SATX kitchen</TableCell>
                <TableCell>✅</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>210Fit Prep</TableCell>
                <TableCell>~$8–12</TableCell>
                <TableCell>Local SATX kitchen</TableCell>
                <TableCell>✅</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>ProMeals</TableCell>
                <TableCell>$8.99–10.99</TableCell>
                <TableCell>Houston kitchen</TableCell>
                <TableCell>❌</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Snap Kitchen</TableCell>
                <TableCell>$10–14</TableCell>
                <TableCell>Multi-city brand</TableCell>
                <TableCell>❌</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Factor</TableCell>
                <TableCell>$13–16</TableCell>
                <TableCell>National brand</TableCell>
                <TableCell>❌</TableCell>
              </TableRow>
              <TableRow className="bg-green-50 font-semibold">
                <TableCell>Let's Make Dinner</TableCell>
                <TableCell>$4–10/person</TableCell>
                <TableCell>Your neighbor</TableCell>
                <TableCell>✅✅</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>
      </div>
    </div>
  );
}
