"use client";

import { MessageSquare, Users, Gamepad2, Settings, Swords, Trophy, Activity } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: Gamepad2, label: "Library", href: "/games" },
  { icon: Trophy, label: "Leaderboard", href: "/leaderboard" },
  { icon: Activity, label: "Activity", href: "/activity" },
];

const FRIENDS = [
  { name: "Nova", status: "online", game: "In Tic Tac Toe" },
  { name: "Cipher", status: "ingame", game: "Playing Chess" },
  { name: "Pulse", status: "offline", game: "Last seen 2h ago" },
  { name: "Vortex", status: "online", game: "Online" },
  { name: "Echo", status: "ingame", game: "Playing Ludo" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed right-0 top-0 bottom-0 w-64 client-sidebar flex flex-col z-40 pt-16">
      {/* Navigation Links (Secondary Nav) */}
      <div className="p-4 space-y-1 border-b border-white/5">
        <div className="client-label mb-3 px-2">Menu</div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all group",
                isActive 
                  ? "bg-base-700 text-white" 
                  : "text-text-secondary hover:bg-base-800 hover:text-white"
              )}
            >
              <item.icon className={cn("w-4 h-4", isActive ? "text-accent-blue" : "text-text-muted group-hover:text-white transition-colors")} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="client-label">Online (3)</div>
          <button className="text-text-muted hover:text-white transition-colors">
            <Users className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          {FRIENDS.map((friend) => (
            <button
              key={friend.name}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-base-800 transition-colors text-left group"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-base-700 border border-white/5 flex items-center justify-center overflow-hidden">
                  <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${friend.name}`} alt={friend.name} className="w-full h-full" />
                </div>
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#111111]",
                  friend.status === "online" ? "bg-status-online" :
                  friend.status === "ingame" ? "bg-status-ingame" : "bg-status-offline"
                )} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "text-sm font-medium truncate",
                  friend.status === "offline" ? "text-text-muted" : "text-white group-hover:text-accent-blue transition-colors"
                )}>
                  {friend.name}
                </div>
                <div className="text-[10px] text-text-muted truncate">
                  {friend.game}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* User Profile Area (Bottom) */}
      <div className="p-4 border-t border-white/5 bg-base-900/50">
        <div className="flex items-center gap-3">
          <div className="relative cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-base-700 border border-white/10 overflow-hidden">
              <img src="https://api.dicebear.com/9.x/bottts-neutral/svg?seed=ProGamer42" alt="User" className="w-full h-full" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-status-online border-2 border-base-900" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white truncate">ProGamer42</div>
            <div className="text-xs text-text-muted flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
              Level 12
            </div>
          </div>
          <button className="p-2 text-text-muted hover:text-white hover:bg-base-800 rounded-md transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
