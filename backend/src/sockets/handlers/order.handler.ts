import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../events';
import { logger } from '../../configs/logger';

export function registerOrderHandlers(_io: Server, socket: Socket): void {
  const { userId } = socket.data as { userId: string };

  socket.on(SOCKET_EVENTS.JOIN_ORDER_ROOM, (data: { orderId: string }) => {
    const room = `order:${data.orderId}`;
    void socket.join(room);
    logger.debug('Client joined order room', { socketId: socket.id, userId, room });
  });

  socket.on(SOCKET_EVENTS.LEAVE_ORDER_ROOM, (data: { orderId: string }) => {
    const room = `order:${data.orderId}`;
    void socket.leave(room);
    logger.debug('Client left order room', { socketId: socket.id, userId, room });
  });
}
