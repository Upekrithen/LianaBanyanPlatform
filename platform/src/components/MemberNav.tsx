/**
 * MemberNav - Member-conditional nav enhancement (NOT a content gate).
 *
 * Checks Supabase for a mnemosynec_members row for the authenticated user.
 * If a row is found: renders additional nav items (HEOHO, Battery Dispatch, My IP Ledger).
 * If no row is found: renders nothing.
 *
 * ALL content pages remain accessible to all users regardless of membership.
 * This component controls only the nav surface enhancement.
 */

import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MemberNavProps {
  /** Optional className applied to the wrapper element. */
  className?: string;
}

interface MnemosynecMemberRow {
  id: string;
  user_id: string;
  [key: string]: unknown;
}

async function fetchMemberRow(userId: string): Promise<MnemosynecMemberRow | null> {
  // supabase.from cast to any because mnemosynec_members is not yet in the
  // generated types file. If the table does not exist the query returns an
  // error which we treat as "no membership row" - safe fallback, no gate.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("mnemosynec_members")
    .select("id, user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    // Table absent or permission denied - treat as not a member (no gate).
    return null;
  }
  return data ?? null;
}

const MEMBER_NAV_ITEMS = [
  { title: "HEOHO", url: "/heoho" },
  { title: "Battery Dispatch", url: "/battery-dispatch" },
  { title: "My IP Ledger", url: "/dashboard/ip-ledger" },
] as const;

export function MemberNav({ className }: MemberNavProps) {
  const { user } = useAuth();

  const { data: memberRow } = useQuery({
    queryKey: ["mnemosynec_member_row", user?.id ?? ""],
    queryFn: () => (user ? fetchMemberRow(user.id) : Promise.resolve(null)),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // No user or no membership row: render nothing (no gate, just no extra nav).
  if (!user || !memberRow) {
    return null;
  }

  return (
    <nav
      className={className}
      aria-label="Member navigation"
    >
      {MEMBER_NAV_ITEMS.map((item) => (
        <NavLink
          key={item.url}
          to={item.url}
          className={({ isActive }) =>
            isActive
              ? "member-nav-item member-nav-item--active"
              : "member-nav-item"
          }
        >
          {item.title}
        </NavLink>
      ))}
    </nav>
  );
}

export default MemberNav;
