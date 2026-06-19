import { useCallback, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';
import { SOCKET_EVENTS } from './useSocket.types';

const SOCKET_URL = import.meta.env['VITE_SOCKET_URL'] as string ?? 'http://localhost:3000';

let socketInstance: Socket | null = null;

export function useSocket() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
      return;
    }

    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        auth: { token: accessToken },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });
    }

    socketRef.current = socketInstance;

    return () => {
      // Don't disconnect on component unmount — singleton
    };
  }, [accessToken]);

  const on = useCallback((event: string, handler: (...args: unknown[]) => void) => {
    socketRef.current?.on(event, handler);
    return () => {
      socketRef.current?.off(event, handler);
    };
  }, []); // socketRef is a stable ref object — value is read at call time

  const emit = useCallback((event: string, data?: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  const joinRoom = useCallback((room: string) => {
    socketRef.current?.emit(`join:${room}_room`, { [`${room}Id`]: room });
  }, []);

  return {
    socket: socketRef.current,
    on,
    emit,
    joinRoom,
    isConnected: socketRef.current?.connected ?? false,
    EVENTS: SOCKET_EVENTS,
  };
}
