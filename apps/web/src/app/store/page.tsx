"use client";

import { useState } from "react";
import { Check, Coins, Gem, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cosmeticItems } from "@/lib/platform-data";
import { usePlatformStore } from "@/lib/platform-store";
import { cn } from "@/lib/utils";

export default function StorePage() {
  const user = usePlatformStore((state) => state.user);
  const spendCoins = usePlatformStore((state) => state.spendCoins);
  const [owned, setOwned] = useState(() => new Set(cosmeticItems.filter((item) => item.owned).map((item) => item.id)));
  const [message, setMessage] = useState("Cosmetics only. No pay-to-win boosts.");

  const buyItem = (itemId: string, price: number) => {
    if (owned.has(itemId)) {
      setMessage("Already owned. Equip flows are ready for the next account pass.");
      return;
    }

    if (!spendCoins(price)) {
      setMessage("Not enough coins. Play matches to earn more.");
      return;
    }

    setOwned((current) => new Set(current).add(itemId));
    setMessage("Purchase complete. Cosmetic added to your collection.");
  };

  return (
    <div className="flex-1 bg-base-900">
      <section className="border-b border-white/5 bg-base-800/20">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-6 py-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="client-label mb-4 text-accent-cyan">Cosmetic Store</div>
            <h1 className="client-heading-1 mb-4 text-4xl md:text-6xl">Customize your presence</h1>
            <p className="max-w-2xl text-base font-medium leading-relaxed text-text-secondary">
              Spend earned coins on avatars, frames, board skins, card backs, and cursor effects. Cosmetic-only by design.
            </p>
          </div>
          <div className="rounded-lg border border-white/5 bg-base-800 p-5">
            <div className="client-label mb-1">Wallet</div>
            <div className="flex items-center gap-2 font-display text-3xl font-black text-accent-cyan">
              <Coins className="h-6 w-6" />
              {user.coins.toLocaleString()}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1400px] px-6 py-10">
        <div className="mb-6 rounded-lg border border-white/5 bg-base-800 p-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-accent-cyan" />
            <p className="text-sm font-semibold text-text-secondary">{message}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cosmeticItems.map((item) => {
            const isOwned = owned.has(item.id);
            return (
              <article key={item.id} className="rounded-lg border border-white/5 bg-base-800 p-5 transition hover:border-white/15">
                <div className="mb-5 flex aspect-[16/9] items-center justify-center rounded-lg border border-white/5 bg-base-900" style={{ boxShadow: `inset 0 0 80px ${item.accent}22` }}>
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-white/10" style={{ backgroundColor: `${item.accent}22`, color: item.accent }}>
                    <Gem className="h-8 w-8" />
                  </div>
                </div>

                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="client-label mb-1" style={{ color: item.accent }}>{item.type}</div>
                    <h2 className="text-xl font-bold text-white">{item.name}</h2>
                  </div>
                  <span
                    className={cn(
                      "rounded px-2 py-1 text-xs font-bold",
                      item.rarity === "Legendary" && "bg-amber-400/10 text-amber-300",
                      item.rarity === "Epic" && "bg-accent-purple/10 text-accent-purple",
                      item.rarity === "Rare" && "bg-accent-cyan/10 text-accent-cyan",
                      item.rarity === "Common" && "bg-white/10 text-text-secondary",
                    )}
                  >
                    {item.rarity}
                  </span>
                </div>

                <div className="mb-5 flex items-center justify-between rounded bg-base-900 p-3">
                  <span className="text-sm font-semibold text-text-secondary">Price</span>
                  <span className="font-display font-bold text-white">{item.price.toLocaleString()} coins</span>
                </div>

                <Button onClick={() => buyItem(item.id, item.price)} className="w-full" variant={isOwned ? "secondary" : "default"}>
                  {isOwned ? <Check className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
                  {isOwned ? "Owned" : "Purchase"}
                </Button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
