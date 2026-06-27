"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, Gamepad2, Users, Clock, Trophy, MessageSquare, Activity, Crown } from "lucide-react";
import Link from "next/link";

// ============================================================
// DATA MODELS
// ============================================================

const FEATURED_GAMES = [
  {
    id: "chess",
    title: "Chess",
    category: "Strategy",
    image: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=2071&auto=format&fit=crop",
    players: "1-2",
    time: "10-30m",
  },
  {
    id: "tic-tac-toe",
    title: "Tic Tac Toe",
    category: "Casual",
    image: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=2070&auto=format&fit=crop",
    players: "1-2",
    time: "3m",
  },
  {
    id: "ludo",
    title: "Ludo",
    category: "Board",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2070&auto=format&fit=crop",
    players: "2-4",
    time: "15-45m",
  },
  {
    id: "card-blast",
    title: "Card Blast",
    category: "Card",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop",
    players: "2-6",
    time: "10-20m",
  },
];

const CATEGORIES = [
  { name: "Strategy", count: "12 Games", icon: Crown },
  { name: "Casual", count: "24 Games", icon: Gamepad2 },
  { name: "Board", count: "8 Games", icon: Activity },
  { name: "Card", count: "15 Games", icon: Trophy },
];

const TRENDING_MULTIPLAYER = [
  { id: "chess", title: "Grandmaster Lobby", game: "Chess", players: "1,204 Online", status: "Live Matchmaking" },
  { id: "ludo", title: "Party Lounge", game: "Ludo", players: "3,402 Online", status: "Instant Join" },
  { id: "card-blast", title: "High Rollers", game: "Card Blast", players: "892 Online", status: "Competitive" },
];

const LEADERBOARD = [
  { rank: 1, name: "Nova", rating: 9450, winRate: "68.2%", main: "Chess" },
  { rank: 2, name: "Cipher", rating: 8900, winRate: "64.1%", main: "Card Blast" },
  { rank: 3, name: "Pulse", rating: 8750, winRate: "61.5%", main: "Tic Tac Toe" },
  { rank: 4, name: "Vortex", rating: 8200, winRate: "59.0%", main: "Ludo" },
  { rank: 5, name: "Echo", rating: 7900, winRate: "58.4%", main: "Chess" },
];

const COMMUNITY_FEED = [
  { user: "Nova", action: "reached Grandmaster rank in Chess", time: "2h ago", avatar: "Nova" },
  { user: "Cipher", action: "won 5 matches of Card Blast in a row", time: "4h ago", avatar: "Cipher" },
  { user: "Vortex", action: "unlocked the 'Neon Flux' avatar", time: "1d ago", avatar: "Vortex" },
];

