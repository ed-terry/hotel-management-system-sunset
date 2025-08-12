import { gql } from '@apollo/client';

// Room Queries
export const GET_ROOMS_QUERY = gql`
  query GetRooms($status: String, $type: String) {
    rooms(status: $status, type: $type) {
      id
      number
      type
      status
      price
    }
  }
`;

export const GET_ROOM_QUERY = gql`
  query GetRoom($id: ID!) {
    room(id: $id) {
      id
      number
      type
      status
      price
      bookings {
        id
        guestName
        checkIn
        checkOut
        status
      }
    }
  }
`;

export const GET_AVAILABLE_ROOMS_QUERY = gql`
  query GetAvailableRooms {
    availableRooms {
      id
      number
      type
      status
      price
    }
  }
`;

// Room Mutations
export const CREATE_ROOM_MUTATION = gql`
  mutation CreateRoom($input: RoomInput!) {
    createRoom(input: $input) {
      id
      number
      type
      status
      price
    }
  }
`;

export const UPDATE_ROOM_MUTATION = gql`
  mutation UpdateRoom($id: ID!, $input: RoomInput!) {
    updateRoom(id: $id, input: $input) {
      id
      number
      type
      status
      price
    }
  }
`;

export const DELETE_ROOM_MUTATION = gql`
  mutation DeleteRoom($id: ID!) {
    deleteRoom(id: $id)
  }
`;

// Report Queries
export const REVENUE_STATS_QUERY = gql`
  query GetRevenueStats($year: Int!) {
    revenueStats(year: $year) {
      month
      revenue
    }
  }
`;

export const HOUSEKEEPING_STATS_QUERY = gql`
  query GetHousekeepingStats {
    housekeepingStats {
      totalCleaned
      cleanedToday
      pendingCleaning
    }
  }
`;

export const OCCUPANCY_STATS_QUERY = gql`
  query GetOccupancyStats {
    occupancyStats {
      totalRooms
      occupiedRooms
      occupancyRate
    }
  }
`;

export const GENERATE_REPORT_MUTATION = gql`
  mutation GenerateReport($input: ReportInput!) {
    generateReport(input: $input) {
      id
      title
      type
      data
      summary
      generatedAt
    }
  }
`;

export const SCHEDULE_REPORT_MUTATION = gql`
  mutation ScheduleReport($input: ReportInput!) {
    scheduleReport(input: $input) {
      id
      title
      type
      data
      summary
      generatedAt
    }
  }
`;

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

// User Preferences Queries
export const GET_USER_PREFERENCES_QUERY = gql`
  query GetUserPreferences {
    userPreferences {
      id
      theme
      language
      timezone
      dateFormat
      currency
      notifications {
        email
        push
        sms
      }
    }
  }
`;

// User Preferences Mutations
export const UPDATE_USER_PREFERENCES_MUTATION = gql`
  mutation UpdateUserPreferences($input: UserPreferencesInput!) {
    updateUserPreferences(input: $input) {
      id
      theme
      language
      timezone
      dateFormat
      currency
      notifications {
        email
        push
        sms
      }
    }
  }
`;

export const UPDATE_USER_THEME_MUTATION = gql`
  mutation UpdateUserTheme($theme: String!) {
    updateUserTheme(theme: $theme) {
      id
      theme
    }
  }
`;

// Payment Queries
export const GET_RECENT_PAYMENTS_QUERY = gql`
  query GetRecentPayments($limit: Int = 10) {
    recentPayments(limit: $limit) {
      id
      amount
      status
      method
      createdAt
      booking {
        id
        guestName
        room {
          number
        }
      }
    }
  }
`;

export const GET_PENDING_PAYMENTS_QUERY = gql`
  query GetPendingPayments {
    pendingPayments {
      id
      amount
      dueDate
      booking {
        id
        guestName
        room {
          number
        }
      }
    }
  }
`;

// Dashboard Stats Query
export const GET_DASHBOARD_STATS_QUERY = gql`
  query GetDashboardStats {
    dashboardStats {
      totalRooms
      occupiedRooms
      availableRooms
      maintenanceRooms
      totalGuests
      checkInsToday
      checkOutsToday
      revenue {
        today
        thisMonth
        thisYear
      }
      occupancyRate
      averageRoomRate
    }
  }
`;

// Analytics Stats Query (with fallback to mock data)
export const GET_ANALYTICS_STATS_QUERY = gql`
  query GetAnalyticsStats($period: String) {
    analyticsStats(period: $period) {
      revenueStats {
        date
        revenue
        period
      }
      bookingStats {
        date
        bookings
        period
      }
      occupancyStats {
        rate
        change
        trend
        occupancyRate
      }
      performanceMetrics {
        totalRevenue
        revenueChange
        totalBookings
        bookingChange
        occupancyRate
        occupancyChange
        averageStayDuration
        stayDurationChange
      }
    }
  }
`;

// Mock Analytics Query (for development/fallback)
export const GET_MOCK_ANALYTICS_QUERY = gql`
  query GetMockAnalytics($period: String) {
    # This is a mock query that will be handled by the frontend
    mockAnalytics(period: $period) {
      message
    }
  }
`;
