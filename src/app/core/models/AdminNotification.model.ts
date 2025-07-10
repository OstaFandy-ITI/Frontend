export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  isActive: boolean;
  createdAt: string;
  actionTaken?: 'approved' | 'rejected' | 'dismissed';
  actionStatus?: string;
}

export interface VacationRequest {
  handymanId: number;
  reason: string;
  startDate: string;
  endDate: string;
}