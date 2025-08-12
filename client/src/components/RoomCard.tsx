import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { DELETE_ROOM_MUTATION, GET_ROOMS_QUERY } from '../graphql/queries';
import { Room, DeleteRoomResponse } from '../types/graphql';

interface RoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onView: (room: Room) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onEdit, onView }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const [deleteRoom] = useMutation<DeleteRoomResponse>(DELETE_ROOM_MUTATION, {
    refetchQueries: [{ query: GET_ROOMS_QUERY }],
    onCompleted: () => {
      setIsDeleting(false);
    },
    onError: (error) => {
      alert(`Error deleting room: ${error.message}`);
      setIsDeleting(false);
    },
  });

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete room ${room.number}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteRoom({
        variables: { id: room.id },
      });
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-emerald-100/80 text-emerald-700 border border-emerald-300/50 shadow-emerald-200/50';
      case 'occupied':
        return 'bg-red-100/80 text-red-700 border border-red-300/50 shadow-red-200/50';
      case 'maintenance':
        return 'bg-amber-100/80 text-amber-700 border border-amber-300/50 shadow-amber-200/50';
      case 'cleaning':
        return 'bg-blue-100/80 text-blue-700 border border-blue-300/50 shadow-blue-200/50';
      default:
        return 'bg-gray-100/80 text-gray-700 border border-gray-300/50 shadow-gray-200/50';
    }
  };

  const formatType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className="bg-gradient-to-br from-white/95 via-amber-50/50 to-orange-50/60 backdrop-blur-md border border-amber-200/40 rounded-xl shadow-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group ring-2 ring-amber-100/30">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-amber-700 transition-colors duration-300 drop-shadow-sm">
            Room {room.number}
          </h3>
          <p className="text-gray-600/80 font-semibold mt-1">{formatType(room.type)}</p>
        </div>
        <span className={`px-3 py-1 text-sm font-bold rounded-full backdrop-blur-sm shadow-lg hover:scale-105 transition-transform duration-200 ${getStatusColor(room.status)}`}>
          {room.status}
        </span>
      </div>

      <div className="mb-6">
        <p className="text-3xl font-bold text-gray-800 group-hover:text-amber-700 transition-colors duration-300 drop-shadow-sm">
          ${room.price}
          <span className="text-base font-semibold text-gray-600/80 ml-1">/night</span>
        </p>
      </div>

      {room.bookings && room.bookings.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse shadow-lg"></div>
            <p className="text-sm text-gray-700/90 font-semibold">
              {room.bookings.length} active booking{room.bookings.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => onView(room)}
          className="flex-1 flex items-center justify-center px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-amber-200/50 hover:border-amber-300 hover:bg-white text-gray-700 rounded-lg transition-all duration-200 hover:scale-105 group/btn shadow-md hover:shadow-lg"
          title="View Details"
        >
          <EyeIcon className="h-4 w-4 mr-2 group-hover/btn:text-amber-600 transition-colors duration-200" />
          <span className="font-semibold">View</span>
        </button>
        <button
          onClick={() => onEdit(room)}
          className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl group/btn"
          title="Edit Room"
        >
          <PencilIcon className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform duration-200" />
          <span className="font-semibold">Edit</span>
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100 group/btn"
          title="Delete Room"
        >
          <TrashIcon className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
