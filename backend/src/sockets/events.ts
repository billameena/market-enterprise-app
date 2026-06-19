// Socket event name constants
export const SOCKET_EVENTS = {
  // Server → Client
  NOTIFICATION_NEW: 'notification:new',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  ORDER_CREATED: 'order:created',
  ORDER_ITEM_SHIPPED: 'order:item_shipped',
  PAYMENT_CONFIRMED: 'payment:confirmed',
  CART_UPDATED: 'cart:updated',
  PRODUCT_BACK_IN_STOCK: 'product:back_in_stock',

  // AI — Server → Client
  AI_DESCRIPTION_READY: 'ai:description_ready',

  // Client → Server
  JOIN_ORDER_ROOM: 'join:order_room',
  LEAVE_ORDER_ROOM: 'leave:order_room',
  MARK_NOTIFICATION_READ: 'mark:notification_read',
} as const;

export type ServerToClientEvents = {
  [SOCKET_EVENTS.NOTIFICATION_NEW]: (data: { id: string; title: string; body: string; type: string }) => void;
  [SOCKET_EVENTS.ORDER_STATUS_CHANGED]: (data: { orderId: string; status: string }) => void;
  [SOCKET_EVENTS.ORDER_CREATED]: (data: { orderId: string; orderNumber: string }) => void;
  [SOCKET_EVENTS.PAYMENT_CONFIRMED]: (data: { orderId: string }) => void;
  [SOCKET_EVENTS.CART_UPDATED]: (data: { count: number }) => void;
};

export type ClientToServerEvents = {
  [SOCKET_EVENTS.JOIN_ORDER_ROOM]: (data: { orderId: string }) => void;
  [SOCKET_EVENTS.LEAVE_ORDER_ROOM]: (data: { orderId: string }) => void;
  [SOCKET_EVENTS.MARK_NOTIFICATION_READ]: (data: { notificationId: string }) => void;
};
