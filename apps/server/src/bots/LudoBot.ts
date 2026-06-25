// ============================================================
// Ludo Bot AI
// Heuristic-based with personality traits
// ============================================================

export class LudoBot {
  private difficulty: string;
  private personality: string;

  constructor(difficulty: string = 'medium') {
    this.difficulty = difficulty;
    const personalities = ['aggressive', 'defensive', 'balanced', 'strategic'];
    this.personality = personalities[Math.floor(Math.random() * personalities.length)];
  }

  chooseToken(
    ludoPlayer: any,
    diceValue: number,
    validMoves: number[],
    _gameState: any,
  ): number {
    if (validMoves.length === 1) return validMoves[0];

    // Easy mode: random valid move
    if (this.difficulty === 'easy') {
      return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    // Score each valid move
    const scores = validMoves.map((tokenIdx) => {
      const token = ludoPlayer.tokens[tokenIdx];
      let score = 0;

      // Move out of home (high priority when rolling 6)
      if (token.isHome && diceValue === 6) {
        score += this.personality === 'aggressive' ? 80 : 60;
      }

      if (!token.isHome && !token.isFinished) {
        const newPos = token.position + diceValue;

        // Reaching home (highest priority)
        if (newPos === 52 + 6) {
          score += 200;
        }

        // Getting into home stretch
        if (newPos >= 52 && token.position < 52) {
          score += 100;
        }

        // Progress toward home
        score += newPos * 2;

        // Moving pieces that are further back (strategic)
        if (this.personality === 'strategic') {
          score += (52 - token.position); // Prefer moving lagging pieces
        }

        // Aggressive: prefer moves that might capture
        if (this.personality === 'aggressive') {
          score += 20; // Favor advancing
        }

        // Defensive: prefer safe squares
        const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];
        const absoluteNewPos = (newPos) % 52;
        if (SAFE_SQUARES.includes(absoluteNewPos)) {
          score += this.personality === 'defensive' ? 50 : 25;
        }

        // Being on an unsafe square with enemies nearby (move away)
        if (this.personality === 'defensive') {
          const currentAbsPos = token.position % 52;
          if (!SAFE_SQUARES.includes(currentAbsPos)) {
            score += 15; // Incentive to move
          }
        }
      }

      // Add some randomness based on difficulty
      const randomFactor = this.difficulty === 'medium' ? 20 : this.difficulty === 'hard' ? 5 : 0;
      score += Math.random() * randomFactor;

      return { tokenIdx, score };
    });

    // Return the highest scoring move
    scores.sort((a, b) => b.score - a.score);
    return scores[0].tokenIdx;
  }
}
