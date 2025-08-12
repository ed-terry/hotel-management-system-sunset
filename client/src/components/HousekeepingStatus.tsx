import { useQuery } from '@apollo/client';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  PlayIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { GET_HOUSEKEEPING_STATS_QUERY, GET_HOUSEKEEPING_TASKS_QUERY } from '../graphql/queries';
import { 
  GetHousekeepingStatsResponse,
  GetHousekeepingTasksResponse 
} from '../types/graphql';

const HousekeepingStatus = () => {
  const { data: statsData, loading: statsLoading } = useQuery<GetHousekeepingStatsResponse>(
    GET_HOUSEKEEPING_STATS_QUERY,
    {
      pollInterval: 30000, // Poll every 30 seconds for real-time updates
      errorPolicy: 'all'
    }
  );

  const { data: tasksData, loading: tasksLoading } = useQuery<GetHousekeepingTasksResponse>(
    GET_HOUSEKEEPING_TASKS_QUERY,
    {
      variables: { status: 'PENDING' },
      pollInterval: 30000, // Poll every 30 seconds
      errorPolicy: 'all'
    }
  );

  const stats = statsData?.housekeepingStats;
  const pendingTasks = tasksData?.housekeepingTasks || [];

  if (statsLoading && tasksLoading) {
    return (
      <div className="bg-gradient-to-br from-base-200 to-base-300/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-primary/20">
        <div className="animate-pulse">
          <div className="h-8 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg mb-6"></div>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-base-100/50 backdrop-blur-sm rounded-lg p-4 border border-primary/10">
                <div className="h-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded mb-3"></div>
                <div className="h-8 bg-gradient-to-r from-primary/30 to-secondary/30 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OCCUPIED':
        return 'text-error';
      case 'AVAILABLE':
        return 'text-success';
      case 'CLEANING':
        return 'text-warning';
      case 'MAINTENANCE':
        return 'text-warning';
      default:
        return 'text-base-content/70';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-error bg-error/20';
      case 'HIGH':
        return 'text-warning bg-warning/20';
      case 'MEDIUM':
        return 'text-warning bg-warning/20';
      case 'LOW':
        return 'text-success bg-success/20';
      default:
        return 'text-base-content/70 bg-base-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="bg-gradient-to-br from-base-200 to-base-300/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-primary/20 hover:shadow-xl transition-all duration-200">
        <h2 className="text-xl text-base-content font-bold mb-6 flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <UserGroupIcon className="h-6 w-6 text-primary" />
          </div>
          Housekeeping Overview
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-base-100/80 backdrop-blur-sm rounded-lg p-4 border border-primary/10 hover:bg-base-100 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/70 text-sm font-medium">Total Tasks</p>
                <p className="text-2xl font-bold text-base-content group-hover:text-primary transition-colors duration-200">{stats?.totalTasks || 0}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-info group-hover:scale-110 transition-transform duration-200" />
            </div>
          </div>

          <div className="bg-base-100/80 backdrop-blur-sm rounded-lg p-4 border border-primary/10 hover:bg-base-100 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/70 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-success group-hover:scale-105 transition-transform duration-200">{stats?.totalCleaned || 0}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-success group-hover:scale-110 transition-transform duration-200" />
            </div>
          </div>

          <div className="bg-base-100/80 backdrop-blur-sm rounded-lg p-4 border border-primary/10 hover:bg-base-100 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/70 text-sm font-medium">Today</p>
                <p className="text-2xl font-bold text-info group-hover:scale-105 transition-transform duration-200">{stats?.cleanedToday || 0}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-info group-hover:scale-110 transition-transform duration-200" />
            </div>
          </div>

          <div className="bg-base-100/80 backdrop-blur-sm rounded-lg p-4 border border-primary/10 hover:bg-base-100 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/70 text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold text-warning group-hover:scale-105 transition-transform duration-200">{stats?.inProgress || 0}</p>
              </div>
              <PlayIcon className="h-8 w-8 text-warning group-hover:scale-110 transition-transform duration-200" />
            </div>
          </div>

          <div className="bg-base-100/80 backdrop-blur-sm rounded-lg p-4 border border-primary/10 hover:bg-base-100 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/70 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-warning group-hover:scale-105 transition-transform duration-200">{stats?.pendingCleaning || 0}</p>
              </div>
              <ExclamationCircleIcon className="h-8 w-8 text-warning group-hover:scale-110 transition-transform duration-200" />
            </div>
          </div>

          <div className="bg-base-100/80 backdrop-blur-sm rounded-lg p-4 border border-primary/10 hover:bg-base-100 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/70 text-sm font-medium">Avg Time</p>
                <p className="text-2xl font-bold text-accent group-hover:scale-105 transition-transform duration-200">
                  {stats?.averageCleaningTime ? Math.round(stats.averageCleaningTime) : 0}m
                </p>
              </div>
              <ClockIcon className="h-8 w-8 text-accent group-hover:scale-110 transition-transform duration-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div className="bg-gradient-to-br from-base-200 to-base-300/50 backdrop-blur-sm rounded-xl shadow-lg border border-primary/20 hover:shadow-xl transition-all duration-200">
          <h3 className="text-lg text-base-content font-bold p-6 border-b border-primary/20 flex items-center gap-3">
            <div className="p-2 bg-warning/20 rounded-lg">
              <ExclamationCircleIcon className="h-5 w-5 text-warning" />
            </div>
            Pending Tasks ({pendingTasks.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-base-content/70 text-sm font-medium border-b border-primary/20">
                  <th className="py-4 px-6 text-left">ROOM</th>
                  <th className="py-4 px-6 text-left">TASK</th>
                  <th className="py-4 px-6 text-left">PRIORITY</th>
                  <th className="py-4 px-6 text-left">ASSIGNED TO</th>
                  <th className="py-4 px-6 text-left">EST. TIME</th>
                </tr>
              </thead>
              <tbody>
                {pendingTasks.slice(0, 10).map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-primary/10 hover:bg-base-100/50 hover:backdrop-blur-sm transition-all duration-200 group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <span className="text-base-content font-semibold group-hover:text-primary transition-colors duration-200">{task.room.number}</span>
                        <span className={`ml-2 text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(task.room.status)}`}>
                          ({task.room.status})
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-base-content/80 font-medium">
                      {task.taskType.replace(/_/g, ' ')}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${getPriorityColor(task.priority)} hover:scale-105 transition-transform duration-200`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-base-content/80 font-medium">
                      {task.assignedTo || 'Unassigned'}
                    </td>
                    <td className="py-4 px-6 text-base-content/80 font-medium">
                      {task.estimatedTime}m
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HousekeepingStatus;