// ============================================================
// SINGLE PAGE LAYOUT
// ============================================================

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. HERO SECTION */}
      {/* Fixed height offset for the 72px navbar to ensure true 100vh visual */}
      <section id="hero" className="relative h-[calc(100vh-72px)] flex items-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-base-900/40 z-10 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-base-900 via-base-900/50 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-base-900 via-base-900/80 to-transparent z-10 w-3/4" />
          <img 
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover filter brightness-75 contrast-125"
          />
        </div>

        <div className="max-w-[1400px] mx-auto w-full px-6 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 text-accent-cyan font-bold tracking-widest text-xs uppercase mb-8">
              <span className="w-8 h-px bg-accent-cyan" />
              Featured Release
            </div>
            
            <h1 className="client-heading-1 text-5xl md:text-7xl mb-8 text-white drop-shadow-2xl">
              Discover the Ultimate <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">
                Browser Gaming Experience.
              </span>
            </h1>
            
            <p className="text-lg text-text-secondary mb-10 max-w-xl font-medium leading-relaxed">
              No downloads. No updates. Just instant, premium multiplayer games in your browser. Share a link and play with friends immediately.
            </p>
            
            <div className="flex items-center gap-4">
              <Button size="lg" className="h-14 px-8 text-base shadow-[0_0_30px_rgba(0,212,255,0.2)]" asChild>
                <Link href="/games">
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  Play Free Now
                </Link>
              </Button>
              <Button size="lg" variant="secondary" className="h-14 px-8 text-base" asChild>
                <Link href="/games#lobbies">
                  View Live Lobbies
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. FEATURED GAMES */}
      <section id="featured" className="py-32 bg-base-900 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto w-full px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="client-heading-2 mb-2">Featured Games</h2>
              <p className="text-text-secondary font-medium">Hand-crafted multiplayer experiences.</p>
            </div>
            <Button variant="ghost" className="text-text-secondary hover:text-white group shrink-0" asChild>
              <Link href="/games">
                Browse Full Library
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_GAMES.map((game) => (
              <Link key={game.id} href={`/games/${game.id}`} className="group block">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-base-800 border border-white/5 transition-all duration-300 group-hover:border-white/10 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                  <img 
                    src={game.image} 
                    alt={game.title} 
                    className="w-full h-full object-cover filter brightness-75 contrast-125 transition-all duration-500 group-hover:scale-105 group-hover:brightness-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-base-900 via-base-900/40 to-transparent opacity-90" />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[2px]">
                    <div className="w-16 h-16 rounded-full bg-accent-blue/90 flex items-center justify-center text-base-900 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      <Play className="w-6 h-6 fill-current ml-1" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="client-label text-accent-blue mb-2">{game.category}</div>
                    <h3 className="font-display font-bold text-2xl text-white mb-3 group-hover:text-accent-blue transition-colors truncate">{game.title}</h3>
                    
                    <div className="flex items-center gap-4 text-xs font-semibold text-text-secondary opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <div className="flex items-center gap-1.5 bg-base-800/80 backdrop-blur px-2.5 py-1 rounded-md border border-white/5">
                        <Users className="w-3 h-3" /> {game.players}
                      </div>
                      <div className="flex items-center gap-1.5 bg-base-800/80 backdrop-blur px-2.5 py-1 rounded-md border border-white/5">
                        <Clock className="w-3 h-3" /> {game.time}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. POPULAR CATEGORIES */}
      <section id="categories" className="py-32 bg-base-800/30 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto w-full px-6">
          <div className="mb-8">
            <h2 className="client-heading-2 mb-2">Browse by Genre</h2>
            <p className="text-text-secondary font-medium">Find your next obsession.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {CATEGORIES.map((cat, i) => (
              <button key={i} className="flex flex-col items-start p-6 rounded-xl bg-base-800 border border-white/5 hover:border-white/10 hover:bg-base-700 transition-all text-left group">
                <cat.icon className="w-8 h-8 text-text-muted group-hover:text-accent-cyan transition-colors mb-4" />
                <h3 className="font-bold text-lg text-white mb-1">{cat.name}</h3>
                <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TRENDING MULTIPLAYER */}
      <section id="trending" className="py-32 bg-base-900 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto w-full px-6">
          <div className="mb-8">
            <h2 className="client-heading-2 mb-2">Live Matchmaking</h2>
            <p className="text-text-secondary font-medium">Jump into active lobbies instantly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRENDING_MULTIPLAYER.map((lobby, i) => (
              <div key={i} className="p-6 rounded-xl bg-base-800 border border-white/5 flex flex-col justify-between h-48 group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-accent-purple bg-accent-purple/10 px-2 py-1 rounded">
                      {lobby.status}
                    </span>
                    <span className="flex items-center text-xs font-semibold text-text-muted">
                      <span className="w-2 h-2 rounded-full bg-status-online mr-2 animate-pulse" />
                      {lobby.players}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-white mb-1 truncate">{lobby.title}</h3>
                  <p className="text-sm text-text-secondary">{lobby.game}</p>
                </div>
                
                <Button variant="secondary" className="w-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all" asChild>
                  <Link href={`/rooms/${lobby.id === "chess" ? "NOVA82" : lobby.id === "ludo" ? "PARTY7" : "BLAST4"}?game=${lobby.id}`}>
                    Join Lobby
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TOP PLAYERS & COMMUNITY */}
      <section id="players" className="py-32 bg-base-800/30">
        <div className="max-w-[1400px] mx-auto w-full px-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Leaderboard */}
            <div className="xl:col-span-2 bg-base-800 border border-white/5 rounded-2xl overflow-hidden flex flex-col">
              <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="client-heading-2 mb-2 flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-accent-cyan" />
                    Global Rankings
                  </h2>
                  <p className="text-text-secondary font-medium">Season ends in 12 days.</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/leaderboard">View Full Ladder</Link>
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-text-muted uppercase bg-base-900/50 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4 font-semibold w-24 text-center">Rank</th>
                      <th className="px-6 py-4 font-semibold">Player</th>
                      <th className="px-6 py-4 font-semibold text-right">Rating</th>
                      <th className="px-6 py-4 font-semibold text-right hidden sm:table-cell">Win Rate</th>
                      <th className="px-6 py-4 font-semibold hidden md:table-cell text-right">Main Game</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LEADERBOARD.map((player) => (
                      <tr key={player.rank} className="border-b border-white/5 hover:bg-base-700/30 transition-colors">
                        <td className="px-6 py-4 text-center">
                          <span className="text-text-muted font-display font-bold">#{player.rank}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-base-900 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                              <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${player.name}`} alt={player.name} className="w-full h-full" />
                            </div>
                            <span className="font-semibold text-white">{player.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-display font-bold text-accent-cyan">{player.rating.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-right hidden sm:table-cell text-text-secondary font-medium">
                          {player.winRate}
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell text-text-muted text-xs uppercase tracking-wider font-semibold">
                          {player.main}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Community Feed */}
            <div id="community" className="bg-base-800 border border-white/5 rounded-2xl p-8 flex flex-col">
              <h2 className="client-heading-2 mb-2 flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-accent-purple" />
                Community
              </h2>
              <p className="text-text-secondary font-medium mb-8">Recent activity across the platform.</p>
              
              <div className="flex-1 flex flex-col gap-6">
                {COMMUNITY_FEED.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-base-900 border border-white/5 shrink-0 overflow-hidden">
                      <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${item.avatar}`} alt={item.user} className="w-full h-full" />
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary leading-relaxed mb-1">
                        <span className="font-bold text-white mr-2">{item.user}</span>
                        {item.action}
                      </p>
                      <span className="text-xs text-text-muted font-semibold">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="secondary" className="w-full mt-8" asChild>
                <Link href="/profile">View Activity Feed</Link>
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-base-900 border-t border-white/5 pt-20 pb-10">
        <div className="max-w-[1400px] mx-auto w-full px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white text-base-900 flex items-center justify-center rounded-[4px] font-display font-black text-lg">
                N
              </div>
              <span className="font-display font-bold text-lg tracking-wider text-white">
                NEXUS<span className="text-accent-blue">PLAY</span>
              </span>
            </Link>
            
            <div className="flex items-center gap-6 text-sm font-semibold text-text-secondary">
              <Link href="/store" className="hover:text-white transition-colors">Store</Link>
              <Link href="/leaderboard" className="hover:text-white transition-colors">Rankings</Link>
              <Link href="/profile" className="hover:text-white transition-colors">Profile</Link>
            </div>
          </div>
          
          <div className="text-center md:text-left text-xs text-text-muted font-medium">
            &copy; 2026 NexusPlay Entertainment. All rights reserved. Not affiliated with Riot Games or Steam.
          </div>
        </div>
      </footer>

    </div>
  );
}
