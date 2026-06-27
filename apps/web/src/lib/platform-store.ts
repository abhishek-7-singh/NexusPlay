"use client";

import { create } from "zustand";
import type { GameId } from "@/lib/platform-data";

export interface NexusUser {
  id: string;
  name: string;
  avatarSeed: string;
  level: number;
  xp: number;
  coins: number;
  isGuest: boolean;
}

export interface MatchSummary {
  id: string;
  gameId: GameId;
  result: "Win" | "Loss" | "Draw" | "Practice";
  opponent: string;
  playedAt: string;
  ratingDelta: number;
}

interface PlatformStore {
  user: NexusUser;
  favoriteGameIds: GameId[];
  recentRooms: string[];
  matchHistory: MatchSummary[];
  hasHydrated: boolean;
  hydrate: () => void;
  loginGuest: (name: string) => void;
  logout: () => void;
  toggleFavorite: (gameId: GameId) => void;
  addRecentRoom: (roomCode: string) => void;
  addMatch: (match: Omit<MatchSummary, "id" | "playedAt">) => void;
  spendCoins: (amount: number) => boolean;
}

const STORAGE_KEY = "nexusplay_platform_state";

const defaultUser: NexusUser = {
  id: "guest_local",
  name: "ProGamer42",
  avatarSeed: "ProGamer42",
  level: 12,
  xp: 7420,
  coins: 1250,
  isGuest: true,
};

const defaultHistory: MatchSummary[] = [
  { id: "m1", gameId: "tic-tac-toe", result: "Win", opponent: "Nova AI", playedAt: "Today", ratingDelta: 18 },
  { id: "m2", gameId: "card-blast", result: "Practice", opponent: "3 bots", playedAt: "Yesterday", ratingDelta: 0 },
  { id: "m3", gameId: "chess", result: "Loss", opponent: "Cipher", playedAt: "2 days ago", ratingDelta: -9 },
];

function persist(state: Pick<PlatformStore, "user" | "favoriteGameIds" | "recentRooms" | "matchHistory">) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      user: state.user,
      favoriteGameIds: state.favoriteGameIds,
      recentRooms: state.recentRooms,
      matchHistory: state.matchHistory,
    }),
  );
}

export const usePlatformStore = create<PlatformStore>((set, get) => ({
  user: defaultUser,
  favoriteGameIds: ["chess", "tic-tac-toe"],
  recentRooms: ["NOVA82", "PARTY7"],
  matchHistory: defaultHistory,
  hasHydrated: false,

  hydrate: () => {
    if (typeof window === "undefined" || get().hasHydrated) return;

    const rawPlatform = window.localStorage.getItem(STORAGE_KEY);
    const rawLegacyUser = window.localStorage.getItem("nexus_user");

    if (rawPlatform) {
      try {
        const parsed = JSON.parse(rawPlatform) as Partial<PlatformStore>;
        set({
          user: parsed.user ?? defaultUser,
          favoriteGameIds: parsed.favoriteGameIds ?? ["chess", "tic-tac-toe"],
          recentRooms: parsed.recentRooms ?? ["NOVA82", "PARTY7"],
          matchHistory: parsed.matchHistory ?? defaultHistory,
          hasHydrated: true,
        });
        return;
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    if (rawLegacyUser) {
      try {
        const legacy = JSON.parse(rawLegacyUser) as { id?: string; name?: string; isGuest?: boolean };
        set({
          user: {
            ...defaultUser,
            id: legacy.id ?? defaultUser.id,
            name: legacy.name ?? defaultUser.name,
            avatarSeed: legacy.name ?? defaultUser.avatarSeed,
            isGuest: legacy.isGuest ?? true,
          },
          hasHydrated: true,
        });
        persist(get());
        return;
      } catch {
        window.localStorage.removeItem("nexus_user");
      }
    }

    set({ hasHydrated: true });
    persist(get());
  },

  loginGuest: (name) => {
    const cleaned = name.trim().slice(0, 20) || "Player";
    set({
      user: {
        ...defaultUser,
        id: `guest_${Date.now()}`,
        name: cleaned,
        avatarSeed: cleaned,
      },
    });
    persist(get());
  },

  logout: () => {
    set({ user: defaultUser });
    persist(get());
  },

  toggleFavorite: (gameId) => {
    const favoriteGameIds = get().favoriteGameIds.includes(gameId)
      ? get().favoriteGameIds.filter((id) => id !== gameId)
      : [gameId, ...get().favoriteGameIds];
    set({ favoriteGameIds });
    persist(get());
  },

  addRecentRoom: (roomCode) => {
    const normalized = roomCode.trim().toUpperCase();
    if (!normalized) return;
    set({ recentRooms: [normalized, ...get().recentRooms.filter((code) => code !== normalized)].slice(0, 5) });
    persist(get());
  },

  addMatch: (match) => {
    set({
      matchHistory: [
        {
          ...match,
          id: `match_${Date.now()}`,
          playedAt: "Just now",
        },
        ...get().matchHistory,
      ].slice(0, 12),
      user: {
        ...get().user,
        xp: get().user.xp + 120,
      },
    });
    persist(get());
  },

  spendCoins: (amount) => {
    if (get().user.coins < amount) return false;
    set({ user: { ...get().user, coins: get().user.coins - amount } });
    persist(get());
    return true;
  },
}));
