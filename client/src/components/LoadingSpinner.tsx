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
            <div className={`${sizeClasses[size]} bg-primary rounded-full animate-bounce`}></div>
            <div className={`${sizeClasses[size]} bg-primary rounded-full animate-bounce animation-delay-200`}></div>
            <div className={`${sizeClasses[size]} bg-primary rounded-full animate-bounce animation-delay-400`}></div>
          </div>
        );
        
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} bg-gradient-to-br from-primary to-accent rounded-full animate-pulse shadow-lg`}></div>
        );
        
      case 'luxury':
        return (
          <div className="relative">
            <div className={`${sizeClasses[size]} border-4 border-transparent bg-gradient-to-br from-primary via-accent to-secondary rounded-full animate-spin`}>
              <div className="absolute inset-1 bg-base-100 rounded-full"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className={`animate-spin rounded-full border-4 border-primary/20 border-l-primary ${sizeClasses[size]} shadow-lg`}></div>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {renderSpinner()}
      {text && (
        <div className="text-center">
          <p className={`text-base-content/70 animate-pulse font-medium ${textSizeClasses[size]}`}>
            {text}
          </p>
          <div className="mt-2 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce animation-delay-100"></div>
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce animation-delay-200"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
