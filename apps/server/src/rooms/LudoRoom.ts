import { Client } from 'colyseus';
import { Schema, type, ArraySchema, MapSchema } from '@colyseus/schema';
import { BaseGameRoom, BaseGameState } from './BaseGameRoom';
import { LudoBot } from '../bots/LudoBot';

// ============================================================
// Ludo State
// ============================================================

export class LudoToken extends Schema {
  @type('number') position: number = -1; // -1 = home, 0-56 = board, 57 = finished
  @type('boolean') isHome: boolean = true;
  @type('boolean') isFinished: boolean = false;
  @type('number') colorIndex: number = 0;
}

export class LudoPlayerState extends Schema {
  @type('string') id: string = '';
  @type('number') colorIndex: number = 0; // 0=red, 1=blue, 2=green, 3=yellow
  @type([LudoToken]) tokens = new ArraySchema<LudoToken>();
  @type('number') finishedTokens: number = 0;
}

export class LudoGameState extends BaseGameState {
  @type({ map: LudoPlayerState }) ludoPlayers = new MapSchema<LudoPlayerState>();
  @type('number') diceValue: number = 0;
  @type('boolean') hasRolled: boolean = false;
  @type('boolean') mustRollAgain: boolean = false;
  @type('number') consecutiveSixes: number = 0;
  @type('string') lastCapture: string = '';
  @type('number') turnOrder: number = 0;
  @type(['string']) playerOrder = new ArraySchema<string>();
}

// ============================================================
// Board Layout Constants
// ============================================================
const BOARD_SIZE = 52; // Main track squares
const HOME_STRETCH_SIZE = 6; // Home stretch per player
const START_POSITIONS = [0, 13, 26, 39]; // Starting square for each color
const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47]; // Star/safe squares

// ============================================================
// Ludo Room
// ============================================================

export class LudoRoom extends BaseGameRoom<LudoGameState> {
  maxClients = 4;
  private bots: Map<string, LudoBot> = new Map();

  createInitialState(): LudoGameState {
    return new LudoGameState();
  }

  registerMessageHandlers(): void {
    this.onMessage('rollDice', (client: Client) => {
      this.handleRollDice(client.sessionId);
    });

    this.onMessage('moveToken', (client: Client, data: { tokenIndex: number }) => {
      this.handleMoveToken(client.sessionId, data.tokenIndex);
    });

    this.onMessage('skipTurn', (client: Client) => {
      if (this.state.status !== 'playing') return;
      if (this.state.currentTurnId !== client.sessionId) return;
      if (!this.state.hasRolled) return;
      this.nextTurn();
    });
  }

  onGameStart(): void {
    this.state.diceValue = 0;
    this.state.hasRolled = false;
    this.state.consecutiveSixes = 0;
    this.state.turnOrder = 0;
    this.state.playerOrder.clear();

    const colors = [0, 1, 2, 3];
    let colorIdx = 0;

    this.state.players.forEach((player, playerId) => {
      const ludoPlayer = new LudoPlayerState();
      ludoPlayer.id = playerId;
      ludoPlayer.colorIndex = colors[colorIdx];
      ludoPlayer.finishedTokens = 0;

      for (let i = 0; i < 4; i++) {
        const token = new LudoToken();
        token.position = -1;
        token.isHome = true;
        token.isFinished = false;
        token.colorIndex = colors[colorIdx];
        ludoPlayer.tokens.push(token);
      }

      this.state.ludoPlayers.set(playerId, ludoPlayer);
      this.state.playerOrder.push(playerId);

      // Initialize bots
      if (player.isBot) {
        this.bots.set(playerId, new LudoBot(this.metadata?.botDifficulty as string || 'medium'));
      }

      colorIdx++;
    });

    // First player's turn
    this.state.currentTurnId = this.state.playerOrder[0]!;

    // Trigger bot if first player is bot
    const firstPlayer = this.state.players.get(this.state.currentTurnId);
    if (firstPlayer?.isBot) {
      this.scheduleBotTurn(this.state.currentTurnId);
    }
  }

