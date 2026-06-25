"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FloatingObjects } from "@/components/effects/FloatingObjects";

const titleWords = ["PLAY", "TOGETHER."];
const subtitleWords = ["NO", "DOWNLOADS."];
const taglineWords = ["JUST", "SHARE", "A", "ROOM."];

const wordVariants = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      delay: i * 0.12,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  }),
};

const buttonVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: 1.2 + i * 0.15,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  }),
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Floating game objects in background */}
      <FloatingObjects />

      {/* Central gradient spotlight */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0, 212, 255, 0.05) 0%, rgba(139, 92, 246, 0.03) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="container-xl relative z-10 text-center px-4">
        {/* Main Title */}
        <div className="mb-2">
          <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
            {titleWords.map((word, i) => (
              <motion.span
                key={word}
                className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight"
                style={{
                  background: "linear-gradient(135deg, #FFFFFF 0%, #00D4FF 50%, #8B5CF6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                custom={i}
              >
                {word}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Subtitle */}
        <div className="mb-2">
          <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
            {subtitleWords.map((word, i) => (
              <motion.span
                key={word}
                className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-white/80"
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                custom={i + titleWords.length}
              >
                {word}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Tagline */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            {taglineWords.map((word, i) => (
              <motion.span
                key={`${word}-${i}`}
                className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-wide neon-text"
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                custom={i + titleWords.length + subtitleWords.length}
              >
                {word}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Description */}
        <motion.p
          className="text-base sm:text-lg text-white/50 max-w-xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          Instant multiplayer games in your browser. Challenge friends, play with AI bots,
          or join players worldwide. No downloads, no installs.
        </motion.p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.div
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <Link href="/games" className="btn-primary text-base px-10 py-4 text-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play Now
            </Link>
          </motion.div>

          <motion.div
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            <Link href="/games" className="btn-secondary text-base px-8 py-4">
              Browse Games
            </Link>
          </motion.div>

          <motion.div
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            <a href="#how-it-works" className="btn-ghost text-base px-6 py-4">
              How It Works ↓
            </a>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          className="mt-20 flex items-center justify-center gap-8 sm:gap-16 flex-wrap"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
        >
          {[
            { value: "25+", label: "Games" },
            { value: "50K+", label: "Players" },
            { value: "1M+", label: "Matches Played" },
            { value: "4.9★", label: "Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display font-bold text-2xl sm:text-3xl neon-text">
                {stat.value}
              </div>
              <div className="text-xs text-white/40 mt-1 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center pt-2">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-neon-blue"
            animate={{ y: [0, 16, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
