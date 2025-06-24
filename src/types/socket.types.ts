import { Socket } from "socket.io";

// Socket user interface
export interface SocketUser {
  id: number;
  email: string;
  role: "user" | "admin";
}

// Extend Socket interface to include user data
declare module "socket.io" {
  interface Socket {
    user?: SocketUser;
  }
}

// Direct message payload interface
export interface DirectMessagePayload {
  content: string;
  receiverId: number;
}

// Direct message response interface
export interface MessageResponse {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  sentAt: Date;
  read?: boolean;
}

// Group message payload interface
export interface GroupMessagePayload {
  content: string;
  groupId: number;
}

// Group message response interface
export interface GroupMessageResponse {
  id: number;
  content: string;
  groupId: number;
  senderId: number;
  sentAt: Date;
}

// Socket callback function interface
export interface SocketCallback {
  (response: {
    success: boolean;
    message?: MessageResponse | GroupMessageResponse;
    error?: string;
  }): void;
}
