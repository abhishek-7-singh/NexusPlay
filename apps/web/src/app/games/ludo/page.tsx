"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, RefreshCcw, Activity, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================================
// Ludo Redesign — Premium Client Aesthetic
// ============================================================

const COLORS = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B"];

interface Token {
  position: number; 
  isHome: boolean;
  isFinished: boolean;
}

interface LudoPlayer {
  color: number;
  tokens: Token[];
  finishedCount: number;
  isBot: boolean;
  name: string;
}

function createPlayer(colorIdx: number, isBot: boolean, name: string): LudoPlayer {
  return {
    color: colorIdx,
    tokens: Array.from({ length: 4 }, () => ({ position: -1, isHome: true, isFinished: false })),
    finishedCount: 0,
    isBot,
    name,
  };
}

function botChooseToken(player: LudoPlayer, diceValue: number): number {
  const validTokens: number[] = [];
  for (let i = 0; i < 4; i++) {
    const t = player.tokens[i];
    if (t.isFinished) continue;
    if (t.isHome && diceValue === 6) validTokens.push(i);
    if (!t.isHome && !t.isFinished) {
      const newPos = t.position + diceValue;
      if (newPos <= 57) validTokens.push(i);
    }
  }
  if (validTokens.length === 0) return -1;

  for (const ti of validTokens) {
    const t = player.tokens[ti];
    if (!t.isHome && t.position + diceValue === 57) return ti;
  }
  for (const ti of validTokens) {
    if (player.tokens[ti].isHome) return ti;
  }
  validTokens.sort((a, b) => player.tokens[b].position - player.tokens[a].position);
  return validTokens[0];
}

