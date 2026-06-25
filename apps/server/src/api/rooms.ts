import { Router } from 'express';

export const roomsRouter = Router();

// Get active rooms list (for lobby browser)
roomsRouter.get('/list', (_req, res) => {
  // This will be populated by Colyseus room metadata
  // For now return empty - the actual room listing uses Colyseus lobby
  res.json({ rooms: [] });
});

// Get room by code
roomsRouter.get('/code/:code', (req, res) => {
  const { code } = req.params;
  // Room lookup will be done via Colyseus matchmaker
  res.json({ roomCode: code, found: false });
});
