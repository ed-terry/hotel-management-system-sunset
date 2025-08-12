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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-200 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto border border-base-300">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-base-300">
          <h2 className="text-xl font-semibold text-base-content">
            {isEdit ? 'Edit Task' : 'Create Housekeeping Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-base-content/70 hover:text-base-content transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.general && (
            <div className="bg-error/20 border border-error text-error px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          {/* Room Selection (only for new tasks) */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-base-content/70 mb-2">
                Room *
              </label>
              <select
                value={!isEdit ? (formData as HousekeepingTaskInput).roomId : ''}
                onChange={(e) => handleInputChange('roomId', e.target.value)}
                className="w-full px-3 py-2 bg-base-100 border border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select a room</option>
                {roomsData?.rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    Room {room.number} ({room.type})
                  </option>
                ))}
              </select>
              {errors.roomId && (
                <p className="mt-1 text-sm text-error">{errors.roomId}</p>
              )}
            </div>
          )}

          {/* Task Type (only for new tasks) */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-base-content/70 mb-2">
                Task Type *
              </label>
              <select
                value={!isEdit ? (formData as HousekeepingTaskInput).taskType : 'CLEANING'}
                onChange={(e) => handleInputChange('taskType', e.target.value)}
                className="w-full px-3 py-2 bg-base-100 border border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {TASK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              {errors.taskType && (
                <p className="mt-1 text-sm text-error">{errors.taskType}</p>
              )}
            </div>
          )}

          {/* Status (only for editing) */}
          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-base-content/70 mb-2">
                Status
              </label>
              <select
                value={isEdit ? (formData as UpdateHousekeepingTaskInput).status || task?.status : 'PENDING'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-base-100 border border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-base-content/70 mb-2">
              Priority *
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full px-3 py-2 bg-base-100 border border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
            {errors.priority && (
              <p className="mt-1 text-sm text-error">{errors.priority}</p>
            )}
          </div>

          {/* Estimated Time */}
          <div>
            <label className="block text-sm font-medium text-base-content/70 mb-2">
              Estimated Time (minutes) *
            </label>
            <input
              type="number"
              min="1"
              value={formData.estimatedTime}
              onChange={(e) => handleInputChange('estimatedTime', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-base-100 border border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.estimatedTime && (
              <p className="mt-1 text-sm text-error">{errors.estimatedTime}</p>
            )}
          </div>

          {/* Actual Time (only for editing completed tasks) */}
          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-base-content/70 mb-2">
                Actual Time (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={isEdit ? (formData as UpdateHousekeepingTaskInput).actualTime || '' : ''}
                onChange={(e) => handleInputChange('actualTime', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-base-100 border border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          )}

          {/* Assigned To */}
          <div>
            <label className="block text-sm font-medium text-base-content/70 mb-2">
              Assigned To
            </label>
            <input
              type="text"
              value={formData.assignedTo}
              onChange={(e) => handleInputChange('assignedTo', e.target.value)}
              placeholder="Enter staff member name"
              className="w-full px-3 py-2 bg-base-100 border border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-base-content/70 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              placeholder="Additional notes..."
              className="w-full px-3 py-2 bg-base-100 border border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-content px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-base-300 text-base-content/70 rounded-md hover:bg-base-300 transition-colors"
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
