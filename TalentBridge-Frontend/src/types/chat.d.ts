export type MessageRole = "USER" | "ASSISTANT";

export interface ChatRequest {
  question: string;
  sessionId: string;
}

export interface ChatMessageDto {
  id: number;
  role: MessageRole;
  content: string;
  createdAt: string; // ISO format: "yyyy-MM-dd HH:mm:ss"
  createdBy: string;
  attachmentUrls?: string[];
  attachmentTypes?: string[];
}

export interface ChatSessionDto {
  sessionId: string;
  firstMessage: string;
  lastMessage: string;
  messageCount: number;
  createdAt: string; // ISO format: "yyyy-MM-dd HH:mm:ss"
  lastMessageTime: string; // ISO format: "yyyy-MM-dd HH:mm:ss"
}

export interface ChatSessionInfo {
  sessionId: string;
  exists: boolean;
  messageCount: number;
}

