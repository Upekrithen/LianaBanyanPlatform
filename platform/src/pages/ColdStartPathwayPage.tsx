import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

/**
 * ColdStartPathwayPage — redirects pathway slugs to real production pages.
 * No more "staged for next session" stubs. The pages are LIVE.
 */

const PATHWAY_ROUTES: Record<string, string> = {
  food: "/mission-one",
  manufacturing: "/manufacturing",
  service: "/crew-call",
  "local-business": "/storefront-aggregation",
  guild: "/guilds",
  tribe: "/tribes",
  broadcast: "/subscriptions",
};

export default function ColdStartPathwayPage() {
  const { pathway = "" } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const target = PATHWAY_ROUTES[pathway] || "/cold-start";
    navigate(target, { replace: true });
  }, [pathway, navigate]);

  return null;
}
