"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, RefreshCcw, Activity, ShieldAlert, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================================
// Card Blast Redesign — Premium Client Aesthetic
// ============================================================

interface Card {
  id: string;
  color: "red" | "blue" | "green" | "yellow" | "wild";
  value: string;
}

const CARD_STYLES = {
  red: { bg: "bg-[#D32F2F]", text: "text-white", border: "border-[#B71C1C]" },
  blue: { bg: "bg-[#1976D2]", text: "text-white", border: "border-[#0D47A1]" },
  green: { bg: "bg-[#388E3C]", text: "text-white", border: "border-[#1B5E20]" },
  yellow: { bg: "bg-[#FBC02D]", text: "text-[#212121]", border: "border-[#F57F17]" },
  wild: { bg: "bg-gradient-to-br from-[#D32F2F] via-[#1976D2] to-[#388E3C]", text: "text-white", border: "border-white/20" },
};

function createDeck(): Card[] {
  const deck: Card[] = [];
  const colors: Card["color"][] = ["red", "blue", "green", "yellow"];
  let id = 0;

  for (const c of colors) {
    deck.push({ id: `${id++}`, color: c, value: "0" });
    for (let i = 0; i < 2; i++) {
      for (let n = 1; n <= 9; n++) deck.push({ id: `${id++}`, color: c, value: String(n) });
      deck.push({ id: `${id++}`, color: c, value: "⊘" }); // Skip
      deck.push({ id: `${id++}`, color: c, value: "⟲" }); // Reverse
      deck.push({ id: `${id++}`, color: c, value: "+2" });
    }
  }
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `${id++}`, color: "wild", value: "W" });
    deck.push({ id: `${id++}`, color: "wild", value: "+4" });
  }
  return deck;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Player {
  name: string;
  hand: Card[];
  isBot: boolean;
  calledUno: boolean;
}

function isPlayable(card: Card, topCard: Card, currentColor: string): boolean {
  if (card.color === "wild") return true;
  if (card.color === currentColor) return true;
  if (card.value === topCard.value) return true;
  return false;
}

