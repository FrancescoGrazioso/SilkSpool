import React, { useState, useEffect } from 'react';
import { notificationService, Notification } from '../services/notificationService';

interface NotificationContainerProps {
  className?: string;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  className = ""
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    return notificationService.subscribe((notification) => {
      if (notification.title === '' && notification.message === '') {
        // This is a dismiss notification
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      } else {
        setNotifications(prev => {
          const existing = prev.find(n => n.id === notification.id);
          if (existing) {
            // Update existing notification
            return prev.map(n => n.id === notification.id ? notification : n);
          } else {
            // Add new notification
            return [...prev, notification];
          }
        });
      }
    });
  }, []);

  const dismissNotification = (id: string) => {
    notificationService.dismiss(id);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return (
          <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getBorderColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'border-l-green-500';
      case 'error': return 'border-l-red-500';
      case 'warning': return 'border-l-yellow-500';
      default: return 'border-l-blue-500';
    }
  };

  const getBackgroundColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-900';
      case 'error': return 'bg-red-900';
      case 'warning': return 'bg-yellow-900';
      default: return 'bg-blue-900';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 space-y-2 ${className}`}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            w-96 max-w-lg bg-gray-800 border-l-4 ${getBorderColor(notification.type)} ${getBackgroundColor(notification.type)}
            shadow-lg rounded-lg p-3 transform transition-all duration-300 ease-in-out
            animate-in slide-in-from-right-full
          `}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-100">
                {notification.title}
              </p>
              <p className="text-sm text-gray-300">
                {notification.message}
              </p>
              
              {/* Progress bar */}
              {notification.progress !== undefined && (
                <div className="mt-1">
                  <div className="bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-primary-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${notification.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {Math.round(notification.progress)}%
                  </p>
                </div>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => dismissNotification(notification.id)}
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
