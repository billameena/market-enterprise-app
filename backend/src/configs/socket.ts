import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { redisPublisher, redisSubscriber } from './redis';
import { env } from './env';
import { logger } from './logger';
import { verifyAccessToken } from '../utils/jwt';
import { registerSocketHandlers } from '../sockets';

let io: SocketServer;

export function createSocketServer(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    path: '/socket.io',
  });

  // Redis adapter for horizontal scaling
  io.adapter(createAdapter(redisPublisher, redisSubscriber));

  // JWT authentication middleware on socket handshake
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth['token'] as string | undefined ||
        (socket.handshake.headers['authorization'] as string | undefined)?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const payload = verifyAccessToken(token);
      socket.data = { userId: payload.sub, role: payload.role };
      return next();
    } catch {
      return next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket) => {
    const { userId } = socket.data as { userId: string; role: string };
    logger.info('Socket client connected', { socketId: socket.id, userId });

    // Auto-join user's personal room
    void socket.join(`user:${userId}`);

    registerSocketHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      logger.info('Socket client disconnected', { socketId: socket.id, userId, reason });
    });
  });

  return io;
}

export function getSocketServer(): SocketServer {
  if (!io) {
    throw new Error('Socket server not initialized');
  }
  return io;
}

export function emitToUser(userId: string, event: string, data: unknown): void {
  getSocketServer().to(`user:${userId}`).emit(event, data);
}

export function emitToRoom(room: string, event: string, data: unknown): void {
  getSocketServer().to(room).emit(event, data);
}
