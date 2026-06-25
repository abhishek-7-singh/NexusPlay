"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    step: "01",
    title: "Choose a Game",
    description: "Browse our collection of 25+ multiplayer games. From chess to racing — there's something for everyone.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    color: "from-neon-blue to-cyan-400",
  },
  {
    step: "02",
    title: "Create or Join a Room",
    description: "Get a unique room code, share it with friends, or join a public match. Play with bots if you prefer solo.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: "from-neon-purple to-pink-400",
  },
  {
    step: "03",
    title: "Play Instantly",
    description: "No downloads. No installs. Games load in seconds. Play on any device — desktop, tablet, or phone.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
    color: "from-neon-green to-emerald-400",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-32" id="how-it-works">
      <div className="container-xl">
        {/* Section header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title neon-text">How It Works</h2>
          <p className="section-subtitle mx-auto">
            Three simple steps to start playing with friends
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              className="relative"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
            >
              <div className="glass-card p-8 text-center relative overflow-hidden h-full">
                {/* Step number background */}
                <div className="absolute top-4 right-4 font-display text-6xl font-black text-white/[0.03]">
                  {step.step}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}
                  style={{ boxShadow: `0 8px 30px rgba(0, 212, 255, 0.15)` }}
                >
                  <div className="text-white">
                    {step.icon}
                  </div>
                </div>

                <h3 className="font-display font-bold text-xl text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connector line (hidden on last item and mobile) */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 lg:-right-8 w-12 lg:w-16 h-px">
                  <div className="w-full h-px bg-gradient-to-r from-white/10 to-transparent" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-neon-blue/30" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
