// ============================================================
// Chess Bot AI
// Minimax with alpha-beta pruning and piece-square tables
// ============================================================

// Piece values
const PIECE_VALUES: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
};

// Piece-square tables (from white's perspective; flip for black)
const PST: Record<string, number[]> = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  r: [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0,
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20,
  ],
  k: [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20,
  ],
};

function squareToIndex(square: string): number {
  const file = square.charCodeAt(0) - 97; // a=0, h=7
  const rank = parseInt(square[1]) - 1;   // 1=0, 8=7
  return (7 - rank) * 8 + file;
}

export class ChessBot {
  private difficulty: string;
  private maxDepth: number;
  private mistakeRate: number;

  constructor(difficulty: string = 'medium') {
    this.difficulty = difficulty;

    switch (difficulty) {
      case 'easy':
        this.maxDepth = 1;
        this.mistakeRate = 0.4;
        break;
      case 'medium':
        this.maxDepth = 2;
        this.mistakeRate = 0.15;
        break;
      case 'hard':
        this.maxDepth = 3;
        this.mistakeRate = 0.05;
        break;
      case 'expert':
        this.maxDepth = 4;
        this.mistakeRate = 0;
        break;
      default:
        this.maxDepth = 2;
        this.mistakeRate = 0.15;
    }
  }

  getThinkingDelay(): number {
    switch (this.difficulty) {
      case 'easy': return 500 + Math.random() * 1000;
      case 'medium': return 800 + Math.random() * 1500;
      case 'hard': return 1000 + Math.random() * 2000;
      case 'expert': return 1500 + Math.random() * 2500;
      default: return 800 + Math.random() * 1500;
    }
  }

  chooseMove(chess: any): { from: string; to: string; promotion?: string } | null {
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return null;

    // Random mistake
    if (Math.random() < this.mistakeRate) {
      // Pick a "reasonable" random move (captures preferred)
      const captures = moves.filter((m: any) => m.captured);
      if (captures.length > 0 && Math.random() < 0.6) {
        const move = captures[Math.floor(Math.random() * captures.length)];
        return { from: move.from, to: move.to, promotion: move.promotion };
      }
      const move = moves[Math.floor(Math.random() * moves.length)];
      return { from: move.from, to: move.to, promotion: move.promotion };
    }

    // Find best move via minimax
    let bestMove = moves[0];
    let bestScore = -Infinity;
    const isWhite = chess.turn() === 'w';

    for (const move of moves) {
      chess.move(move);
      const score = -this.minimax(chess, this.maxDepth - 1, -Infinity, Infinity, !isWhite);
      chess.undo();

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return { from: bestMove.from, to: bestMove.to, promotion: bestMove.promotion };
  }

  private minimax(chess: any, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    if (depth === 0 || chess.isGameOver()) {
      return this.evaluate(chess, isMaximizing);
    }

    const moves = chess.moves({ verbose: true });

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        chess.move(move);
        const evalScore = this.minimax(chess, depth - 1, alpha, beta, false);
        chess.undo();
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        chess.move(move);
        const evalScore = this.minimax(chess, depth - 1, alpha, beta, true);
        chess.undo();
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  private evaluate(chess: any, _isWhitePerspective: boolean): number {
    if (chess.isCheckmate()) {
      return chess.turn() === 'w' ? -99999 : 99999;
    }
    if (chess.isDraw() || chess.isStalemate()) return 0;

    let score = 0;
    const board = chess.board();

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (!piece) continue;

        const pieceValue = PIECE_VALUES[piece.type] || 0;
        const pstIndex = piece.color === 'w' ? rank * 8 + file : (7 - rank) * 8 + file;
        const pstValue = PST[piece.type]?.[pstIndex] || 0;

        if (piece.color === 'w') {
          score += pieceValue + pstValue;
        } else {
          score -= pieceValue + pstValue;
        }
      }
    }

    // Mobility bonus
    const mobility = chess.moves().length;
    score += (chess.turn() === 'w' ? 1 : -1) * mobility * 2;

    return score;
  }
}
