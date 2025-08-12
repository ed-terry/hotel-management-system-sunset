import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { 
  HousekeepingStatus, 
  HousekeepingTaskForm 
} from '../components';
import { 
  GET_HOUSEKEEPING_TASKS_QUERY,
  COMPLETE_HOUSEKEEPING_TASK_MUTATION,
  DELETE_HOUSEKEEPING_TASK_MUTATION,
  UPDATE_HOUSEKEEPING_TASK_MUTATION
} from '../graphql/queries';
import { 
  HousekeepingTask, 
  GetHousekeepingTasksResponse,
  CompleteHousekeepingTaskResponse
} from '../types/graphql';

const TASK_STATUSES = ['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const TASK_TYPES = ['ALL', 'CLEANING', 'MAINTENANCE', 'INSPECTION', 'REPAIR', 'RESTOCKING'];
const PRIORITIES = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const Housekeeping = () => {
  const [selectedTask, setSelectedTask] = useState<HousekeepingTask | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');

  // Build query variables
  const queryVariables = {
    ...(filterStatus !== 'ALL' && { status: filterStatus }),
  };

  const { data, loading, error, refetch } = useQuery<GetHousekeepingTasksResponse>(
    GET_HOUSEKEEPING_TASKS_QUERY,
    {
      variables: queryVariables,
      pollInterval: 30000, // Real-time updates every 30 seconds
      errorPolicy: 'all',
    }
  );

  const [completeTask] = useMutation<CompleteHousekeepingTaskResponse>(
    COMPLETE_HOUSEKEEPING_TASK_MUTATION,
    {
      refetchQueries: [{ query: GET_HOUSEKEEPING_TASKS_QUERY }],
    }
  );

  const [deleteTask] = useMutation(DELETE_HOUSEKEEPING_TASK_MUTATION, {
    refetchQueries: [{ query: GET_HOUSEKEEPING_TASKS_QUERY }],
  });

  const [updateTaskStatus] = useMutation(UPDATE_HOUSEKEEPING_TASK_MUTATION, {
    refetchQueries: [{ query: GET_HOUSEKEEPING_TASKS_QUERY }],
  });

  const tasks = data?.housekeepingTasks || [];

  // Filter tasks by search term, type, and priority
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.taskType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.assignedTo && task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'ALL' || task.taskType === filterType;
    const matchesPriority = filterPriority === 'ALL' || task.priority === filterPriority;

    return matchesSearch && matchesType && matchesPriority;
  });

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: HousekeepingTask) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedTask(null);
  };

  const handleFormSuccess = () => {
    refetch();
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const actualTime = prompt('Enter actual time taken (minutes):');
      if (actualTime) {
        await completeTask({
          variables: {
            id: taskId,
            actualTime: parseInt(actualTime),
          },
        });
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask({
          variables: { id: taskId },
        });
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleStartTask = async (taskId: string) => {
    try {
      await updateTaskStatus({
        variables: {
          id: taskId,
          input: { status: 'IN_PROGRESS' },
        },
      });
    } catch (error) {
      console.error('Error starting task:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-orange-400 bg-orange-900/20';
      case 'IN_PROGRESS':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'COMPLETED':
        return 'text-green-400 bg-green-900/20';
      case 'CANCELLED':
        return 'text-red-400 bg-red-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-400 bg-red-900/20';
      case 'HIGH':
        return 'text-orange-400 bg-orange-900/20';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'LOW':
        return 'text-green-400 bg-green-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (error) {
    console.error('Error fetching housekeeping tasks:', error);
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <CheckCircleIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Housekeeping Management</h1>
                <p className="text-white/90 text-lg">Streamline cleaning operations and maintenance tasks</p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={handleAddTask}
                className="btn btn-white btn-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {/* Housekeeping Status Overview */}
        <div className="mb-8">
          <HousekeepingStatus />
        </div>

        {/* Search and Filters */}
        <div className="bg-base-200 border border-base-300 rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-col xl:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks by room, type, or staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
              >
                {TASK_STATUSES.map(status => (
                  <option key={status} value={status}>
                    {status === 'ALL' ? 'All Statuses' : status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
              >
                {TASK_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type === 'ALL' ? 'All Types' : type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
              >
                {PRIORITIES.map(priority => (
                  <option key={priority} value={priority}>
                    {priority === 'ALL' ? 'All Priorities' : priority}
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
            <p className="text-red-200">Failed to load housekeeping tasks</p>
            <p className="text-red-300 text-sm">{error.message}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
        </div>
      )}

      {/* Tasks Count */}
      {!loading && (
        <div className="mb-4">
          <p className="text-gray-400">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </p>
        </div>
      )}

      {/* Tasks Table */}
      {!loading && filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">
            {tasks.length === 0 ? 'No tasks found' : 'No tasks match your filters'}
          </div>
          <p className="text-gray-500">
            {tasks.length === 0 ? 'Get started by adding your first task.' : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-primary-light rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary">
                <tr className="text-gray-400 text-sm">
                  <th className="py-3 px-6 text-left">ROOM</th>
                  <th className="py-3 px-6 text-left">TASK</th>
                  <th className="py-3 px-6 text-left">STATUS</th>
                  <th className="py-3 px-6 text-left">PRIORITY</th>
                  <th className="py-3 px-6 text-left">ASSIGNED TO</th>
                  <th className="py-3 px-6 text-left">TIME</th>
                  <th className="py-3 px-6 text-left">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-gray-700 hover:bg-primary transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <span className="text-white font-medium">{task.room.number}</span>
                        <span className="ml-2 text-xs text-gray-400">
                          ({task.room.type})
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-white font-medium">
                          {task.taskType.replace(/_/g, ' ')}
                        </div>
                        {task.notes && (
                          <div className="text-gray-400 text-sm mt-1 truncate max-w-xs">
                            {task.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-300">
                      {task.assignedTo || 'Unassigned'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-300 text-sm">
                        <div>Est: {formatTime(task.estimatedTime)}</div>
                        {task.actualTime && (
                          <div className="text-green-400">Act: {formatTime(task.actualTime)}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        {task.status === 'PENDING' && (
                          <button
                            onClick={() => handleStartTask(task.id)}
                            className="p-1 text-yellow-400 hover:text-yellow-300 transition-colors"
                            title="Start Task"
                          >
                            <PlayIcon className="h-4 w-4" />
                          </button>
                        )}
                        {(task.status === 'PENDING' || task.status === 'IN_PROGRESS') && (
                          <button
                            onClick={() => handleCompleteTask(task.id)}
                            className="p-1 text-green-400 hover:text-green-300 transition-colors"
                            title="Complete Task"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditTask(task)}
                          className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                          title="Edit Task"
                        >
                          <ClockIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          title="Delete Task"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      <HousekeepingTaskForm
        task={selectedTask}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
      </div>
    </div>
  );
};

export default Housekeeping;
