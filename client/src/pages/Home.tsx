import React, { useEffect } from 'react';
import {
  BookingSection,
  Dashboard,
  HousekeepingStatus,
  PaymentSection,
} from '../components';
import { logger } from '../utils/logger';
import { HomeIcon } from '@heroicons/react/24/outline';

const Home: React.FC = () => {
  useEffect(() => {
    logger.info('Home dashboard loaded', {
      component: 'Home',
      action: 'pageLoad',
      metadata: {
        timestamp: new Date().toISOString(),
        url: window.location.pathname,
      },
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200/50 to-primary/5">
      {/* Modern Header */}
      <div className="relative bg-gradient-to-r from-primary/20 via-secondary/15 to-accent/10 backdrop-blur-sm border-b border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-30"></div>
        <div className="relative container mx-auto px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/20 backdrop-blur-sm rounded-xl border border-primary/30">
              <HomeIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Sunset Hotel Dashboard
              </h1>
              <p className="text-base-content/70 mt-1">Welcome to your Sunset Hotel management center</p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="space-y-8">
            <BookingSection />
            <PaymentSection />
          </div>
          
          {/* Right column - spans 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            <Dashboard />
            <HousekeepingStatus />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;