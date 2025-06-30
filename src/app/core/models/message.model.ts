export interface ChatThread {
  chatId: number;
  bookingId: number;
  clientName: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface MessageDTO {
  chatId: number;
  senderId: number;
  content: string;
  sentAt?: string;
}
