import { gql } from '@apollo/client';

// Housekeeping Queries
export const GET_HOUSEKEEPING_TASKS_QUERY = gql`
  query GetHousekeepingTasks($status: String, $roomId: ID) {
    housekeepingTasks(status: $status, roomId: $roomId) {
      id
      room {
        id
        number
        type
        status
        price
      }
      taskType
      status
      assignedTo
      priority
      estimatedTime
      actualTime
      notes
      createdAt
      completedAt
    }
  }
`;

export const GET_HOUSEKEEPING_TASK_QUERY = gql`
  query GetHousekeepingTask($id: ID!) {
    housekeepingTask(id: $id) {
      id
      room {
        id
        number
        type
        status
        price
      }
      taskType
      status
      assignedTo
      priority
      estimatedTime
      actualTime
      notes
      createdAt
      completedAt
    }
  }
`;

export const GET_HOUSEKEEPING_STATS_QUERY = gql`
  query GetHousekeepingStats {
    housekeepingStats {
      totalCleaned
      cleanedToday
      pendingCleaning
      inProgress
      averageCleaningTime
      totalTasks
    }
  }
`;

// Housekeeping Mutations
export const CREATE_HOUSEKEEPING_TASK_MUTATION = gql`
  mutation CreateHousekeepingTask($input: HousekeepingTaskInput!) {
    createHousekeepingTask(input: $input) {
      id
      room {
        id
        number
        type
        status
        price
      }
      taskType
      status
      assignedTo
      priority
      estimatedTime
      actualTime
      notes
      createdAt
      completedAt
    }
  }
`;

export const UPDATE_HOUSEKEEPING_TASK_MUTATION = gql`
  mutation UpdateHousekeepingTask($id: ID!, $input: UpdateHousekeepingTaskInput!) {
    updateHousekeepingTask(id: $id, input: $input) {
      id
      room {
        id
        number
        type
        status
        price
      }
      taskType
      status
      assignedTo
      priority
      estimatedTime
      actualTime
      notes
      createdAt
      completedAt
    }
  }
`;

export const COMPLETE_HOUSEKEEPING_TASK_MUTATION = gql`
  mutation CompleteHousekeepingTask($id: ID!, $actualTime: Int, $notes: String) {
    completeHousekeepingTask(id: $id, actualTime: $actualTime, notes: $notes) {
      id
      room {
        id
        number
        type
        status
        price
      }
      taskType
      status
      assignedTo
      priority
      estimatedTime
      actualTime
      notes
      createdAt
      completedAt
    }
  }
`;

export const DELETE_HOUSEKEEPING_TASK_MUTATION = gql`
  mutation DeleteHousekeepingTask($id: ID!) {
    deleteHousekeepingTask(id: $id)
  }
`;

export const UPDATE_ROOM_STATUS_MUTATION = gql`
  mutation UpdateRoomStatus($roomId: ID!, $status: String!) {
    updateRoomStatus(roomId: $roomId, status: $status) {
      id
      number
      type
      status
      price
    }
  }
`;