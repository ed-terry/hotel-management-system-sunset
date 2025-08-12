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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-primary-light rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {room ? 'Edit Room' : 'Add New Room'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-200">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Room Number *
            </label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => handleChange('number', e.target.value)}
              className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
              placeholder="e.g., 101, A-1, Presidential Suite"
            />
            {errors.number && (
              <p className="mt-1 text-sm text-red-400">{errors.number}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Room Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
            >
              {ROOM_TYPES.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
            >
              {ROOM_STATUSES.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price per Night *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-400">{errors.price}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-md transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : (room ? 'Update Room' : 'Add Room')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomForm;
