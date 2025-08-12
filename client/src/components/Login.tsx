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
    <div className="min-h-screen bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-ping animation-delay-2000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 shadow-2xl border border-white/20 hover:scale-105 transition-transform duration-300 p-2">
            <Logo size={80} className="rounded-2xl shadow-xl" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Sunset Hotel</h2>
          <p className="text-white/80 text-lg font-medium">Management System</p>
          <p className="mt-2 text-white/60">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-white/90">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-white/60 group-focus-within:text-white transition-colors duration-200" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200 backdrop-blur-sm hover:bg-white/15"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-white/90">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-white/60 group-focus-within:text-white transition-colors duration-200" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200 backdrop-blur-sm hover:bg-white/15"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-white/60 hover:text-white transition-colors duration-200" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-white/60 hover:text-white transition-colors duration-200" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-primary bg-white hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
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
          <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <h3 className="text-sm font-semibold text-white/90 mb-3">Demo Credentials:</h3>
            <div className="text-sm text-white/70 space-y-2">
              <div className="bg-white/10 rounded-lg p-2">
                <p><span className="font-medium text-white/90">Email:</span> admin@hotelmanagement.com</p>
                <p><span className="font-medium text-white/90">Password:</span> Admin123!</p>
              </div>
            </div>
            <p className="text-xs text-amber-300 mt-3 flex items-center">
              <span className="mr-1">⚠️</span>
              Change credentials after first login
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-white/40 text-sm">
          <p>© 2025 Hotel Luxe Management System</p>
          <p className="mt-1">Crafted with ❤️ for exceptional hospitality</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
