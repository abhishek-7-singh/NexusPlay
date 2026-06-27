export type GameId =
  | "tic-tac-toe"
  | "chess"
  | "ludo"
  | "card-blast"
  | "connect-four"
  | "checkers"
  | "snake"
  | "memory-cards"
  | "typing-race"
  | "drawing-guess";

export type GameMode = "local" | "bot" | "online" | "spectate";
export type GameStatusLabel = "Live" | "Queueing" | "Beta" | "Practice";

export interface PlatformGame {
  id: GameId;
  title: string;
  shortTitle: string;
  category: string;
  description: string;
  cover: string;
  accent: string;
  players: string;
  duration: string;
  online: number;
  rating: number;
  status: GameStatusLabel;
  modes: GameMode[];
  tags: string[];
}

export interface LobbyRoom {
  code: string;
  title: string;
  gameId: GameId;
  host: string;
  players: number;
  maxPlayers: number;
  region: string;
  ping: number;
  visibility: "Public" | "Private" | "Friends";
  mode: "Ranked" | "Casual" | "Bots" | "Spectate";
}

export interface LeaderboardPlayer {
  rank: number;
  name: string;
  level: number;
  rating: number;
  winRate: number;
  mainGame: GameId;
  region: string;
}

export interface CosmeticItem {
  id: string;
  name: string;
  type: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  price: number;
  owned: boolean;
  accent: string;
}

export const platformGames: PlatformGame[] = [
  {
    id: "chess",
    title: "Chess",
    shortTitle: "Chess",
    category: "Strategy",
    description: "Classic ranked chess with legal move validation, bot practice, move history, and rematch flow.",
    cover: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=1600&auto=format&fit=crop",
    accent: "#00D4FF",
    players: "1-2",
    duration: "10-30m",
    online: 1204,
    rating: 4.8,
    status: "Live",
    modes: ["bot", "online", "spectate"],
    tags: ["Ranked", "Bot AI", "Turn based"],
  },
  {
    id: "tic-tac-toe",
    title: "Tic Tac Toe",
    shortTitle: "Tic Tac Toe",
    category: "Casual",
    description: "Fast tactical matches with difficulty-tuned minimax bots and instant replay.",
    cover: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=1600&auto=format&fit=crop",
    accent: "#10B981",
    players: "1-2",
    duration: "3m",
    online: 842,
    rating: 4.6,
    status: "Live",
    modes: ["local", "bot", "online"],
    tags: ["Quick play", "Private room", "Bot AI"],
  },
  {
    id: "ludo",
    title: "Ludo Rush",
    shortTitle: "Ludo",
    category: "Board",
    description: "Four-player race with bot opponents, turn automation, dice flow, and progress tracking.",
    cover: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1600&auto=format&fit=crop",
    accent: "#F59E0B",
    players: "2-4",
    duration: "15-45m",
    online: 3402,
    rating: 4.7,
    status: "Live",
    modes: ["bot", "online"],
    tags: ["Party", "Dice", "Bots"],
  },
  {
    id: "card-blast",
    title: "Card Blast",
    shortTitle: "Card Blast",
    category: "Card",
    description: "UNO-style color matching with action cards, wild choices, bot players, and hand state.",
    cover: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1600&auto=format&fit=crop",
    accent: "#8B5CF6",
    players: "2-4",
    duration: "10-20m",
    online: 892,
    rating: 4.5,
    status: "Live",
    modes: ["bot", "online"],
    tags: ["Cards", "Party", "Wild cards"],
  },
  {
    id: "connect-four",
    title: "Connect Four",
    shortTitle: "Connect 4",
    category: "Puzzle",
    description: "Drop discs, build threats, and queue into casual two-player matches.",
    cover: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=1600&auto=format&fit=crop",
    accent: "#EF4444",
    players: "1-2",
    duration: "5m",
    online: 319,
    rating: 4.3,
    status: "Queueing",
    modes: ["online", "spectate"],
    tags: ["Coming next", "Strategy"],
  },
  {
    id: "typing-race",
    title: "Typing Race",
    shortTitle: "Typing Race",
    category: "Word",
    description: "Race friends through precision typing sprints with WPM and accuracy scoring.",
    cover: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop",
    accent: "#06B6D4",
    players: "2-8",
    duration: "2m",
    online: 541,
    rating: 4.4,
    status: "Beta",
    modes: ["online", "spectate"],
    tags: ["Beta", "Skill", "Fast"],
  },
];

export const liveRooms: LobbyRoom[] = [
  { code: "NOVA82", title: "Grandmaster Lobby", gameId: "chess", host: "Nova", players: 1, maxPlayers: 2, region: "IN", ping: 34, visibility: "Public", mode: "Ranked" },
  { code: "PARTY7", title: "Party Lounge", gameId: "ludo", host: "Vortex", players: 3, maxPlayers: 4, region: "SG", ping: 52, visibility: "Public", mode: "Casual" },
  { code: "BLAST4", title: "High Rollers", gameId: "card-blast", host: "Cipher", players: 2, maxPlayers: 4, region: "EU", ping: 118, visibility: "Public", mode: "Casual" },
  { code: "TACTIC", title: "Two Minute Tactics", gameId: "tic-tac-toe", host: "Pulse", players: 1, maxPlayers: 2, region: "IN", ping: 29, visibility: "Friends", mode: "Bots" },
];

export const leaderboardPlayers: LeaderboardPlayer[] = [
  { rank: 1, name: "Nova", level: 88, rating: 9450, winRate: 68.2, mainGame: "chess", region: "IN" },
  { rank: 2, name: "Cipher", level: 76, rating: 8900, winRate: 64.1, mainGame: "card-blast", region: "EU" },
  { rank: 3, name: "Pulse", level: 71, rating: 8750, winRate: 61.5, mainGame: "tic-tac-toe", region: "SG" },
  { rank: 4, name: "Vortex", level: 66, rating: 8200, winRate: 59.0, mainGame: "ludo", region: "IN" },
  { rank: 5, name: "Echo", level: 64, rating: 7900, winRate: 58.4, mainGame: "chess", region: "US" },
  { rank: 6, name: "Zenith", level: 59, rating: 7520, winRate: 56.7, mainGame: "card-blast", region: "IN" },
];

export const cosmeticItems: CosmeticItem[] = [
  { id: "avatar-neon", name: "Neon Flux Avatar", type: "Avatar", rarity: "Epic", price: 900, owned: true, accent: "#00D4FF" },
  { id: "frame-orbit", name: "Orbit Frame", type: "Profile Frame", rarity: "Rare", price: 650, owned: false, accent: "#8B5CF6" },
  { id: "board-onyx", name: "Onyx Board Skin", type: "Board Skin", rarity: "Legendary", price: 1400, owned: false, accent: "#F59E0B" },
  { id: "cards-prism", name: "Prism Card Backs", type: "Card Skin", rarity: "Epic", price: 1000, owned: false, accent: "#10B981" },
  { id: "cursor-spark", name: "Spark Cursor Trail", type: "Cursor Effect", rarity: "Common", price: 300, owned: true, accent: "#FFFFFF" },
];

export function getGameById(gameId: GameId): PlatformGame {
  return platformGames.find((game) => game.id === gameId) ?? platformGames[0];
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
