import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { 
  CREATE_HOUSEKEEPING_TASK_MUTATION, 
  UPDATE_HOUSEKEEPING_TASK_MUTATION,
  GET_HOUSEKEEPING_TASKS_QUERY,
  GET_ROOMS_QUERY
} from '../graphql/queries';
import { 
  HousekeepingTask, 
  HousekeepingTaskInput, 
  UpdateHousekeepingTaskInput,
  CreateHousekeepingTaskResponse,
  UpdateHousekeepingTaskResponse,
  GetRoomsResponse
} from '../types/graphql';

interface HousekeepingTaskFormProps {
  task: HousekeepingTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TASK_TYPES = ['CLEANING', 'MAINTENANCE', 'INSPECTION', 'REPAIR', 'RESTOCKING'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const HousekeepingTaskForm: React.FC<HousekeepingTaskFormProps> = ({ 
  task, 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [createFormData, setCreateFormData] = useState<HousekeepingTaskInput>({
    roomId: '',
    taskType: 'CLEANING',
    priority: 'MEDIUM',
    estimatedTime: 30,
    assignedTo: '',
    notes: '',
  });

  const [editFormData, setEditFormData] = useState<UpdateHousekeepingTaskInput>({
    status: 'PENDING',
    assignedTo: '',
    priority: 'MEDIUM',
    estimatedTime: 30,
    actualTime: undefined,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get rooms for dropdown
  const { data: roomsData } = useQuery<GetRoomsResponse>(GET_ROOMS_QUERY, {
    errorPolicy: 'all'
  });

  const [createTask, { loading: createLoading }] = useMutation<CreateHousekeepingTaskResponse>(
    CREATE_HOUSEKEEPING_TASK_MUTATION,
    {
      refetchQueries: [{ query: GET_HOUSEKEEPING_TASKS_QUERY }],
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

  const [updateTask, { loading: updateLoading }] = useMutation<UpdateHousekeepingTaskResponse>(
    UPDATE_HOUSEKEEPING_TASK_MUTATION,
    {
      refetchQueries: [{ query: GET_HOUSEKEEPING_TASKS_QUERY }],
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

  const isEdit = !!task;
  const loading = createLoading || updateLoading;
  const formData = isEdit ? editFormData : createFormData;

  // Reset form when task prop changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (task) {
        setEditFormData({
          status: task.status,
          assignedTo: task.assignedTo || '',
          priority: task.priority,
          estimatedTime: task.estimatedTime,
          actualTime: task.actualTime,
          notes: task.notes || '',
        });
      } else {
        setCreateFormData({
          roomId: '',
          taskType: 'CLEANING',
          priority: 'MEDIUM',
          estimatedTime: 30,
          assignedTo: '',
          notes: '',
        });
      }
      setErrors({});
    }
  }, [task, isOpen]);

  const resetForm = () => {
    setCreateFormData({
      roomId: '',
      taskType: 'CLEANING',
      priority: 'MEDIUM',
      estimatedTime: 30,
      assignedTo: '',
      notes: '',
    });
    setEditFormData({
      status: 'PENDING',
      assignedTo: '',
      priority: 'MEDIUM',
      estimatedTime: 30,
      actualTime: undefined,
      notes: '',
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isEdit) {
      const createData = formData as HousekeepingTaskInput;
      if (!createData.roomId) {
        newErrors.roomId = 'Room is required';
      }
      if (!createData.taskType) {
        newErrors.taskType = 'Task type is required';
      }
    }

    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }

    if (!formData.estimatedTime || formData.estimatedTime <= 0) {
      newErrors.estimatedTime = 'Estimated time must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isEdit && task) {
        await updateTask({
          variables: {
            id: task.id,
            input: formData as UpdateHousekeepingTaskInput,
          },
        });
      } else {
        await createTask({
          variables: {
            input: formData as HousekeepingTaskInput,
          },
        });
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (isEdit) {
      setEditFormData(prev => ({ ...prev, [field]: value }));
    } else {
      setCreateFormData(prev => ({ ...prev, [field]: value }));
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white via-amber-50/50 to-orange-50/30 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border-2 border-amber-200/50 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b-2 border-amber-200/50 bg-gradient-to-r from-amber-100/50 to-orange-100/30">
          <h2 className="text-xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
            {isEdit ? 'Edit Task' : 'Create Housekeeping Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:bg-red-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.general && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                {errors.general}
              </div>
            </div>
          )}

          {/* Room Selection (only for new tasks) */}
          {!isEdit && (
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                Room *
              </label>
              <select
                value={!isEdit ? (formData as HousekeepingTaskInput).roomId : ''}
                onChange={(e) => handleInputChange('roomId', e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border-2 border-amber-200 rounded-xl text-gray-800 focus:ring-4 focus:ring-amber-300/50 focus:border-amber-400 transition-all duration-300 group-hover:border-amber-300 cursor-pointer shadow-lg"
              >
                <option value="">Select a room</option>
                {roomsData?.rooms.map((room) => (
                  <option key={room.id} value={room.id} className="py-2">
                    Room {room.number} ({room.type})
                  </option>
                ))}
              </select>
              {errors.roomId && (
                <p className="mt-2 text-sm text-red-500 font-medium flex items-center">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                  {errors.roomId}
                </p>
              )}
            </div>
          )}

          {/* Task Type (only for new tasks) */}
          {!isEdit && (
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                Task Type *
              </label>
              <select
                value={!isEdit ? (formData as HousekeepingTaskInput).taskType : 'CLEANING'}
                onChange={(e) => handleInputChange('taskType', e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border-2 border-amber-200 rounded-xl text-gray-800 focus:ring-4 focus:ring-amber-300/50 focus:border-amber-400 transition-all duration-300 group-hover:border-amber-300 cursor-pointer shadow-lg"
              >
                {TASK_TYPES.map((type) => (
                  <option key={type} value={type} className="py-2">
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              {errors.taskType && (
                <p className="mt-2 text-sm text-red-500 font-medium flex items-center">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                  {errors.taskType}
                </p>
              )}
            </div>
          )}

          {/* Status (only for editing) */}
          {isEdit && (
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                Status
              </label>
              <select
                value={isEdit ? (formData as UpdateHousekeepingTaskInput).status || task?.status : 'PENDING'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border-2 border-amber-200 rounded-xl text-gray-800 focus:ring-4 focus:ring-amber-300/50 focus:border-amber-400 transition-all duration-300 group-hover:border-amber-300 cursor-pointer shadow-lg"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status} className="py-2">
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Priority */}
          <div className="group">
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              Priority *
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full px-4 py-3 bg-white/80 border-2 border-amber-200 rounded-xl text-gray-800 focus:ring-4 focus:ring-amber-300/50 focus:border-amber-400 transition-all duration-300 group-hover:border-amber-300 cursor-pointer shadow-lg"
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority} className="py-2">
                  {priority}
                </option>
              ))}
            </select>
            {errors.priority && (
              <p className="mt-2 text-sm text-red-500 font-medium flex items-center">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                {errors.priority}
              </p>
            )}
          </div>

          {/* Estimated Time */}
          <div className="group">
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              Estimated Time (minutes) *
            </label>
            <input
              type="number"
              min="1"
              value={formData.estimatedTime}
              onChange={(e) => handleInputChange('estimatedTime', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white/80 border-2 border-amber-200 rounded-xl text-gray-800 focus:ring-4 focus:ring-amber-300/50 focus:border-amber-400 transition-all duration-300 group-hover:border-amber-300 placeholder-gray-400 shadow-lg"
            />
            {errors.estimatedTime && (
              <p className="mt-2 text-sm text-red-500 font-medium flex items-center">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                {errors.estimatedTime}
              </p>
            )}
          </div>

          {/* Actual Time (only for editing completed tasks) */}
          {isEdit && (
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                Actual Time (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={isEdit ? (formData as UpdateHousekeepingTaskInput).actualTime || '' : ''}
                onChange={(e) => handleInputChange('actualTime', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-4 py-3 bg-white/80 border-2 border-amber-200 rounded-xl text-gray-800 focus:ring-4 focus:ring-amber-300/50 focus:border-amber-400 transition-all duration-300 group-hover:border-amber-300 placeholder-gray-400 shadow-lg"
              />
            </div>
          )}

          {/* Assigned To */}
          <div className="group">
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              Assigned To
            </label>
            <input
              type="text"
              value={formData.assignedTo}
              onChange={(e) => handleInputChange('assignedTo', e.target.value)}
              placeholder="Enter staff member name"
              className="w-full px-4 py-3 bg-white/80 border-2 border-amber-200 rounded-xl text-gray-800 focus:ring-4 focus:ring-amber-300/50 focus:border-amber-400 transition-all duration-300 group-hover:border-amber-300 placeholder-gray-400 shadow-lg"
            />
          </div>

          {/* Notes */}
          <div className="group">
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              placeholder="Additional notes..."
              className="w-full px-4 py-3 bg-white/80 border-2 border-amber-200 rounded-xl text-gray-800 focus:ring-4 focus:ring-amber-300/50 focus:border-amber-400 transition-all duration-300 group-hover:border-amber-300 placeholder-gray-400 resize-none shadow-lg"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 ring-2 ring-amber-200/50 hover:ring-amber-300/70"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Saving...
                </span>
              ) : (
                isEdit ? 'Update Task' : 'Create Task'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HousekeepingTaskForm;
