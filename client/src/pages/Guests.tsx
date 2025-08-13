import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  ChatBubbleLeftEllipsisIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  nationality: string;
  idNumber: string;
  vipStatus: 'None' | 'Silver' | 'Gold' | 'Platinum';
  totalStays: number;
  totalSpent: number;
  lastStay: string;
  preferences: string[];
  notes: string;
  createdAt: string;
}

interface Booking {
  id: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: 'Confirmed' | 'Checked In' | 'Checked Out' | 'Cancelled';
  totalAmount: number;
}

const Guests = () => {
  const [guests, setGuests] = useState<Guest[]>([
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, New York, NY 10001',
      dateOfBirth: '1985-06-15',
      nationality: 'American',
      idNumber: 'P123456789',
      vipStatus: 'Gold',
      totalStays: 8,
      totalSpent: 4500,
      lastStay: '2025-01-15',
      preferences: ['Non-smoking', 'High floor', 'Ocean view'],
      notes: 'Prefers late check-in. Allergic to feather pillows.',
      createdAt: '2024-03-15',
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 987-6543',
      address: '456 Oak Ave, Los Angeles, CA 90210',
      dateOfBirth: '1990-09-22',
      nationality: 'American',
      idNumber: 'D987654321',
      vipStatus: 'Silver',
      totalStays: 3,
      totalSpent: 1800,
      lastStay: '2024-12-20',
      preferences: ['Quiet room', 'Early check-in'],
      notes: 'Business traveler. Requests receipts for all expenses.',
      createdAt: '2024-06-10',
    },
  ]);

  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [guestBookings, setGuestBookings] = useState<Booking[]>([]);

  const [guestForm, setGuestForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    nationality: '',
    idNumber: '',
    preferences: '',
    notes: '',
  });

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch = 
      guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.phone.includes(searchTerm);

    const matchesFilter = 
      filterStatus === 'all' || 
      guest.vipStatus.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    if (selectedGuest) {
      // Simulate fetching guest bookings
      setGuestBookings([
        {
          id: '1',
          roomNumber: '205',
          checkIn: '2025-01-15',
          checkOut: '2025-01-18',
          status: 'Checked Out',
          totalAmount: 450,
        },
        {
          id: '2',
          roomNumber: '312',
          checkIn: '2024-11-20',
          checkOut: '2024-11-23',
          status: 'Checked Out',
          totalAmount: 380,
        },
      ]);
    }
  }, [selectedGuest]);

  const handleSubmitGuest = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newGuest: Guest = {
      id: Date.now().toString(),
      firstName: guestForm.firstName,
      lastName: guestForm.lastName,
      email: guestForm.email,
      phone: guestForm.phone,
      address: guestForm.address,
      dateOfBirth: guestForm.dateOfBirth,
      nationality: guestForm.nationality,
      idNumber: guestForm.idNumber,
      vipStatus: 'None',
      totalStays: 0,
      totalSpent: 0,
      lastStay: '',
      preferences: guestForm.preferences.split(',').map(p => p.trim()),
      notes: guestForm.notes,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setGuests(prev => [...prev, newGuest]);
    setShowGuestForm(false);
    setGuestForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      nationality: '',
      idNumber: '',
      preferences: '',
      notes: '',
    });
    
    toast.success('Guest added successfully!');
  };

  const getVipStatusColor = (status: string) => {
    switch (status) {
      case 'Platinum': return 'text-amber-400 bg-amber-900/20';
      case 'Gold': return 'text-yellow-400 bg-yellow-900/20';
      case 'Silver': return 'text-gray-400 bg-gray-900/20';
      default: return 'text-gray-500 bg-gray-800/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'text-orange-400 bg-orange-900/20';
      case 'Checked In': return 'text-orange-500 bg-red-900/20';
      case 'Checked Out': return 'text-gray-400 bg-gray-900/20';
      case 'Cancelled': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-500 bg-gray-800/20';
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <UserIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Guest Management</h1>
                <p className="text-white/90 text-lg">Manage guest profiles and build lasting relationships</p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => setShowGuestForm(true)}
                className="btn btn-white btn-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Guest</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {/* Search and Filter */}
        <div className="bg-base-200 border border-base-300 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search guests by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
            >
              <option value="all">All VIP Status</option>
              <option value="none">None</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Guests List */}
        <div className="lg:col-span-2">
          <div className="bg-primary-light rounded-lg shadow-lg">
            <div className="p-4 border-b border-gray-600">
              <h2 className="text-lg font-semibold text-white">
                Guests ({filteredGuests.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-600 max-h-96 overflow-y-auto">
              {filteredGuests.map((guest) => (
                <div
                  key={guest.id}
                  onClick={() => setSelectedGuest(guest)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-primary ${
                    selectedGuest?.id === guest.id ? 'bg-primary' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">
                          {guest.firstName} {guest.lastName}
                        </h3>
                        <p className="text-gray-400 text-sm">{guest.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVipStatusColor(guest.vipStatus)}`}>
                        {guest.vipStatus}
                      </span>
                      <div className="text-right">
                        <p className="text-white text-sm">{guest.totalStays} stays</p>
                        <p className="text-gray-400 text-xs">${guest.totalSpent}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredGuests.length === 0 && (
                <div className="p-8 text-center">
                  <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No guests found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Guest Details */}
        <div className="lg:col-span-1">
          {selectedGuest ? (
            <div className="bg-primary-light rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedGuest.firstName} {selectedGuest.lastName}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVipStatusColor(selectedGuest.vipStatus)}`}>
                    {selectedGuest.vipStatus} Member
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-300">
                  <EnvelopeIcon className="h-5 w-5" />
                  <span className="text-sm">{selectedGuest.email}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-300">
                  <PhoneIcon className="h-5 w-5" />
                  <span className="text-sm">{selectedGuest.phone}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-300">
                  <MapPinIcon className="h-5 w-5" />
                  <span className="text-sm">{selectedGuest.address}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-300">
                  <CalendarDaysIcon className="h-5 w-5" />
                  <span className="text-sm">Last stay: {selectedGuest.lastStay || 'Never'}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-600">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-white">{selectedGuest.totalStays}</p>
                    <p className="text-gray-400 text-sm">Total Stays</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">${selectedGuest.totalSpent}</p>
                    <p className="text-gray-400 text-sm">Total Spent</p>
                  </div>
                </div>
              </div>

              {selectedGuest.preferences.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-white font-medium mb-2">Preferences</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedGuest.preferences.map((pref, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-full"
                      >
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedGuest.notes && (
                <div className="mt-6">
                  <h4 className="text-white font-medium mb-2">Notes</h4>
                  <p className="text-gray-300 text-sm">{selectedGuest.notes}</p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-600">
                <h4 className="text-white font-medium mb-3">Recent Bookings</h4>
                <div className="space-y-2">
                  {guestBookings.map((booking) => (
                    <div key={booking.id} className="p-3 bg-primary rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white font-medium">Room {booking.roomNumber}</p>
                          <p className="text-gray-400 text-sm">
                            {booking.checkIn} - {booking.checkOut}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          <p className="text-white text-sm mt-1">${booking.totalAmount}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button className="w-full px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-md transition-colors flex items-center justify-center space-x-2">
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>Generate Invoice</span>
                </button>
                <button className="w-full px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-md transition-colors flex items-center justify-center space-x-2">
                  <ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
                  <span>Send Message</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-primary-light rounded-lg shadow-lg p-6 text-center">
              <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Select a guest to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Guest Modal */}
      {showGuestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-primary-light rounded-lg p-6 w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Add New Guest</h2>
              <button
                onClick={() => setShowGuestForm(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitGuest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestForm.firstName}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestForm.lastName}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={guestForm.email}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestForm.phone}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address
                </label>
                <textarea
                  value={guestForm.address}
                  onChange={(e) => setGuestForm(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={guestForm.dateOfBirth}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={guestForm.nationality}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, nationality: e.target.value }))}
                    className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID Number
                  </label>
                  <input
                    type="text"
                    value={guestForm.idNumber}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, idNumber: e.target.value }))}
                    className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preferences (comma-separated)
                </label>
                <input
                  type="text"
                  value={guestForm.preferences}
                  onChange={(e) => setGuestForm(prev => ({ ...prev, preferences: e.target.value }))}
                  placeholder="e.g., Non-smoking, High floor, Ocean view"
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={guestForm.notes}
                  onChange={(e) => setGuestForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGuestForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-md transition-colors"
                >
                  Add Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Guests;
