"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Chess, Move, Square } from "chess.js";
import { Activity, ChevronLeft, RefreshCcw, Settings2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Difficulty = "easy" | "medium" | "hard";

const PIECE_SYMBOLS: Record<string, string> = {
  p: "p",
  n: "n",
  b: "b",
  r: "r",
  q: "q",
  k: "k",
  P: "P",
  N: "N",
  B: "B",
  R: "R",
  Q: "Q",
  K: "K",
};

const boardRows = ["8", "7", "6", "5", "4", "3", "2", "1"];
const boardCols = ["a", "b", "c", "d", "e", "f", "g", "h"];

export default function ChessPage() {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
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
      setStatus("Check.");
    } else {
      setStatus(game.turn() === "w" ? "Your turn (White)" : "Bot is thinking...");
    }
  }, [game]);

  const makeBotMove = useCallback(() => {
    if (game.isGameOver()) return;

    window.setTimeout(() => {
      const moves = game.moves({ verbose: true });
      if (moves.length === 0) return;

      const checks = moves.filter((move) => move.san.includes("+"));
      const captures = moves.filter((move) => move.captured);
      const promotions = moves.filter((move) => move.promotion);
      const pool =
        difficulty === "hard" && checks.length > 0
          ? checks
          : difficulty === "hard" && promotions.length > 0
            ? promotions
            : difficulty !== "easy" && captures.length > 0
              ? captures
              : moves;

      game.move(pool[Math.floor(Math.random() * pool.length)]);
      updateGameState();
    }, 650);
  }, [difficulty, game, updateGameState]);

  useEffect(() => {
    if (game.turn() === "b" && !gameOver) {
      makeBotMove();
    }
  }, [fen, game, gameOver, makeBotMove]);

  const handleSquareClick = (square: Square) => {
    if (gameOver || game.turn() === "b") return;

    if (selectedSquare) {
      const move = validMoves.find((candidate) => candidate.to === square);
      if (move) {
        game.move({ from: selectedSquare, to: square, promotion: move.promotion ? "q" : undefined });
        setSelectedSquare(null);
        setValidMoves([]);
        updateGameState();
        return;
      }
    }

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
  };

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-6 py-10">
      <div className="mb-8 flex flex-col justify-between gap-6 border-b border-white/5 pb-6 md:flex-row md:items-end">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 bg-base-800 hover:bg-base-700">
              <Link href="/games"><ChevronLeft className="h-4 w-4" /></Link>
            </Button>
            <div className="client-label">Chess</div>
          </div>
          <h1 className="client-heading-1 text-4xl">Bot Practice</h1>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-base-800/50 px-5 py-3">
          <Activity className={cn("h-5 w-5", gameOver ? "text-red-400" : game.turn() === "w" ? "text-accent-blue" : "animate-pulse text-text-muted")} />
          <span className="text-sm font-semibold text-white">{status}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-start justify-center gap-12 lg:flex-row">
        <div className="mx-auto flex w-full max-w-[600px] flex-1 flex-col items-center">
          <div className="mb-4 flex w-full items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-white/5 bg-base-800 text-xs font-black text-text-secondary">AI</div>
            <div>
              <div className="text-sm font-bold text-white">Stockfish Lite</div>
              <div className="text-xs text-text-muted">Rating: 1400 - Level: {difficulty}</div>
            </div>
          </div>

          <div className="flex aspect-square max-h-[600px] w-full flex-col rounded-xl border border-white/5 bg-base-800 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.5)] sm:p-4">
            {boardRows.map((row, rowIndex) => (
              <div key={row} className="flex w-full flex-1">
                {boardCols.map((col, colIndex) => {
                  const square = `${col}${row}` as Square;
                  const piece = game.get(square);
                  const isLight = (rowIndex + colIndex) % 2 === 0;
                  const isSelected = selectedSquare === square;
                  const isValidMove = validMoves.some((move) => move.to === square);

                  return (
                    <button
                      key={square}
                      onClick={() => handleSquareClick(square)}
                      className={cn(
                        "relative flex flex-1 select-none items-center justify-center text-2xl font-black uppercase transition-colors sm:text-4xl",
                        isLight ? "bg-[#cfd0ce]" : "bg-[#6c7b64]",
                        isSelected && "ring-4 ring-inset ring-accent-blue/60",
                        isValidMove && !piece && "after:h-4 after:w-4 after:rounded-full after:bg-black/25 after:content-['']",
                        isValidMove && piece && "ring-4 ring-inset ring-black/25",
                      )}
                    >
                      {piece && (
                        <span className={piece.color === "w" ? "text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" : "text-black"}>
                          {PIECE_SYMBOLS[piece.color === "w" ? piece.type.toUpperCase() : piece.type]}
                        </span>
                      )}
                      {colIndex === 0 && <span className={cn("absolute left-1 top-1 text-[10px] font-bold", isLight ? "text-[#6c7b64]" : "text-[#cfd0ce]")}>{row}</span>}
                      {rowIndex === 7 && <span className={cn("absolute bottom-1 right-1 text-[10px] font-bold", isLight ? "text-[#6c7b64]" : "text-[#cfd0ce]")}>{col}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-4 flex w-full items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <img src="https://api.dicebear.com/9.x/bottts-neutral/svg?seed=ProGamer42" alt="User" className="h-10 w-10 rounded-md border border-white/5 bg-base-800" />
              <div>
                <div className="text-sm font-bold text-white">ProGamer42 (You)</div>
                <div className="text-xs text-text-muted">Rating: 1250</div>
              </div>
            </div>

            {gameOver && (
              <Button onClick={resetGame} variant="secondary" size="sm">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Rematch
              </Button>
            )}
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-6 lg:w-80">
          <div className="rounded-xl border border-white/5 bg-base-800/30 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-text-muted" />
              <h3 className="text-sm font-semibold text-white">Match Settings</h3>
            </div>
            <label className="client-label mb-3 block">AI Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setDifficulty(level);
                    resetGame();
                  }}
                  className={cn(
                    "rounded-md border px-2 py-2 text-xs font-semibold capitalize transition-all",
                    difficulty === level
                      ? "border-white bg-white text-base-900"
                      : "border-white/5 bg-base-800 text-text-secondary hover:bg-base-700 hover:text-white",
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="flex min-h-[300px] flex-1 flex-col overflow-hidden rounded-xl border border-white/5 bg-base-800/30">
            <div className="flex items-center gap-2 border-b border-white/5 bg-base-800/50 p-4">
              <Shield className="h-4 w-4 text-text-muted" />
              <h3 className="text-sm font-semibold text-white">Move History</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 text-sm font-medium text-text-secondary">
              {moveHistory.length === 0 ? (
                <div className="py-8 text-center text-text-muted">No moves yet</div>
              ) : (
                <div className="space-y-2">
                  {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, index) => (
                    <div key={index} className="grid grid-cols-[32px_1fr_1fr] gap-3">
                      <span className="text-text-muted">{index + 1}.</span>
                      <span className="text-white">{moveHistory[index * 2]}</span>
                      <span className="text-white">{moveHistory[index * 2 + 1] ?? ""}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
