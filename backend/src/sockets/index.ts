import { Server, Socket } from 'socket.io';
import { registerNotificationHandlers } from './handlers/notification.handler';
import { registerOrderHandlers } from './handlers/order.handler';

export function registerSocketHandlers(io: Server, socket: Socket): void {
  registerNotificationHandlers(io, socket);
  registerOrderHandlers(io, socket);
}
