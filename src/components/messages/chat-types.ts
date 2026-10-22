import type { Conversation, MessageOrderContext } from "@/entities/message";
import type { Manufacturer } from "@/entities/manufacturer";
import type { MessageAttachment } from "@/shared/api/contracts";

export type ChatMessage = {
  id: string;
  senderId?: string;
  senderType?: string;
  senderName?: string;
  senderAvatarUrl?: string;
  sender: "user" | "factory";
  text: string;
  time: string;
  attachment?: MessageAttachment;
  /** The order this message is about, if the sender picked one. */
  order?: MessageOrderContext;
  /** ISO time of the sender's last edit. */
  editedAt?: string;
  /** Deleted for everyone by the sender. */
  deleted?: boolean;
};

export type ThreadWithMessages = Conversation & {
  manufacturer: Manufacturer;
  messages: ChatMessage[];
};
