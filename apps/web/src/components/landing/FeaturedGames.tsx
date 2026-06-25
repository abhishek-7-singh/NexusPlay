"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const GAMES = [
  {
    id: "tic-tac-toe",
    name: "Tic Tac Toe",
    description: "Classic strategy with neon flair",
    icon: "❌⭕",
    color: "from-blue-500 to-cyan-400",
    players: "2 Players",
    tags: ["Strategy", "Quick"],
  },
  {
    id: "chess",
    name: "Chess",
    description: "The ultimate game of strategy",
    icon: "♟️",
    color: "from-purple-500 to-pink-500",
    players: "2 Players",
    tags: ["Strategy", "Competitive"],
  },
  {
    id: "ludo",
    name: "Ludo",
    description: "Race your tokens home!",
    icon: "🎲",
    color: "from-green-500 to-emerald-400",
    players: "2-4 Players",
    tags: ["Party", "Board"],
  },
  {
    id: "card-blast",
    name: "Card Blast",
    description: "UNO-style card mayhem",
    icon: "🃏",
    color: "from-red-500 to-orange-400",
    players: "2-6 Players",
    tags: ["Card", "Party"],
  },
  {
    id: "snake",
    name: "Snake Battle",
    description: "Competitive snake action",
    icon: "🐍",
    color: "from-lime-500 to-green-400",
    players: "2-4 Players",
    tags: ["Arcade", "Action"],
    comingSoon: true,
  },
  {
    id: "pool",
    name: "8 Ball Pool",
    description: "Physics-based pool game",
    icon: "🎱",
    color: "from-indigo-500 to-blue-400",
    players: "2 Players",
    tags: ["Sports", "Physics"],
    comingSoon: true,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: i * 0.1,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

export function FeaturedGames() {
  return (
    <section className="relative py-32" id="featured-games">
      <div className="container-xl">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title neon-text">Featured Games</h2>
          <p className="section-subtitle mx-auto">
            Jump into any game instantly — no downloads, no installs. Play with friends or challenge AI bots.
          </p>
        </motion.div>

        {/* Game grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAMES.map((game, i) => (
            <motion.div
              key={game.id}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              custom={i}
            >
              <Link
                href={game.comingSoon ? "#" : `/games/${game.id}`}
                className="block glass-card group relative overflow-hidden"
              >
                {/* Gradient top bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${game.color}`} />

                {/* Coming soon badge */}
                {game.comingSoon && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-white/70">
                    Coming Soon
                  </div>
                )}

                <div className="p-6">
                  {/* Icon */}
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {game.icon}
                  </div>

                  {/* Info */}
                  <h3 className="font-display font-bold text-lg text-white mb-1">
                    {game.name}
                  </h3>
                  <p className="text-sm text-white/40 mb-4">
                    {game.description}
                  </p>

                  {/* Tags and players */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {game.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-md bg-white/5 text-xs text-white/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-white/30">{game.players}</span>
                  </div>
                </div>

                {/* Hover glow overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-[0.03]`} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View all link */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/games" className="btn-secondary px-8 py-3">
            View All Games →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
