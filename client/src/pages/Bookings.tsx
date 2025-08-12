import { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, PlusIcon } from '@heroicons/react/24/outline';
import { BookingSection } from '../components';

interface Booking {
  id: number;
  guest_name: string;
  room_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
}

const Bookings = () => {
  const [bookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewBooking, setShowNewBooking] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/20 text-success border-success/30';
      case 'completed': return 'bg-info/20 text-info border-info/30';
      case 'cancelled': return 'bg-error/20 text-error border-error/30';
      default: return 'bg-base-300 text-base-content border-base-300';
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Bookings Management
              </h1>
              <p className="text-white/90 text-lg">
                Manage reservations and track guest stays
              </p>
            </div>
            <button
              onClick={() => setShowNewBooking(!showNewBooking)}
              className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Booking
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 -mt-8">
        {/* New Booking Form - Collapsible */}
        {showNewBooking && (
          <div className="mb-8 transform transition-all duration-300 ease-in-out">
            <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-base-content">Create New Booking</h2>
                  <button
                    onClick={() => setShowNewBooking(false)}
                    className="text-base-content/60 hover:text-base-content transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <BookingSection />
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Search bookings by guest name or room..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-base-200 border border-base-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>
              
              {/* Filter */}
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-base-content/60" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 bg-base-200 border border-base-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden">
          {bookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
                <MagnifyingGlassIcon className="h-10 w-10 text-base-content/40" />
              </div>
              <h3 className="text-xl font-semibold text-base-content mb-2">No bookings found</h3>
              <p className="text-base-content/60 mb-6">Get started by creating your first booking</p>
              <button
                onClick={() => setShowNewBooking(true)}
                className="btn btn-primary"
              >
                Create First Booking
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-base-200 border-b border-base-300">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-base-content">Guest</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-base-content">Room</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-base-content">Check In</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-base-content">Check Out</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-base-content">Guests</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-base-content">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-base-content">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-300">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-base-200/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-base-content">{booking.guest_name}</td>
                      <td className="px-6 py-4 text-sm text-base-content">Room {booking.room_id}</td>
                      <td className="px-6 py-4 text-sm text-base-content">{booking.check_in}</td>
                      <td className="px-6 py-4 text-sm text-base-content">{booking.check_out}</td>
                      <td className="px-6 py-4 text-sm text-base-content">{booking.guests}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-base-content">${booking.total_price}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bookings;