  onGameReset(): void {
    this.state.ludoPlayers.clear();
    this.state.playerOrder.clear();
    this.state.diceValue = 0;
    this.state.hasRolled = false;
    this.state.consecutiveSixes = 0;
  }

  onPlayerLeaveGame(playerId: string): void {
    // Remove player's tokens from the board
    this.state.ludoPlayers.delete(playerId);
    const orderIdx = this.state.playerOrder.indexOf(playerId);
    if (orderIdx !== -1) {
      this.state.playerOrder.splice(orderIdx, 1);
    }

    // Check if only one player left
    if (this.state.playerOrder.length <= 1 && this.state.playerOrder.length > 0) {
      this.endGame(this.state.playerOrder[0] ?? null);
    }

    // If it was their turn, move to next
    if (this.state.currentTurnId === playerId) {
      this.nextTurn();
    }
  }

  // ============================================================
  // Game Logic
  // ============================================================

  private handleRollDice(playerId: string): void {
    if (this.state.status !== 'playing') return;
    if (this.state.currentTurnId !== playerId) return;
    if (this.state.hasRolled) return;

    // Roll dice (1-6)
    this.state.diceValue = Math.floor(Math.random() * 6) + 1;
    this.state.hasRolled = true;

    // Check for triple six
    if (this.state.diceValue === 6) {
      this.state.consecutiveSixes++;
      if (this.state.consecutiveSixes >= 3) {
        // Triple six penalty — skip turn
        this.addSystemMessage(`${this.state.players.get(playerId)?.username} rolled three 6s in a row! Turn skipped.`);
        this.state.consecutiveSixes = 0;
        this.nextTurn();
        return;
      }
    } else {
      this.state.consecutiveSixes = 0;
    }

    // Check if any move is possible
    const ludoPlayer = this.state.ludoPlayers.get(playerId);
    if (!ludoPlayer) return;

    const hasValidMove = this.getValidMoves(ludoPlayer).length > 0;
    if (!hasValidMove) {
      // No valid moves — auto skip
      this.broadcast('noValidMoves', { playerId });
      setTimeout(() => {
        if (this.state.status === 'playing') {
          this.nextTurn();
        }
      }, 1000);
    }
  }

  private handleMoveToken(playerId: string, tokenIndex: number): void {
    if (this.state.status !== 'playing') return;
    if (this.state.currentTurnId !== playerId) return;
    if (!this.state.hasRolled) return;

    const ludoPlayer = this.state.ludoPlayers.get(playerId);
    if (!ludoPlayer) return;
    if (tokenIndex < 0 || tokenIndex >= 4) return;

    const token = ludoPlayer.tokens[tokenIndex];
    if (!token) return;
    if (!this.isValidMove(ludoPlayer, token)) return;

    // Execute the move
    if (token.isHome && this.state.diceValue === 6) {
      // Move out of home
      token.position = START_POSITIONS[ludoPlayer.colorIndex];
      token.isHome = false;
    } else if (!token.isHome && !token.isFinished) {
      const newPos = this.calculateNewPosition(ludoPlayer, token);
      if (newPos >= BOARD_SIZE + HOME_STRETCH_SIZE) {
        // Exact position to finish
        if (newPos === BOARD_SIZE + HOME_STRETCH_SIZE) {
          token.isFinished = true;
          token.position = 57;
          ludoPlayer.finishedTokens++;
          this.addSystemMessage(`${this.state.players.get(playerId)?.username} got a token home!`);
        } else {
          return; // Can't overshoot
        }
      } else {
        // Check for capture
        const absolutePos = (START_POSITIONS[ludoPlayer.colorIndex] + newPos) % BOARD_SIZE;

        if (newPos < BOARD_SIZE && !SAFE_SQUARES.includes(absolutePos)) {
          this.checkCapture(playerId, absolutePos);
        }

        token.position = newPos;
      }
    }

    // Check win condition
    if (ludoPlayer.finishedTokens >= 4) {
      this.endGame(playerId);
      return;
    }

    // Extra turn on 6 or capture
    if (this.state.diceValue === 6 || this.state.lastCapture === playerId) {
      this.state.mustRollAgain = true;
      this.state.hasRolled = false;
      this.state.lastCapture = '';

      // Bot extra turn
      const currentPlayer = this.state.players.get(playerId);
      if (currentPlayer?.isBot) {
        this.scheduleBotTurn(playerId);
      }
    } else {
      this.nextTurn();
    }
  }

