"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function AnimatedCounter({ target, duration = 2 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const motionVal = { value: 0 };
    const controls = animate(motionVal, { value: target }, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setCount(Math.floor(latest.value)),
    });

    return () => controls.stop();
  }, [isVisible, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

const STATS = [
  { value: 2847, suffix: "", label: "Players Online", icon: "🟢" },
  { value: 25, suffix: "+", label: "Games Available", icon: "🎮" },
  { value: 1287543, suffix: "", label: "Matches Played", icon: "🏆" },
  { value: 99, suffix: "%", label: "Uptime", icon: "⚡" },
];

export function StatsSection() {
  return (
    <section className="relative py-32">
      <div className="container-xl">
        <motion.div
          className="glass-panel p-12 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 via-neon-purple/5 to-neon-cyan/5 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="section-title neon-text text-center mb-12">
              Platform Stats
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="text-3xl mb-3">{stat.icon}</div>
                  <div className="font-display font-black text-3xl sm:text-4xl text-white mb-2">
                    <AnimatedCounter target={stat.value} />
                    {stat.suffix}
                  </div>
                  <div className="text-sm text-white/40 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
