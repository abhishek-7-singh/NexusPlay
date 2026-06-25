import { Client } from 'colyseus';
import { Schema, type, ArraySchema } from '@colyseus/schema';
import { BaseGameRoom, BaseGameState } from './BaseGameRoom';
import { ChessBot } from '../bots/ChessBot';

// ============================================================
// Chess State
// ============================================================

export class MoveRecord extends Schema {
  @type('string') from: string = '';
  @type('string') to: string = '';
  @type('string') piece: string = '';
  @type('string') san: string = '';
  @type('string') fen: string = '';
  @type('number') timestamp: number = 0;
}

export class ChessGameState extends BaseGameState {
  @type('string') fen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  @type('string') playerWhite: string = '';
  @type('string') playerBlack: string = '';
  @type('number') whiteTimeMs: number = 600000; // 10 min default
  @type('number') blackTimeMs: number = 600000;
  @type('boolean') isCheck: boolean = false;
  @type('boolean') isCheckmate: boolean = false;
  @type('boolean') isStalemate: boolean = false;
  @type('string') lastMoveFrom: string = '';
  @type('string') lastMoveTo: string = '';
  @type([MoveRecord]) moveHistory = new ArraySchema<MoveRecord>();
  @type('string') drawOfferedBy: string = '';
  @type('string') timeControl: string = 'rapid'; // bullet, blitz, rapid, classical
}

// ============================================================
// Chess Room
// ============================================================

export class ChessRoom extends BaseGameRoom<ChessGameState> {
  maxClients = 2;
  private chess: any = null; // chess.js instance
  private bot: ChessBot | null = null;
  private clockInterval: any = null;

  createInitialState(): ChessGameState {
    return new ChessGameState();
  }

  registerMessageHandlers(): void {
    this.onMessage('move', (client: Client, data: { from: string; to: string; promotion?: string }) => {
      this.handleMove(client.sessionId, data.from, data.to, data.promotion);
    });

    this.onMessage('resign', (client: Client) => {
      if (this.state.status !== 'playing') return;
      const otherPlayer = Array.from(this.state.players.keys()).find(id => id !== client.sessionId);
      if (otherPlayer) {
        this.addSystemMessage(`${this.state.players.get(client.sessionId)?.username} resigned`);
        this.endGame(otherPlayer);
      }
    });

    this.onMessage('offerDraw', (client: Client) => {
      if (this.state.status !== 'playing') return;
      this.state.drawOfferedBy = client.sessionId;
      this.addSystemMessage(`${this.state.players.get(client.sessionId)?.username} offered a draw`);
    });

    this.onMessage('acceptDraw', (client: Client) => {
      if (this.state.drawOfferedBy && this.state.drawOfferedBy !== client.sessionId) {
        this.endGame(null, true);
      }
    });

    this.onMessage('declineDraw', () => {
      this.state.drawOfferedBy = '';
    });
  }

  async onGameStart(): Promise<void> {
    // Dynamic import chess.js
    const { Chess } = await import('chess.js');
    this.chess = new Chess();

    // Assign colors
    const playerIds = Array.from(this.state.players.keys());
    if (Math.random() < 0.5) {
      this.state.playerWhite = playerIds[0];
      this.state.playerBlack = playerIds[1];
    } else {
      this.state.playerWhite = playerIds[1];
      this.state.playerBlack = playerIds[0];
    }

    this.state.fen = this.chess.fen();
    this.state.currentTurnId = this.state.playerWhite;

    // Set time based on time control
    const times: Record<string, number> = {
      bullet: 60000,
      blitz: 300000,
      rapid: 600000,
      classical: 1800000,
    };
    const time = times[this.state.timeControl] || 600000;
    this.state.whiteTimeMs = time;
    this.state.blackTimeMs = time;

    // Start clock
    this.startClock();

    // Initialize bot
    const botPlayer = Array.from(this.state.players.values()).find(p => p.isBot);
    if (botPlayer) {
      this.bot = new ChessBot(this.metadata?.botDifficulty as string || 'medium');
      if (this.state.playerWhite === botPlayer.id) {
        this.scheduleBotMove(botPlayer.id);
      }
    }
  }

  onGameReset(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
      this.clockInterval = null;
    }
    this.state.fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    this.state.moveHistory.clear();
    this.state.isCheck = false;
    this.state.isCheckmate = false;
    this.state.isStalemate = false;
    this.state.lastMoveFrom = '';
    this.state.lastMoveTo = '';
    this.state.drawOfferedBy = '';
  }

  onPlayerLeaveGame(playerId: string): void {
    const otherPlayer = Array.from(this.state.players.keys()).find(id => id !== playerId);
    if (otherPlayer) {
      this.endGame(otherPlayer);
    }
  }

  onDispose(): void {
    super.onDispose();
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  private startClock() {
    this.clockInterval = setInterval(() => {
      if (this.state.status !== 'playing') return;

      if (this.state.currentTurnId === this.state.playerWhite) {
        this.state.whiteTimeMs -= 100;
        if (this.state.whiteTimeMs <= 0) {
          this.state.whiteTimeMs = 0;
          this.endGame(this.state.playerBlack);
        }
      } else {
        this.state.blackTimeMs -= 100;
        if (this.state.blackTimeMs <= 0) {
          this.state.blackTimeMs = 0;
          this.endGame(this.state.playerWhite);
        }
      }
    }, 100);
  }

  private handleMove(playerId: string, from: string, to: string, promotion?: string): void {
    if (this.state.status !== 'playing') return;
    if (this.state.currentTurnId !== playerId) return;
    if (!this.chess) return;

    try {
      const move = this.chess.move({ from, to, promotion: promotion || 'q' });
      if (!move) return;

      // Update state
      this.state.fen = this.chess.fen();
      this.state.lastMoveFrom = from;
      this.state.lastMoveTo = to;
      this.state.isCheck = this.chess.isCheck();
      this.state.drawOfferedBy = '';

      // Record move
      const record = new MoveRecord();
      record.from = from;
      record.to = to;
      record.piece = move.piece;
      record.san = move.san;
      record.fen = this.chess.fen();
      record.timestamp = Date.now();
      this.state.moveHistory.push(record);

      // Check game end conditions
      if (this.chess.isCheckmate()) {
        this.state.isCheckmate = true;
        this.endGame(playerId);
        return;
      }

      if (this.chess.isStalemate() || this.chess.isDraw() || this.chess.isThreefoldRepetition()) {
        this.state.isStalemate = this.chess.isStalemate();
        this.endGame(null, true);
        return;
      }

      // Switch turn
      this.state.currentTurnId =
        playerId === this.state.playerWhite ? this.state.playerBlack : this.state.playerWhite;

      // Bot move
      const nextPlayer = this.state.players.get(this.state.currentTurnId);
      if (nextPlayer?.isBot) {
        this.scheduleBotMove(this.state.currentTurnId);
      }
    } catch {
      // Invalid move - ignore
    }
  }

  private scheduleBotMove(botId: string): void {
    if (!this.bot || !this.chess) return;

    const thinkTime = this.bot.getThinkingDelay();

    const timer = setTimeout(() => {
      if (this.state.status !== 'playing') return;
      if (this.state.currentTurnId !== botId) return;

      const move = this.bot!.chooseMove(this.chess);
      if (move) {
        this.handleMove(botId, move.from, move.to, move.promotion);
      }
      this.botClients.delete(botId);
    }, thinkTime);

    this.botClients.set(botId, timer);
  }
}
