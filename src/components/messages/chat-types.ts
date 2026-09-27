import type { Conversation, MessageOrderContext } from "@/entities/message";
import type { Manufacturer } from "@/entities/manufacturer";
import type { MessageAttachment } from "@/shared/api/contracts";

export type ChatMessage = {
  id: string;
  sender: "user" | "factory";
  text: string;
  time: string;
  attachment?: MessageAttachment;
  /** The order this message is about, if the sender picked one. */
  order?: MessageOrderContext;
};

export type ThreadWithMessages = Conversation & {
  manufacturer: Manufacturer;
  messages: ChatMessage[];
};
