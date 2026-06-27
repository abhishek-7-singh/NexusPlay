"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Bot, Check, Copy, Crown, Eye, Gamepad2, Link2, Play, Settings2, Shield, Signal, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGameById, liveRooms, platformGames, type GameId } from "@/lib/platform-data";
import { usePlatformStore } from "@/lib/platform-store";
import { cn } from "@/lib/utils";

const botDifficulties = ["easy", "medium", "hard", "expert"] as const;

export default function RoomPage() {
  const params = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const addRecentRoom = usePlatformStore((state) => state.addRecentRoom);
  const user = usePlatformStore((state) => state.user);
  const [copied, setCopied] = useState(false);
  const [botDifficulty, setBotDifficulty] = useState<(typeof botDifficulties)[number]>("medium");
  const [spectatorMode, setSpectatorMode] = useState(false);

  const roomCode = String(params.code ?? "").toUpperCase();
  const listedRoom = liveRooms.find((room) => room.code === roomCode);
  const requestedGame = searchParams.get("game") as GameId | null;
  const fallbackGameId: GameId = requestedGame && platformGames.some((game) => game.id === requestedGame) ? requestedGame : "tic-tac-toe";
  const gameId: GameId = listedRoom?.gameId ?? fallbackGameId;
  const game = getGameById(gameId);

  const inviteUrl = useMemo(() => {
    if (typeof window === "undefined") return `/rooms/${roomCode}?game=${game.id}`;
    return `${window.location.origin}/rooms/${roomCode}?game=${game.id}`;
  }, [game.id, roomCode]);

  useEffect(() => {
    addRecentRoom(roomCode);
  }, [addRecentRoom, roomCode]);

  const copyInvite = async () => {
    await navigator.clipboard?.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const launchGame = () => {
    router.push(`/games/${game.id}?room=${roomCode}&bot=${botDifficulty}&spectate=${spectatorMode ? "1" : "0"}`);
  };

  return (
    <div className="flex-1 bg-base-900">
      <section className="border-b border-white/5 bg-base-800/20">
        <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-6 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="client-label mb-4 text-accent-cyan">Room Lobby</div>
            <h1 className="client-heading-1 mb-4 text-4xl md:text-6xl">{listedRoom?.title ?? "Private Match Room"}</h1>
            <p className="max-w-2xl text-base font-medium leading-relaxed text-text-secondary">
              Invite friends with the room code, tune the match settings, then launch into {game.title}. Online server rooms are scaffolded; this staging page keeps the user flow complete while local/bot play is available immediately.
            </p>
          </div>

          <div className="rounded-lg border border-white/5 bg-base-800 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="client-label">Room Code</span>
              <span className="font-display text-2xl font-black tracking-widest text-accent-cyan">{roomCode}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={copyInvite} variant="secondary">
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button onClick={launchGame}>
                <Play className="mr-2 h-4 w-4 fill-current" />
                Launch
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1400px] gap-6 px-6 py-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-lg border border-white/5 bg-base-800">
            <div className="relative aspect-[21/9] min-h-60 overflow-hidden">
              <img src={game.cover} alt={game.title} className="h-full w-full object-cover brightness-75" />
              <div className="absolute inset-0 bg-gradient-to-r from-base-900 via-base-900/70 to-transparent" />
              <div className="absolute bottom-6 left-6 max-w-xl">
                <div className="client-label mb-2" style={{ color: game.accent }}>{game.category}</div>
                <h2 className="mb-3 text-3xl font-bold text-white">{game.title}</h2>
                <p className="text-sm leading-relaxed text-text-secondary">{game.description}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Users, label: "Players", value: listedRoom ? `${listedRoom.players}/${listedRoom.maxPlayers}` : game.players },
              { icon: Signal, label: "Region", value: listedRoom ? `${listedRoom.region} - ${listedRoom.ping} ms` : "Auto region" },
              { icon: Shield, label: "Visibility", value: listedRoom?.visibility ?? "Private" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-white/5 bg-base-800 p-5">
                <item.icon className="mb-4 h-5 w-5 text-accent-cyan" />
                <div className="client-label mb-1">{item.label}</div>
                <div className="font-bold text-white">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-white/5 bg-base-800 p-5">
            <div className="mb-5 flex items-center gap-2">
              <Link2 className="h-4 w-4 text-text-muted" />
              <h3 className="font-bold text-white">Invite Link</h3>
            </div>
            <div className="flex gap-2">
              <input
                readOnly
                value={inviteUrl}
                className="min-w-0 flex-1 rounded-md border border-white/10 bg-base-900 px-4 py-3 text-sm text-text-secondary outline-none"
              />
              <Button variant="secondary" onClick={copyInvite}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-white/5 bg-base-800 p-5">
            <div className="mb-5 flex items-center gap-2">
              <Crown className="h-4 w-4 text-accent-cyan" />
              <h3 className="font-bold text-white">Players</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-md bg-base-900 p-3">
                <div className="flex items-center gap-3">
                  <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(user.avatarSeed)}`} alt={user.name} className="h-9 w-9 rounded-md bg-base-800" />
                  <div>
                    <div className="text-sm font-bold text-white">{user.name}</div>
                    <div className="text-xs text-text-muted">Host - Level {user.level}</div>
                  </div>
                </div>
                <span className="h-2 w-2 rounded-full bg-status-online" />
              </div>
              <div className="flex items-center justify-between rounded-md bg-base-900 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-base-800 text-text-muted">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Bot Fill</div>
                    <div className="text-xs text-text-muted">Enabled for practice</div>
                  </div>
                </div>
                <span className="text-xs font-bold uppercase text-accent-cyan">{botDifficulty}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/5 bg-base-800 p-5">
            <div className="mb-5 flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-text-muted" />
              <h3 className="font-bold text-white">Match Settings</h3>
            </div>
            <div className="space-y-5">
              <div>
                <label className="client-label mb-3 block">Bot Difficulty</label>
                <div className="grid grid-cols-2 gap-2">
                  {botDifficulties.map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => setBotDifficulty(difficulty)}
                      className={cn(
                        "rounded-md border px-3 py-2 text-xs font-bold capitalize transition",
                        botDifficulty === difficulty
                          ? "border-white bg-white text-base-900"
                          : "border-white/5 bg-base-900 text-text-secondary hover:text-white",
                      )}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSpectatorMode((value) => !value)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md border p-3 text-left transition",
                  spectatorMode ? "border-accent-cyan/40 bg-accent-cyan/10" : "border-white/5 bg-base-900",
                )}
              >
                <span className="flex items-center gap-3">
                  <Eye className="h-4 w-4 text-text-muted" />
                  <span>
                    <span className="block text-sm font-bold text-white">Spectator mode</span>
                    <span className="block text-xs text-text-muted">Join without taking a player slot.</span>
                  </span>
                </span>
                <span className={cn("h-5 w-9 rounded-full p-1 transition", spectatorMode ? "bg-accent-cyan" : "bg-base-700")}>
                  <span className={cn("block h-3 w-3 rounded-full bg-white transition", spectatorMode && "translate-x-4")} />
                </span>
              </button>

              <Button onClick={launchGame} className="h-12 w-full">
                <Gamepad2 className="mr-2 h-4 w-4" />
                Start Match
              </Button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
