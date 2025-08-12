import { BookingSection } from '../components';
import { Dashboard as DashboardStats } from '../components';
import { HousekeepingStatus } from '../components';
import { PaymentSection } from '../components';
import QuickActions from '../components/QuickActions';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-accent text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Welcome Back
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              Manage your hotel operations efficiently with our comprehensive dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 -mt-8">
        {/* Quick Actions - Featured */}
        <div className="mb-8 sm:mb-12">
          <QuickActions />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column */}
          <div className="xl:col-span-1 space-y-6 sm:space-y-8">
            <div className="transform hover:scale-[1.02] transition-transform duration-200">
              <BookingSection />
            </div>
            <div className="transform hover:scale-[1.02] transition-transform duration-200">
              <PaymentSection />
            </div>
          </div>
          
          {/* Right Column - Stats & Status */}
          <div className="xl:col-span-2 space-y-6 sm:space-y-8">
            <div className="transform hover:scale-[1.01] transition-transform duration-200">
              <DashboardStats />
            </div>
            <div className="transform hover:scale-[1.01] transition-transform duration-200">
              <HousekeepingStatus />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
