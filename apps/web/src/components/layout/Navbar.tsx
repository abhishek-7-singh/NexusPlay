"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Bell, Coins, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlatformStore } from "@/lib/platform-store";

export function Navbar() {
  const [activeSection, setActiveSection] = useState("");
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const user = usePlatformStore((state) => state.user);
  const hydrate = usePlatformStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isHomePage) return;

    const observers: IntersectionObserver[] = [];
    const sections = ["hero", "featured", "categories", "trending", "players", "community"];

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setActiveSection(id);
              }
            });
          },
          { rootMargin: "-80px 0px -60% 0px" }
        );
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [isHomePage]);

  const navLinks = [
    { label: "Library", href: "/games", id: "featured" },
    { label: "Lobbies", href: "/games#lobbies", id: "trending" },
    { label: "Rankings", href: "/leaderboard", id: "players" },
    { label: "Store", href: "/store", id: "store" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[72px] bg-base-900/90 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
      <div className="h-full px-6 flex items-center justify-between max-w-[1400px] mx-auto w-full">
        {/* Left: Brand */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-white text-base-900 flex items-center justify-center rounded-[4px] font-display font-black text-lg transition-transform group-hover:scale-105">
              N
            </div>
            <span className="font-display font-bold text-lg tracking-wider text-white">
              NEXUS<span className="text-accent-blue">PLAY</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => {
              const isActive = pathname === item.href || (isHomePage && activeSection === item.id);
              const href = isHomePage && item.id !== "store" && item.href.startsWith("/")
                ? item.href
                : item.href;
              
              return (
                <Link
                  key={item.href}
                  href={href}
                  className={cn(
                    "text-sm font-semibold transition-colors relative py-2",
                    isActive ? "text-white" : "text-text-secondary hover:text-white"
                  )}
                  onClick={(e) => {
                    if (isHomePage && item.href.startsWith("#")) {
                      e.preventDefault();
                      document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  {item.label}
                  {isActive && (
                    <div className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-accent-blue rounded-t-sm" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link href="/store" className="hidden lg:flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-white transition-colors">
            <Coins className="h-4 w-4 text-accent-cyan" />
            {user.coins.toLocaleString()}
          </Link>

          <button className="text-text-secondary hover:text-white transition-colors relative" aria-label="Notifications">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent-blue ring-2 ring-base-900" />
          </button>

          <Button variant="secondary" size="sm" asChild className="hidden sm:inline-flex h-10 px-3">
            <Link href="/profile" className="gap-2">
              <UserRound className="h-4 w-4" />
              <span className="max-w-28 truncate">{user.name}</span>
            </Link>
          </Button>
          
          <Button variant="default" size="sm" asChild className="h-10 px-6 font-bold shadow-[0_0_15px_rgba(0,212,255,0.15)]">
            <Link href="/games">Play Now</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
