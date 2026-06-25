import { Room, Client, Delayed } from 'colyseus';
import { Schema, type, MapSchema, ArraySchema } from '@colyseus/schema';

// ============================================================
// Base Schema Classes
// ============================================================

export class PlayerState extends Schema {
  @type('string') id: string = '';
  @type('string') username: string = '';
  @type('string') avatarUrl: string = '';
  @type('number') level: number = 1;
  @type('boolean') isBot: boolean = false;
  @type('boolean') isReady: boolean = false;
  @type('boolean') isConnected: boolean = true;
  @type('number') score: number = 0;
  @type('string') seatIndex: string = '0';
}

export class ChatMessageState extends Schema {
  @type('string') id: string = '';
  @type('string') senderId: string = '';
  @type('string') senderName: string = '';
  @type('string') content: string = '';
  @type('string') type: string = 'text';
  @type('number') timestamp: number = 0;
}

export class BaseGameState extends Schema {
  @type('string') status: string = 'waiting'; // waiting | ready | playing | finished
  @type('string') hostId: string = '';
  @type('string') roomCode: string = '';
  @type('string') currentTurnId: string = '';
  @type('number') turnTimeLeft: number = -1;
  @type('string') winnerId: string = '';
  @type('boolean') isDraw: boolean = false;
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type([ChatMessageState]) chatMessages = new ArraySchema<ChatMessageState>();
}

// ============================================================
// Base Game Room
// ============================================================

export abstract class BaseGameRoom<TState extends BaseGameState> extends Room<TState> {
  maxClients = 2;
  autoDispose = true;
  private turnTimer: Delayed | null = null;
  protected botClients: Map<string, NodeJS.Timeout> = new Map();

  // Generate a short, readable room code
  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  onCreate(options: any) {
    this.setState(this.createInitialState());
    this.state.roomCode = this.generateRoomCode();
    this.state.status = 'waiting';

    // Set room metadata for lobby listing
    this.setMetadata({
      roomCode: this.state.roomCode,
      gameId: options.gameId || this.roomName,
      visibility: options.visibility || 'public',
    });

    // Handle chat messages
    this.onMessage('chat', (client, message: { content: string; type?: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      const chatMsg = new ChatMessageState();
      chatMsg.id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      chatMsg.senderId = client.sessionId;
      chatMsg.senderName = player.username;
      chatMsg.content = message.content;
      chatMsg.type = message.type || 'text';
      chatMsg.timestamp = Date.now();

      this.state.chatMessages.push(chatMsg);

      // Keep only last 100 messages
      while (this.state.chatMessages.length > 100) {
        this.state.chatMessages.shift();
      }
    });

    // Handle ready toggle
    this.onMessage('ready', (client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || this.state.status !== 'waiting') return;

      player.isReady = !player.isReady;
      this.checkAllReady();
    });

    // Handle rematch request
    this.onMessage('rematch', () => {
      if (this.state.status !== 'finished') return;
      this.resetGame();
    });

    // Register game-specific message handlers
    this.registerMessageHandlers();
  }

  onJoin(client: Client, options: any) {
    const player = new PlayerState();
    player.id = client.sessionId;
    player.username = options.username || `Player ${this.state.players.size + 1}`;
    player.avatarUrl = options.avatarUrl || '';
    player.level = options.level || 1;
    player.isBot = false;
    player.isReady = false;
    player.isConnected = true;
    player.seatIndex = String(this.state.players.size);

    this.state.players.set(client.sessionId, player);

    // First player is host
    if (this.state.players.size === 1) {
      this.state.hostId = client.sessionId;
    }

    // System message
    this.addSystemMessage(`${player.username} joined the game`);

    // Fill bot slots if requested
    if (options.enableBots && this.state.players.size < this.maxClients) {
      this.fillBotSlots(options.botDifficulty || 'medium');
    }
  }

