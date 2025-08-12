import React, { useState, useEffect } from 'react';
import { 
  HomeModernIcon, 
  SparklesIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';
import Logo from './Logo';

interface AppLoadingScreenProps {
  onLoadingComplete?: () => void;
}

const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({ onLoadingComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const loadingSteps = [
    { text: 'Initializing Sunset Hotel System...', duration: 800 },
    { text: 'Loading guest preferences...', duration: 600 },
    { text: 'Synchronizing room availability...', duration: 700 },
    { text: 'Preparing dashboard analytics...', duration: 500 },
    { text: 'Finalizing user interface...', duration: 400 },
  ];

  useEffect(() => {
    let timeoutId: number;

    const advanceStep = () => {
      if (currentStep < loadingSteps.length - 1) {
        timeoutId = window.setTimeout(() => {
          setCurrentStep(prev => prev + 1);
        }, loadingSteps[currentStep].duration);
      } else {
        timeoutId = window.setTimeout(() => {
          setIsComplete(true);
          setTimeout(() => {
            onLoadingComplete?.();
          }, 800);
        }, loadingSteps[currentStep].duration);
      }
    };

    advanceStep();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentStep, loadingSteps, onLoadingComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 z-50 flex items-center justify-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-ping animation-delay-2000"></div>
        
        {/* Floating Icons */}
        <div className="absolute top-20 left-20 animate-bounce animation-delay-500">
          <HomeModernIcon className="h-8 w-8 text-primary/30" />
        </div>
        <div className="absolute top-32 right-32 animate-bounce animation-delay-1500">
          <SparklesIcon className="h-6 w-6 text-secondary/30" />
        </div>
        <div className="absolute bottom-32 left-32 animate-bounce animation-delay-2500">
          <CheckCircleIcon className="h-7 w-7 text-accent/30" />
        </div>
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="mb-8">
          <div className="mx-auto h-32 w-32 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-primary/20 animate-pulse p-3">
            <Logo size={108} className="rounded-2xl shadow-lg" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">Sunset Hotel</h1>
          <p className="text-base-content/70 text-lg font-medium">Management System</p>
        </div>

        {/* Loading Animation */}
        <div className="mb-8">
          {isComplete ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full backdrop-blur-sm border border-primary/30">
                <CheckCircleIcon className="h-12 w-12 text-primary animate-pulse" />
              </div>
              <p className="text-base-content text-xl font-semibold">Welcome!</p>
            </div>
          ) : (
            <LoadingSpinner 
              size="xl" 
              variant="luxury" 
              text={loadingSteps[currentStep]?.text}
              className="text-base-content"
            />
          )}
        </div>

        {/* Progress Indicator */}
        <div className="space-y-4">
          <div className="w-full bg-base-content/10 rounded-full h-2 backdrop-blur-sm">
            <div 
              className="h-2 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 ease-out shadow-lg"
              style={{ width: `${((currentStep + 1) / loadingSteps.length) * 100}%` }}
            ></div>
          </div>
          
          {/* Step Indicators */}
          <div className="flex justify-center space-x-2">
            {loadingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index <= currentStep
                    ? 'bg-primary shadow-lg scale-125'
                    : 'bg-base-content/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-base-content/50 text-sm">
          <p>Crafted with ❤️ for exceptional hospitality</p>
          <p className="mt-1">© 2025 Sunset Hotel Management System</p>
        </div>
      </div>
    </div>
  );
};

export default AppLoadingScreen;
