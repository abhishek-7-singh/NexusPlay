"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-white/5">
      <div className="container-xl py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                <span className="text-white font-black text-lg">N</span>
              </div>
              <span className="font-display font-bold text-xl tracking-wider text-white">
                NEXUS<span className="neon-text">PLAY</span>
              </span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed">
              The ultimate multiplayer browser gaming platform. Play together with friends — no downloads required.
            </p>
          </div>

          {/* Links */}
          {[
            {
              title: "Platform",
              links: [
                { label: "Browse Games", href: "/games" },
                { label: "Leaderboard", href: "/leaderboard" },
                { label: "Store", href: "/store" },
                { label: "Events", href: "#" },
              ],
            },
            {
              title: "Community",
              links: [
                { label: "Discord", href: "#" },
                { label: "Twitter", href: "#" },
                { label: "Reddit", href: "#" },
                { label: "Blog", href: "#" },
              ],
            },
            {
              title: "Support",
              links: [
                { label: "Help Center", href: "#" },
                { label: "Terms of Service", href: "#" },
                { label: "Privacy Policy", href: "#" },
                { label: "Contact Us", href: "#" },
              ],
            },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="font-display text-sm font-bold tracking-wider text-white/80 uppercase mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 hover:text-neon-blue transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © 2026 NexusPlay. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-xs text-white/40">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
