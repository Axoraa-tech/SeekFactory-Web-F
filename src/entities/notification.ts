export type NotificationType = "system" | "quote" | "rfq" | "message" | "follow" | "order";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  /** system, quote, rfq, message, follow or order */
  type: NotificationType;
  /** Id of the RFQ, conversation, order or factory the notification is about. */
  referenceId?: string;
};
