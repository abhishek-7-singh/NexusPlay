// ============================================================
// Card Blast Bot AI
// Strategic card play with color analysis
// ============================================================

export class CardBlastBot {
  private difficulty: string;

  constructor(difficulty: string = 'medium') {
    this.difficulty = difficulty;
  }

  chooseCard(playableCards: any[], currentColor: string, fullHand: any[]): any {
    if (playableCards.length === 1) return playableCards[0];

    // Easy: random
    if (this.difficulty === 'easy') {
      return playableCards[Math.floor(Math.random() * playableCards.length)];
    }

    // Score each card
    const scored = playableCards.map((card) => {
      let score = 0;

      // Prefer playing color cards over wild (save wild for later)
      if (card.color !== 'wild') {
        score += 10;
        if (card.color === currentColor) score += 5;
      }

      // Prefer special cards (higher impact)
      if (card.value === 'draw2') score += 15;
      if (card.value === 'skip') score += 12;
      if (card.value === 'reverse') score += 8;
      if (card.value === 'wild4') score += 20;

      // Prefer higher number cards (get rid of high points first)
      const numVal = parseInt(card.value);
      if (!isNaN(numVal)) score += numVal;

      // Play cards that match the most common color in hand
      const colorCounts = this.getColorCounts(fullHand);
      if (card.color !== 'wild' && colorCounts[card.color]) {
        score += colorCounts[card.color] * 3;
      }

      // Add difficulty-based randomness
      const noise = this.difficulty === 'medium' ? 10 : this.difficulty === 'hard' ? 3 : 0;
      score += Math.random() * noise;

      return { card, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0].card;
  }

  chooseColor(hand: any[]): string {
    const counts = this.getColorCounts(hand);
    let maxCount = 0;
    let bestColor = 'red';

    for (const [color, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        bestColor = color;
      }
    }

    return bestColor;
  }

  private getColorCounts(hand: any[]): Record<string, number> {
    const counts: Record<string, number> = { red: 0, blue: 0, green: 0, yellow: 0 };
    hand.forEach((card) => {
      if (card.color !== 'wild' && counts[card.color] !== undefined) {
        counts[card.color]++;
      }
    });
    return counts;
  }
}
