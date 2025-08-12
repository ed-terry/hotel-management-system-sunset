import React, { useState, useEffect, useCallback } from 'react';
import { BellIcon, XMarkIcon, CheckIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'booking' | 'housekeeping' | 'payment';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'system' | 'booking' | 'housekeeping' | 'payment' | 'maintenance' | 'guest';
  metadata?: Record<string, any>;
}

const EnhancedNotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'priority'>('timestamp');

  // Mock data for demonstration
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'booking',
        title: 'New Booking Received',
        message: 'Room 204 has been booked for 3 nights by John Smith',
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        isRead: false,
        priority: 'high',
        category: 'booking',
        actionUrl: '/bookings',
        metadata: { roomNumber: '204', guestName: 'John Smith' }
      },
      {
        id: '2',
        type: 'housekeeping',
        title: 'Room Cleaning Complete',
        message: 'Room 105 has been cleaned and is ready for check-in',
        timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
        isRead: false,
        priority: 'medium',
        category: 'housekeeping',
        actionUrl: '/housekeeping',
        metadata: { roomNumber: '105', status: 'ready' }
      },
      {
        id: '3',
        type: 'payment',
        title: 'Payment Received',
        message: 'Payment of $450.00 received for Invoice #INV-001',
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        isRead: true,
        priority: 'medium',
        category: 'payment',
        actionUrl: '/invoices',
        metadata: { amount: 450.00, invoiceId: 'INV-001' }
      },
      {
        id: '4',
        type: 'warning',
        title: 'Maintenance Required',
        message: 'Air conditioning in Room 301 needs attention',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: false,
        priority: 'urgent',
        category: 'maintenance',
        metadata: { roomNumber: '301', issue: 'air_conditioning' }
      },
      {
        id: '5',
        type: 'info',
        title: 'System Update',
        message: 'Sunset Hotel management system has been updated to version 2.1.0',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        isRead: true,
        priority: 'low',
        category: 'system',
        metadata: { version: '2.1.0' }
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const shouldAddNotification = Math.random() > 0.95; // 5% chance every 30 seconds
      
      if (shouldAddNotification) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: 'info',
          title: 'Real-time Update',
          message: 'A new event has occurred in the system',
          timestamp: new Date(),
          isRead: false,
          priority: 'medium',
          category: 'system'
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        
        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/logo.svg'
          });
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: Notification['type']) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case 'error':
        return <ExclamationTriangleIcon className={`${iconClass} text-red-500`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${iconClass} text-yellow-500`} />;
      case 'success':
        return <CheckIcon className={`${iconClass} text-green-500`} />;
      case 'booking':
        return <div className={`${iconClass} bg-blue-500 rounded text-white text-xs flex items-center justify-center`}>B</div>;
      case 'housekeeping':
        return <div className={`${iconClass} bg-purple-500 rounded text-white text-xs flex items-center justify-center`}>H</div>;
      case 'payment':
        return <div className={`${iconClass} bg-green-500 rounded text-white text-xs flex items-center justify-center`}>$</div>;
      default:
        return <InformationCircleIcon className={`${iconClass} text-blue-500`} />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-blue-500 bg-blue-50';
      case 'low': return 'border-gray-300 bg-gray-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const filteredNotifications = notifications
    .filter(notification => {
      if (filter === 'all') return true;
      if (filter === 'unread') return !notification.isRead;
      return notification.category === filter;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

  const categories = Array.from(new Set(notifications.map(n => n.category)));

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
      >
        {unreadCount > 0 ? (
          <BellIconSolid className="h-6 w-6 text-blue-600" />
        ) : (
          <BellIcon className="h-6 w-6" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'priority')}
                className="text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="timestamp">Recent</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications to display
              </div>
            ) : (
              <div className="space-y-1">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      notification.isRead ? 'opacity-60' : ''
                    } ${getPriorityColor(notification.priority)}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium text-gray-900 ${
                              !notification.isRead ? 'font-semibold' : ''
                            }`}>
                              {notification.title}
                            </p>
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          {notification.priority === 'urgent' && (
                            <span className="inline-block mt-1 px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                              Urgent
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-800">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedNotificationCenter;