export default function CardBlastPage() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [topCard, setTopCard] = useState<Card | null>(null);
  const [currentColor, setCurrentColor] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [direction, setDirection] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winnerName, setWinnerName] = useState("");
  const [message, setMessage] = useState("Press Start to play");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingWildCard, setPendingWildCard] = useState<Card | null>(null);
  const [isBotPlaying, setIsBotPlaying] = useState(false);

  const startGame = useCallback(() => {
    let d = shuffle(createDeck());
    const p: Player[] = [
      { name: "ProGamer42 (You)", hand: [], isBot: false, calledUno: false },
      { name: "Nova AI", hand: [], isBot: true, calledUno: false },
      { name: "Cipher AI", hand: [], isBot: true, calledUno: false },
      { name: "Pulse AI", hand: [], isBot: true, calledUno: false },
    ];

    for (let i = 0; i < 7; i++) {
      for (const player of p) player.hand.push(d.pop()!);
    }

    let startCard = d.pop()!;
    while (startCard.color === "wild" || ["⊘", "⟲", "+2"].includes(startCard.value)) {
      d.unshift(startCard);
      d = shuffle(d);
      startCard = d.pop()!;
    }

    setDeck(d);
    setPlayers(p);
    setTopCard(startCard);
    setCurrentColor(startCard.color);
    setCurrentPlayer(0);
    setDirection(1);
    setGameStarted(true);
    setGameOver(false);
    setWinnerName("");
    setMessage("Your turn! Play a card or draw.");
  }, []);

  const playCard = useCallback((cardIndex: number, chosenColor?: string) => {
    if (gameOver || isBotPlaying) return;

    const newPlayers = players.map(p => ({ ...p, hand: [...p.hand] }));
    const player = newPlayers[currentPlayer];
    const card = player.hand[cardIndex];

    if (!topCard || !isPlayable(card, topCard, currentColor)) return;

    if (card.color === "wild" && !chosenColor && currentPlayer === 0) {
      setPendingWildCard(card);
      setShowColorPicker(true);
      return;
    }

    player.hand.splice(cardIndex, 1);
    setTopCard(card);
    const newColor = card.color === "wild" ? (chosenColor || "red") : card.color;
    setCurrentColor(newColor);

    if (player.hand.length === 0) {
      setPlayers(newPlayers);
      setGameOver(true);
      setWinnerName(player.name);
      setMessage(`${player.name} wins!`);
      return;
    }

    if (player.hand.length === 1) {
      player.calledUno = true;
      setMessage(`${player.name} called UNO!`);
    }

    let newDirection = direction;
    let skip = false;

    if (card.value === "⟲") { newDirection = -direction; setDirection(newDirection); if (newPlayers.length === 2) skip = true; }
    if (card.value === "⊘") skip = true;
    if (card.value === "+2") {
      const nextIdx = (currentPlayer + newDirection + 4) % 4;
      for (let i = 0; i < 2 && deck.length > 0; i++) { const d = [...deck]; newPlayers[nextIdx].hand.push(d.pop()!); setDeck(d); }
      skip = true;
    }
    if (card.value === "+4") {
      const nextIdx = (currentPlayer + newDirection + 4) % 4;
      for (let i = 0; i < 4 && deck.length > 0; i++) { const d = [...deck]; newPlayers[nextIdx].hand.push(d.pop()!); setDeck(d); }
      skip = true;
    }

    setPlayers(newPlayers);
    const steps = skip ? 2 : 1;
    const nextPlayer = ((currentPlayer + newDirection * steps) % 4 + 4) % 4;
    setCurrentPlayer(nextPlayer);

    if (newPlayers[nextPlayer].isBot) {
      setTimeout(() => playBotTurn(newPlayers, nextPlayer, card, newColor, newDirection), 800 + Math.random() * 700);
    } else {
      if (!card.value.includes("+") && card.value !== "⊘") setMessage("Your turn! Play a card or draw.");
    }
  }, [players, currentPlayer, topCard, currentColor, direction, deck, gameOver, isBotPlaying]);

  const drawCard = useCallback(() => {
    if (gameOver || isBotPlaying || currentPlayer !== 0 || deck.length === 0) return;

    const newDeck = [...deck];
    const newPlayers = players.map(p => ({ ...p, hand: [...p.hand] }));
    newPlayers[0].hand.push(newDeck.pop()!);
    setDeck(newDeck);
    setPlayers(newPlayers);

    const next = ((currentPlayer + direction) % 4 + 4) % 4;
    setCurrentPlayer(next);
    setMessage(`You drew a card.`);

    if (newPlayers[next].isBot) {
      setTimeout(() => playBotTurn(newPlayers, next, topCard!, currentColor, direction), 800 + Math.random() * 700);
    }
  }, [deck, players, currentPlayer, direction, gameOver, isBotPlaying, topCard, currentColor]);

  const playBotTurn = useCallback((currentPlayers: Player[], botIdx: number, top: Card, color: string, dir: number) => {
    setIsBotPlaying(true);
    const bot = currentPlayers[botIdx];
    const playable = bot.hand.map((card, i) => ({ card, index: i })).filter(({ card }) => isPlayable(card, top, color));

    let newPlayers = currentPlayers.map(p => ({ ...p, hand: [...p.hand] }));
    let newTop = top;
    let newColor = color;
    let newDir = dir;

    if (playable.length > 0) {
      const nonWild = playable.filter(p => p.card.color !== "wild");
      const chosen = nonWild.length > 0 ? nonWild[Math.floor(Math.random() * nonWild.length)] : playable[0];

      newPlayers[botIdx].hand.splice(chosen.index, 1);
      newTop = chosen.card;
      newColor = chosen.card.color === "wild" ? ["red", "blue", "green", "yellow"][Math.floor(Math.random() * 4)] : chosen.card.color;
      setTopCard(newTop);
      setCurrentColor(newColor);

      if (newPlayers[botIdx].hand.length === 0) {
        setPlayers(newPlayers);
        setGameOver(true);
        setWinnerName(bot.name);
        setMessage(`${bot.name} wins!`);
        setIsBotPlaying(false);
        return;
      }

      if (newPlayers[botIdx].hand.length === 1) setMessage(`${bot.name} called UNO!`);
      else setMessage(`${bot.name} played a card.`);

      let skip = false;
      if (newTop.value === "⟲") { newDir = -dir; setDirection(newDir); }
      if (newTop.value === "⊘") skip = true;
      if (newTop.value === "+2") {
        const nextIdx = ((botIdx + newDir) % 4 + 4) % 4;
        const d = [...deck];
        for (let i = 0; i < 2 && d.length > 0; i++) newPlayers[nextIdx].hand.push(d.pop()!);
        setDeck(d); skip = true;
      }
      if (newTop.value === "+4") {
        const nextIdx = ((botIdx + newDir) % 4 + 4) % 4;
        const d = [...deck];
        for (let i = 0; i < 4 && d.length > 0; i++) newPlayers[nextIdx].hand.push(d.pop()!);
        setDeck(d); skip = true;
      }

      setPlayers(newPlayers);
      const steps = skip ? 2 : 1;
      const nextPlayer = ((botIdx + newDir * steps) % 4 + 4) % 4;
      setCurrentPlayer(nextPlayer);

      if (newPlayers[nextPlayer].isBot) setTimeout(() => playBotTurn(newPlayers, nextPlayer, newTop, newColor, newDir), 600 + Math.random() * 800);
      else { setMessage("Your turn! Play a card or draw."); setIsBotPlaying(false); }
    } else {
      if (deck.length > 0) {
        const d = [...deck];
        newPlayers[botIdx].hand.push(d.pop()!);
        setDeck(d); setPlayers(newPlayers);
        setMessage(`${bot.name} drew a card.`);
      }
      const nextPlayer = ((botIdx + dir) % 4 + 4) % 4;
      setCurrentPlayer(nextPlayer);

      if (newPlayers[nextPlayer].isBot) setTimeout(() => playBotTurn(newPlayers, nextPlayer, top, color, dir), 600 + Math.random() * 800);
      else { setMessage("Your turn! Play a card or draw."); setIsBotPlaying(false); }
    }
  }, [deck]);

  const handleColorChoice = (color: string) => {
    setShowColorPicker(false);
    if (pendingWildCard) {
      const cardIndex = players[0].hand.findIndex(c => c.id === pendingWildCard.id);
      if (cardIndex !== -1) playCard(cardIndex, color);
      setPendingWildCard(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col pt-20 px-8 pb-8 max-w-[1400px] mx-auto w-full relative">
      {/* Game Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 bg-base-800 hover:bg-base-700">
              <Link href="/games"><ChevronLeft className="w-4 h-4" /></Link>
            </Button>
            <div className="client-label">Card Blast</div>
          </div>
          <h1 className="client-heading-1 text-4xl">Free-for-all</h1>
        </div>

        <div className="flex items-center gap-3 bg-base-800/50 px-5 py-3 rounded-lg border border-white/5">
           <Activity className={cn("w-5 h-5", gameOver ? "text-accent-blue" : "text-text-muted animate-pulse")} />
           <span className="text-sm font-semibold text-white">{message}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12 items-start justify-center">
        
        {/* Main Game Area */}
        <div className="flex-1 flex flex-col items-center w-full max-w-[800px] mx-auto min-h-[500px]">
          
          {!gameStarted ? (
            <div className="flex flex-col items-center justify-center h-full pt-20">
              <Layers className="w-16 h-16 text-text-muted mb-6" />
              <h2 className="client-heading-2 mb-4">Ready to play?</h2>
              <p className="text-text-secondary mb-8">Match colors or numbers. Use special cards to win.</p>
              <Button onClick={startGame} size="lg" className="w-48 shadow-[0_0_30px_rgba(0,212,255,0.15)]">
                Start Match
              </Button>
            </div>
          ) : (
            <>
              {/* Top/Center: Discard & Draw */}
              <div className="flex items-center justify-center gap-12 mb-16 pt-8">
                
                {/* Draw pile */}
                <button
                  className="w-24 h-36 rounded-xl bg-base-800 border-2 border-white/5 flex flex-col items-center justify-center hover:border-white/20 transition-all hover:-translate-y-1 relative shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
                  onClick={drawCard}
                  disabled={gameOver || isBotPlaying || currentPlayer !== 0}
                >
                  <Layers className="w-8 h-8 text-text-muted mb-2" />
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">{deck.length} Left</span>
                </button>

                {/* Top Card */}
                {topCard && (
                  <motion.div
                    className={cn(
                      "w-24 h-36 rounded-xl flex items-center justify-center border-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative",
                      CARD_STYLES[topCard.color].bg,
                      CARD_STYLES[topCard.color].border
                    )}
                    key={topCard.id}
                    initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
                    animate={{ scale: 1, rotate: (Math.random() * 6 - 3), opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="absolute top-2 left-2 text-xs font-bold text-white/80">{topCard.value}</div>
                    <div className="absolute bottom-2 right-2 text-xs font-bold text-white/80 rotate-180">{topCard.value}</div>
                    <span className={cn("font-display font-black text-4xl drop-shadow-md", CARD_STYLES[topCard.color].text)}>
                      {topCard.value}
                    </span>
                    {/* Current color indicator for wilds */}
                    {topCard.color === "wild" && currentColor && (
                      <div className={cn(
                        "absolute -bottom-3 -right-3 w-8 h-8 rounded-full border-4 border-base-900 shadow-lg",
                        CARD_STYLES[currentColor as keyof typeof CARD_STYLES]?.bg || "bg-base-700"
                      )} />
                    )}
                  </motion.div>
                )}
              </div>

              {/* Player Hand */}
              <div className="w-full bg-base-800/30 p-6 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="client-label">Your Hand ({players[0]?.hand.length || 0})</div>
                  {players[0]?.hand.length === 1 && (
                    <div className="text-xs font-bold text-red-500 animate-pulse bg-red-500/10 px-2 py-1 rounded">
                      UNO WARNING
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center min-h-[150px]">
                  <AnimatePresence mode="popLayout">
                    {players[0]?.hand.map((card, i) => {
                      const canPlay = currentPlayer === 0 && !isBotPlaying && topCard && isPlayable(card, topCard, currentColor);
                      return (
                        <motion.button
                          key={card.id}
                          layout
                          initial={{ scale: 0, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0, y: -20 }}
                          onClick={() => canPlay && playCard(i)}
                          className={cn(
                            "w-16 h-24 sm:w-20 sm:h-32 rounded-xl flex items-center justify-center border-2 transition-all relative",
                            CARD_STYLES[card.color].bg,
                            CARD_STYLES[card.color].border,
                            canPlay ? "cursor-pointer hover:-translate-y-4 shadow-lg ring-2 ring-transparent hover:ring-white/50" : "cursor-default opacity-50 grayscale-[50%]"
                          )}
                        >
                          <div className="absolute top-1 left-1.5 sm:top-2 sm:left-2 text-[10px] sm:text-xs font-bold text-white/80">{card.value}</div>
                          <span className={cn("font-display font-black text-xl sm:text-3xl drop-shadow-md", CARD_STYLES[card.color].text)}>
                            {card.value}
                          </span>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {gameOver && (
                <div className="mt-8 flex justify-center">
                   <Button onClick={startGame} size="lg">Play Again</Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar Status (Desktop) */}
        {gameStarted && (
          <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
            <div className="bg-base-800/30 rounded-xl border border-white/5 p-6 flex flex-col gap-4">
               <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                  <ShieldAlert className="w-4 h-4 text-text-muted" />
                  <h3 className="text-sm font-semibold text-white">Opponents</h3>
               </div>
               {players.slice(1).map((p, i) => (
                 <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-base-800 flex items-center justify-center border border-white/5 overflow-hidden">
                       <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${p.name}`} alt={p.name} className="w-full h-full" />
                     </div>
                     <div>
                       <div className={cn("text-sm font-bold", currentPlayer === i + 1 ? "text-white" : "text-text-muted")}>{p.name}</div>
                       <div className="text-[10px] text-text-muted font-semibold">{p.hand.length} Cards</div>
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                     {p.hand.length === 1 && (
                       <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">UNO</span>
                     )}
                     {currentPlayer === i + 1 && (
                       <div className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
                     )}
                   </div>
                 </div>
               ))}
               
               {/* Current Color Status */}
               <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                 <span className="text-xs text-text-muted font-semibold uppercase">Active Color</span>
                 <div className="flex items-center gap-2">
                   <span className="text-xs font-bold text-white uppercase">{currentColor || "None"}</span>
                   {currentColor && (
                     <div className={cn("w-3 h-3 rounded-full", CARD_STYLES[currentColor as keyof typeof CARD_STYLES]?.bg)} />
                   )}
                 </div>
               </div>
               
               <div className="flex items-center justify-between">
                 <span className="text-xs text-text-muted font-semibold uppercase">Play Direction</span>
                 <span className="text-xs font-bold text-white uppercase">{direction === 1 ? "Clockwise ⬇" : "Counter ⬆"}</span>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Wild Card Color Picker Modal (Client Overlay) */}
      <AnimatePresence>
        {showColorPicker && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center client-overlay bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-base-800 p-8 rounded-2xl border border-white/10 shadow-2xl max-w-sm w-full"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h3 className="client-heading-2 text-2xl text-center mb-6">Select Color</h3>
              <div className="grid grid-cols-2 gap-4">
                {["red", "blue", "green", "yellow"].map(c => (
                  <button
                    key={c}
                    className={cn(
                      "h-24 rounded-xl flex items-center justify-center text-white font-bold text-sm uppercase tracking-wider transition-transform hover:scale-105 border-2 border-white/10 shadow-lg",
                      CARD_STYLES[c as keyof typeof CARD_STYLES].bg
                    )}
                    onClick={() => handleColorChoice(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
