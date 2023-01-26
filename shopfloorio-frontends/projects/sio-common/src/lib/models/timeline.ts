export enum NotificationType {
  ERROR = 'Error',
  NOTIFICATION = 'Notification',
}

export interface TimeLine {
  notificationType: NotificationType;
  description: string;
  color?: string;
  createdAt: string;
}
