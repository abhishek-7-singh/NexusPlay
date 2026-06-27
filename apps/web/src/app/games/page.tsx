"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, Bot, Clock, Copy, Gamepad2, Heart, Lock, Play, Search, Signal, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { generateRoomCode, getGameById, liveRooms, platformGames, type GameId } from "@/lib/platform-data";
import { usePlatformStore } from "@/lib/platform-store";

const categories = ["All", "Strategy", "Casual", "Board", "Card", "Puzzle", "Word"];

export default function GamesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [roomCode, setRoomCode] = useState("");
  const router = useRouter();
  const favoriteGameIds = usePlatformStore((state) => state.favoriteGameIds);
  const toggleFavorite = usePlatformStore((state) => state.toggleFavorite);
  const addRecentRoom = usePlatformStore((state) => state.addRecentRoom);

  const filteredGames = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return platformGames.filter((game) => {
      const matchesCategory = category === "All" || game.category === category;
      const matchesQuery = !normalizedQuery || `${game.title} ${game.category} ${game.tags.join(" ")}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const createRoom = (gameId: GameId) => {
    const code = generateRoomCode();
    addRecentRoom(code);
    router.push(`/rooms/${code}?game=${gameId}`);
  };

  const joinRoom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = roomCode.trim().toUpperCase();
    if (!normalized) return;
    addRecentRoom(normalized);
    router.push(`/rooms/${normalized}`);
  };

  return (
    <div className="flex-1 bg-base-900">
      <section className="border-b border-white/5 bg-base-800/20">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-6 py-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="client-label mb-4 text-accent-cyan">Game Library</div>
            <h1 className="client-heading-1 mb-4 text-4xl md:text-6xl">Pick a game. Start a room. Share the code.</h1>
            <p className="max-w-2xl text-base font-medium leading-relaxed text-text-secondary">
              Browse live games, practice against bots, or create a private room for friends. The playable games below are wired as real local/bot experiences, with lobby flows ready for online play.
            </p>
          </div>

          <form onSubmit={joinRoom} className="w-full max-w-md rounded-lg border border-white/5 bg-base-800 p-3">
            <label htmlFor="room-code" className="client-label mb-2 block">Join Room Code</label>
            <div className="flex gap-2">
              <input
                id="room-code"
                value={roomCode}
                onChange={(event) => setRoomCode(event.target.value)}
                placeholder="NOVA82"
                className="min-w-0 flex-1 rounded-md border border-white/10 bg-base-900 px-4 py-3 font-display text-sm uppercase tracking-wider text-white outline-none transition focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/30"
                maxLength={8}
              />
              <Button type="submit" className="h-12 px-5">
                Join
              </Button>
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1400px] px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-xl flex-1 items-center gap-3 rounded-lg border border-white/5 bg-base-800 px-4 py-3">
            <Search className="h-4 w-4 text-text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by game, genre, or mode"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-text-muted"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={cn(
                  "h-10 rounded-md border px-4 text-sm font-semibold transition whitespace-nowrap",
                  category === item
                    ? "border-white bg-white text-base-900"
                    : "border-white/5 bg-base-800 text-text-secondary hover:bg-base-700 hover:text-white",
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredGames.map((game) => {
            const isPlayable = game.modes.includes("bot") || game.modes.includes("local");
            const isFavorite = favoriteGameIds.includes(game.id);

            return (
              <article key={game.id} className="overflow-hidden rounded-lg border border-white/5 bg-base-800 transition hover:-translate-y-1 hover:border-white/15">
                <div className="relative aspect-[16/9] overflow-hidden bg-base-700">
                  <img src={game.cover} alt={game.title} className="h-full w-full object-cover brightness-75 transition duration-500 hover:scale-105 hover:brightness-95" />
                  <div className="absolute inset-0 bg-gradient-to-t from-base-900 via-transparent to-transparent" />
                  <div className="absolute left-4 top-4 rounded bg-base-900/80 px-2 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    {game.status}
                  </div>
                  <button
                    onClick={() => toggleFavorite(game.id)}
                    className={cn(
                      "absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-base-900/80 transition hover:bg-base-800",
                      isFavorite ? "text-accent-cyan" : "text-text-secondary",
                    )}
                    aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
                  >
                    <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
                  </button>
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="client-label mb-1" style={{ color: game.accent }}>{game.category}</div>
                      <h2 className="text-xl font-bold text-white">{game.title}</h2>
                    </div>
                    <div className="text-right text-xs font-semibold text-text-muted">
                      <div>{game.rating.toFixed(1)} rating</div>
                      <div>{game.online.toLocaleString()} online</div>
                    </div>
                  </div>

                  <p className="mb-5 min-h-12 text-sm leading-relaxed text-text-secondary">{game.description}</p>

                  <div className="mb-5 flex flex-wrap gap-2 text-xs font-semibold text-text-secondary">
                    <span className="inline-flex items-center gap-1 rounded bg-base-900 px-2 py-1"><Users className="h-3 w-3" /> {game.players}</span>
                    <span className="inline-flex items-center gap-1 rounded bg-base-900 px-2 py-1"><Clock className="h-3 w-3" /> {game.duration}</span>
                    {game.modes.includes("bot") && <span className="inline-flex items-center gap-1 rounded bg-base-900 px-2 py-1"><Bot className="h-3 w-3" /> Bots</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild disabled={!isPlayable} className={!isPlayable ? "opacity-60" : ""}>
                      <Link href={isPlayable ? `/games/${game.id}` : "/games"}>
                        <Play className="mr-2 h-4 w-4 fill-current" />
                        Play
                      </Link>
                    </Button>
                    <Button variant="secondary" onClick={() => createRoom(game.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Room
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="lobbies" className="border-t border-white/5 bg-base-800/20">
        <div className="mx-auto w-full max-w-[1400px] px-6 py-12">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="client-label mb-2 text-accent-cyan">Live Lobbies</div>
              <h2 className="client-heading-2">Open rooms near you</h2>
            </div>
            <Button variant="outline" asChild>
              <Link href="/leaderboard">View rankings</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {liveRooms.map((room) => {
              const game = getGameById(room.gameId);
              return (
                <Link
                  key={room.code}
                  href={`/rooms/${room.code}?game=${room.gameId}`}
                  onClick={() => addRecentRoom(room.code)}
                  className="grid gap-4 rounded-lg border border-white/5 bg-base-800 p-4 transition hover:border-white/15 hover:bg-base-700/50 md:grid-cols-[1.3fr_1fr_auto]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: `${game.accent}22`, color: game.accent }}>
                      <Gamepad2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-white">{room.title}</h3>
                      <p className="text-sm text-text-secondary">{game.title} hosted by {room.host}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-text-secondary sm:grid-cols-4">
                    <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {room.players}/{room.maxPlayers}</span>
                    <span className="inline-flex items-center gap-1"><Signal className="h-3 w-3" /> {room.ping} ms</span>
                    <span className="inline-flex items-center gap-1"><Activity className="h-3 w-3" /> {room.mode}</span>
                    <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /> {room.visibility}</span>
                  </div>

                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    <span className="font-display text-sm font-bold tracking-widest text-accent-cyan">{room.code}</span>
                    <Button size="sm" variant="secondary">
                      Join
                    </Button>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 rounded-lg border border-white/5 bg-base-900 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-accent-cyan" />
                <div>
                  <h3 className="font-bold text-white">Quick Match</h3>
                  <p className="text-sm text-text-secondary">We will place you into a live room or create a bot-backed practice room.</p>
                </div>
              </div>
              <Button onClick={() => createRoom("tic-tac-toe")}>Start quick match</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
