import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'gamestore-dev-secret-change-in-production';

export const authRouter = Router();

// In-memory user store (Phase 1 — replace with PostgreSQL later)
const users = new Map<string, any>();

// Guest login
authRouter.post('/guest', (req, res) => {
  const { username } = req.body;
  const id = uuidv4();
  const displayName = username || `Player_${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const user = {
    id,
    username: displayName,
    email: null,
    avatarUrl: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(displayName)}`,
    provider: 'guest',
    level: 1,
    xp: 0,
    xpToNextLevel: 1000,
    rank: 'bronze',
    stats: {
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      gamesDraw: 0,
      winRate: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalPlayTime: 0,
      favoriteGame: null,
    },
    coins: 500, // Starting coins
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  users.set(id, user);

  const token = jwt.sign(
    { userId: id, username: displayName, provider: 'guest' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ user, token });
});

// Get user profile
authRouter.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const payload = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as any;
    const user = users.get(payload.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update profile
authRouter.patch('/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const payload = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as any;
    const user = users.get(payload.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { username, avatarUrl } = req.body;
    if (username) user.username = username;
    if (avatarUrl) user.avatarUrl = avatarUrl;

    res.json({ user });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});
