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
        return 'bg-success/20 text-success';
      case 'occupied':
        return 'bg-error/20 text-error';
      case 'maintenance':
        return 'bg-warning/20 text-warning';
      case 'cleaning':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-base-300 text-base-content/70';
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-info/20 text-info';
      case 'checked_in':
        return 'bg-success/20 text-success';
      case 'checked_out':
        return 'bg-base-300 text-base-content/70';
      case 'cancelled':
        return 'bg-error/20 text-error';
      default:
        return 'bg-base-300 text-base-content/70';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-base-100 to-base-200/50 backdrop-blur-sm rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-primary/20 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-xl">
              <UserIcon className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-base-content">Room {room.number} Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-base-content/70 hover:text-base-content hover:bg-base-200 rounded-lg transition-all duration-200 hover:scale-110"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-base-100/50 backdrop-blur-sm rounded-xl p-6 border border-primary/10 hover:shadow-lg transition-all duration-300">
            <h3 className="text-xl font-bold text-base-content mb-6 flex items-center gap-3">
              <div className="p-2 bg-info/20 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-info" />
              </div>
              Room Information
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-base-content/70 font-medium">Room Number:</span>
                <span className="text-base-content font-bold text-lg">{room.number}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-base-content/70 font-medium">Type:</span>
                <span className="text-base-content font-semibold">{formatType(room.type)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-base-content/70 font-medium">Status:</span>
                <span className={`px-3 py-1 text-sm font-bold rounded-full border ${getStatusColor(room.status)} hover:scale-105 transition-transform duration-200`}>
                  {room.status}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-base-content/70 font-medium">Price per Night:</span>
                <span className="text-primary font-bold text-2xl">${room.price}</span>
              </div>
            </div>
          </div>

          <div className="bg-base-100/50 backdrop-blur-sm rounded-xl p-6 border border-primary/10 hover:shadow-lg transition-all duration-300">
            <h3 className="text-xl font-bold text-base-content mb-6 flex items-center gap-3">
              <div className="p-2 bg-success/20 rounded-lg">
                <UserIcon className="h-5 w-5 text-success" />
              </div>
              Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-base-content/70 font-medium">Total Bookings:</span>
                <span className="text-base-content font-bold text-lg">{room.bookings?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-base-content/70 font-medium">Active Bookings:</span>
                <span className="text-success font-bold text-lg">
                  {room.bookings?.filter(b => 
                    b.status === 'CONFIRMED' || b.status === 'CHECKED_IN'
                  ).length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {room.bookings && room.bookings.length > 0 && (
          <div className="bg-base-100/50 backdrop-blur-sm rounded-xl p-6 border border-primary/10 hover:shadow-lg transition-all duration-300">
            <h3 className="text-xl font-bold text-base-content mb-6 flex items-center gap-3">
              <div className="p-2 bg-warning/20 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-warning" />
              </div>
              Recent Bookings
            </h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {room.bookings.map((booking) => (
                <div key={booking.id} className="bg-gradient-to-r from-base-200/50 to-base-300/30 backdrop-blur-sm rounded-xl p-4 border border-primary/10 hover:border-primary/20 hover:shadow-md transition-all duration-200 group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors duration-200">
                        <UserIcon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-base-content font-bold group-hover:text-primary transition-colors duration-200">{booking.guestName}</span>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getBookingStatusColor(booking.status)} hover:scale-105 transition-transform duration-200`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-base-content/80 font-medium">
                    <CalendarIcon className="h-4 w-4 mr-2 text-info" />
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
            className="px-8 py-3 bg-primary/90 hover:bg-primary text-primary-content rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
