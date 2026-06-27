"use client";

import Link from "next/link";
import { Medal, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGameById, leaderboardPlayers, platformGames } from "@/lib/platform-data";

export default function LeaderboardPage() {
  const topThree = leaderboardPlayers.slice(0, 3);

  return (
    <div className="flex-1 bg-base-900">
      <section className="border-b border-white/5 bg-base-800/20">
        <div className="mx-auto w-full max-w-[1400px] px-6 py-12">
          <div className="client-label mb-4 text-accent-cyan">Season Rankings</div>
          <h1 className="client-heading-1 mb-4 text-4xl md:text-6xl">Global ladder</h1>
          <p className="max-w-2xl text-base font-medium leading-relaxed text-text-secondary">
            Track rating, win rate, region, and main game across the NexusPlay season.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1400px] px-6 py-10">
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {topThree.map((player) => {
            const game = getGameById(player.mainGame);
            return (
              <article key={player.name} className="rounded-lg border border-white/5 bg-base-800 p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-base-900">
                    {player.rank === 1 ? <Trophy className="h-5 w-5 text-accent-cyan" /> : <Medal className="h-5 w-5 text-text-secondary" />}
                  </div>
                  <span className="font-display text-2xl font-black text-white">#{player.rank}</span>
                </div>
                <div className="mb-4 flex items-center gap-3">
                  <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${player.name}`} alt={player.name} className="h-12 w-12 rounded-md bg-base-900" />
                  <div>
                    <h2 className="font-bold text-white">{player.name}</h2>
                    <p className="text-sm text-text-muted">Level {player.level} - {player.region}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded bg-base-900 p-3">
                    <div className="client-label mb-1">Rating</div>
                    <div className="font-display font-bold text-accent-cyan">{player.rating.toLocaleString()}</div>
                  </div>
                  <div className="rounded bg-base-900 p-3">
                    <div className="client-label mb-1">Win Rate</div>
                    <div className="font-display font-bold text-white">{player.winRate}%</div>
                  </div>
                </div>
                <Button asChild variant="secondary" className="mt-5 w-full">
                  <Link href={`/games/${game.id}`}>Play {game.shortTitle}</Link>
                </Button>
              </article>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-lg border border-white/5 bg-base-800">
          <div className="flex items-center justify-between border-b border-white/5 p-5">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-accent-cyan" />
              <h2 className="font-bold text-white">Full ladder</h2>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Season 01</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-white/5 bg-base-900/60 text-xs uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="px-5 py-4">Rank</th>
                  <th className="px-5 py-4">Player</th>
                  <th className="px-5 py-4">Main Game</th>
                  <th className="px-5 py-4 text-right">Rating</th>
                  <th className="px-5 py-4 text-right">Win Rate</th>
                  <th className="px-5 py-4 text-right">Region</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardPlayers.map((player) => {
                  const game = getGameById(player.mainGame);
                  return (
                    <tr key={player.name} className="border-b border-white/5 transition hover:bg-base-700/40">
                      <td className="px-5 py-4 font-display font-bold text-text-muted">#{player.rank}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${player.name}`} alt={player.name} className="h-9 w-9 rounded-md bg-base-900" />
                          <div>
                            <div className="font-bold text-white">{player.name}</div>
                            <div className="text-xs text-text-muted">Level {player.level}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-text-secondary">{game.title}</td>
                      <td className="px-5 py-4 text-right font-display font-bold text-accent-cyan">{player.rating.toLocaleString()}</td>
                      <td className="px-5 py-4 text-right text-text-secondary">{player.winRate}%</td>
                      <td className="px-5 py-4 text-right text-text-muted">{player.region}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {platformGames.slice(0, 4).map((game) => (
            <Link key={game.id} href={`/games/${game.id}`} className="rounded-lg border border-white/5 bg-base-800 p-4 transition hover:border-white/15">
              <div className="client-label mb-1" style={{ color: game.accent }}>{game.category}</div>
              <div className="font-bold text-white">{game.title}</div>
              <div className="text-sm text-text-muted">{game.online.toLocaleString()} players online</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