export default function LudoPage() {
  const [players, setPlayers] = useState<LudoPlayer[]>(() => [
    createPlayer(0, false, "You"),
    createPlayer(1, true, "Nova AI"),
    createPlayer(2, true, "Cipher AI"),
    createPlayer(3, true, "Pulse AI"),
  ]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [diceValue, setDiceValue] = useState(0);
  const [hasRolled, setHasRolled] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string>("");
  const [message, setMessage] = useState("Roll the dice to start");

  const getValidMoves = useCallback((player: LudoPlayer, dice: number): number[] => {
    const valid: number[] = [];
    for (let i = 0; i < 4; i++) {
      const t = player.tokens[i];
      if (t.isFinished) continue;
      if (t.isHome && dice === 6) valid.push(i);
      if (!t.isHome && !t.isFinished && t.position + dice <= 57) valid.push(i);
    }
    return valid;
  }, []);

  function nextTurn(gotExtraTurn: boolean, updatedPlayers: LudoPlayer[]) {
    if (!gotExtraTurn) {
      const next = (currentPlayer + 1) % 4;
      setCurrentPlayer(next);
      setHasRolled(false);
      setDiceValue(0);

      if (updatedPlayers[next].isBot) {
        setTimeout(() => {
          const roll = Math.floor(Math.random() * 6) + 1;
          setDiceValue(roll);
          setHasRolled(true);
          setMessage(`${updatedPlayers[next].name} rolled ${roll}`);

          const valid = [];
          for (let i = 0; i < 4; i++) {
            const t = updatedPlayers[next].tokens[i];
            if (t.isFinished) continue;
            if (t.isHome && roll === 6) valid.push(i);
            if (!t.isHome && !t.isFinished && t.position + roll <= 57) valid.push(i);
          }

          if (valid.length === 0) {
            setMessage(`${updatedPlayers[next].name} has no valid moves`);
            setTimeout(() => {
              const nn = (next + 1) % 4;
              setCurrentPlayer(nn);
              setHasRolled(false);
              setDiceValue(0);
              if (!updatedPlayers[nn].isBot) setMessage("Your turn! Roll the dice.");
            }, 800);
            return;
          }

          const chosenToken = botChooseToken(updatedPlayers[next], roll);
          if (chosenToken === -1) return;

          setTimeout(() => {
            const newPlayers = [...updatedPlayers];
            const p = { ...newPlayers[next], tokens: [...newPlayers[next].tokens.map(t => ({ ...t }))] };
            const token = p.tokens[chosenToken];

            if (token.isHome && roll === 6) {
              token.position = 0;
              token.isHome = false;
            } else {
              token.position += roll;
              if (token.position >= 57) {
                token.position = 57;
                token.isFinished = true;
                p.finishedCount++;
                if (p.finishedCount >= 4) {
                  setGameOver(true);
                  setWinner(p.name);
                }
              }
            }

            newPlayers[next] = p;
            setPlayers(newPlayers);

            const gotExtra = roll === 6;
            if (gotExtra && !gameOver) {
              setMessage(`${p.name} rolled a 6! Extra turn.`);
              setTimeout(() => nextTurn(false, newPlayers), 800);
            } else if (!gameOver) {
              const nn2 = (next + 1) % 4;
              setCurrentPlayer(nn2);
              setHasRolled(false);
              setDiceValue(0);
              if (!newPlayers[nn2].isBot) setMessage("Your turn! Roll the dice.");
              else setTimeout(() => nextTurn(false, newPlayers), 500);
            }
          }, 600);
        }, 900);
      } else {
        setMessage("Your turn! Roll the dice.");
      }
    } else {
      setHasRolled(false);
      setDiceValue(0);
      setMessage("You rolled a 6! Roll again.");
    }
  }

  const rollDice = () => {
    if (hasRolled || isRolling || gameOver || players[currentPlayer].isBot) return;

    setIsRolling(true);
    let rollCount = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount > 8) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        setHasRolled(true);
        setIsRolling(false);

        const valid = getValidMoves(players[currentPlayer], finalRoll);
        if (valid.length === 0) {
          setMessage(`Rolled ${finalRoll} - no valid moves`);
          setTimeout(() => nextTurn(false, players), 1200);
        } else {
          setMessage(`Rolled ${finalRoll} - choose a token`);
        }
      }
    }, 60);
  };

  const moveToken = (tokenIndex: number) => {
    if (!hasRolled || gameOver || players[currentPlayer].isBot) return;

    const player = players[currentPlayer];
    const token = player.tokens[tokenIndex];

    if (token.isFinished) return;
    if (token.isHome && diceValue !== 6) return;
    if (!token.isHome && token.position + diceValue > 57) return;

    const newPlayers = [...players];
    const p = { ...newPlayers[currentPlayer], tokens: [...newPlayers[currentPlayer].tokens.map(t => ({ ...t }))] };
    const t = p.tokens[tokenIndex];

    if (t.isHome && diceValue === 6) {
      t.position = 0;
      t.isHome = false;
    } else {
      t.position += diceValue;
      if (t.position >= 57) {
        t.position = 57;
        t.isFinished = true;
        p.finishedCount++;
        if (p.finishedCount >= 4) {
          setGameOver(true);
          setWinner(p.name);
        }
      }
    }

    newPlayers[currentPlayer] = p;
    setPlayers(newPlayers);

    if (!gameOver) {
      const gotExtra = diceValue === 6;
      setTimeout(() => nextTurn(gotExtra, newPlayers), 500);
    }
  };

  const resetGame = () => {
    setPlayers([
      createPlayer(0, false, "You"),
      createPlayer(1, true, "Nova AI"),
      createPlayer(2, true, "Cipher AI"),
      createPlayer(3, true, "Pulse AI"),
    ]);
    setCurrentPlayer(0);
    setDiceValue(0);
    setHasRolled(false);
    setGameOver(false);
    setWinner("");
    setMessage("Roll the dice to start");
  };

  const DICE_FACES = ["", "1", "2", "3", "4", "5", "6"];

  return (
    <div className="flex-1 flex flex-col pt-20 px-8 pb-8 max-w-[1400px] mx-auto w-full">
      {/* Game Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 bg-base-800 hover:bg-base-700">
              <Link href="/games"><ChevronLeft className="w-4 h-4" /></Link>
            </Button>
            <div className="client-label">Ludo</div>
          </div>
          <h1 className="client-heading-1 text-4xl">4-Player Free-for-all</h1>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-3 bg-base-800/50 px-5 py-3 rounded-lg border border-white/5">
           <Activity className={cn("w-5 h-5", gameOver ? "text-accent-blue" : "text-text-muted animate-pulse")} />
           <span className="text-sm font-semibold text-white">{message}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12 items-start justify-center">
        
        {/* Game Area */}
        <div className="flex-1 flex flex-col items-center w-full max-w-[600px] mx-auto">
          
          {/* Ludo Board */}
          <div className="bg-base-800 p-4 rounded-2xl border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-full mb-8">
            <div className="grid grid-cols-2 gap-4">
              {players.map((player, pi) => (
                <div 
                  key={pi} 
                  className={cn(
                    "bg-base-900 rounded-xl p-4 border transition-colors duration-300",
                    currentPlayer === pi ? "border-white/20" : "border-white/5"
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[player.color] }} />
                      <span className={cn("text-sm font-bold", currentPlayer === pi ? "text-white" : "text-text-muted")}>
                        {player.name}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-text-muted bg-base-800 px-2 py-1 rounded">
                      {player.finishedCount}/4
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {player.tokens.map((token, ti) => {
                      const isMovable = currentPlayer === pi && !player.isBot && hasRolled && !token.isFinished &&
                        ((token.isHome && diceValue === 6) || (!token.isHome && token.position + diceValue <= 57));

                      return (
                        <button
                          key={ti}
                          onClick={() => isMovable && moveToken(ti)}
                          disabled={!isMovable}
                          className={cn(
                            "aspect-square rounded-lg flex items-center justify-center font-bold text-sm transition-all border-2",
                            token.isFinished ? "bg-base-800 border-transparent text-text-muted opacity-50" : 
                            token.isHome ? "bg-base-800 border-dashed border-white/10" : "bg-base-700",
                            isMovable ? "cursor-pointer ring-2 ring-accent-blue border-transparent hover:scale-105 shadow-lg" : "cursor-default"
                          )}
                          style={(!token.isHome && !token.isFinished) ? { borderColor: COLORS[player.color], color: COLORS[player.color] } : {}}
                        >
                          {token.isFinished ? "DONE" : token.isHome ? "HOME" : token.position}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dice & Controls */}
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={rollDice}
              disabled={hasRolled || isRolling || gameOver || players[currentPlayer].isBot}
              className={cn(
                "w-24 h-24 bg-base-800 rounded-2xl flex items-center justify-center text-6xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-white/5 transition-all",
                (!hasRolled && currentPlayer === 0 && !isRolling && !gameOver) ? "cursor-pointer hover:bg-base-700 hover:border-accent-blue/50 hover:-translate-y-1" : "opacity-70 cursor-not-allowed"
              )}
            >
               <motion.div
                 animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.1, 1] } : {}}
                 transition={{ duration: 0.3, repeat: isRolling ? Infinity : 0 }}
                 className={isRolling ? "text-accent-blue drop-shadow-[0_0_15px_rgba(0,212,255,0.5)]" : "text-white"}
               >
                 {diceValue ? DICE_FACES[diceValue] : "ROLL"}
               </motion.div>
            </button>
            
            {gameOver && (
              <Button onClick={resetGame} size="lg" className="h-14">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            )}
          </div>
          
          <AnimatePresence>
            {gameOver && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-center"
              >
                <div className="client-heading-2 text-accent-blue">
                  {winner === "You" ? "Victory!" : `${winner} wins!`}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Status (Desktop) */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          <div className="bg-base-800/30 rounded-xl border border-white/5 p-6 flex flex-col gap-4">
             <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                <Users className="w-4 h-4 text-text-muted" />
                <h3 className="text-sm font-semibold text-white">Player Status</h3>
             </div>
             {players.map((p, i) => (
               <div key={i} className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-base-800 flex items-center justify-center border border-white/5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[p.color] }} />
                   </div>
                   <div>
                     <div className={cn("text-sm font-bold", currentPlayer === i ? "text-white" : "text-text-muted")}>{p.name}</div>
                     <div className="text-[10px] text-text-muted uppercase font-semibold">Tokens: {p.finishedCount}/4</div>
                   </div>
                 </div>
                 {currentPlayer === i && (
                   <div className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
                 )}
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
}
