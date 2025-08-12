import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  WrenchScrewdriverIcon,
  SparklesIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
  UPDATE_ROOM_STATUS_MUTATION,
  CREATE_HOUSEKEEPING_TASK_MUTATION,
  GET_ROOMS_QUERY,
  GET_HOUSEKEEPING_TASKS_QUERY,
} from '../graphql/queries';
import {
  GetRoomsResponse,
  UpdateRoomStatusResponse,
  CreateHousekeepingTaskResponse,
} from '../types/graphql';

const QuickActions = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data: roomsData } = useQuery<GetRoomsResponse>(GET_ROOMS_QUERY, {
    errorPolicy: 'all',
  });

  const [updateRoomStatus] = useMutation<UpdateRoomStatusResponse>(
    UPDATE_ROOM_STATUS_MUTATION,
    {
      refetchQueries: [{ query: GET_ROOMS_QUERY }],
    }
  );

  const [createHousekeepingTask] = useMutation<CreateHousekeepingTaskResponse>(
    CREATE_HOUSEKEEPING_TASK_MUTATION,
    {
      refetchQueries: [{ query: GET_HOUSEKEEPING_TASKS_QUERY }],
    }
  );

  const rooms = roomsData?.rooms || [];
  const occupiedRooms = rooms.filter(room => room.status === 'OCCUPIED');
  const availableRooms = rooms.filter(room => room.status === 'AVAILABLE');

  const handleCheckOut = async (roomId: string) => {
    try {
      // Update room status to cleaning
      await updateRoomStatus({
        variables: { roomId, status: 'CLEANING' },
      });

      // Create a cleaning task
      await createHousekeepingTask({
        variables: {
          input: {
            roomId,
            taskType: 'CLEANING',
            priority: 'HIGH',
            estimatedTime: 45,
            notes: 'Post check-out cleaning required',
          },
        },
      });

      alert('Room checked out successfully! Cleaning task created.');
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Failed to process checkout');
    }
  };

  const handleQuickClean = async (roomId: string) => {
    try {
      await createHousekeepingTask({
        variables: {
          input: {
            roomId,
            taskType: 'CLEANING',
            priority: 'MEDIUM',
            estimatedTime: 30,
            notes: 'Quick cleaning requested',
          },
        },
      });
      alert('Cleaning task created successfully!');
    } catch (error) {
      console.error('Error creating cleaning task:', error);
      alert('Failed to create cleaning task');
    }
  };

  const handleMaintenance = async (roomId: string) => {
    try {
      await updateRoomStatus({
        variables: { roomId, status: 'MAINTENANCE' },
      });

      await createHousekeepingTask({
        variables: {
          input: {
            roomId,
            taskType: 'MAINTENANCE',
            priority: 'HIGH',
            estimatedTime: 120,
            notes: 'Room requires maintenance attention',
          },
        },
      });

      alert('Room set to maintenance mode!');
    } catch (error) {
      console.error('Error setting maintenance:', error);
      alert('Failed to set maintenance mode');
    }
  };

  const quickActions = [
    {
      id: 'checkout',
      name: 'Quick Check-out',
      icon: ClockIcon,
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Check out a guest and create cleaning task',
      action: () => setIsExpanded(true),
    },
    {
      id: 'clean',
      name: 'Schedule Cleaning',
      icon: SparklesIcon,
      color: 'bg-green-600 hover:bg-green-700',
      description: 'Create a cleaning task for any room',
      action: () => setIsExpanded(true),
    },
    {
      id: 'maintenance',
      name: 'Set Maintenance',
      icon: WrenchScrewdriverIcon,
      color: 'bg-orange-600 hover:bg-orange-700',
      description: 'Put a room in maintenance mode',
      action: () => setIsExpanded(true),
    },
    {
      id: 'booking',
      name: 'Quick Booking',
      icon: CalendarDaysIcon,
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Create a new booking quickly',
      action: () => {
        window.location.href = '/bookings';
      },
    },
  ];

  return (
    <div className="bg-gradient-to-br from-base-200 to-base-300/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-primary/20 hover:shadow-xl transition-all duration-200">
      <h2 className="text-xl font-bold text-base-content mb-6 flex items-center gap-2">
        <div className="p-2 bg-primary/20 rounded-lg">
          <CheckCircleIcon className="h-6 w-6 text-primary" />
        </div>
        Quick Actions
      </h2>

      {!isExpanded ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                className={`group ${action.color} text-white p-6 rounded-xl shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
              >
                <Icon className="h-10 w-10 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
                <div className="text-sm font-bold">{action.name}</div>
                <div className="text-xs text-white/80 mt-2 leading-tight">{action.description}</div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">Select Action</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Check-out Section */}
            <div className="bg-primary rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                Check-out Rooms
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {occupiedRooms.length > 0 ? (
                  occupiedRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => handleCheckOut(room.id)}
                      className="w-full text-left px-3 py-2 bg-blue-900/30 hover:bg-blue-900/50 text-blue-200 rounded transition-colors text-sm"
                    >
                      Room {room.number} ({room.type})
                    </button>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No occupied rooms</p>
                )}
              </div>
            </div>

            {/* Cleaning Section */}
            <div className="bg-primary rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2" />
                Schedule Cleaning
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableRooms.length > 0 ? (
                  availableRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => handleQuickClean(room.id)}
                      className="w-full text-left px-3 py-2 bg-green-900/30 hover:bg-green-900/50 text-green-200 rounded transition-colors text-sm"
                    >
                      Room {room.number} ({room.type})
                    </button>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No available rooms</p>
                )}
              </div>
            </div>

            {/* Maintenance Section */}
            <div className="bg-primary rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 flex items-center">
                <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
                Set Maintenance
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {rooms.filter(room => room.status !== 'MAINTENANCE').length > 0 ? (
                  rooms
                    .filter(room => room.status !== 'MAINTENANCE')
                    .map((room) => (
                      <button
                        key={room.id}
                        onClick={() => handleMaintenance(room.id)}
                        className="w-full text-left px-3 py-2 bg-orange-900/30 hover:bg-orange-900/50 text-orange-200 rounded transition-colors text-sm"
                      >
                        Room {room.number} ({room.status})
                      </button>
                    ))
                ) : (
                  <p className="text-gray-400 text-sm">All rooms in maintenance</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;
