import React, { useState } from 'react';
import {
  CogIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';
import ThemePicker from '../components/ThemePicker';
import UserActivityTracker from '../components/UserActivityTracker';

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
  });

  const settingsSections = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon },
    { id: 'system', name: 'System', icon: ServerIcon },
  ];

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <CogIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Settings</h1>
              <p className="text-white/90 text-lg">Customize your experience and manage preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Settings Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-base-200 border border-base-300 rounded-2xl shadow-lg p-4 sticky top-24">
              <nav className="space-y-2">
                {settingsSections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                        activeSection === section.id
                          ? 'bg-primary text-primary-content shadow-md scale-[1.02]'
                          : 'text-base-content hover:bg-base-300 hover:text-primary hover:scale-[1.01]'
                      }`}
                    >
                      <IconComponent className={`h-5 w-5 transition-transform duration-200 ${
                        activeSection === section.id ? 'scale-110' : 'group-hover:scale-110'
                      }`} />
                      <span className="font-medium">{section.name}</span>
                      {activeSection === section.id && (
                        <div className="ml-auto w-2 h-2 bg-primary-content rounded-full animate-pulse"></div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:w-3/4">
            <div className="bg-base-200 border border-base-300 rounded-2xl shadow-lg p-6 sm:p-8">
              {activeSection === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-base-content mb-6">Profile Settings</h2>
                  <div className="space-y-6">
                    {/* Profile Information */}
                    <div className="bg-base-100 rounded-lg p-6 border border-base-300">
                      <h3 className="text-lg font-semibold text-base-content mb-4">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-base-content/70 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            defaultValue="Hotel"
                            className="w-full px-4 py-2 bg-base-200 border border-base-300 rounded-lg text-base-content focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-base-content/70 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            defaultValue="Admin"
                            className="w-full px-4 py-2 bg-base-200 border border-base-300 rounded-lg text-base-content focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-base-content/70 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            defaultValue="admin@hotelmanagement.com"
                            className="w-full px-4 py-2 bg-base-200 border border-base-300 rounded-lg text-base-content focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Activity & Security */}
                    <div className="bg-base-100 rounded-lg p-6 border border-base-300">
                      <h3 className="text-lg font-semibold text-base-content mb-4">Activity & Security</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-2 border-b border-base-300">
                            <span className="text-base-content/70 text-sm">Last Login</span>
                            <span className="text-base-content font-medium">Today, 9:24 AM</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-base-300">
                            <span className="text-base-content/70 text-sm">Login Count</span>
                            <span className="text-base-content font-medium">2,847 times</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-base-300">
                            <span className="text-base-content/70 text-sm">Account Created</span>
                            <span className="text-base-content font-medium">Jan 15, 2024</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-base-content/70 text-sm">Status</span>
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                              <span className="text-success font-medium">Active</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="p-4 bg-info/10 border border-info/30 rounded-lg">
                            <div className="flex items-center mb-2">
                              <svg className="w-5 h-5 text-info mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              <span className="text-info font-medium text-sm">Security Status</span>
                            </div>
                            <p className="text-base-content/80 text-sm">
                              Your account is secure. Two-factor authentication is enabled.
                            </p>
                          </div>
                          
                          <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                            <div className="flex items-center mb-2">
                              <svg className="w-5 h-5 text-warning mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <span className="text-warning font-medium text-sm">Password Reminder</span>
                            </div>
                            <p className="text-base-content/80 text-sm">
                              Last password change: 45 days ago. Consider updating your password.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* User Activity Tracker */}
                    <UserActivityTracker />
                  </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-base-content mb-6">Notification Preferences</h2>
                  <div className="space-y-8">
                    {/* General Notifications */}
                    <div className="bg-base-100 rounded-lg p-6 border border-base-300">
                      <h3 className="text-lg font-semibold text-base-content mb-4">General Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base font-medium text-base-content">Email Notifications</h4>
                            <p className="text-base-content/70 text-sm">Receive notifications via email</p>
                          </div>
                          <button
                            onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              notifications.email ? 'bg-primary' : 'bg-base-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                notifications.email ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base font-medium text-base-content">Push Notifications</h4>
                            <p className="text-base-content/70 text-sm">Receive push notifications in browser</p>
                          </div>
                          <button
                            onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              notifications.push ? 'bg-primary' : 'bg-base-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                notifications.push ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base font-medium text-base-content">SMS Notifications</h4>
                            <p className="text-base-content/70 text-sm">Receive notifications via SMS</p>
                          </div>
                          <button
                            onClick={() => setNotifications(prev => ({ ...prev, sms: !prev.sms }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              notifications.sms ? 'bg-primary' : 'bg-base-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                notifications.sms ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Booking Notifications */}
                    <div className="bg-base-100 rounded-lg p-6 border border-base-300">
                      <h3 className="text-lg font-semibold text-base-content mb-4">🏨 Booking Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base font-medium text-base-content">New Reservations</h4>
                            <p className="text-base-content/70 text-sm">Get notified when new bookings are made</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-primary">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base font-medium text-base-content">Cancellations</h4>
                            <p className="text-base-content/70 text-sm">Get notified when bookings are cancelled</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-primary">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base font-medium text-base-content">Check-in Reminders</h4>
                            <p className="text-base-content/70 text-sm">Reminders for upcoming check-ins</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-primary">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* System Notifications */}
                    <div className="bg-base-100 rounded-lg p-6 border border-base-300">
                      <h3 className="text-lg font-semibold text-base-content mb-4">🔧 System Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base font-medium text-base-content">Security Alerts</h4>
                            <p className="text-base-content/70 text-sm">Important security notifications</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-primary">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base font-medium text-base-content">System Updates</h4>
                            <p className="text-base-content/70 text-sm">Get notified about system updates</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-base-300">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Notification Schedule */}
                    <div className="bg-base-100 rounded-lg p-6 border border-base-300">
                      <h3 className="text-lg font-semibold text-base-content mb-4">📅 Schedule & Timing</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-base-content/70 mb-2">
                            Report Schedule
                          </label>
                          <select className="w-full px-4 py-2 bg-base-200 border border-base-300 rounded-lg text-base-content focus:ring-2 focus:ring-primary focus:border-transparent">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="never">Never</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-base-content/70 mb-2">
                            Quiet Hours (No notifications during these hours)
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-base-content/60 mb-1">From</label>
                              <input
                                type="time"
                                defaultValue="22:00"
                                className="w-full px-3 py-2 bg-base-200 border border-base-300 rounded-lg text-base-content focus:ring-2 focus:ring-primary focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-base-content/60 mb-1">To</label>
                              <input
                                type="time"
                                defaultValue="08:00"
                                className="w-full px-3 py-2 bg-base-200 border border-base-300 rounded-lg text-base-content focus:ring-2 focus:ring-primary focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-base-content mb-6">Security Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-base-content mb-3">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-base-content/70 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-2 bg-base-100 border border-base-300 rounded-lg text-base-content focus:ring-2 focus:ring-secondary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-base-content/70 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-2 bg-base-100 border border-base-300 rounded-lg text-base-content focus:ring-2 focus:ring-secondary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-base-content/70 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-2 bg-base-100 border border-base-300 rounded-lg text-base-content focus:ring-2 focus:ring-secondary focus:border-transparent"
                          />
                        </div>
                        <button className="px-6 py-2 bg-secondary hover:bg-secondary/90 text-base-content rounded-lg transition-colors">
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'appearance' && (
                <div>
                  <h2 className="text-2xl font-bold text-base-content mb-6">Appearance Settings</h2>
                  <ThemePicker />
                </div>
              )}

              {activeSection === 'system' && (
                <div>
                  <h2 className="text-2xl font-bold text-base-content mb-6">System Settings</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-primary rounded-lg p-4">
                        <h3 className="text-lg font-medium text-base-content mb-2">Database Status</h3>
                        <p className="text-green-400">Connected</p>
                      </div>
                      <div className="bg-primary rounded-lg p-4">
                        <h3 className="text-lg font-medium text-base-content mb-2">Server Status</h3>
                        <p className="text-green-400">Running</p>
                      </div>
                      <div className="bg-primary rounded-lg p-4">
                        <h3 className="text-lg font-medium text-base-content mb-2">Last Backup</h3>
                        <p className="text-base-content/70">Today, 3:00 AM</p>
                      </div>
                      <div className="bg-primary rounded-lg p-4">
                        <h3 className="text-lg font-medium text-base-content mb-2">Version</h3>
                        <p className="text-base-content/70">1.0.0</p>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <button className="px-6 py-2 bg-info hover:bg-info/90 text-base-content rounded-lg transition-colors">
                        Create Backup
                      </button>
                      <button className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-base-content rounded-lg transition-colors">
                        Export Data
                      </button>
                      <button className="px-6 py-2 bg-success hover:bg-success/90 text-base-content rounded-lg transition-colors">
                        Check Updates
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
