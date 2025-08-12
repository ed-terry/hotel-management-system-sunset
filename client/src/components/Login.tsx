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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-ping animation-delay-2000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-28 w-28 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-primary/20 hover:scale-105 transition-transform duration-300 p-3">
            <Logo size={88} className="rounded-2xl shadow-lg" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">Sunset Hotel</h2>
          <p className="text-base-content/70 text-lg font-medium">Management System</p>
          <p className="mt-2 text-base-content/50">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-base-100/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-primary/10 hover:shadow-2xl transition-all duration-300">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-base-content/80">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-base-content/40 group-focus-within:text-primary transition-colors duration-200" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-base-200/50 border border-primary/20 rounded-xl text-base-content placeholder-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200 backdrop-blur-sm hover:bg-base-200/70"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-base-content/80">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-base-content/40 group-focus-within:text-primary transition-colors duration-200" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-base-200/50 border border-primary/20 rounded-xl text-base-content placeholder-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200 backdrop-blur-sm hover:bg-base-200/70"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-base-content/40 hover:text-primary transition-colors duration-200" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-base-content/40 hover:text-primary transition-colors duration-200" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
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
