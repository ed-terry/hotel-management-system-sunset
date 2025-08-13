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
    <div className="fixed inset-0 bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-red-50/60 z-50 flex items-center justify-center backdrop-blur-sm">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-red-400/15 to-pink-400/15 rounded-full blur-3xl animate-ping animation-delay-2000"></div>
        
        {/* Floating Icons */}
        <div className="absolute top-20 left-20 animate-bounce animation-delay-500">
          <HomeModernIcon className="h-8 w-8 text-amber-500/40 drop-shadow-lg" />
        </div>
        <div className="absolute top-32 right-32 animate-bounce animation-delay-1500">
          <SparklesIcon className="h-6 w-6 text-orange-500/40 drop-shadow-lg" />
        </div>
        <div className="absolute bottom-32 left-32 animate-bounce animation-delay-2500">
          <CheckCircleIcon className="h-7 w-7 text-red-500/40 drop-shadow-lg" />
        </div>
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="mb-8">
          <div className="mx-auto h-32 w-32 bg-gradient-to-br from-amber-100/30 via-orange-100/30 to-red-100/30 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 shadow-2xl border border-amber-300/30 animate-pulse p-3 ring-4 ring-amber-400/20 ring-offset-2 ring-offset-transparent">
            <Logo size={108} className="rounded-2xl shadow-xl drop-shadow-lg" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-2 drop-shadow-sm">Sunset Hotel</h1>
          <p className="text-base-content/80 text-lg font-semibold tracking-wide drop-shadow-sm">Management System</p>
        </div>

        {/* Loading Animation */}
        <div className="mb-8">
          {isComplete ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-gradient-to-br from-emerald-100/40 to-green-100/40 rounded-full backdrop-blur-md border border-emerald-300/40 shadow-xl ring-4 ring-emerald-400/20">
                <CheckCircleIcon className="h-12 w-12 text-orange-600 animate-pulse drop-shadow-lg" />
              </div>
              <p className="text-gray-800 text-xl font-bold tracking-wide drop-shadow-sm">Welcome!</p>
            </div>
          ) : (
            <LoadingSpinner 
              size="xl" 
              variant="luxury" 
              text={loadingSteps[currentStep]?.text}
              className="text-gray-700"
            />
          )}
        </div>

        {/* Progress Indicator */}
        <div className="space-y-4">
          <div className="w-full bg-gray-300/30 rounded-full h-3 backdrop-blur-md shadow-inner border border-gray-300/20">
            <div 
              className="h-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full transition-all duration-500 ease-out shadow-lg ring-2 ring-amber-400/30"
              style={{ width: `${((currentStep + 1) / loadingSteps.length) * 100}%` }}
            ></div>
          </div>
          
          {/* Step Indicators */}
          <div className="flex justify-center space-x-3">
            {loadingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 shadow-lg ${
                  index <= currentStep
                    ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-400/50 scale-125 ring-2 ring-amber-400/30'
                    : 'bg-gray-300/40 backdrop-blur-sm'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-gray-600/70 text-sm">
          <p className="font-medium">Crafted with ❤️ for exceptional hospitality</p>
          <p className="mt-1 text-gray-500/60">© 2025 Sunset Hotel Management System</p>
        </div>
      </div>
    </div>
  );
};

export default AppLoadingScreen;
