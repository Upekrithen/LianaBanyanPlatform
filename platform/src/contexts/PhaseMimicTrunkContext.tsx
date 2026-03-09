/**
 * PHASE MIMICTRUNK CONTEXT PROVIDER
 * ====================================
 * Spec: MUFFLED_RULE_AND_PHASE_MIMICTRUNKS.md, Sections 3, 4
 * Ticket: B-011
 *
 * Manages Phase MimicTrunk state:
 *   - Current phase (if inside one)
 *   - Connection validation status
 *   - DNA chain integrity
 *   - Ledger sync status
 *   - Access card verification
 *   - Source code download management
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

import {
  type PhaseMimicTrunk,
  type PhaseConnectionStatus,
  type PhaseOwnerType,
  type ValidationAttempt,
  type PhaseAccessRecord,
  type SpecialDeckCardLink,
  createPhaseMimicTrunk,
  processValidation,
  canConnect,
  hasValidAccess,
  getGovernanceChain,
  getTrunkSummary,
  VALIDATION_INTERVAL_MS,
} from "@/lib/discourse/phaseMimicTrunks";

import {
  type DownloadPackage,
  type ConnectionHandshake,
  generatePackage,
  isPackageValid,
  initiateHandshake,
  getHandshakeFailureMessage,
} from "@/lib/discourse/sourceDistribution";

// ── Context Types ──────────────────────────────────────────────────────────

interface PhaseMimicTrunkState {
  /** All trunks owned by the current user */
  ownedTrunks: PhaseMimicTrunk[];
  /** Currently active phase (if inside one) */
  currentPhase: PhaseMimicTrunk | null;
  /** Whether user is inside a phase */
  isInPhase: boolean;
  /** Current connection status */
  connectionStatus: PhaseConnectionStatus | null;
  /** Latest validation attempt */
  lastValidation: ValidationAttempt | null;
  /** User's Special Deck Card links */
  deckCardLinks: SpecialDeckCardLink[];
  /** Active download package (if generating/downloading) */
  activeDownload: DownloadPackage | null;
  /** Active connection handshake (if connecting) */
  activeHandshake: ConnectionHandshake | null;
  /** Is the context loading */
  isLoading: boolean;
  /** Error message */
  error: string | null;
}

interface PhaseMimicTrunkActions {
  /** Create a new personal Phase MimicTrunk */
  createPersonalPhase: (
    name: string,
    description: string,
    monthlyFee: number,
    goldenKeyPlaneId?: string,
  ) => PhaseMimicTrunk;
  /** Enter a Phase MimicTrunk */
  enterPhase: (
    trunkId: string,
    accessMethod: PhaseAccessRecord["accessMethod"],
  ) => { success: boolean; reason?: string };
  /** Exit the current Phase */
  exitPhase: () => void;
  /** Check if user has access to a specific trunk */
  checkAccess: (trunkId: string) => boolean;
  /** Generate a source code download package */
  generateDownload: (trunkId: string) => DownloadPackage;
  /** Start a connection handshake */
  startHandshake: (packageId: string, trunkId: string) => ConnectionHandshake;
  /** Get governance chain for a trunk */
  getGovernance: (trunkId: string) => PhaseMimicTrunk[];
  /** Get trunk summary */
  getTrunkInfo: (trunkId: string) => ReturnType<typeof getTrunkSummary> | null;
  /** Get failure message for a handshake result */
  getFailureMessage: (result: ConnectionHandshake["result"]) => string;
  /** Refresh owned trunks from database */
  refreshTrunks: () => Promise<void>;
}

type PhaseMimicTrunkContextType = PhaseMimicTrunkState & PhaseMimicTrunkActions;

// ── Context ────────────────────────────────────────────────────────────────

const PhaseMimicTrunkContext = createContext<PhaseMimicTrunkContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────────────────

