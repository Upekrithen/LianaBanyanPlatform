import React, { createContext, useContext, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface FriendWord {
  word: string;
  language: string;
  discoveredAt: Date;
  discoveredVia: "lintel" | "manual" | "gift";
}

interface GatePassage {
  gateId: string;
  friendWord: string;
  language: string;
  passedAt: Date;
}

interface ContentRating {
  currentRating: string;
  verifiedAge: boolean;
  ratingLocked: boolean;
}

type RatingLevel = "ST" | "KG" | "JR" | "GA" | "TN" | "MT" | "AD" | "UV";

const RATING_ORDER: RatingLevel[] = ["ST", "KG", "JR", "GA", "TN", "MT", "AD", "UV"];

const RATING_LABELS: Record<RatingLevel, string> = {
  ST: "Shirley Temple",
  KG: "Kindergarten",
  JR: "Junior",
  GA: "General",
  TN: "Teen",
  MT: "Mature",
  AD: "Adult",
  UV: "Ultra-Violet",
};

interface GateContextType {
  friendWords: FriendWord[];
  lintelWords: Record<string, string[]>;
  userRating: ContentRating;
  addFriendWord: (word: string, language: string, via: "lintel" | "manual" | "gift") => void;
  passGate: (gateId: string, word: string, language: string) => void;
  getLintelWords: (gateId: string) => string[];
  canAccessRating: (targetRating: RatingLevel) => boolean;
  createExceptionStamp: (fromRating: RatingLevel, toRating: RatingLevel) => void;
  getRatingLabel: (rating: RatingLevel) => string;
  isRatingHigher: (a: RatingLevel, b: RatingLevel) => boolean;
}

const GateContext = createContext<GateContextType | undefined>(undefined);

const FRIEND_WORDS_BY_LANGUAGE: Record<string, string[]> = {
  english: ["friend", "pal", "buddy", "mate", "companion"],
  spanish: ["amigo", "amiga", "compañero", "compañera"],
  french: ["ami", "amie", "copain", "copine"],
  german: ["freund", "freundin", "kumpel"],
  italian: ["amico", "amica", "compagno"],
  portuguese: ["amigo", "amiga", "companheiro"],
  japanese: ["友達", "tomodachi", "友人"],
  chinese: ["朋友", "pengyou", "好友"],
  korean: ["친구", "chingu", "벗"],
  arabic: ["صديق", "sadiq", "رفيق"],
  swahili: ["rafiki", "ndugu"],
  hindi: ["दोस्त", "dost", "मित्र"],
  russian: ["друг", "drug", "товарищ"],
};

export function GateProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: friendWords = [] } = useQuery({
    queryKey: ["friend-words", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_friend_words")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      return (data || []).map((w) => ({
        word: w.word,
        language: w.language,
        discoveredAt: new Date(w.discovered_at),
        discoveredVia: w.discovered_via as "lintel" | "manual" | "gift",
      })) as FriendWord[];
    },
    enabled: !!user,
  });

  const { data: lintelWords = {} } = useQuery({
    queryKey: ["lintel-words"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gate_passages")
        .select("gate_id, friend_word")
        .order("passed_at", { ascending: false });

      if (error) throw error;

      const lintels: Record<string, string[]> = {};
      (data || []).forEach((p) => {
        if (!lintels[p.gate_id]) {
          lintels[p.gate_id] = [];
        }
        if (lintels[p.gate_id].length < 3 && !lintels[p.gate_id].includes(p.friend_word)) {
          lintels[p.gate_id].push(p.friend_word);
        }
      });
      return lintels;
    },
  });

  const { data: userRating = { currentRating: "GA", verifiedAge: false, ratingLocked: false } } = useQuery({
    queryKey: ["user-rating", user?.id],
    queryFn: async () => {
      if (!user) return { currentRating: "GA", verifiedAge: false, ratingLocked: false };

      const { data, error } = await supabase
        .from("user_content_rating")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      return data
        ? {
            currentRating: data.current_rating,
            verifiedAge: data.verified_age,
            ratingLocked: data.rating_locked,
          }
        : { currentRating: "GA", verifiedAge: false, ratingLocked: false };
    },
    enabled: !!user,
  });

  const addWordMutation = useMutation({
    mutationFn: async ({
      word,
      language,
      via,
    }: {
      word: string;
      language: string;
      via: "lintel" | "manual" | "gift";
    }) => {
      if (!user) return;

      await supabase.from("user_friend_words").upsert({
        user_id: user.id,
        word: word.toLowerCase(),
        language,
        discovered_via: via,
        discovered_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend-words"] });
    },
  });

  const passGateMutation = useMutation({
    mutationFn: async ({
      gateId,
      word,
      language,
    }: {
      gateId: string;
      word: string;
      language: string;
    }) => {
      if (!user) return;

      await supabase.from("gate_passages").insert({
        gate_id: gateId,
        user_id: user.id,
        friend_word: word.toLowerCase(),
        language,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lintel-words"] });
    },
  });

  const exceptionStampMutation = useMutation({
    mutationFn: async ({
      fromRating,
      toRating,
    }: {
      fromRating: RatingLevel;
      toRating: RatingLevel;
    }) => {
      if (!user) return;

      await supabase.from("exception_stamps").insert({
        user_id: user.id,
        from_rating: fromRating,
        to_rating: toRating,
        passphrase_hash: "hashed",
      });
    },
  });

  const getLintelWords = useCallback(
    (gateId: string) => {
      return lintelWords[gateId] || [];
    },
    [lintelWords]
  );

  const isRatingHigher = useCallback((a: RatingLevel, b: RatingLevel) => {
    return RATING_ORDER.indexOf(a) > RATING_ORDER.indexOf(b);
  }, []);

  const canAccessRating = useCallback(
    (targetRating: RatingLevel) => {
      const userRatingIndex = RATING_ORDER.indexOf(userRating.currentRating as RatingLevel);
      const targetIndex = RATING_ORDER.indexOf(targetRating);
      return userRatingIndex >= targetIndex;
    },
    [userRating]
  );

  const getRatingLabel = useCallback((rating: RatingLevel) => {
    return RATING_LABELS[rating] || rating;
  }, []);

  return (
    <GateContext.Provider
      value={{
        friendWords,
        lintelWords,
        userRating,
        addFriendWord: (word, language, via) =>
          addWordMutation.mutate({ word, language, via }),
        passGate: (gateId, word, language) =>
          passGateMutation.mutate({ gateId, word, language }),
        getLintelWords,
        canAccessRating,
        createExceptionStamp: (fromRating, toRating) =>
          exceptionStampMutation.mutate({ fromRating, toRating }),
        getRatingLabel,
        isRatingHigher,
      }}
    >
      {children}
    </GateContext.Provider>
  );
}

export function useGate() {
  const context = useContext(GateContext);
  if (!context) {
    throw new Error("useGate must be used within GateProvider");
  }
  return context;
}

export { FRIEND_WORDS_BY_LANGUAGE, RATING_ORDER, RATING_LABELS };
export type { RatingLevel, FriendWord };
