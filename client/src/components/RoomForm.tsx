import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CREATE_ROOM_MUTATION, UPDATE_ROOM_MUTATION, GET_ROOMS_QUERY } from '../graphql/queries';
import { Room, RoomInput, CreateRoomResponse, UpdateRoomResponse } from '../types/graphql';

interface RoomFormProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ROOM_TYPES = ['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE'];
const ROOM_STATUSES = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING'];

const RoomForm: React.FC<RoomFormProps> = ({ room, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<RoomInput>({
    number: '',
    type: 'SINGLE',
    status: 'AVAILABLE',
    price: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when room prop changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        number: room?.number || '',
        type: room?.type || 'SINGLE',
        status: room?.status || 'AVAILABLE',
        price: room?.price || 0,
      });
      setErrors({});
    }
  }, [room, isOpen]);

  const [createRoom, { loading: createLoading }] = useMutation<CreateRoomResponse>(
    CREATE_ROOM_MUTATION,
    {
      refetchQueries: [{ query: GET_ROOMS_QUERY }],
      onCompleted: () => {
        onSuccess?.();
        onClose();
        resetForm();
      },
      onError: (error) => {
        setErrors({ general: error.message });
      },
    }
  );

  const [updateRoom, { loading: updateLoading }] = useMutation<UpdateRoomResponse>(
    UPDATE_ROOM_MUTATION,
    {
      refetchQueries: [{ query: GET_ROOMS_QUERY }],
      onCompleted: () => {
        onSuccess?.();
        onClose();
        resetForm();
      },
      onError: (error) => {
        setErrors({ general: error.message });
      },
    }
  );

  const resetForm = () => {
    setFormData({
      number: '',
      type: 'SINGLE',
      status: 'AVAILABLE',
      price: 0,
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.number.trim()) {
      newErrors.number = 'Room number is required';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (room) {
        await updateRoom({
          variables: {
            id: room.id,
            input: formData,
          },
        });
      } else {
        await createRoom({
          variables: {
            input: formData,
          },
        });
      }
    } catch (error) {
      console.error('Error saving room:', error);
    }
  };

  const handleChange = (field: keyof RoomInput, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  const isLoading = createLoading || updateLoading;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white via-amber-50/50 to-orange-50/30 rounded-2xl shadow-2xl border border-amber-200/50 p-8 w-full max-w-md transform animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
            {room ? 'Edit Room' : 'Add New Room'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:bg-red-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {errors.general && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl text-red-700 shadow-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></div>
              {errors.general}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              Room Number *
            </label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => handleChange('number', e.target.value)}
              className="w-full px-4 py-3 bg-white/80 border-2 border-amber-200 rounded-xl text-gray-800 focus:ring-4 focus:ring-amber-300/50 focus:border-amber-400 transition-all duration-300 group-hover:border-amber-300 placeholder-gray-400 shadow-lg"
              placeholder="e.g., 101, A-1, Presidential Suite"
            />
            {errors.number && (
              <p className="mt-2 text-sm text-red-500 font-medium flex items-center">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                {errors.number}
              </p>
            )}
          </div>

          <div className="group">
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              Room Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-4 py-3 bg-white/80 border-2 border-amber-200 rounded-xl text-gray-800 focus:ring-4 focus:ring-amber-300/50 focus:border-amber-400 transition-all duration-300 group-hover:border-amber-300 cursor-pointer shadow-lg"
            >
              {ROOM_TYPES.map(type => (
                <option key={type} value={type} className="py-2">
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="group">
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-4 py-3 bg-white/80 border-2 border-amber-200 rounded-xl text-gray-800 focus:ring-4 focus:ring-amber-300/50 focus:border-amber-400 transition-all duration-300 group-hover:border-amber-300 cursor-pointer shadow-lg"
            >
              {ROOM_STATUSES.map(status => (
                <option key={status} value={status} className="py-2">
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="group">
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              Price per Night *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 font-bold text-lg">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-3 bg-white/80 border-2 border-amber-200 rounded-xl text-gray-800 focus:ring-4 focus:ring-amber-300/50 focus:border-amber-400 transition-all duration-300 group-hover:border-amber-300 placeholder-gray-400 shadow-lg"
                placeholder="0.00"
              />
            </div>
            {errors.price && (
              <p className="mt-2 text-sm text-red-500 font-medium flex items-center">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                {errors.price}
              </p>
            )}
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 ring-2 ring-amber-200/50 hover:ring-amber-300/70"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Saving...
                </span>
              ) : (
                room ? 'Update Room' : 'Add Room'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomForm;
