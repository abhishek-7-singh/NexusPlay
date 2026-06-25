"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Chess, Square, Move } from "chess.js";
import { ChevronLeft, RefreshCcw, Settings2, Activity, Shield, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================================
// Chess Redesign — Premium Client Aesthetic
// ============================================================

type Difficulty = "easy" | "medium" | "hard";

const PIECE_SYMBOLS: Record<string, string> = {
  p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚",
  P: "♙", N: "♘", B: "♗", R: "♖", Q: "♕", K: "♔",
};

export default function ChessPage() {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState("Your turn (White)");

  const updateGameState = useCallback(() => {
    setFen(game.fen());
    setMoveHistory(game.history());

    if (game.isCheckmate()) {
      setStatus(`Checkmate! ${game.turn() === "w" ? "Black" : "White"} wins.`);
      setGameOver(true);
    } else if (game.isDraw()) {
      setStatus("Game drawn.");
      setGameOver(true);
    } else if (game.isCheck()) {
      setStatus("Check!");
    } else {
      setStatus(game.turn() === "w" ? "Your turn (White)" : "Bot is thinking...");
    }
  }, [game]);

  const makeBotMove = useCallback(() => {
    if (game.isGameOver()) return;
    setIsBotThinking(true);

    setTimeout(() => {
      const moves = game.moves({ verbose: true });
      if (moves.length === 0) return;

      // Simple random bot for demonstration to keep code size small, 
      // can be enhanced with Minimax later
      const move = moves[Math.floor(Math.random() * moves.length)];
      game.move(move);
      updateGameState();
      setIsBotThinking(false);
    }, 600);
  }, [game, updateGameState]);

  useEffect(() => {
    if (game.turn() === "b" && !gameOver) {
      makeBotMove();
    }
  }, [fen, game, gameOver, makeBotMove]);

  const handleSquareClick = (square: Square) => {
    if (gameOver || game.turn() === "b") return;

    // If already selected, try to move
    if (selectedSquare) {
      const move = validMoves.find((m) => m.to === square);
      if (move) {
        // Handle promotion automatically to Queen for simplicity
        if (move.promotion) {
          game.move({ from: selectedSquare, to: square, promotion: "q" });
        } else {
          game.move({ from: selectedSquare, to: square });
        }
        setSelectedSquare(null);
        setValidMoves([]);
        updateGameState();
        return;
      }
    }

    // Select piece
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      setValidMoves(game.moves({ square, verbose: true }));
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setSelectedSquare(null);
    setValidMoves([]);
    setMoveHistory([]);
    setGameOver(false);
    setStatus("Your turn (White)");
    setIsBotThinking(false);
  };

  const boardRows = ["8", "7", "6", "5", "4", "3", "2", "1"];
  const boardCols = ["a", "b", "c", "d", "e", "f", "g", "h"];

  return (
    <div className="flex-1 flex flex-col pt-20 px-8 pb-8 max-w-[1400px] mx-auto w-full">
      {/* Game Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 bg-base-800 hover:bg-base-700">
              <Link href="/games"><ChevronLeft className="w-4 h-4" /></Link>
            </Button>
            <div className="client-label">Chess</div>
          </div>
          <h1 className="client-heading-1 text-4xl">Grandmaster AI</h1>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-3 bg-base-800/50 px-5 py-3 rounded-lg border border-white/5">
           <Activity className={cn("w-5 h-5", gameOver ? "text-red-500" : game.turn() === 'w' ? "text-accent-blue" : "text-text-muted animate-pulse")} />
           <span className="text-sm font-semibold text-white">{status}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12 items-start justify-center">
        
        {/* Game Board Area */}
        <div className="flex-1 flex flex-col items-center w-full max-w-[600px] mx-auto">
          
          {/* Opponent Profile */}
          <div className="w-full flex items-center gap-3 mb-4 px-2">
             <div className="w-10 h-10 rounded-md bg-base-800 border border-white/5 flex items-center justify-center">
               🤖
             </div>
             <div>
               <div className="text-sm font-bold text-white">Stockfish Lite</div>
               <div className="text-xs text-text-muted">Rating: 1400 • Level: {difficulty}</div>
             </div>
          </div>

          {/* The Board */}
          <div className="bg-base-800 p-3 sm:p-4 rounded-xl border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-full aspect-square max-h-[600px] flex flex-col">
            {boardRows.map((row, rIndex) => (
              <div key={row} className="flex-1 flex w-full">
                {boardCols.map((col, cIndex) => {
                  const square = `${col}${row}` as Square;
                  const piece = game.get(square);
                  const isLight = (rIndex + cIndex) % 2 === 0;
                  const isSelected = selectedSquare === square;
                  const isLastMove = moveHistory.length > 0 && false; // simplification
                  const isValidMove = validMoves.some((m) => m.to === square);

                  return (
                    <button
                      key={square}
                      onClick={() => handleSquareClick(square)}
                      className={cn(
                        "flex-1 relative flex items-center justify-center text-3xl sm:text-5xl transition-colors select-none",
                        isLight ? "bg-[#cfd0ce]" : "bg-[#6c7b64]",
                        isSelected && "ring-inset ring-4 ring-accent-blue/60 bg-accent-blue/30",
                        isValidMove && !piece && "after:content-[''] after:w-4 after:h-4 after:rounded-full after:bg-black/20",
                        isValidMove && piece && "ring-inset ring-4 ring-black/20"
                      )}
                    >
                      {piece && (
                        <span className={cn(
                          "cursor-pointer drop-shadow-md",
                          piece.color === "w" ? "text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" : "text-black"
                        )}>
                          {PIECE_SYMBOLS[piece.color === 'w' ? piece.type.toUpperCase() : piece.type]}
                        </span>
                      )}
                      
                      {/* Coordinates (bottom-right edge) */}
                      {cIndex === 0 && <span className={cn("absolute top-1 left-1 text-[10px] font-bold", isLight ? "text-[#6c7b64]" : "text-[#cfd0ce]")}>{row}</span>}
                      {rIndex === 7 && <span className={cn("absolute bottom-1 right-1 text-[10px] font-bold", isLight ? "text-[#6c7b64]" : "text-[#cfd0ce]")}>{col}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Player Profile */}
          <div className="w-full flex items-center justify-between mt-4 px-2">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-md bg-base-800 border border-white/5 overflow-hidden">
                 <img src="https://api.dicebear.com/9.x/bottts-neutral/svg?seed=ProGamer42" alt="User" className="w-full h-full" />
               </div>
               <div>
                 <div className="text-sm font-bold text-white">ProGamer42 (You)</div>
                 <div className="text-xs text-text-muted">Rating: 1250</div>
               </div>
             </div>
             
             {gameOver && (
                <Button onClick={resetGame} variant="secondary" size="sm">
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Rematch
                </Button>
             )}
          </div>
        </div>

        {/* Sidebar Data (Desktop) */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          
          {/* Match Settings */}
          <div className="bg-base-800/30 rounded-xl border border-white/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-4 h-4 text-text-muted" />
              <h3 className="text-sm font-semibold text-white">Match Settings</h3>
            </div>
            <div>
              <label className="client-label mb-3 block">AI Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => { setDifficulty(level); resetGame(); }}
                    className={cn(
                      "px-2 py-2 rounded-md text-xs font-semibold capitalize transition-all border",
                      difficulty === level 
                        ? "bg-white text-base-900 border-white" 
                        : "bg-base-800 text-text-secondary border-white/5 hover:bg-base-700 hover:text-white"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Move History */}
          <div className="bg-base-800/30 rounded-xl border border-white/5 p-0 flex-1 min-h-[300px] flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b border-white/5 bg-base-800/50">
              <Shield className="w-4 h-4 text-text-muted" />
              <h3 className="text-sm font-semibold text-white">Move History</h3>
            </div>
            <div className="p-4 overflow-y-auto flex-1 text-sm font-medium text-text-secondary">
              {moveHistory.length === 0 ? (
                <div className="text-text-muted text-center py-8">No moves yet</div>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {moveHistory.map((move, i) => {
                    if (i % 2 === 0) {
                      return (
                        <div key={i} className="flex gap-4">
                          <span className="text-text-muted w-4">{Math.floor(i / 2) + 1}.</span>
                          <span className="text-white">{move}</span>
                          {moveHistory[i + 1] && (
                            <span className="text-white">{moveHistory[i + 1]}</span>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
