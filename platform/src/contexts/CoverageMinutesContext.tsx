/**
 * COVERAGE MINUTES CONTEXT PROVIDER
 * ===================================
 * Spec: MUFFLED_RULE_AND_PHASE_MIMICTRUNKS.md, Sections 1, 2
 * Ticket: B-009
 *
 * Manages Coverage Minutes state across the application:
 *   - Current balance, earned, spent, donated, received
 *   - Earning from reading/listening
 *   - Spending on speaking/publishing
 *   - Donation flow (member-to-member)
 *   - Accumulation level tracking
 *   - Reading speed tier
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import {
  type CoverageMinuteAccount,
  type CoverageMinuteTransaction,
  type CoverageMinuteDonation,
  type DonationRecordView,
  type ReadingProgress,
  type CoverageContentType,
  type ReadingSpeedTier,
  createAccount,
  calculateBalance,
  roundToIncrement,
  calculateReadingEarnings,
  canSpeak,
  canDonate,
  getAccumulationLevel,
  calculatePublishingCost,
  ACCUMULATION_INCREMENT,
  MAX_SESSION_BROADCAST,
  DONATION_RECORD_VIEW_FEE,
} from "@/lib/discourse/coverageMinutes";

// ── Context Types ──────────────────────────────────────────────────────────

interface CoverageMinutesState {
  account: CoverageMinuteAccount | null;
  balance: number;
  accumulationLevel: ReturnType<typeof getAccumulationLevel>;
  isLoading: boolean;
  error: string | null;
  /** Recent transactions for display */
  recentTransactions: CoverageMinuteTransaction[];
  /** Active reading sessions */
  activeReading: ReadingProgress | null;
}

interface CoverageMinutesActions {
  /** Earn Coverage Minutes from reading content */
  earnFromReading: (
    contentId: string,
    contentType: CoverageContentType,
    pagesRead: number,
    totalPages: number,
    readingTimeMinutes: number,
  ) => Promise<void>;
  /** Earn Coverage Minutes from listening at a Round Table */
  earnFromListening: (
    roundTableId: string,
    minutesListened: number,
  ) => Promise<void>;
  /** Spend Coverage Minutes on speaking */
  spendOnSpeaking: (
    roundTableId: string,
    minutesSpoken: number,
  ) => Promise<{ allowed: boolean; reason?: string }>;
  /** Spend Coverage Minutes on publishing text */
  spendOnPublishing: (
    wordCount: number,
  ) => Promise<{ allowed: boolean; cost: number; reason?: string }>;
  /** Donate Coverage Minutes to another member */
  donateTo: (
    toMemberId: string,
    minutes: number,
  ) => Promise<{ success: boolean; reason?: string }>;
  /** View a donation record (costs a fee) */
  viewDonationRecord: (
    donationId: string,
  ) => Promise<{ success: boolean; record?: CoverageMinuteDonation }>;
  /** Check if the user can speak for a given duration */
  checkCanSpeak: (
    durationMinutes: number,
    sessionUsed: number,
  ) => { allowed: boolean; reason?: string; maxMinutes: number };
  /** Refresh the account from the database */
  refreshAccount: () => Promise<void>;
  /** Set reading speed tier */
  setReadingSpeedTier: (tier: ReadingSpeedTier) => void;
}

type CoverageMinutesContextType = CoverageMinutesState & CoverageMinutesActions;

// ── Context ────────────────────────────────────────────────────────────────

const CoverageMinutesContext = createContext<CoverageMinutesContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────────────────

