import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { 
  HousekeepingStatus, 
  RoomForm, 
  RoomCard, 
  RoomDetails 
} from '../components';
import { GET_ROOMS_QUERY } from '../graphql/queries';
import { Room, GetRoomsResponse } from '../types/graphql';

const ROOM_TYPES = ['ALL', 'SINGLE', 'DOUBLE', 'SUITE', 'DELUXE'];
const ROOM_STATUSES = ['ALL', 'AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING'];

const Rooms = () => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Build query variables
  const queryVariables = {
    ...(filterType !== 'ALL' && { type: filterType }),
    ...(filterStatus !== 'ALL' && { status: filterStatus }),
  };

  const { data, loading, error, refetch } = useQuery<GetRoomsResponse>(
    GET_ROOMS_QUERY,
    {
      variables: queryVariables,
      errorPolicy: 'all',
    }
  );

  const rooms = data?.rooms || [];

  // Filter rooms by search term
  const filteredRooms = rooms.filter(room =>
    room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRoom = () => {
    setSelectedRoom(null);
    setIsFormOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsFormOpen(true);
  };

  const handleViewRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsDetailsOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedRoom(null);
  };

  const handleDetailsClose = () => {
    setIsDetailsOpen(false);
    setSelectedRoom(null);
  };

  const handleFormSuccess = () => {
    refetch();
  };

  if (error) {
    console.error('Error fetching rooms:', error);
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <PlusIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Room Management</h1>
                <p className="text-white/90 text-lg">Manage room inventory and housekeeping status</p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={handleAddRoom}
                className="btn btn-white btn-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Room</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {/* Room Status Overview */}
        <div className="mb-8">
          <HousekeepingStatus />
        </div>

        {/* Search and Filters */}
        <div className="bg-base-200 border border-base-300 rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-base-content/70" />
              <input
                type="text"
                placeholder="Search rooms by number or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-base-100 border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-base-content/70" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-base-100 border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-secondary focus:border-transparent"
              >
                {ROOM_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type === 'ALL' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-base-100 border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-secondary focus:border-transparent"
              >
                {ROOM_STATUSES.map(status => (
                  <option key={status} value={status}>
                    {status === 'ALL' ? 'All Statuses' : status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3" />
          <div>
            <p className="text-red-200">Failed to load rooms</p>
            <p className="text-red-300 text-sm">{error.message}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Rooms Count */}
      {!loading && (
        <div className="mb-4">
          <p className="text-base-content/70">
            Showing {filteredRooms.length} of {rooms.length} rooms
          </p>
        </div>
      )}

      {/* Room Grid */}
      {!loading && filteredRooms.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-base-content/70 text-lg mb-2">
            {rooms.length === 0 ? 'No rooms found' : 'No rooms match your filters'}
          </div>
          <p className="text-base-content/60">
            {rooms.length === 0 ? 'Get started by adding your first room.' : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onEdit={handleEditRoom}
              onView={handleViewRoom}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <RoomForm
        room={selectedRoom}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />

      <RoomDetails
        room={selectedRoom}
        isOpen={isDetailsOpen}
        onClose={handleDetailsClose}
      />
      </div>
    </div>
  );
};

export default Rooms;
