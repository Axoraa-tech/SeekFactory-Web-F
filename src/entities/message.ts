/** Order a chat message is about (chosen by the sender as context). */
export type MessageOrderContext = {
  id: string;
  referenceNumber: string;
  productName: string;
  productSlug?: string;
  quantity?: number;
  unit?: string;
  status?: string;
};

export type Conversation = {
  id: string;
  manufacturerId: string;
  buyerId?: string;
  buyerName?: string;
  buyerCompany?: string;
  buyerAvatarUrl?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};
