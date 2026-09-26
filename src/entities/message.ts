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
