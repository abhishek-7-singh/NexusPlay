"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, RefreshCcw, Activity, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// ============================================================
// Tic Tac Toe Redesign — Premium Client Aesthetic
// ============================================================

type Player = "X" | "O" | null;
type Difficulty = "easy" | "medium" | "hard" | "impossible";

export default function TicTacToePage() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<Player | "Draw">(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("hard");
  const [score, setScore] = useState({ player: 0, bot: 0, draws: 0 });

  const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  const checkWinner = (squares: Player[]): { winner: Player | "Draw", line: number[] | null } | null => {
    for (let i = 0; i < WIN_LINES.length; i++) {
      const [a, b, c] = WIN_LINES[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: WIN_LINES[i] };
      }
    }
    if (!squares.includes(null)) return { winner: "Draw", line: null };
    return null;
  };

  const minimax = (squares: Player[], depth: number, isMaximizing: boolean, alpha: number, beta: number): number => {
    const result = checkWinner(squares);
    if (result?.winner === "O") return 10 - depth;
    if (result?.winner === "X") return depth - 10;
    if (result?.winner === "Draw") return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < squares.length; i++) {
        if (!squares[i]) {
          squares[i] = "O";
          const score = minimax(squares, depth + 1, false, alpha, beta);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
          alpha = Math.max(alpha, score);
          if (beta <= alpha) break;
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < squares.length; i++) {
        if (!squares[i]) {
          squares[i] = "X";
          const score = minimax(squares, depth + 1, true, alpha, beta);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
          beta = Math.min(beta, score);
          if (beta <= alpha) break;
        }
      }
      return bestScore;
    }
  };

  const getBotMove = (squares: Player[]): number => {
    const available = squares.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];

    const boardSignature = squares.reduce((total, value, index) => {
      const weight = value === "X" ? 3 : value === "O" ? 7 : 1;
      return total + weight * (index + 1);
    }, 0);

    if (difficulty === "easy" || (difficulty === "medium" && boardSignature % 5 > 2) || (difficulty === "hard" && boardSignature % 7 === 0)) {
      return available[boardSignature % available.length];
    }

    let bestScore = -Infinity;
    let move = available[0];

    for (let i = 0; i < squares.length; i++) {
      if (!squares[i]) {
        squares[i] = "O";
        const score = minimax(squares, 0, false, -Infinity, Infinity);
        squares[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  const handleClick = (index: number) => {
    if (board[index] || winner || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    setIsPlayerTurn(false);

    const result = checkWinner(newBoard);
    if (result) {
      handleGameOver(result);
      return;
    }

    // Bot turn
    setTimeout(() => {
      const botMove = getBotMove(newBoard);
      const botBoard = [...newBoard];
      botBoard[botMove] = "O";
      setBoard(botBoard);
      
      const botResult = checkWinner(botBoard);
      if (botResult) {
        handleGameOver(botResult);
      } else {
        setIsPlayerTurn(true);
      }
    }, 500);
  };

  const handleGameOver = (result: { winner: Player | "Draw", line: number[] | null }) => {
    setWinner(result.winner);
    setWinningLine(result.line);
    if (result.winner === "X") setScore(s => ({ ...s, player: s.player + 1 }));
    else if (result.winner === "O") setScore(s => ({ ...s, bot: s.bot + 1 }));
    else setScore(s => ({ ...s, draws: s.draws + 1 }));
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine(null);
    setIsPlayerTurn(true);
  };

  return (
    <div className="flex-1 flex flex-col pt-20 px-8 pb-8 max-w-[1400px] mx-auto w-full">
      {/* Game Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 bg-base-800 hover:bg-base-700">
              <Link href="/games"><ChevronLeft className="w-4 h-4" /></Link>
            </Button>
            <div className="client-label">Tic Tac Toe</div>
          </div>
          <h1 className="client-heading-1 text-4xl">Human vs AI</h1>
        </div>

        {/* Score & Settings Panel */}
        <div className="flex items-center gap-4 bg-base-800/50 p-2 rounded-lg border border-white/5">
          <div className="px-4 py-2 flex flex-col items-center">
            <span className="text-xs text-text-muted font-semibold uppercase mb-1">You (X)</span>
            <span className="text-xl font-display font-bold text-white">{score.player}</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="px-4 py-2 flex flex-col items-center">
            <span className="text-xs text-text-muted font-semibold uppercase mb-1">Draw</span>
            <span className="text-xl font-display font-bold text-text-secondary">{score.draws}</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="px-4 py-2 flex flex-col items-center">
            <span className="text-xs text-text-muted font-semibold uppercase mb-1">Bot (O)</span>
            <span className="text-xl font-display font-bold text-white">{score.bot}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12 items-start justify-center">
        
        {/* Game Board Area */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[600px] mx-auto">
          
          {/* Status Indicator */}
          <div className="flex items-center gap-3 mb-8 bg-base-800/80 px-4 py-2 rounded-full border border-white/5 shadow-sm">
            {winner ? (
              <>
                <Activity className="w-4 h-4 text-accent-cyan" />
                <span className="text-sm font-semibold text-white">
                  {winner === "Draw" ? "Game Drawn!" : `${winner === "X" ? "You won!" : "Bot won!"}`}
                </span>
              </>
            ) : (
              <>
                <div className={`w-2 h-2 rounded-full ${isPlayerTurn ? "bg-accent-blue" : "bg-red-500"} animate-pulse`} />
                <span className="text-sm font-medium text-text-secondary">
                  {isPlayerTurn ? "Your Turn" : "Bot is thinking..."}
                </span>
              </>
            )}
          </div>

          {/* The Board */}
          <div className="bg-base-800 p-2 sm:p-4 rounded-2xl border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-base-900 rounded-xl overflow-hidden p-2 sm:p-3">
              {board.map((cell, i) => {
                const isWinningCell = winningLine?.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => handleClick(i)}
                    disabled={!!cell || !!winner || !isPlayerTurn}
                    className={`
                      w-24 h-24 sm:w-32 sm:h-32 bg-base-800 rounded-lg flex items-center justify-center
                      transition-all duration-200 text-5xl sm:text-6xl font-display font-black
                      ${!cell && !winner && isPlayerTurn ? "hover:bg-base-700 cursor-pointer hover:shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]" : "cursor-default"}
                      ${isWinningCell ? "bg-base-700 border border-white/10" : "border border-transparent"}
                    `}
                  >
                    <AnimatePresence>
                      {cell && (
                        <motion.span
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className={cell === "X" ? "text-white" : "text-text-muted"}
                        >
                          {cell}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-10 h-12">
            <AnimatePresence>
              {winner && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Button onClick={resetGame} size="lg" className="w-48 shadow-[0_0_30px_rgba(0,212,255,0.15)]">
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Play Again
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Settings (Desktop) */}
        <div className="w-full lg:w-80 bg-base-800/30 rounded-xl border border-white/5 p-6 shrink-0">
          <div className="flex items-center gap-2 mb-6">
            <Settings2 className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-semibold text-white">Match Settings</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="client-label mb-3 block">AI Difficulty</label>
              <div className="grid grid-cols-2 gap-2">
                {(["easy", "medium", "hard", "impossible"] as Difficulty[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => { setDifficulty(level); resetGame(); }}
                    className={`
                      px-3 py-2 rounded-md text-xs font-semibold capitalize transition-all border
                      ${difficulty === level 
                        ? "bg-white text-base-900 border-white" 
                        : "bg-base-800 text-text-secondary border-white/5 hover:bg-base-700 hover:text-white"
                      }
                    `}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-text-muted mt-3">
                {difficulty === "easy" && "Bot plays randomly most of the time."}
                {difficulty === "medium" && "Bot makes some smart moves but makes mistakes."}
                {difficulty === "hard" && "Bot rarely makes mistakes."}
                {difficulty === "impossible" && "Minimax algorithm. You cannot win."}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
