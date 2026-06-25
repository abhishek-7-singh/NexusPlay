"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const CATEGORIES = [
  { name: "Board Games", icon: "♟️", count: 4, color: "from-purple-500/20 to-purple-500/5" },
  { name: "Card Games", icon: "🃏", count: 2, color: "from-red-500/20 to-red-500/5" },
  { name: "Strategy", icon: "🧠", count: 5, color: "from-blue-500/20 to-blue-500/5" },
  { name: "Party", icon: "🎉", count: 6, color: "from-pink-500/20 to-pink-500/5" },
  { name: "Action", icon: "⚔️", count: 4, color: "from-orange-500/20 to-orange-500/5" },
  { name: "Racing", icon: "🏎️", count: 2, color: "from-green-500/20 to-green-500/5" },
  { name: "Sports", icon: "⚽", count: 3, color: "from-cyan-500/20 to-cyan-500/5" },
  { name: "Puzzle", icon: "🧩", count: 3, color: "from-yellow-500/20 to-yellow-500/5" },
  { name: "Arcade", icon: "👾", count: 4, color: "from-indigo-500/20 to-indigo-500/5" },
  { name: "Word", icon: "📝", count: 2, color: "from-teal-500/20 to-teal-500/5" },
  { name: "Trivia", icon: "❓", count: 2, color: "from-amber-500/20 to-amber-500/5" },
  { name: "Casual", icon: "☕", count: 5, color: "from-rose-500/20 to-rose-500/5" },
];

export function Categories() {
  return (
    <section className="relative py-32" id="categories">
      <div className="container-xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title neon-text">Game Categories</h2>
          <p className="section-subtitle mx-auto">
            Find your perfect game across 12 categories
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                href={`/games?category=${cat.name.toLowerCase()}`}
                className="glass-card p-5 text-center group block"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mx-auto mb-3 text-2xl group-hover:scale-110 transition-transform duration-300`}>
                  {cat.icon}
                </div>
                <h3 className="text-sm font-semibold text-white/80 mb-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-white/30">
                  {cat.count} games
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
