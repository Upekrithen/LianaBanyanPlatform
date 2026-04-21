/**
 * BECOME CAPTAIN PAGE
 * ===================
 * Milestone 2: The Cold Start & Stewardship System
 *
 * Landing page for users to become a Captain for a specific initiative in their city.
 * URL: /become-captain/:initiativeId?city=Phoenix&state=AZ
 *
 * NAVAL RANK PROGRESSION:
 * - Captain: 1 ship (your own) - Local leader for ONE initiative in ONE city
 * - Commodore: 3+ ships - Leader of 3+ initiatives OR 1 initiative across 3+ cities
 * - Rear Admiral: Squadron - Regional coordinator (state-level)
 * - Vice Admiral: Fleet division - Multi-state coordinator
 * - Admiral: Full fleet - National coordinator
 * - Fleet Admiral / Crown: The public figure who sets national vision
 */

import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClaimCaptainForm } from "@/components/cold-start/ClaimDukedomForm";
import { ArrowLeft, Anchor, MapPin, Ship } from "lucide-react";

const INITIATIVE_NAMES: Record<string, string> = {
  lets_make_dinner: "Let's Make Dinner",
  lets_get_groceries: "Let's Get Groceries",
  lets_go_shopping: "Let's Go Shopping",
  household_concierge: 'Household Concierge',
  family_table: 'The Family Table',
  health_accords: 'Tatiana Schlossburg Health Accords',
  msa: 'MSA',
  defense_klaus: 'Defense Klaus',
  rally_group: 'Rally Group',
  vsl: 'VSL',
  lets_make_bread: "Let's Make Bread",
  harper_guild: 'Harper Guild',
  jukebox: 'JukeBox',
  didasko: 'Didasko',
  brass_tacks: 'Brass Tacks',
  international: 'International',
};

const BecomeCaptain: React.FC = () => {
  const { initiativeId } = useParams<{ initiativeId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const city = searchParams.get('city') || '';
  const state = searchParams.get('state') || '';
  const initiativeName = INITIATIVE_NAMES[initiativeId || ''] || initiativeId || 'Unknown Initiative';

  if (!city || !state) {
    return (
      <PortalPageLayout maxWidth="lg" xrayId="become-captain" className="flex items-center justify-center">
        <div className="text-center p-8">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Port Required</h1>
          <p className="text-muted-foreground mb-4">
            Please specify a city and state to become a Captain.
          </p>
          <Button onClick={() => navigate('/cold-start-dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cold Start Dashboard
          </Button>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout maxWidth="lg" xrayId="become-captain">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate(`/cold-start-dashboard?city=${city}&state=${state}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {city}, {state}
          </Button>

          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              <Ship className="w-3 h-3 mr-1 text-blue-500" />
              The 300: The Fleet
            </Badge>
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
              <Anchor className="w-8 h-8 text-blue-500" />
              Become a Captain
            </h1>
            <p className="text-lg text-muted-foreground">
              {initiativeName} • {city}, {state}
            </p>
          </div>
        </div>

        {/* Form */}
        <ClaimCaptainForm
          initiativeId={initiativeId || ''}
          initiativeName={initiativeName}
          city={city}
          state={state}
          onSuccess={() => {
            // Could navigate to a success page or dashboard
          }}
        />
      </div>
    </PortalPageLayout>
  );
};

export default BecomeCaptain;
