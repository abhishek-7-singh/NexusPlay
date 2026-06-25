"use client";

import { motion } from "framer-motion";

const OBJECTS = [
  { emoji: "🎮", x: "10%", y: "20%", size: 40, delay: 0, duration: 7 },
  { emoji: "🎲", x: "85%", y: "15%", size: 35, delay: 1, duration: 8 },
  { emoji: "♟️", x: "75%", y: "65%", size: 38, delay: 2, duration: 6 },
  { emoji: "🃏", x: "15%", y: "70%", size: 36, delay: 0.5, duration: 9 },
  { emoji: "🏎️", x: "60%", y: "25%", size: 32, delay: 1.5, duration: 7 },
  { emoji: "🎯", x: "90%", y: "45%", size: 30, delay: 3, duration: 8 },
  { emoji: "⚽", x: "25%", y: "40%", size: 28, delay: 2.5, duration: 6 },
  { emoji: "🏆", x: "50%", y: "75%", size: 34, delay: 0.8, duration: 10 },
  { emoji: "🎪", x: "40%", y: "10%", size: 30, delay: 1.2, duration: 7 },
  { emoji: "⚔️", x: "70%", y: "85%", size: 32, delay: 3.5, duration: 8 },
];

export function FloatingObjects() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {OBJECTS.map((obj, i) => (
        <motion.div
          key={i}
          className="absolute select-none"
          style={{
            left: obj.x,
            top: obj.y,
            fontSize: obj.size,
            filter: "drop-shadow(0 0 12px rgba(0, 212, 255, 0.3))",
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.4, 0.3, 0.4],
            scale: [0.8, 1, 0.9, 1],
            y: [0, -20, 10, 0],
            rotate: [0, 10, -5, 0],
          }}
          transition={{
            duration: obj.duration,
            delay: obj.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {obj.emoji}
        </motion.div>
      ))}

      {/* Holographic rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`ring-${i}`}
          className="absolute rounded-full border"
          style={{
            width: 100 + i * 60,
            height: 100 + i * 60,
            left: `${30 + i * 15}%`,
            top: `${20 + i * 20}%`,
            borderColor: `rgba(0, 212, 255, ${0.05 - i * 0.01})`,
          }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 30 + i * 10, repeat: Infinity, ease: "linear" },
            scale: { duration: 5 + i * 2, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      ))}
    </div>
  );
}
