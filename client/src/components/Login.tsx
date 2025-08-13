import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import Logo from './Logo';

// Enhanced login component with better performance and accessibility
const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  // Memoized handlers for better performance
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      // Navigation will be handled by the auth context and routing
    } catch (error) {
      // Error handling is done in the auth context
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, login]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleDemoLogin = useCallback(() => {
    setEmail('admin@sunsethotel.com');
    setPassword('sunset123');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100/80 via-red-50/50 to-orange-200/40 dark:from-base-300/10 dark:via-orange-900/20 dark:to-red-900/10 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden transition-all duration-300">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-gradient-to-br from-orange-400/20 to-red-400/20 dark:from-orange-600/10 dark:to-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-gradient-to-br from-red-400/20 to-orange-400/20 dark:from-red-600/10 dark:to-orange-600/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-br from-orange-400/15 to-red-400/15 dark:from-orange-600/5 dark:to-red-600/5 rounded-full blur-3xl animate-ping animation-delay-2000"></div>
      </div>

      <div className="max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8 relative z-10">
        {/* Enhanced Header with improved responsive design */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 bg-gradient-to-br from-orange-100/40 via-red-100/30 to-orange-200/40 dark:from-orange-900/20 dark:via-red-900/15 dark:to-orange-800/20 backdrop-blur-md rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 shadow-2xl border border-orange-300/30 dark:border-orange-700/30 hover:scale-105 transition-transform duration-300 p-2 sm:p-3 ring-4 ring-orange-400/20 dark:ring-orange-600/20 ring-offset-2 ring-offset-transparent">
            <Logo size={64} className="sm:hidden rounded-xl shadow-xl drop-shadow-lg" />
            <Logo size={80} className="hidden sm:block lg:hidden rounded-xl shadow-xl drop-shadow-lg" />
            <Logo size={88} className="hidden lg:block rounded-2xl shadow-xl drop-shadow-lg" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-800 bg-clip-text text-transparent mb-2 drop-shadow-sm">
            Sunset Hotel
          </h2>
          <p className="text-base-content/80 text-base sm:text-lg font-semibold tracking-wide drop-shadow-sm">
            Management System
          </p>
          <p className="mt-2 text-base-content/70 text-sm sm:text-base font-medium">
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-base-100/85 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 border border-orange-200/40 dark:border-orange-800/40 hover:shadow-3xl transition-all duration-300 ring-2 ring-orange-300/20 dark:ring-orange-700/20">
          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-bold text-base-content">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-base-content/50 group-focus-within:text-orange-600 transition-colors duration-200" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-base-200/70 border-2 border-orange-200/50 dark:border-orange-800/50 rounded-lg sm:rounded-xl text-base-content placeholder-base-content/50 focus:outline-none focus:ring-4 focus:ring-orange-300/30 dark:focus:ring-orange-700/30 focus:border-orange-400 dark:focus:border-orange-600 transition-all duration-200 backdrop-blur-sm hover:bg-base-200/80 text-sm sm:text-base shadow-inner"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-bold text-base-content">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-4 w-4 sm:h-5 sm:w-5 text-base-content/50 group-focus-within:text-orange-600 transition-colors duration-200" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 bg-base-200/70 border-2 border-orange-200/50 dark:border-orange-800/50 rounded-lg sm:rounded-xl text-base-content placeholder-base-content/50 focus:outline-none focus:ring-4 focus:ring-orange-300/30 dark:focus:ring-orange-700/30 focus:border-orange-400 dark:focus:border-orange-600 transition-all duration-200 backdrop-blur-sm hover:bg-base-200/80 text-sm sm:text-base shadow-inner"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5 text-base-content/50 hover:text-orange-600 transition-colors duration-200" />
                  ) : (
                    <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-base-content/50 hover:text-orange-600 transition-colors duration-200" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3 sm:pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 sm:py-3.5 px-4 border border-transparent text-sm sm:text-base font-bold rounded-lg sm:rounded-xl text-white bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 focus:outline-none focus:ring-4 focus:ring-amber-300/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl animate-glow"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <LockClosedIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    Sign in
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Enhanced Demo Credentials Info with quick fill button */}
          <div className="mt-6 p-4 bg-gradient-to-r from-orange-50/80 to-red-50/80 dark:from-orange-900/20 dark:to-red-900/20 backdrop-blur-sm rounded-xl border border-orange-300/40 dark:border-orange-700/40 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-base-content">Demo Credentials:</h3>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-xs px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                Quick Fill
              </button>
            </div>
            <div className="text-sm text-base-content/70 space-y-2">
              <div className="bg-base-200/60 dark:bg-base-300/30 rounded-lg p-3 border border-orange-200/40 dark:border-orange-800/40 shadow-sm">
                <p><span className="font-semibold text-base-content">Email:</span> admin@sunsethotel.com</p>
                <p><span className="font-semibold text-base-content">Password:</span> sunset123</p>
              </div>
            </div>
            <p className="text-xs text-orange-700 dark:text-orange-400 mt-3 flex items-center font-medium">
              <span className="mr-1">⚠️</span>
              Demo credentials for testing purposes
            </p>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="text-center text-base-content/60 text-sm">
          <p className="font-medium">© 2025 Sunset Hotel Management System</p>
          <p className="mt-1 text-xs">Crafted with ❤️ for exceptional hospitality</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
