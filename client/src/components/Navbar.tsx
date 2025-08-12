import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Squares2X2Icon,
  CalendarDaysIcon,
  HomeModernIcon,
  ChartBarIcon,
  UsersIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  PresentationChartLineIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import EnhancedNotificationCenter from './EnhancedNotificationCenter';
import UniversalSearch from './UniversalSearch';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Squares2X2Icon },
  { name: 'Bookings', href: '/bookings', icon: CalendarDaysIcon },
  { name: 'Rooms', href: '/rooms', icon: HomeModernIcon },
  { name: 'Housekeeping', href: '/housekeeping', icon: SparklesIcon },
  { name: 'Guests', href: '/guests', icon: UsersIcon },
  { name: 'Employees', href: '/employees', icon: IdentificationIcon },
  { name: 'Invoices', href: '/invoices', icon: BanknotesIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Analytics', href: '/analytics', icon: PresentationChartLineIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <nav className="bg-gradient-to-r from-base-100 via-base-200/50 to-base-100 backdrop-blur-md border-b border-primary/10 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-4">
              <div className="p-1 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/10">
                <Logo size={48} className="shadow-sm rounded-lg" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Sunset Hotel
                </h1>
                <p className="text-base-content/60 text-sm font-medium">Management System</p>
              </div>
            </div>
            <div className="hidden md:block ml-12">
              <div className="flex space-x-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border border-primary/20'
                          : 'text-base-content/70 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 hover:text-primary border border-transparent hover:border-primary/10'
                      } px-4 py-2.5 rounded-xl text-sm font-medium flex items-center space-x-2 transition-all duration-200 shadow-sm`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Enhanced Search Bar - Desktop */}
          <div className="hidden lg:block flex-1 max-w-lg mx-8">
            <UniversalSearch />
          </div>

          {/* Right side - Enhanced Notifications, Theme Toggle and User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Mobile Search Button - shows on tablet screens */}
            <div className="lg:hidden">
              <button
                onClick={() => {
                  // In a real app, this would open a modal with search
                  console.log('Open mobile search');
                }}
                className="p-2.5 text-base-content/70 hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-200 border border-transparent hover:border-primary/10"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </div>

            <EnhancedNotificationCenter />
            <ThemeToggle />
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 text-base-content/70 hover:text-primary px-3 py-2 rounded-xl transition-all duration-200 hover:bg-primary/5 border border-transparent hover:border-primary/10"
              >
                <UserCircleIcon className="h-6 w-6" />
                <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-base-100 rounded-xl shadow-lg border border-primary/10 z-50 overflow-hidden">
                  <div className="py-1">
                    <div className="px-4 py-3 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-secondary/5">
                      <p className="text-sm font-medium text-base-content">{user?.email}</p>
                      <p className="text-xs text-base-content/60 capitalize font-medium">{user?.role.toLowerCase()}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-base-content/70 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 hover:text-primary flex items-center space-x-2 transition-all duration-200"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-base-content/70 hover:text-primary p-2.5 rounded-xl hover:bg-primary/5 transition-all duration-200 border border-transparent hover:border-primary/10"
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-base-300">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {/* Mobile Search */}
            <div className="px-3 py-2">
              <UniversalSearch />
            </div>

            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'bg-primary text-primary-content'
                      : 'text-base-content hover:bg-base-300 hover:text-primary'
                  } px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* Mobile User Menu */}
            <div className="border-t border-base-300 pt-2">
              <div className="px-3 py-2 flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-base-content/70">{user?.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <EnhancedNotificationCenter />
                  <ThemeToggle />
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-base-content hover:bg-base-300 hover:text-primary flex items-center space-x-2"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
