import { Client } from 'colyseus';
import { Schema, type, ArraySchema } from '@colyseus/schema';
import { BaseGameRoom, BaseGameState, PlayerState } from './BaseGameRoom';
import { TicTacToeBot } from '../bots/TicTacToeBot';

// ============================================================
// Tic Tac Toe State
// ============================================================

export class TicTacToeState extends BaseGameState {
  @type(['string']) board = new ArraySchema<string>(
    '', '', '', '', '', '', '', '', ''
  );
  @type('string') playerX: string = '';
  @type('string') playerO: string = '';
  @type('number') moveCount: number = 0;
  @type('string') winningLine: string = ''; // e.g. "0,1,2"
}

// ============================================================
// Winning combinations
// ============================================================
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],            // diagonals
];

// ============================================================
// Tic Tac Toe Room
// ============================================================

export class TicTacToeRoom extends BaseGameRoom<TicTacToeState> {
  maxClients = 2;
  private bot: TicTacToeBot | null = null;

  createInitialState(): TicTacToeState {
    return new TicTacToeState();
  }

  registerMessageHandlers(): void {
    this.onMessage('move', (client: Client, data: { index: number }) => {
      this.handleMove(client.sessionId, data.index);
    });
  }

  onGameStart(): void {
    // Clear the board
    for (let i = 0; i < 9; i++) {
      this.state.board[i] = '';
    }
    this.state.moveCount = 0;
    this.state.winningLine = '';

    // Assign X and O
    const playerIds = Array.from(this.state.players.keys());
    this.state.playerX = playerIds[0];
    this.state.playerO = playerIds[1];
    this.state.currentTurnId = this.state.playerX;

    // Initialize bot if playing against bot
    const botPlayer = Array.from(this.state.players.values()).find(p => p.isBot);
    if (botPlayer) {
      const botDifficulty = (this.metadata?.botDifficulty as string) || 'medium';
      this.bot = new TicTacToeBot(botDifficulty);

      // If bot is X (goes first), make a move
      if (this.state.playerX === botPlayer.id) {
        this.scheduleBotMove(botPlayer.id);
      }
    }
  }

  onGameReset(): void {
    for (let i = 0; i < 9; i++) {
      this.state.board[i] = '';
    }
    this.state.moveCount = 0;
    this.state.winningLine = '';
    this.state.playerX = '';
    this.state.playerO = '';
  }

  onPlayerLeaveGame(playerId: string): void {
    // Other player wins by forfeit
    const otherPlayer = Array.from(this.state.players.keys()).find(id => id !== playerId);
    if (otherPlayer) {
      this.endGame(otherPlayer);
    }
  }

  // ============================================================
  // Game Logic
  // ============================================================

  private handleMove(playerId: string, index: number): void {
    // Validate
    if (this.state.status !== 'playing') return;
    if (this.state.currentTurnId !== playerId) return;
    if (index < 0 || index > 8) return;
    if (this.state.board[index] !== '') return;

    // Place the piece
    const symbol = playerId === this.state.playerX ? 'X' : 'O';
    this.state.board[index] = symbol;
    this.state.moveCount++;

    // Check for win
    const winLine = this.checkWin(symbol);
    if (winLine) {
      this.state.winningLine = winLine.join(',');
      this.endGame(playerId);
      return;
    }

    // Check for draw
    if (this.state.moveCount >= 9) {
      this.endGame(null, true);
      return;
    }

    // Switch turn
    this.state.currentTurnId =
      playerId === this.state.playerX ? this.state.playerO : this.state.playerX;

    // Trigger bot move if it's the bot's turn
    const nextPlayer = this.state.players.get(this.state.currentTurnId);
    if (nextPlayer?.isBot) {
      this.scheduleBotMove(this.state.currentTurnId);
    }
  }

  private checkWin(symbol: string): number[] | null {
    for (const line of WIN_LINES) {
      if (line.every(i => this.state.board[i] === symbol)) {
        return line;
      }
    }
    return null;
  }

  private scheduleBotMove(botId: string): void {
    if (!this.bot) return;

    // Get the board as a simple array
    const board = Array.from(this.state.board);
    const botSymbol = botId === this.state.playerX ? 'X' : 'O';

    // Bot "thinks" for a realistic delay
    const thinkTime = this.bot.getThinkingDelay();

    const timer = setTimeout(() => {
      if (this.state.status !== 'playing') return;
      if (this.state.currentTurnId !== botId) return;

      const moveIndex = this.bot!.chooseMove(board, botSymbol);
      if (moveIndex !== -1) {
        this.handleMove(botId, moveIndex);
      }
      this.botClients.delete(botId);
    }, thinkTime);

    this.botClients.set(botId, timer);
  }
}
