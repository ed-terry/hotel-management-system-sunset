import { XMarkIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';
import { Room } from '../types/graphql';

interface RoomDetailsProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
}

const RoomDetails: React.FC<RoomDetailsProps> = ({ room, isOpen, onClose }) => {
  if (!isOpen || !room) return null;

  const formatType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-300';
      case 'occupied':
        return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-300';
      case 'maintenance':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border-yellow-300';
      case 'cleaning':
        return 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-300';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-300';
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border-orange-300';
      case 'checked_in':
        return 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-300';
      case 'checked_out':
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-300';
      case 'cancelled':
        return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-300';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-white via-amber-50/50 to-orange-50/30 backdrop-blur-sm rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto border-2 border-amber-200/50 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl shadow-lg">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">Room {room.number} Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-lg"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border-2 border-amber-200/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-lg shadow-md">
                <CalendarIcon className="h-5 w-5 text-white" />
              </div>
              Room Information
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-amber-100">
                <span className="text-gray-600 font-bold">Room Number:</span>
                <span className="text-gray-800 font-bold text-lg bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1 rounded-lg">{room.number}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-amber-100">
                <span className="text-gray-600 font-bold">Type:</span>
                <span className="text-gray-800 font-semibold">{formatType(room.type)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-amber-100">
                <span className="text-gray-600 font-bold">Status:</span>
                <span className={`px-4 py-2 text-sm font-bold rounded-full border-2 ${getStatusColor(room.status)} hover:scale-105 transition-all duration-200 shadow-lg`}>
                  {room.status}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600 font-bold">Price per Night:</span>
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent font-bold text-2xl">${room.price}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border-2 border-amber-200/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-emerald-400 to-green-400 rounded-lg shadow-md">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-amber-100">
                <span className="text-gray-600 font-bold">Total Bookings:</span>
                <span className="text-gray-800 font-bold text-lg bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1 rounded-lg">{room.bookings?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600 font-bold">Active Bookings:</span>
                <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent font-bold text-lg">
                  {room.bookings?.filter(b => 
                    b.status === 'CONFIRMED' || b.status === 'CHECKED_IN'
                  ).length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {room.bookings && room.bookings.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border-2 border-amber-200/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-lg shadow-md">
                <CalendarIcon className="h-5 w-5 text-white" />
              </div>
              Recent Bookings
            </h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {room.bookings.map((booking) => (
                <div key={booking.id} className="bg-gradient-to-r from-white to-amber-50/50 backdrop-blur-sm rounded-xl p-4 border-2 border-amber-200/30 hover:border-amber-300/50 hover:shadow-lg transition-all duration-200 group transform hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg group-hover:from-amber-500 group-hover:to-orange-500 transition-all duration-200 shadow-md">
                        <UserIcon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-800 font-bold group-hover:text-amber-700 transition-colors duration-200">{booking.guestName}</span>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border-2 ${getBookingStatusColor(booking.status)} hover:scale-105 transition-all duration-200 shadow-md`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 font-medium">
                    <CalendarIcon className="h-4 w-4 mr-2 text-orange-500" />
                    <span>
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 ring-2 ring-amber-200/50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
