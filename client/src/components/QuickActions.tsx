import React, { useState, useCallback, useMemo } from 'react';
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

// Enhanced QuickActions with performance optimizations
const QuickActions: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [processingRooms, setProcessingRooms] = useState<Set<string>>(new Set());
  
  const { data: roomsData, loading } = useQuery<GetRoomsResponse>(GET_ROOMS_QUERY, {
    errorPolicy: 'all',
    pollInterval: 30000, // Auto-refresh every 30 seconds
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
      errorPolicy: 'all',
    }
  );

  // Memoized room filtering for better performance
  const { rooms, occupiedRooms, availableRooms, maintenanceRooms } = useMemo(() => {
    const allRooms = roomsData?.rooms || [];
    return {
      rooms: allRooms,
      occupiedRooms: allRooms.filter(room => room.status === 'OCCUPIED'),
      availableRooms: allRooms.filter(room => room.status === 'AVAILABLE'),
      maintenanceRooms: allRooms.filter(room => room.status === 'MAINTENANCE'),
    };
  }, [roomsData?.rooms]);

  // Enhanced checkout handler with optimistic UI updates
  const handleCheckOut = useCallback(async (roomId: string) => {
    if (processingRooms.has(roomId)) return; // Prevent double-clicks
    
    setProcessingRooms(prev => new Set(prev).add(roomId));
    
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
    } finally {
      setProcessingRooms(prev => {
        const newSet = new Set(prev);
        newSet.delete(roomId);
        return newSet;
      });
    }
  }, [updateRoomStatus, createHousekeepingTask, processingRooms, setProcessingRooms]);

  const handleQuickClean = useCallback(async (roomId: string) => {
    if (processingRooms.has(roomId)) return;
    
    setProcessingRooms(prev => new Set(prev).add(roomId));
    
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
    } finally {
      setProcessingRooms(prev => {
        const newSet = new Set(prev);
        newSet.delete(roomId);
        return newSet;
      });
    }
  }, [createHousekeepingTask, processingRooms, setProcessingRooms]);

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
      color: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600',
      description: 'Check out a guest and create cleaning task',
      action: () => setIsExpanded(true),
    },
    {
      id: 'clean',
      name: 'Schedule Cleaning',
      icon: SparklesIcon,
      color: 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600',
      description: 'Create a cleaning task for any room',
      action: () => setIsExpanded(true),
    },
    {
      id: 'maintenance',
      name: 'Set Maintenance',
      icon: WrenchScrewdriverIcon,
      color: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
      description: 'Put a room in maintenance mode',
      action: () => setIsExpanded(true),
    },
    {
      id: 'booking',
      name: 'Quick Booking',
      icon: CalendarDaysIcon,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      description: 'Create a new booking quickly',
      action: () => {
        window.location.href = '/bookings';
      },
    },
  ];

  return (
    <div className="bg-gradient-to-br from-white via-amber-50/50 to-orange-50/30 backdrop-blur-sm rounded-xl shadow-2xl p-6 border-2 border-amber-200/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg shadow-md">
          <CheckCircleIcon className="h-6 w-6 text-white" />
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
                className={`group ${action.color} text-white p-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-300/50 transform hover:-translate-y-1`}
              >
                <Icon className="h-10 w-10 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200 drop-shadow-lg" />
                <div className="text-sm font-bold">{action.name}</div>
                <div className="text-xs text-white/90 mt-2 leading-tight">{action.description}</div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Select Action</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
            >
              ✕
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Check-out Section */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 shadow-lg">
              <h4 className="text-white font-bold mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                Check-out Rooms
              </h4>
              <div className="space-y-3 max-h-32 overflow-y-auto">
                {occupiedRooms.length > 0 ? (
                  occupiedRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => handleCheckOut(room.id)}
                      className="w-full text-left px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      Room {room.number} ({room.type})
                    </button>
                  ))
                ) : (
                  <p className="text-blue-200 text-sm font-medium">No occupied rooms</p>
                )}
              </div>
            </div>

            {/* Cleaning Section */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl p-6 shadow-lg">
              <h4 className="text-white font-bold mb-4 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2" />
                Schedule Cleaning
              </h4>
              <div className="space-y-3 max-h-32 overflow-y-auto">
                {availableRooms.length > 0 ? (
                  availableRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => handleQuickClean(room.id)}
                      className="w-full text-left px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      Room {room.number} ({room.type})
                    </button>
                  ))
                ) : (
                  <p className="text-green-200 text-sm font-medium">No available rooms</p>
                )}
              </div>
            </div>

            {/* Maintenance Section */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 shadow-lg">
              <h4 className="text-white font-bold mb-4 flex items-center">
                <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
                Set Maintenance
              </h4>
              <div className="space-y-3 max-h-32 overflow-y-auto">
                {rooms.filter(room => room.status !== 'MAINTENANCE').length > 0 ? (
                  rooms
                    .filter(room => room.status !== 'MAINTENANCE')
                    .map((room) => (
                      <button
                        key={room.id}
                        onClick={() => handleMaintenance(room.id)}
                        className="w-full text-left px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        Room {room.number} ({room.status})
                      </button>
                    ))
                ) : (
                  <p className="text-orange-200 text-sm font-medium">All rooms in maintenance</p>
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
