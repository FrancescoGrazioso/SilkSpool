export interface Notification {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning';
  title: string;
  message: string;
  duration?: number; // Auto-dismiss after this many ms (0 = no auto-dismiss)
  progress?: number; // 0-100 for progress bars
}

export type NotificationCallback = (notification: Notification) => void;

class NotificationService {
  private listeners: NotificationCallback[] = [];
  private notifications: Notification[] = [];
  private nextId = 1;

  subscribe(callback: NotificationCallback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notify(notification: Notification) {
    this.notifications.push(notification);
    this.listeners.forEach(listener => listener(notification));
    
    // Auto-dismiss if duration is set
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.duration);
    }
  }

  show(notification: Omit<Notification, 'id'>) {
    const newNotification: Notification = {
      id: `notification-${this.nextId++}`,
      ...notification,
    };
    this.notify(newNotification);
    return newNotification.id;
  }

  updateProgress(notificationId: string, progress: number) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.progress = Math.max(0, Math.min(100, progress));
      this.listeners.forEach(listener => listener(notification));
    }
  }

  dismiss(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.listeners.forEach(listener => {
      // Send a special "dismiss" notification
      listener({
        id: notificationId,
        type: 'info',
        title: '',
        message: '',
        duration: 0,
      });
    });
  }

  // Convenience methods
  info(title: string, message: string, duration = 5000) {
    return this.show({ type: 'info', title, message, duration });
  }

  success(title: string, message: string, duration = 5000) {
    return this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration = 0) {
    return this.show({ type: 'error', title, message, duration });
  }

  warning(title: string, message: string, duration = 5000) {
    return this.show({ type: 'warning', title, message, duration });
  }

  progress(title: string, message: string, initialProgress = 0) {
    return this.show({ 
      type: 'info', 
      title, 
      message, 
      progress: initialProgress,
      duration: 0 // Don't auto-dismiss progress notifications
    });
  }
}

export const notificationService = new NotificationService();
