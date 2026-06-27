"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Award, Crown, Edit3, Gamepad2, History, LogOut, Star, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGameById } from "@/lib/platform-data";
import { usePlatformStore } from "@/lib/platform-store";

const achievements = [
  { name: "First Blood", description: "Win your first match.", progress: 1, max: 1, reward: 150 },
  { name: "Bot Breaker", description: "Beat a hard difficulty bot.", progress: 2, max: 3, reward: 300 },
  { name: "Room Captain", description: "Create five private rooms.", progress: 3, max: 5, reward: 250 },
  { name: "Season Climber", description: "Reach level 15 this season.", progress: 12, max: 15, reward: 500 },
];

export default function ProfilePage() {
  const user = usePlatformStore((state) => state.user);
  const matchHistory = usePlatformStore((state) => state.matchHistory);
  const favoriteGameIds = usePlatformStore((state) => state.favoriteGameIds);
  const recentRooms = usePlatformStore((state) => state.recentRooms);
  const logout = usePlatformStore((state) => state.logout);
  const hydrate = usePlatformStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const xpIntoLevel = user.xp % 1000;
  const xpPercent = Math.min(100, Math.round((xpIntoLevel / 1000) * 100));

  return (
    <div className="flex-1 bg-base-900">
      <section className="border-b border-white/5 bg-base-800/20">
        <div className="mx-auto w-full max-w-[1400px] px-6 py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-5">
              <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(user.avatarSeed)}`} alt={user.name} className="h-24 w-24 rounded-lg border border-white/10 bg-base-800" />
              <div>
                <div className="client-label mb-2 text-accent-cyan">Player Profile</div>
                <h1 className="client-heading-1 text-4xl md:text-6xl">{user.name}</h1>
                <p className="mt-2 text-text-secondary">Guest account - Level {user.level}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" asChild>
                <Link href="/login"><Edit3 className="mr-2 h-4 w-4" /> Change name</Link>
              </Button>
              <Button variant="outline" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> Reset
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1400px] gap-6 px-6 py-10 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-6">
          <div className="rounded-lg border border-white/5 bg-base-800 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Crown className="h-4 w-4 text-accent-cyan" />
              <h2 className="font-bold text-white">Progress</h2>
            </div>
            <div className="mb-3 flex items-end justify-between">
              <span className="text-3xl font-black text-white">Level {user.level}</span>
              <span className="text-sm font-semibold text-text-secondary">{xpIntoLevel}/1000 XP</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-base-900">
              <div className="h-full rounded-full bg-accent-cyan" style={{ width: `${xpPercent}%` }} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded bg-base-900 p-3">
                <div className="client-label mb-1">Coins</div>
                <div className="font-display font-bold text-accent-cyan">{user.coins.toLocaleString()}</div>
              </div>
              <div className="rounded bg-base-900 p-3">
                <div className="client-label mb-1">Rank</div>
                <div className="font-display font-bold text-white">Silver</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/5 bg-base-800 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-accent-cyan" />
              <h2 className="font-bold text-white">Favorites</h2>
            </div>
            <div className="space-y-2">
              {favoriteGameIds.map((gameId) => {
                const game = getGameById(gameId);
                return (
                  <Link key={game.id} href={`/games/${game.id}`} className="flex items-center justify-between rounded-md bg-base-900 p-3 transition hover:bg-base-700">
                    <span className="font-semibold text-white">{game.title}</span>
                    <Gamepad2 className="h-4 w-4 text-text-muted" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-white/5 bg-base-800 p-5">
            <div className="mb-4 flex items-center gap-2">
              <History className="h-4 w-4 text-accent-cyan" />
              <h2 className="font-bold text-white">Recent Rooms</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentRooms.map((code) => (
                <Link key={code} href={`/rooms/${code}`} className="rounded bg-base-900 px-3 py-2 font-display text-xs font-bold tracking-wider text-text-secondary transition hover:text-white">
                  {code}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="rounded-lg border border-white/5 bg-base-800">
            <div className="flex items-center justify-between border-b border-white/5 p-5">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-accent-cyan" />
                <h2 className="font-bold text-white">Match History</h2>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link href="/games">Play more</Link>
              </Button>
            </div>
            <div className="divide-y divide-white/5">
              {matchHistory.map((match) => {
                const game = getGameById(match.gameId);
                return (
                  <div key={match.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                    <div>
                      <div className="font-bold text-white">{game.title}</div>
                      <div className="text-sm text-text-muted">vs {match.opponent} - {match.playedAt}</div>
                    </div>
                    <span className="rounded bg-base-900 px-3 py-1 text-xs font-bold text-text-secondary">{match.result}</span>
                    <span className={match.ratingDelta >= 0 ? "font-display font-bold text-status-online" : "font-display font-bold text-red-400"}>
                      {match.ratingDelta > 0 ? "+" : ""}{match.ratingDelta}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-white/5 bg-base-800 p-5">
            <div className="mb-5 flex items-center gap-2">
              <Award className="h-4 w-4 text-accent-cyan" />
              <h2 className="font-bold text-white">Achievements</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {achievements.map((achievement) => {
                const percent = Math.round((achievement.progress / achievement.max) * 100);
                return (
                  <article key={achievement.name} className="rounded-lg border border-white/5 bg-base-900 p-4">
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-white">{achievement.name}</h3>
                        <p className="text-sm text-text-muted">{achievement.description}</p>
                      </div>
                      <span className="rounded bg-accent-cyan/10 px-2 py-1 text-xs font-bold text-accent-cyan">{achievement.reward} XP</span>
                    </div>
                    <div className="mb-2 h-2 overflow-hidden rounded-full bg-base-700">
                      <div className="h-full bg-accent-cyan" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="text-xs font-semibold text-text-muted">{achievement.progress}/{achievement.max}</div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
