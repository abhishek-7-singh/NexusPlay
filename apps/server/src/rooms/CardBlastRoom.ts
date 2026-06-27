import { Client } from 'colyseus';
import { Schema, type, ArraySchema, MapSchema } from '@colyseus/schema';
import { BaseGameRoom, BaseGameState } from './BaseGameRoom';
import { CardBlastBot } from '../bots/CardBlastBot';

// ============================================================
// Card State
// ============================================================

export class CardState extends Schema {
  @type('string') id: string = '';
  @type('string') color: string = ''; // red, blue, green, yellow, wild
  @type('string') value: string = ''; // 0-9, skip, reverse, draw2, wild, wild4
  @type('boolean') isPlayable: boolean = false;
}

export class CardPlayerState extends Schema {
  @type('string') id: string = '';
  @type('number') cardCount: number = 0;
  @type([CardState]) hand = new ArraySchema<CardState>();
  @type('boolean') calledUno: boolean = false;
  @type('number') score: number = 0;
}

export class CardBlastGameState extends BaseGameState {
  @type({ map: CardPlayerState }) cardPlayers = new MapSchema<CardPlayerState>();
  @type(CardState) topCard: CardState = new CardState();
  @type('string') currentColor: string = '';
  @type('number') drawPile: number = 0;
  @type('boolean') isReversed: boolean = false;
  @type('number') pendingDrawCards: number = 0;
  @type(['string']) playerOrder = new ArraySchema<string>();
  @type('number') turnIndex: number = 0;
}

// ============================================================
// Deck Generation
// ============================================================
const COLORS = ['red', 'blue', 'green', 'yellow'];

function createDeck(): { color: string; value: string }[] {
  const deck: { color: string; value: string }[] = [];

  for (const color of COLORS) {
    // One zero per color
    deck.push({ color, value: '0' });
    // Two of each 1-9, skip, reverse, draw2
    for (let i = 0; i < 2; i++) {
      for (let n = 1; n <= 9; n++) {
        deck.push({ color, value: String(n) });
      }
      deck.push({ color, value: 'skip' });
      deck.push({ color, value: 'reverse' });
      deck.push({ color, value: 'draw2' });
    }
  }

  // 4 wild, 4 wild4
  for (let i = 0; i < 4; i++) {
    deck.push({ color: 'wild', value: 'wild' });
    deck.push({ color: 'wild', value: 'wild4' });
  }

  return deck;
}

function shuffleDeck<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================================
// Card Blast Room
// ============================================================

export class CardBlastRoom extends BaseGameRoom<CardBlastGameState> {
  maxClients = 6;
  private deck: { color: string; value: string }[] = [];
  private discardPile: { color: string; value: string }[] = [];
  private bots: Map<string, CardBlastBot> = new Map();

  createInitialState(): CardBlastGameState {
    return new CardBlastGameState();
  }

  registerMessageHandlers(): void {
    this.onMessage('playCard', (client: Client, data: { cardId: string; chosenColor?: string }) => {
      this.handlePlayCard(client.sessionId, data.cardId, data.chosenColor);
    });

    this.onMessage('drawCard', (client: Client) => {
      this.handleDrawCard(client.sessionId);
    });

    this.onMessage('callUno', (client: Client) => {
      this.handleCallUno(client.sessionId);
    });

    this.onMessage('challengeUno', (client: Client, data: { targetId: string }) => {
      this.handleChallengeUno(client.sessionId, data.targetId);
    });
  }

