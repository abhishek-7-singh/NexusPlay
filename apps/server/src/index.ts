import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { monitor } from '@colyseus/monitor';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { TicTacToeRoom } from './rooms/TicTacToeRoom';
import { ChessRoom } from './rooms/ChessRoom';
import { LudoRoom } from './rooms/LudoRoom';
import { CardBlastRoom } from './rooms/CardBlastRoom';
import { authRouter } from './api/auth';
import { roomsRouter } from './api/rooms';

const PORT = Number(process.env.PORT) || 3001;

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// API routes
app.use('/api/auth', authRouter);
app.use('/api/rooms', roomsRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Colyseus monitor (admin dashboard)
app.use('/colyseus', monitor());

const server = http.createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({ server }),
});

// Register game rooms
gameServer.define('tic-tac-toe', TicTacToeRoom);
gameServer.define('chess', ChessRoom);
gameServer.define('ludo', LudoRoom);
gameServer.define('card-blast', CardBlastRoom);

gameServer.listen(PORT).then(() => {
  console.log(`\n🎮 GameStore Server running on http://localhost:${PORT}`);
  console.log(`📊 Colyseus Monitor: http://localhost:${PORT}/colyseus`);
  console.log(`🌐 WebSocket ready for connections\n`);
});
