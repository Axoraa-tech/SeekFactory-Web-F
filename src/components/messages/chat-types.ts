import type { Conversation } from "@/entities/message";
import type { Manufacturer } from "@/entities/manufacturer";

export type ChatAttachment = {
  name: string;
  size: string;
  /** Uploaded file URL; absent only while an upload is in flight. */
  url?: string;
};

export type ChatMessage = {
  id: string;
  sender: "user" | "factory";
  text: string;
  time: string;
  attachment?: ChatAttachment;
};

export type ThreadWithMessages = Conversation & {
  manufacturer: Manufacturer;
  messages: ChatMessage[];
};