  async onLeave(client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    player.isConnected = false;

    if (!consented) {
      // Allow reconnection for 30 seconds
      try {
        await this.allowReconnection(client, 30);
        player.isConnected = true;
        this.addSystemMessage(`${player.username} reconnected`);
        return;
      } catch {
        // Player did not reconnect
      }
    }

    this.addSystemMessage(`${player.username} left the game`);
    this.state.players.delete(client.sessionId);

    // Host migration
    if (client.sessionId === this.state.hostId && this.state.players.size > 0) {
      const newHost = Array.from(this.state.players.keys())[0];
      this.state.hostId = newHost;
      this.addSystemMessage(`Host migrated to ${this.state.players.get(newHost)?.username}`);
    }

    // Handle game state when player leaves during game
    if (this.state.status === 'playing') {
      this.onPlayerLeaveGame(client.sessionId);
    }
  }

  onDispose() {
    // Clean up bot timers
    for (const timer of this.botClients.values()) {
      clearTimeout(timer);
    }
    this.botClients.clear();

    if (this.turnTimer) {
      this.turnTimer.clear();
    }
  }

  // ============================================================
  // Protected methods for subclasses
  // ============================================================

  protected addSystemMessage(content: string) {
    const msg = new ChatMessageState();
    msg.id = `sys-${Date.now()}`;
    msg.senderId = 'system';
    msg.senderName = 'System';
    msg.content = content;
    msg.type = 'system';
    msg.timestamp = Date.now();
    this.state.chatMessages.push(msg);
  }

  protected checkAllReady() {
    if (this.state.players.size < 2) return;

    let allReady = true;
    this.state.players.forEach((player) => {
      if (!player.isReady && !player.isBot) allReady = false;
    });

    if (allReady) {
      this.startCountdown();
    }
  }

  protected startCountdown() {
    this.state.status = 'ready';
    this.broadcast('countdown', { seconds: 3 });

    this.clock.setTimeout(() => {
      this.startGame();
    }, 3000);
  }

  protected startGame() {
    this.state.status = 'playing';
    this.onGameStart();
  }

  protected endGame(winnerId: string | null, isDraw: boolean = false) {
    this.state.status = 'finished';
    this.state.winnerId = winnerId || '';
    this.state.isDraw = isDraw;

    if (this.turnTimer) {
      this.turnTimer.clear();
    }

    const winner = winnerId ? this.state.players.get(winnerId) : null;
    if (isDraw) {
      this.addSystemMessage('Game ended in a draw!');
    } else if (winner) {
      this.addSystemMessage(`${winner.username} wins!`);
    }

    this.broadcast('gameOver', {
      winnerId,
      isDraw,
    });
  }

  protected resetGame() {
    this.state.status = 'waiting';
    this.state.winnerId = '';
    this.state.isDraw = false;
    this.state.currentTurnId = '';

    this.state.players.forEach((player) => {
      player.isReady = false;
      player.score = 0;
    });

    this.onGameReset();
    this.addSystemMessage('Game has been reset. Ready up!');
  }

  protected setTurnTimer(seconds: number, onTimeout: () => void) {
    if (this.turnTimer) this.turnTimer.clear();

    this.state.turnTimeLeft = seconds;

    this.turnTimer = this.clock.setInterval(() => {
      this.state.turnTimeLeft--;
      if (this.state.turnTimeLeft <= 0) {
        this.turnTimer?.clear();
        onTimeout();
      }
    }, 1000);
  }

  protected fillBotSlots(difficulty: string) {
    const botNames = ['Nova', 'Cipher', 'Pulse', 'Nexus', 'Vortex', 'Zenith', 'Flux', 'Echo'];
    let botIndex = 0;

    while (this.state.players.size < this.maxClients) {
      const botId = `bot-${Date.now()}-${botIndex}`;
      const bot = new PlayerState();
      bot.id = botId;
      bot.username = `🤖 ${botNames[botIndex % botNames.length]}`;
      bot.isBot = true;
      bot.isReady = true;
      bot.isConnected = true;
      bot.seatIndex = String(this.state.players.size);

      this.state.players.set(botId, bot);
      this.addSystemMessage(`${bot.username} (Bot - ${difficulty}) joined`);
      botIndex++;
    }

    // Check if we can start
    this.checkAllReady();
  }

  // ============================================================
  // Abstract methods for subclasses to implement
  // ============================================================

  abstract createInitialState(): TState;
  abstract registerMessageHandlers(): void;
  abstract onGameStart(): void;
  abstract onGameReset(): void;
  abstract onPlayerLeaveGame(playerId: string): void;
}
