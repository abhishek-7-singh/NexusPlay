// ============================================================
// Game Types
// ============================================================

export type GameId =
  | 'tic-tac-toe'
  | 'chess'
  | 'ludo'
  | 'card-blast'
  | 'connect-four'
  | 'checkers'
  | 'snake'
  | 'memory-cards'
  | 'typing-race'
  | 'drawing-guess';

export type GameCategory =
  | 'action'
  | 'arcade'
  | 'puzzle'
  | 'sports'
  | 'board'
  | 'strategy'
  | 'party'
  | 'racing'
  | 'card'
  | 'word'
  | 'trivia'
  | 'casual'
  | 'competitive';

export type GameStatus = 'waiting' | 'ready' | 'playing' | 'finished' | 'paused';

export interface GameMeta {
  id: GameId;
  name: string;
  description: string;
  category: GameCategory[];
  minPlayers: number;
  maxPlayers: number;
  estimatedDuration: string;
  thumbnail: string;
  icon: string;
  color: string;
  featured: boolean;
  tags: string[];
}

// ============================================================
// Player Types
// ============================================================

export interface Player {
  id: string;
  username: string;
  avatarUrl: string;
  level: number;
  xp: number;
  rank: PlayerRank;
  isBot: boolean;
  isReady: boolean;
  isConnected: boolean;
  isSpectator: boolean;
}

export type PlayerRank =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'grandmaster';

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesDraw: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  totalPlayTime: number;
  favoriteGame: GameId | null;
}

// ============================================================
// Room Types
// ============================================================

export type RoomVisibility = 'public' | 'private' | 'friends-only';

export interface RoomConfig {
  gameId: GameId;
  visibility: RoomVisibility;
  maxPlayers: number;
  enableBots: boolean;
  botDifficulty: BotDifficulty;
  timeLimit?: number;
  customRules?: Record<string, unknown>;
}

export interface RoomInfo {
  roomId: string;
  roomCode: string;
  gameId: GameId;
  hostId: string;
  players: Player[];
  spectators: Player[];
  status: GameStatus;
  visibility: RoomVisibility;
  createdAt: number;
  maxPlayers: number;
}

// ============================================================
// Bot Types
// ============================================================

export type BotDifficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'adaptive';

export type BotPersonality = 'aggressive' | 'defensive' | 'balanced' | 'risky' | 'strategic';

export interface BotConfig {
  difficulty: BotDifficulty;
  personality: BotPersonality;
  thinkingDelay: { min: number; max: number };
  mistakeRate: number; // 0-1, probability of suboptimal move
}

// ============================================================
// Chat Types
// ============================================================

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'emoji' | 'reaction' | 'system';
  timestamp: number;
}

// ============================================================
// Auth Types
// ============================================================

export type AuthProvider = 'google' | 'github' | 'discord' | 'guest';

export interface AuthUser {
  id: string;
  username: string;
  email: string | null;
  avatarUrl: string;
  provider: AuthProvider;
  level: number;
  xp: number;
  xpToNextLevel: number;
  rank: PlayerRank;
  stats: PlayerStats;
  coins: number;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthTokenPayload {
  userId: string;
  username: string;
  provider: AuthProvider;
  iat: number;
  exp: number;
}

// ============================================================
// Leaderboard Types
// ============================================================

export interface LeaderboardEntry {
  rank: number;
  player: Pick<AuthUser, 'id' | 'username' | 'avatarUrl' | 'level' | 'rank'>;
  score: number;
  gamesPlayed: number;
  winRate: number;
}

export type LeaderboardScope = 'global' | 'country' | 'friends' | 'season';

// ============================================================
// Store Types
// ============================================================

export type CosmeticType = 'avatar' | 'frame' | 'emote' | 'theme' | 'board-skin' | 'card-skin' | 'dice-skin' | 'cursor-effect';

export interface CosmeticItem {
  id: string;
  name: string;
  description: string;
  type: CosmeticType;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  previewUrl: string;
  isOwned: boolean;
  isEquipped: boolean;
}

// ============================================================
// Achievement Types
// ============================================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
  xpReward: number;
  coinReward: number;
}

// ============================================================
// Constants
// ============================================================

export const XP_PER_LEVEL = 1000;
export const XP_LEVEL_MULTIPLIER = 1.15;

export function getXpForLevel(level: number): number {
  return Math.floor(XP_PER_LEVEL * Math.pow(XP_LEVEL_MULTIPLIER, level - 1));
}

export function getLevelFromXp(totalXp: number): { level: number; currentXp: number; xpToNext: number } {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= getXpForLevel(level)) {
    remaining -= getXpForLevel(level);
    level++;
  }
  return {
    level,
    currentXp: remaining,
    xpToNext: getXpForLevel(level),
  };
}

export const RANK_THRESHOLDS: Record<PlayerRank, number> = {
  bronze: 0,
  silver: 5,
  gold: 15,
  platinum: 30,
  diamond: 50,
  master: 75,
  grandmaster: 100,
};

export function getRankFromLevel(level: number): PlayerRank {
  const ranks: PlayerRank[] = ['grandmaster', 'master', 'diamond', 'platinum', 'gold', 'silver', 'bronze'];
  for (const rank of ranks) {
    if (level >= RANK_THRESHOLDS[rank]) return rank;
  }
  return 'bronze';
}
