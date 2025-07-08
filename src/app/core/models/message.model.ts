
export interface ChatThread {
  chatId: number;
  bookingId: number;
  clientName: string;
  handymanName: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;           // NEW
  isOnline?: boolean;             // NEW
  bookingDate?: string;          // For display
  categoryName?: string;         // For context
  serviceName?: string;

}

export interface MessageDTO {
  chatId: number;
  senderId?: number;
  content: string;
  sentAt?: string;
  senderName?: string;         
  senderRole?: string;     
}
