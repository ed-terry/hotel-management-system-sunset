import React, { useState } from 'react';
import {
  ClockIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface LoginSession {
  id: string;
  timestamp: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  duration: string;
  status: 'active' | 'ended';
}

interface ActivityStats {
  totalLogins: number;
  lastLogin: string;
  averageSessionTime: string;
  activeSessionsCount: number;
  mostUsedBrowser: string;
  mostUsedOs: string;
}

const UserActivityTracker: React.FC = () => {
  // Mock data - in real app, these would come from backend
  const [sessions] = useState<LoginSession[]>([ // eslint-disable-line @typescript-eslint/no-unused-vars
    {
      id: '1',
      timestamp: '2025-01-18 09:24:15',
      browser: 'Chrome 120.0',
      os: 'Windows 11',
      ip: '192.168.1.100',
      location: 'New York, US',
      duration: '4h 32m',
      status: 'active'
    },
    {
      id: '2', 
      timestamp: '2025-01-17 16:45:22',
      browser: 'Chrome 120.0',
      os: 'Windows 11',
      ip: '192.168.1.100',
      location: 'New York, US',
      duration: '8h 15m',
      status: 'ended'
    },
    {
      id: '3',
      timestamp: '2025-01-16 08:30:45',
      browser: 'Firefox 121.0',
      os: 'Windows 11', 
      ip: '192.168.1.105',
      location: 'New York, US',
      duration: '6h 42m',
      status: 'ended'
    }
  ]);

  const [stats] = useState<ActivityStats>({ // eslint-disable-line @typescript-eslint/no-unused-vars
    totalLogins: 2847,
    lastLogin: '2025-01-18 09:24:15',
    averageSessionTime: '6h 18m',
    activeSessionsCount: 1,
    mostUsedBrowser: 'Chrome',
    mostUsedOs: 'Windows 11'
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: 'active' | 'ended') => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success">
          <div className="w-1.5 h-1.5 bg-success rounded-full mr-1.5"></div>
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-base-300 text-base-content/70">
        Ended
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Activity Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-base-200 border border-base-300 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-base-content/70">Total Logins</p>
              <p className="text-lg font-semibold text-base-content">{stats.totalLogins.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-base-200 border border-base-300 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-info/10 rounded-lg">
              <ClockIcon className="h-5 w-5 text-info" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-base-content/70">Avg. Session</p>
              <p className="text-lg font-semibold text-base-content">{stats.averageSessionTime}</p>
            </div>
          </div>
        </div>

        <div className="bg-base-200 border border-base-300 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-success/10 rounded-lg">
              <ShieldCheckIcon className="h-5 w-5 text-success" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-base-content/70">Active Sessions</p>
              <p className="text-lg font-semibold text-base-content">{stats.activeSessionsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-base-200 border border-base-300 rounded-lg">
        <div className="px-6 py-4 border-b border-base-300">
          <h3 className="text-lg font-semibold text-base-content">Recent Login Sessions</h3>
          <p className="text-sm text-base-content/70 mt-1">Your recent login activity and session details</p>
        </div>
        
        <div className="divide-y divide-base-300">
          {sessions.map((session) => (
            <div key={session.id} className="px-6 py-4 hover:bg-base-100 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-base-100 rounded-lg">
                    <ComputerDesktopIcon className="h-5 w-5 text-base-content/60" />
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-base-content">
                        {session.browser} • {session.os}
                      </p>
                      {getStatusBadge(session.status)}
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1 text-xs text-base-content/60">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>{formatTime(session.timestamp)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <GlobeAltIcon className="h-3 w-3" />
                        <span>{session.ip}</span>
                      </div>
                      <span>Duration: {session.duration}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-base-content/70">{session.location}</p>
                  {session.status === 'active' && (
                    <button className="text-xs text-error hover:text-error/80 mt-1">
                      End Session
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Browser & OS Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-base-200 border border-base-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-base-content mb-4">Browser Usage</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-base-content/70">Chrome</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-base-300 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
                <span className="text-sm font-medium text-base-content">78%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-base-content/70">Firefox</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-base-300 rounded-full h-2">
                  <div className="bg-secondary h-2 rounded-full" style={{ width: '22%' }}></div>
                </div>
                <span className="text-sm font-medium text-base-content">22%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-base-200 border border-base-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-base-content mb-4">Operating System</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-base-content/70">Windows 11</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-base-300 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
                <span className="text-sm font-medium text-base-content">95%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-base-content/70">macOS</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-base-300 rounded-full h-2">
                  <div className="bg-secondary h-2 rounded-full" style={{ width: '5%' }}></div>
                </div>
                <span className="text-sm font-medium text-base-content">5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivityTracker;
