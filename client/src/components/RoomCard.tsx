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
        return 'bg-success/20 text-success border border-success/30';
      case 'occupied':
        return 'bg-error/20 text-error border border-error/30';
      case 'maintenance':
        return 'bg-warning/20 text-warning border border-warning/30';
      case 'cleaning':
        return 'bg-info/20 text-info border border-info/30';
      default:
        return 'bg-base-300/50 text-base-content/70 border border-base-300';
    }
  };

  const formatType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className="bg-gradient-to-br from-base-200 to-base-300/50 backdrop-blur-sm border border-primary/20 rounded-xl shadow-lg p-6 transition-all duration-200 hover:scale-105 hover:shadow-xl group">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-base-content group-hover:text-primary transition-colors duration-200">
            Room {room.number}
          </h3>
          <p className="text-base-content/70 font-medium mt-1">{formatType(room.type)}</p>
        </div>
        <span className={`px-3 py-1 text-sm font-bold rounded-full backdrop-blur-sm ${getStatusColor(room.status)} hover:scale-105 transition-transform duration-200`}>
          {room.status}
        </span>
      </div>

      <div className="mb-6">
        <p className="text-3xl font-bold text-base-content group-hover:text-primary transition-colors duration-200">
          ${room.price}
          <span className="text-base font-medium text-base-content/70 ml-1">/night</span>
        </p>
      </div>

      {room.bookings && room.bookings.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <p className="text-sm text-base-content/80 font-medium">
              {room.bookings.length} active booking{room.bookings.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => onView(room)}
          className="flex-1 flex items-center justify-center px-4 py-3 bg-base-100/80 backdrop-blur-sm border border-primary/20 hover:border-primary/40 hover:bg-base-100 text-base-content rounded-lg transition-all duration-200 hover:scale-105 group/btn"
          title="View Details"
        >
          <EyeIcon className="h-4 w-4 mr-2 group-hover/btn:text-primary transition-colors duration-200" />
          <span className="font-medium">View</span>
        </button>
        <button
          onClick={() => onEdit(room)}
          className="flex-1 flex items-center justify-center px-4 py-3 bg-primary/90 hover:bg-primary text-primary-content rounded-lg transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg group/btn"
          title="Edit Room"
        >
          <PencilIcon className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform duration-200" />
          <span className="font-medium">Edit</span>
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center justify-center px-4 py-3 bg-error/90 hover:bg-error text-error-content rounded-lg transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100 group/btn"
          title="Delete Room"
        >
          <TrashIcon className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
