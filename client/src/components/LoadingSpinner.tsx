import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  variant?: 'default' | 'dots' | 'pulse' | 'luxury';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-2">
            <div className={`${sizeClasses[size]} bg-gradient-to-br from-amber-500 to-amber-600 rounded-full animate-bounce shadow-lg`}></div>
            <div className={`${sizeClasses[size]} bg-gradient-to-br from-orange-500 to-orange-600 rounded-full animate-bounce animation-delay-200 shadow-lg`}></div>
            <div className={`${sizeClasses[size]} bg-gradient-to-br from-red-500 to-red-600 rounded-full animate-bounce animation-delay-400 shadow-lg`}></div>
          </div>
        );
        
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-full animate-pulse shadow-xl ring-4 ring-amber-500/20 ring-offset-2 ring-offset-base-100`}></div>
        );
        
      case 'luxury':
        return (
          <div className="relative">
            <div className={`${sizeClasses[size]} border-4 border-transparent bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-full animate-spin shadow-xl`}>
              <div className="absolute inset-1 bg-base-100 rounded-full"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full animate-ping shadow-lg"></div>
            </div>
            <div className="absolute -inset-2 bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 rounded-full animate-pulse blur-md"></div>
          </div>
        );
        
      default:
        return (
          <div className={`animate-spin rounded-full border-4 border-amber-200/30 border-t-amber-500 border-r-orange-500 border-b-red-500 border-l-amber-600 ${sizeClasses[size]} shadow-xl ring-2 ring-amber-500/20 ring-offset-2 ring-offset-base-100`}></div>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {renderSpinner()}
      {text && (
        <div className="text-center">
          <p className={`text-base-content/80 animate-pulse font-semibold tracking-wide ${textSizeClasses[size]}`}>
            {text}
          </p>
          <div className="mt-3 flex justify-center space-x-1.5">
            <div className="w-1.5 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-bounce shadow-sm"></div>
            <div className="w-1.5 h-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-bounce animation-delay-100 shadow-sm"></div>
            <div className="w-1.5 h-1.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-bounce animation-delay-200 shadow-sm"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
