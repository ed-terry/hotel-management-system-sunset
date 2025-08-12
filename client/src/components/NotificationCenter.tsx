import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import {
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  GET_HOUSEKEEPING_TASKS_QUERY,
  GET_ROOMS_QUERY,
} from '../graphql/queries';
import {
  GetHousekeepingTasksResponse,
  GetRoomsResponse,
} from '../types/graphql';

interface Notification {
  id: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { data: tasksData } = useQuery<GetHousekeepingTasksResponse>(
    GET_HOUSEKEEPING_TASKS_QUERY,
    {
      pollInterval: 30000, // Real-time updates
      errorPolicy: 'all',
    }
  );

  const { data: roomsData } = useQuery<GetRoomsResponse>(GET_ROOMS_QUERY, {
    pollInterval: 30000,
    errorPolicy: 'all',
  });

  // Generate notifications based on data
  useEffect(() => {
    const newNotifications: Notification[] = [];

    if (tasksData?.housekeepingTasks) {
      const urgentTasks = tasksData.housekeepingTasks.filter(
        task => task.priority === 'URGENT' && task.status === 'PENDING'
      );

      urgentTasks.forEach(task => {
        newNotifications.push({
          id: `urgent-task-${task.id}`,
          type: 'urgent',
          title: 'Urgent Task Pending',
          message: `Room ${task.room.number} - ${task.taskType.replace(/_/g, ' ')}`,
          timestamp: new Date(task.createdAt),
          read: false,
        });
      });

      // Overdue tasks (created more than 2 hours ago and still pending)
      const overdueTasks = tasksData.housekeepingTasks.filter(task => {
        const createdTime = new Date(task.createdAt).getTime();
        const now = new Date().getTime();
        const hoursOld = (now - createdTime) / (1000 * 60 * 60);
        return task.status === 'PENDING' && hoursOld > 2;
      });

      overdueTasks.forEach(task => {
        newNotifications.push({
          id: `overdue-task-${task.id}`,
          type: 'warning',
          title: 'Overdue Task',
          message: `Room ${task.room.number} task has been pending for over 2 hours`,
          timestamp: new Date(task.createdAt),
          read: false,
        });
      });

      // Recently completed tasks
      const recentlyCompleted = tasksData.housekeepingTasks.filter(task => {
        if (!task.completedAt) return false;
        const completedTime = new Date(task.completedAt).getTime();
        const now = new Date().getTime();
        const minutesAgo = (now - completedTime) / (1000 * 60);
        return task.status === 'COMPLETED' && minutesAgo < 30;
      });

      recentlyCompleted.forEach(task => {
        newNotifications.push({
          id: `completed-task-${task.id}`,
          type: 'success',
          title: 'Task Completed',
          message: `Room ${task.room.number} ${task.taskType.replace(/_/g, ' ').toLowerCase()} completed`,
          timestamp: new Date(task.completedAt!),
          read: false,
        });
      });
    }

    if (roomsData?.rooms) {
      const maintenanceRooms = roomsData.rooms.filter(
        room => room.status === 'MAINTENANCE'
      );

      maintenanceRooms.forEach(room => {
        newNotifications.push({
          id: `maintenance-room-${room.id}`,
          type: 'warning',
          title: 'Room in Maintenance',
          message: `Room ${room.number} is currently under maintenance`,
          timestamp: new Date(),
          read: false,
        });
      });
    }

    // Sort by timestamp (newest first) and limit to 10
    newNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    setNotifications(newNotifications.slice(0, 10));
  }, [tasksData, roomsData]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'urgent':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />;
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      default:
        return <ClockIcon className="h-5 w-5 text-blue-400" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'urgent':
        return 'border-l-red-500 bg-red-900/10';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-900/10';
      case 'success':
        return 'border-l-green-500 bg-green-900/10';
      default:
        return 'border-l-blue-500 bg-blue-900/10';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-base-content/70 hover:text-base-content transition-all duration-200 hover:bg-base-200/50 rounded-lg group"
      >
        <BellIcon className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Notification Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-gradient-to-br from-base-200 to-base-300/90 backdrop-blur-md border border-primary/20 rounded-xl shadow-xl z-50 max-h-[32rem] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10">
              <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                <BellIcon className="h-5 w-5 text-primary" />
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <BellIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-600">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`p-4 cursor-pointer hover:bg-primary transition-colors border-l-4 ${getNotificationColor(
                        notification.type
                      )} ${!notification.read ? 'bg-primary/30' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-300 mt-1">
                            {notification.message}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
