import type { Conversation } from "@/entities/message";
import type { Manufacturer } from "@/entities/manufacturer";

export type ChatMessage = {
  id: string;
  sender: "user" | "factory";
  text: string;
  time: string;
  attachment?: {
    name: string;
    size: string;
  };
};

export type ThreadWithMessages = Conversation & {
  manufacturer: Manufacturer;
  messages: ChatMessage[];
};
