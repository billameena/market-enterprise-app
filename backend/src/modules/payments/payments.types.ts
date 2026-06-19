export interface CreatePaymentIntentInput {
  orderId: string;
}

export interface ConfirmPaymentInput {
  paymentIntentId: string;
}

export interface RefundInput {
  orderId: string;
  amount?: number;
  reason?: string;
}

export interface WebhookEvent {
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}