  private isValidMove(ludoPlayer: LudoPlayerState, token: LudoToken): boolean {
    if (token.isFinished) return false;

    if (token.isHome) {
      return this.state.diceValue === 6;
    }

    const newPos = this.calculateNewPosition(ludoPlayer, token);
    return newPos <= BOARD_SIZE + HOME_STRETCH_SIZE;
  }

  private getValidMoves(ludoPlayer: LudoPlayerState): number[] {
    const validMoves: number[] = [];
    for (let i = 0; i < 4; i++) {
      const t = ludoPlayer.tokens[i];
      if (t && this.isValidMove(ludoPlayer, t)) {
        validMoves.push(i);
      }
    }
    return validMoves;
  }

  private calculateNewPosition(ludoPlayer: LudoPlayerState, token: LudoToken): number {
    if (token.isHome) return 0;
    return token.position + this.state.diceValue;
  }

  private checkCapture(capturingPlayerId: string, absolutePos: number): void {
    this.state.ludoPlayers.forEach((otherPlayer, otherId) => {
      if (otherId === capturingPlayerId) return;

      otherPlayer.tokens.forEach((token) => {
        if (token.isHome || token.isFinished) return;

        const otherAbsolutePos = (START_POSITIONS[otherPlayer.colorIndex] + token.position) % BOARD_SIZE;
        if (otherAbsolutePos === absolutePos) {
          // Capture! Send back home
          token.position = -1;
          token.isHome = true;
          this.state.lastCapture = capturingPlayerId;
          this.addSystemMessage(
            `${this.state.players.get(capturingPlayerId)?.username} captured ${this.state.players.get(otherId)?.username}'s token!`
          );
        }
      });
    });
  }

  private nextTurn(): void {
    this.state.hasRolled = false;
    this.state.mustRollAgain = false;
    this.state.lastCapture = '';

    // Move to next player in order
    const currentIdx = this.state.playerOrder.indexOf(this.state.currentTurnId);
    const nextIdx = (currentIdx + 1) % this.state.playerOrder.length;
    this.state.currentTurnId = this.state.playerOrder[nextIdx]!;
    this.state.turnOrder++;

    // Trigger bot
    const nextPlayer = this.state.players.get(this.state.currentTurnId);
    if (nextPlayer?.isBot) {
      this.scheduleBotTurn(this.state.currentTurnId);
    }
  }

  private scheduleBotTurn(botId: string): void {
    const bot = this.bots.get(botId);
    if (!bot) return;

    // Roll dice first
    const rollDelay = 500 + Math.random() * 800;
    const timer = setTimeout(() => {
      if (this.state.status !== 'playing') return;
      if (this.state.currentTurnId !== botId) return;

      this.handleRollDice(botId);

      // Then choose a token to move
      const ludoPlayer = this.state.ludoPlayers.get(botId);
      if (!ludoPlayer) return;

      const validMoves = this.getValidMoves(ludoPlayer);
      if (validMoves.length === 0) return;

      const moveDelay = 600 + Math.random() * 1000;
      const moveTimer = setTimeout(() => {
        if (this.state.status !== 'playing') return;
        if (this.state.currentTurnId !== botId) return;

        const chosenToken = bot.chooseToken(ludoPlayer, this.state.diceValue, validMoves, this.state);
        this.handleMoveToken(botId, chosenToken);
        this.botClients.delete(`${botId}-move`);
      }, moveDelay);

      this.botClients.set(`${botId}-move`, moveTimer);
      this.botClients.delete(botId);
    }, rollDelay);

    this.botClients.set(botId, timer);
  }
}