  onGameStart(): void {
    // Create and shuffle deck
    this.deck = shuffleDeck(createDeck());
    this.discardPile = [];

    this.state.isReversed = false;
    this.state.pendingDrawCards = 0;
    this.state.turnIndex = 0;
    this.state.playerOrder.clear();

    // Initialize players and deal cards
    this.state.players.forEach((player, playerId) => {
      const cardPlayer = new CardPlayerState();
      cardPlayer.id = playerId;
      cardPlayer.calledUno = false;

      // Deal 7 cards
      for (let i = 0; i < 7; i++) {
        const drawnCard = this.deck.pop()!;
        const card = new CardState();
        card.id = `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        card.color = drawnCard.color;
        card.value = drawnCard.value;
        cardPlayer.hand.push(card);
      }

      cardPlayer.cardCount = 7;
      this.state.cardPlayers.set(playerId, cardPlayer);
      this.state.playerOrder.push(playerId);

      // Init bots
      if (player.isBot) {
        this.bots.set(playerId, new CardBlastBot(this.metadata?.botDifficulty as string || 'medium'));
      }
    });

    // Place first card (must be a number card)
    let firstCard = this.deck.pop()!;
    while (firstCard.color === 'wild' || ['skip', 'reverse', 'draw2'].includes(firstCard.value)) {
      this.deck.unshift(firstCard);
      this.deck = shuffleDeck(this.deck);
      firstCard = this.deck.pop()!;
    }

    this.state.topCard.color = firstCard.color;
    this.state.topCard.value = firstCard.value;
    this.state.topCard.id = 'top';
    this.state.currentColor = firstCard.color;
    this.state.drawPile = this.deck.length;
    this.discardPile.push(firstCard);

    // Set first player
    this.state.currentTurnId = this.state.playerOrder[0]!;

    // Update playable cards for current player
    this.updatePlayableCards(this.state.currentTurnId);

    // Bot turn
    const firstPlayer = this.state.players.get(this.state.currentTurnId);
    if (firstPlayer?.isBot) {
      this.scheduleBotTurn(this.state.currentTurnId);
    }
  }

  onGameReset(): void {
    this.state.cardPlayers.clear();
    this.state.playerOrder.clear();
    this.deck = [];
    this.discardPile = [];
  }

  onPlayerLeaveGame(playerId: string): void {
    // Return cards to deck
    const cardPlayer = this.state.cardPlayers.get(playerId);
    if (cardPlayer) {
      cardPlayer.hand.forEach((card) => {
        this.deck.push({ color: card.color, value: card.value });
      });
    }

    this.state.cardPlayers.delete(playerId);
    const orderIdx = this.state.playerOrder.indexOf(playerId);
    if (orderIdx !== -1) {
      this.state.playerOrder.splice(orderIdx, 1);
    }

    if (this.state.playerOrder.length <= 1 && this.state.playerOrder.length > 0) {
      this.endGame(this.state.playerOrder[0] ?? null);
    }

    if (this.state.currentTurnId === playerId) {
      this.nextTurn();
    }
  }

  // ============================================================
  // Game Logic
  // ============================================================

  private handlePlayCard(playerId: string, cardId: string, chosenColor?: string): void {
    if (this.state.status !== 'playing') return;
    if (this.state.currentTurnId !== playerId) return;

    const cardPlayer = this.state.cardPlayers.get(playerId);
    if (!cardPlayer) return;

    const cardIndex = cardPlayer.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const card = cardPlayer.hand[cardIndex];
    if (!card) return;

    // Validate play
    if (!this.isCardPlayable(card)) return;

    // Remove card from hand
    cardPlayer.hand.splice(cardIndex, 1);
    cardPlayer.cardCount = cardPlayer.hand.length;

    // Update discard pile
    this.discardPile.push({ color: card.color, value: card.value });
    this.state.topCard.color = card.color;
    this.state.topCard.value = card.value;

    // Handle wild card color choice
    if (card.color === 'wild') {
      this.state.currentColor = chosenColor || 'red';
    } else {
      this.state.currentColor = card.color;
    }

    // Handle special cards
    switch (card.value) {
      case 'skip':
        this.addSystemMessage(`${this.state.players.get(playerId)?.username} played Skip!`);
        this.nextTurn(true); // Skip next player
        break;
      case 'reverse':
        this.state.isReversed = !this.state.isReversed;
        this.addSystemMessage(`${this.state.players.get(playerId)?.username} played Reverse!`);
        if (this.state.playerOrder.length === 2) {
          this.nextTurn(true); // Acts as skip in 2 player
        }
        break;
      case 'draw2':
        this.state.pendingDrawCards += 2;
        this.addSystemMessage(`${this.state.players.get(playerId)?.username} played Draw 2!`);
        break;
      case 'wild4':
        this.state.pendingDrawCards += 4;
        this.addSystemMessage(`${this.state.players.get(playerId)?.username} played Wild Draw 4!`);
        break;
    }

    // Check UNO condition
    if (cardPlayer.cardCount === 1 && !cardPlayer.calledUno) {
      // Player didn't call UNO — vulnerable to challenge
    }

    // Check win
    if (cardPlayer.cardCount === 0) {
      this.endGame(playerId);
      return;
    }

    // Reset UNO call
    if (cardPlayer.cardCount !== 1) {
      cardPlayer.calledUno = false;
    }

    // Next turn (if not already advanced by skip)
    if (!['skip', 'reverse'].includes(card.value) || this.state.playerOrder.length > 2 || card.value !== 'reverse') {
      if (card.value !== 'skip') {
        this.nextTurn();
      }
    }
  }

  private handleDrawCard(playerId: string): void {
    if (this.state.status !== 'playing') return;
    if (this.state.currentTurnId !== playerId) return;

    const cardPlayer = this.state.cardPlayers.get(playerId);
    if (!cardPlayer) return;

    // Draw pending cards or 1
    const drawCount = Math.max(1, this.state.pendingDrawCards);
    this.state.pendingDrawCards = 0;

    for (let i = 0; i < drawCount; i++) {
      this.drawCardFromDeck(cardPlayer);
    }

    cardPlayer.cardCount = cardPlayer.hand.length;
    this.nextTurn();
  }

  private handleCallUno(playerId: string): void {
    const cardPlayer = this.state.cardPlayers.get(playerId);
    if (!cardPlayer) return;
    if (cardPlayer.cardCount === 1 || cardPlayer.cardCount === 2) {
      cardPlayer.calledUno = true;
      this.addSystemMessage(`${this.state.players.get(playerId)?.username} called UNO!`);
    }
  }

  private handleChallengeUno(_challengerId: string, targetId: string): void {
    const targetPlayer = this.state.cardPlayers.get(targetId);
    if (!targetPlayer) return;

    if (targetPlayer.cardCount === 1 && !targetPlayer.calledUno) {
      // Penalty: draw 2 cards
      for (let i = 0; i < 2; i++) {
        this.drawCardFromDeck(targetPlayer);
      }
      targetPlayer.cardCount = targetPlayer.hand.length;
      this.addSystemMessage(`${this.state.players.get(targetId)?.username} didn't call UNO! Drew 2 penalty cards.`);
    }
  }

  private isCardPlayable(card: CardState): boolean {
    if (card.color === 'wild') return true;
    if (card.color === this.state.currentColor) return true;
    if (card.value === this.state.topCard.value) return true;
    return false;
  }

  private drawCardFromDeck(cardPlayer: CardPlayerState): void {
    // Reshuffle discard pile if deck is empty
    if (this.deck.length === 0) {
      const topCard = this.discardPile.pop()!;
      this.deck = shuffleDeck(this.discardPile);
      this.discardPile = [topCard];
    }

    if (this.deck.length === 0) return;

    const drawnCard = this.deck.pop()!;
    const card = new CardState();
    card.id = `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    card.color = drawnCard.color;
    card.value = drawnCard.value;
    cardPlayer.hand.push(card);
    this.state.drawPile = this.deck.length;
  }

  private updatePlayableCards(playerId: string): void {
    const cardPlayer = this.state.cardPlayers.get(playerId);
    if (!cardPlayer) return;

    cardPlayer.hand.forEach((card) => {
      card.isPlayable = this.isCardPlayable(card);
    });
  }

  private nextTurn(skipNext: boolean = false): void {
    const direction = this.state.isReversed ? -1 : 1;
    let steps = skipNext ? 2 : 1;

    this.state.turnIndex = (this.state.turnIndex + steps * direction + this.state.playerOrder.length * 10) % this.state.playerOrder.length;
    this.state.currentTurnId = this.state.playerOrder[this.state.turnIndex]!;

    // Apply pending draw cards to next player
    if (this.state.pendingDrawCards > 0 && !skipNext) {
      const nextPlayer = this.state.cardPlayers.get(this.state.currentTurnId);
      if (nextPlayer) {
        // Player must draw or play a matching draw card
        // For simplicity, auto-draw
        for (let i = 0; i < this.state.pendingDrawCards; i++) {
          this.drawCardFromDeck(nextPlayer);
        }
        nextPlayer.cardCount = nextPlayer.hand.length;
        this.addSystemMessage(`${this.state.players.get(this.state.currentTurnId)?.username} drew ${this.state.pendingDrawCards} cards`);
        this.state.pendingDrawCards = 0;

        // Skip their turn
        this.state.turnIndex = (this.state.turnIndex + direction + this.state.playerOrder.length) % this.state.playerOrder.length;
        this.state.currentTurnId = this.state.playerOrder[this.state.turnIndex]!;
      }
    }

    this.updatePlayableCards(this.state.currentTurnId);

    // Bot turn
    const nextPlayer = this.state.players.get(this.state.currentTurnId);
    if (nextPlayer?.isBot) {
      this.scheduleBotTurn(this.state.currentTurnId);
    }
  }

  private scheduleBotTurn(botId: string): void {
    const bot = this.bots.get(botId);
    if (!bot) return;

    const delay = 1000 + Math.random() * 1500;

    const timer = setTimeout(() => {
      if (this.state.status !== 'playing') return;
      if (this.state.currentTurnId !== botId) return;

      const cardPlayer = this.state.cardPlayers.get(botId);
      if (!cardPlayer) return;

      const playableCards = cardPlayer.hand.filter(c => this.isCardPlayable(c));

      if (playableCards.length > 0) {
        const chosen = bot.chooseCard(playableCards, this.state.currentColor, cardPlayer.hand);

        // Call UNO if needed
        if (cardPlayer.cardCount === 2) {
          cardPlayer.calledUno = true;
          this.addSystemMessage(`${this.state.players.get(botId)?.username} called UNO!`);
        }

        const chosenColor = chosen.color === 'wild' ? bot.chooseColor(cardPlayer.hand) : undefined;
        this.handlePlayCard(botId, chosen.id, chosenColor);
      } else {
        this.handleDrawCard(botId);
      }

      this.botClients.delete(botId);
    }, delay);

    this.botClients.set(botId, timer);
  }
}