export function PhaseMimicTrunkProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [ownedTrunks, setOwnedTrunks] = useState<PhaseMimicTrunk[]>([]);
  const [currentPhase, setCurrentPhase] = useState<PhaseMimicTrunk | null>(null);
  const [lastValidation, setLastValidation] = useState<ValidationAttempt | null>(null);
  const [deckCardLinks, setDeckCardLinks] = useState<SpecialDeckCardLink[]>([]);
  const [activeDownload, setActiveDownload] = useState<DownloadPackage | null>(null);
  const [activeHandshake, setActiveHandshake] = useState<ConnectionHandshake | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const memberId = user?.id ?? "";

  // Derived state
  const isInPhase = currentPhase !== null;
  const connectionStatus = currentPhase?.connectionStatus ?? null;

  // ── Load trunks on auth change ──
  useEffect(() => {
    if (!user) {
      setOwnedTrunks([]);
      setCurrentPhase(null);
      setDeckCardLinks([]);
      setIsLoading(false);
      return;
    }

    loadTrunks(user.id);
  }, [user]);

  const loadTrunks = async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("phase_mimictrunks" as any)
        .select("*")
        .eq("owner_id", userId)
        .eq("owner_type", "member");

      if (fetchError) {
        // Table may not exist yet (pre-migration)
        console.warn("Phase MimicTrunks: table not yet available", fetchError.message);
        setIsLoading(false);
        return;
      }

      if (data && Array.isArray(data)) {
        const trunks: PhaseMimicTrunk[] = data.map((row: any) => ({
          id: row.id,
          name: row.name,
          description: row.description || "",
          ownerType: row.owner_type as PhaseOwnerType,
          ownerId: row.owner_id,
          parentTrunkId: row.parent_trunk_id,
          ledgerSnapshotId: row.ledger_snapshot_id,
          ledgerSnapshotTimestamp: row.ledger_snapshot_timestamp,
          sourceCodeChecksum: row.source_code_checksum || "",
          dnaChain: row.dna_chain || { masterChecksum: "", components: [], iteration: 0, generatedAt: "" },
          connectionStatus: row.connection_status as PhaseConnectionStatus,
          lastValidatedAt: row.last_validated_at,
          validationFailureCount: row.validation_failure_count || 0,
          monthlyFee: Number(row.monthly_fee) || 0,
          specialDeckCardId: row.special_deck_card_id,
          goldenKeyPlaneId: row.golden_key_plane_id,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          suspendedAt: row.suspended_at,
        }));
        setOwnedTrunks(trunks);
      }
    } catch (err) {
      console.warn("Phase MimicTrunks: unable to load", err);
    }

    setIsLoading(false);
  };

  // ── Actions ──

  const createPersonalPhase = useCallback((
    name: string,
    description: string,
    monthlyFee: number,
    goldenKeyPlaneId?: string,
  ): PhaseMimicTrunk => {
    const trunk = createPhaseMimicTrunk(
      name,
      description,
      "member",
      memberId,
      monthlyFee,
      { goldenKeyPlaneId },
    );

    setOwnedTrunks(prev => [...prev, trunk]);
    return trunk;
  }, [memberId]);

  const enterPhase = useCallback((
    trunkId: string,
    accessMethod: PhaseAccessRecord["accessMethod"],
  ): { success: boolean; reason?: string } => {
    const trunk = ownedTrunks.find(t => t.id === trunkId);
    if (!trunk) {
      return { success: false, reason: "Phase not found." };
    }

    const connectionCheck = canConnect(trunk);
    if (!connectionCheck.allowed) {
      return { success: false, reason: connectionCheck.reason };
    }

    setCurrentPhase(trunk);
    return { success: true };
  }, [ownedTrunks]);

  const exitPhase = useCallback(() => {
    setCurrentPhase(null);
  }, []);

  const checkAccess = useCallback((trunkId: string): boolean => {
    // Owner always has access
    if (ownedTrunks.some(t => t.id === trunkId)) return true;

    // Check Special Deck Card links
    return hasValidAccess(deckCardLinks, memberId, trunkId);
  }, [ownedTrunks, deckCardLinks, memberId]);

  const generateDownloadAction = useCallback((trunkId: string): DownloadPackage => {
    const pkg = generatePackage(memberId, trunkId, "1.0.0");
    setActiveDownload(pkg);
    return pkg;
  }, [memberId]);

  const startHandshakeAction = useCallback((
    packageId: string,
    trunkId: string,
  ): ConnectionHandshake => {
    const hs = initiateHandshake(packageId, trunkId, memberId);
    setActiveHandshake(hs);
    return hs;
  }, [memberId]);

  const getGovernance = useCallback((trunkId: string): PhaseMimicTrunk[] => {
    const trunk = ownedTrunks.find(t => t.id === trunkId);
    if (!trunk) return [];
    return getGovernanceChain(trunk, ownedTrunks);
  }, [ownedTrunks]);

  const getTrunkInfo = useCallback((trunkId: string) => {
    const trunk = ownedTrunks.find(t => t.id === trunkId);
    if (!trunk) return null;
    return getTrunkSummary(trunk);
  }, [ownedTrunks]);

  const getFailureMessageAction = useCallback((result: ConnectionHandshake["result"]): string => {
    return getHandshakeFailureMessage(result);
  }, []);

  const refreshTrunks = useCallback(async () => {
    if (!user) return;
    await loadTrunks(user.id);
  }, [user]);

  // ── Context Value ──

  const value: PhaseMimicTrunkContextType = {
    ownedTrunks,
    currentPhase,
    isInPhase,
    connectionStatus,
    lastValidation,
    deckCardLinks,
    activeDownload,
    activeHandshake,
    isLoading,
    error,
    createPersonalPhase,
    enterPhase,
    exitPhase,
    checkAccess,
    generateDownload: generateDownloadAction,
    startHandshake: startHandshakeAction,
    getGovernance,
    getTrunkInfo,
    getFailureMessage: getFailureMessageAction,
    refreshTrunks,
  };

  return (
    <PhaseMimicTrunkContext.Provider value={value}>
      {children}
    </PhaseMimicTrunkContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function usePhaseMimicTrunk() {
  const context = useContext(PhaseMimicTrunkContext);
  if (!context) {
    throw new Error("usePhaseMimicTrunk must be used within a PhaseMimicTrunkProvider");
  }
  return context;
}
