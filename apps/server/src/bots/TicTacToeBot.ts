// ============================================================
// Tic Tac Toe Bot AI
// Implements Minimax with alpha-beta pruning
// ============================================================

export class TicTacToeBot {
  private difficulty: string;
  private mistakeRate: number;

  constructor(difficulty: string = 'medium') {
    this.difficulty = difficulty;

    // Mistake rate determines how often the bot makes a suboptimal move
    switch (difficulty) {
      case 'easy':
        this.mistakeRate = 0.7; // 70% random moves
        break;
      case 'medium':
        this.mistakeRate = 0.35; // 35% random moves
        break;
      case 'hard':
        this.mistakeRate = 0.1; // 10% random moves
        break;
      case 'expert':
        this.mistakeRate = 0; // Perfect play
        break;
      case 'adaptive':
        this.mistakeRate = 0.25; // Starts medium, adapts
        break;
      default:
        this.mistakeRate = 0.35;
    }
  }

  getThinkingDelay(): number {
    // Simulate realistic thinking time
    switch (this.difficulty) {
      case 'easy':
        return 400 + Math.random() * 600;
      case 'medium':
        return 600 + Math.random() * 1000;
      case 'hard':
        return 800 + Math.random() * 1200;
      case 'expert':
        return 1000 + Math.random() * 1500;
      default:
        return 500 + Math.random() * 1000;
    }
  }

  chooseMove(board: string[], botSymbol: string): number {
    const availableMoves = this.getAvailableMoves(board);
    if (availableMoves.length === 0) return -1;

    // Random move based on mistake rate
    if (Math.random() < this.mistakeRate) {
      return this.getSmartRandomMove(board, botSymbol, availableMoves);
    }

    // Optimal move via minimax
    return this.getBestMove(board, botSymbol);
  }

  private getAvailableMoves(board: string[]): number[] {
    return board.reduce<number[]>((moves, cell, index) => {
      if (cell === '') moves.push(index);
      return moves;
    }, []);
  }

  private getSmartRandomMove(board: string[], botSymbol: string, available: number[]): number {
    const opponent = botSymbol === 'X' ? 'O' : 'X';

    // Even on "random" moves, always block an immediate win or take a win
    // Check if bot can win
    for (const move of available) {
      board[move] = botSymbol;
      if (this.checkWinner(board) === botSymbol) {
        board[move] = '';
        return move;
      }
      board[move] = '';
    }

    // Check if need to block opponent
    for (const move of available) {
      board[move] = opponent;
      if (this.checkWinner(board) === opponent) {
        board[move] = '';
        return move;
      }
      board[move] = '';
    }

    // Otherwise random
    // Prefer center > corners > edges
    const center = 4;
    const corners = [0, 2, 6, 8];
    const edges = [1, 3, 5, 7];

    if (available.includes(center)) return center;

    const availableCorners = corners.filter(c => available.includes(c));
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    const availableEdges = edges.filter(e => available.includes(e));
    return availableEdges[Math.floor(Math.random() * availableEdges.length)];
  }

  private getBestMove(board: string[], botSymbol: string): number {
    const opponent = botSymbol === 'X' ? 'O' : 'X';
    let bestScore = -Infinity;
    let bestMove = -1;

    const available = this.getAvailableMoves(board);

    for (const move of available) {
      board[move] = botSymbol;
      const score = this.minimax(board, 0, false, botSymbol, opponent, -Infinity, Infinity);
      board[move] = '';

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private minimax(
    board: string[],
    depth: number,
    isMaximizing: boolean,
    botSymbol: string,
    opponent: string,
    alpha: number,
    beta: number,
  ): number {
    const winner = this.checkWinner(board);
    if (winner === botSymbol) return 10 - depth;
    if (winner === opponent) return depth - 10;
    if (this.getAvailableMoves(board).length === 0) return 0;

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const move of this.getAvailableMoves(board)) {
        board[move] = botSymbol;
        const score = this.minimax(board, depth + 1, false, botSymbol, opponent, alpha, beta);
        board[move] = '';
        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break;
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const move of this.getAvailableMoves(board)) {
        board[move] = opponent;
        const score = this.minimax(board, depth + 1, true, botSymbol, opponent, alpha, beta);
        board[move] = '';
        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        if (beta <= alpha) break;
      }
      return minScore;
    }
  }

  private checkWinner(board: string[]): string | null {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }
}
