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
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-primary/2 to-secondary/2">
      {/* Modern Header */}
      <div className="relative bg-gradient-to-r from-primary/8 via-secondary/6 to-accent/4 backdrop-blur-sm border-b border-primary/10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/2 to-secondary/2 opacity-30"></div>
        <div className="relative container mx-auto px-6 py-10">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm rounded-xl border border-primary/20 shadow-lg">
              <HomeIcon className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Sunset Hotel Dashboard
              </h1>
              <p className="text-base-content/60 mt-2 text-lg">Welcome to your Sunset Hotel management center</p>
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