export function CoverageMinutesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [account, setAccount] = useState<CoverageMinuteAccount | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<CoverageMinuteTransaction[]>([]);
  const [activeReading, setActiveReading] = useState<ReadingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const balance = account ? calculateBalance(account) : 0;
  const accumulationLevel = account
    ? getAccumulationLevel(account)
    : { level: 0, name: "Listener" as const, minEarned: 0, maxSessionMinutes: ACCUMULATION_INCREMENT };

  // ── Load account on auth change ──
  useEffect(() => {
    if (!user) {
      setAccount(null);
      setRecentTransactions([]);
      setIsLoading(false);
      return;
    }

    loadAccount(user.id);
  }, [user]);

  const loadAccount = async (memberId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch existing account
      const { data, error: fetchError } = await supabase
        .from("coverage_minute_accounts" as any)
        .select("*")
        .eq("member_id", memberId)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 = table doesn't exist yet (pre-migration)
        console.warn("Coverage Minutes: table not yet available", fetchError.message);
        setAccount(createAccount(memberId));
        setIsLoading(false);
        return;
      }

      if (data) {
        // Map database row to our interface
        setAccount({
          memberId: (data as any).member_id,
          earnedMinutes: Number((data as any).earned_minutes) || 0,
          spentMinutes: Number((data as any).spent_minutes) || 0,
          donatedMinutes: Number((data as any).donated_minutes) || 0,
          receivedDonations: Number((data as any).received_donations) || 0,
          currentBalance: Number((data as any).current_balance) || 0,
          maxSessionBroadcast: (data as any).max_session_broadcast || MAX_SESSION_BROADCAST,
          accumulationLevel: (data as any).accumulation_level || 0,
          accumulationIncrement: ACCUMULATION_INCREMENT,
          readingSpeedTier: (data as any).reading_speed_tier || "normal",
          createdAt: (data as any).created_at,
          updatedAt: (data as any).updated_at,
        });
      } else {
        // No account yet — create one locally (will be persisted on first transaction)
        setAccount(createAccount(memberId));
      }
    } catch (err) {
      console.warn("Coverage Minutes: unable to load account", err);
      setAccount(createAccount(memberId));
    }

    setIsLoading(false);
  };

  // ── Actions ──

  const earnFromReading = useCallback(async (
    contentId: string,
    contentType: CoverageContentType,
    pagesRead: number,
    totalPages: number,
    readingTimeMinutes: number,
  ) => {
    if (!account) return;

    const earnings = calculateReadingEarnings(
      account.readingSpeedTier,
      readingTimeMinutes,
      pagesRead,
      totalPages,
    );

    const rounded = roundToIncrement(earnings);
    if (rounded <= 0) return;

    // Update local state optimistically
    setAccount(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        earnedMinutes: prev.earnedMinutes + rounded,
        currentBalance: prev.currentBalance + rounded,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [account]);

  const earnFromListening = useCallback(async (
    roundTableId: string,
    minutesListened: number,
  ) => {
    if (!account) return;

    const rounded = roundToIncrement(minutesListened);
    if (rounded <= 0) return;

    setAccount(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        earnedMinutes: prev.earnedMinutes + rounded,
        currentBalance: prev.currentBalance + rounded,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [account]);

  const spendOnSpeaking = useCallback(async (
    roundTableId: string,
    minutesSpoken: number,
  ): Promise<{ allowed: boolean; reason?: string }> => {
    if (!account) return { allowed: false, reason: "No account loaded." };

    const check = canSpeak(account, minutesSpoken, 0);
    if (!check.allowed) return check;

    setAccount(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        spentMinutes: prev.spentMinutes + minutesSpoken,
        currentBalance: prev.currentBalance - minutesSpoken,
        updatedAt: new Date().toISOString(),
      };
    });

    return { allowed: true };
  }, [account]);

  const spendOnPublishing = useCallback(async (
    wordCount: number,
  ): Promise<{ allowed: boolean; cost: number; reason?: string }> => {
    if (!account) return { allowed: false, cost: 0, reason: "No account loaded." };

    const cost = calculatePublishingCost(wordCount);

    if (balance < cost) {
      return {
        allowed: false,
        cost,
        reason: `Publishing requires ${cost} Coverage Minutes but you only have ${balance}.`,
      };
    }

    setAccount(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        spentMinutes: prev.spentMinutes + cost,
        currentBalance: prev.currentBalance - cost,
        updatedAt: new Date().toISOString(),
      };
    });

    return { allowed: true, cost };
  }, [account, balance]);

  const donateTo = useCallback(async (
    toMemberId: string,
    minutes: number,
  ): Promise<{ success: boolean; reason?: string }> => {
    if (!account) return { success: false, reason: "No account loaded." };

    const check = canDonate(account, minutes);
    if (!check.allowed) return { success: false, reason: check.reason };

    setAccount(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        donatedMinutes: prev.donatedMinutes + minutes,
        currentBalance: prev.currentBalance - minutes,
        updatedAt: new Date().toISOString(),
      };
    });

    return { success: true };
  }, [account]);

  const viewDonationRecord = useCallback(async (
    donationId: string,
  ): Promise<{ success: boolean; record?: CoverageMinuteDonation }> => {
    if (!account) return { success: false };

    if (balance < DONATION_RECORD_VIEW_FEE) {
      return { success: false };
    }

    // Deduct the fee
    setAccount(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        spentMinutes: prev.spentMinutes + DONATION_RECORD_VIEW_FEE,
        currentBalance: prev.currentBalance - DONATION_RECORD_VIEW_FEE,
        updatedAt: new Date().toISOString(),
      };
    });

    return { success: true };
  }, [account, balance]);

  const checkCanSpeak = useCallback((
    durationMinutes: number,
    sessionUsed: number,
  ): { allowed: boolean; reason?: string; maxMinutes: number } => {
    if (!account) return { allowed: false, reason: "No account.", maxMinutes: 0 };

    const check = canSpeak(account, durationMinutes, sessionUsed);
    return {
      ...check,
      maxMinutes: check.maxMinutes ?? 0,
    };
  }, [account]);

  const refreshAccount = useCallback(async () => {
    if (!user) return;
    await loadAccount(user.id);
  }, [user]);

  const setReadingSpeedTier = useCallback((tier: ReadingSpeedTier) => {
    setAccount(prev => {
      if (!prev) return prev;
      return { ...prev, readingSpeedTier: tier };
    });
  }, []);

  // ── Context Value ──

  const value: CoverageMinutesContextType = {
    account,
    balance,
    accumulationLevel,
    isLoading,
    error,
    recentTransactions,
    activeReading,
    earnFromReading,
    earnFromListening,
    spendOnSpeaking,
    spendOnPublishing,
    donateTo,
    viewDonationRecord,
    checkCanSpeak,
    refreshAccount,
    setReadingSpeedTier,
  };

  return (
    <CoverageMinutesContext.Provider value={value}>
      {children}
    </CoverageMinutesContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useCoverageMinutes() {
  const context = useContext(CoverageMinutesContext);
  if (!context) {
    throw new Error("useCoverageMinutes must be used within a CoverageMinutesProvider");
  }
  return context;
}
