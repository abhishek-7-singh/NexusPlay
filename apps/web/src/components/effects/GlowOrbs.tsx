"use client";

import { motion } from "framer-motion";

export function GlowOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }} aria-hidden="true">
      {/* Large cyan orb — top left */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0, 212, 255, 0.08) 0%, transparent 70%)",
          top: "-10%",
          left: "-5%",
          filter: "blur(40px)",
        }}
        animate={{
          x: [0, 80, -30, 0],
          y: [0, 40, -20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Purple orb — center right */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)",
          top: "30%",
          right: "-10%",
          filter: "blur(50px)",
        }}
        animate={{
          x: [0, -60, 30, 0],
          y: [0, -50, 40, 0],
          scale: [1, 0.9, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Cyan orb — bottom */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.07) 0%, transparent 70%)",
          bottom: "10%",
          left: "20%",
          filter: "blur(35px)",
        }}
        animate={{
          x: [0, 50, -40, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Small pink accent orb */}
      <motion.div
        className="absolute w-[200px] h-[200px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.05) 0%, transparent 70%)",
          top: "60%",
          right: "30%",
          filter: "blur(30px)",
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -40, 15, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
