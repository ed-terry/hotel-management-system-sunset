import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import Logo from './Logo';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      // Navigation will be handled by the auth context and routing
    } catch (error) {
      // Error handling is done in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/60 via-orange-50/30 to-red-50/40 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-br from-red-400/15 to-pink-400/15 rounded-full blur-3xl animate-ping animation-delay-2000"></div>
      </div>

      <div className="max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 bg-gradient-to-br from-amber-100/40 via-orange-100/30 to-red-100/40 backdrop-blur-md rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 shadow-2xl border border-amber-300/30 hover:scale-105 transition-transform duration-300 p-2 sm:p-3 ring-4 ring-amber-400/20 ring-offset-2 ring-offset-transparent">
            <Logo size={64} className="sm:hidden rounded-xl shadow-xl drop-shadow-lg" />
            <Logo size={80} className="hidden sm:block lg:hidden rounded-xl shadow-xl drop-shadow-lg" />
            <Logo size={88} className="hidden lg:block rounded-2xl shadow-xl drop-shadow-lg" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-2 drop-shadow-sm">Sunset Hotel</h2>
          <p className="text-gray-700/80 text-base sm:text-lg font-semibold tracking-wide drop-shadow-sm">Management System</p>
          <p className="mt-2 text-gray-600/70 text-sm sm:text-base font-medium">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/85 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 border border-amber-200/40 hover:shadow-3xl transition-all duration-300 ring-2 ring-amber-300/20">
          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-bold text-gray-700">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-focus-within:text-amber-600 transition-colors duration-200" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-white/70 border-2 border-amber-200/50 rounded-lg sm:rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-amber-300/30 focus:border-amber-400 transition-all duration-200 backdrop-blur-sm hover:bg-white/80 text-sm sm:text-base shadow-inner"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-focus-within:text-amber-600 transition-colors duration-200" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 bg-white/70 border-2 border-amber-200/50 rounded-lg sm:rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-amber-300/30 focus:border-amber-400 transition-all duration-200 backdrop-blur-sm hover:bg-white/80 text-sm sm:text-base shadow-inner"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 hover:text-amber-600 transition-colors duration-200" />
                  ) : (
                    <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 hover:text-amber-600 transition-colors duration-200" />
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

          {/* Default Credentials Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-50/80 to-orange-50/80 backdrop-blur-sm rounded-xl border border-amber-300/40 shadow-inner">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Demo Credentials:</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="bg-white/60 rounded-lg p-3 border border-amber-200/40 shadow-sm">
                <p><span className="font-semibold text-gray-700">Email:</span> admin@sunsethotel.com</p>
                <p><span className="font-semibold text-gray-700">Password:</span> Admin123!</p>
              </div>
            </div>
            <p className="text-xs text-amber-700 mt-3 flex items-center font-medium">
              <span className="mr-1">⚠️</span>
              Change credentials after first login
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500/60 text-sm">
          <p className="font-medium">© 2025 Sunset Hotel Management System</p>
          <p className="mt-1">Crafted with ❤️ for exceptional hospitality</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
