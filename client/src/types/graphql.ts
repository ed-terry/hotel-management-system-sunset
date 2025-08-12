// Room Types
export interface Room {
    id: string;
    number: string;
    type: string;
    status: string;
    price: number;
    bookings?: Booking[];
}

export interface Booking {
    id: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    status: string;
    room?: Room;
}

export interface RoomInput {
    number: string;
    type: string;
    status?: string;
    price: number;
}

// Room Query Response Types
export interface GetRoomsResponse {
    rooms: Room[];
}

export interface GetRoomResponse {
    room: Room | null;
}

export interface GetAvailableRoomsResponse {
    availableRooms: Room[];
}

// Room Mutation Response Types
export interface CreateRoomResponse {
    createRoom: Room;
}

export interface UpdateRoomResponse {
    updateRoom: Room;
}

export interface DeleteRoomResponse {
    deleteRoom: boolean;
}

// Stats Types
export interface RevenueStats {
    month: string;
    revenue: number;
}

export interface HousekeepingStats {
    totalCleaned: number;
    cleanedToday: number;
    pendingCleaning: number;
    cleaningSatisfaction: number;
}

export interface RoomTypeStats {
    name: string;
    value: number;
}

export interface OccupancyStats {
    totalRooms: number;
    occupiedRooms: number;
    occupancyRate: number;
    roomTypes: RoomTypeStats[];
}

export interface Report {
    id: string;
    title: string;
    type: string;
    data: Record<string, unknown>;
    summary: string;
    generatedAt: string;
}

export interface ReportInput {
    type: string;
    frequency?: string;
    recipients?: string[];
}

export interface GenerateReportResponse {
    generateReport: Report;
}

export interface ScheduleReportResponse {
    scheduleReport: Report;
}

export interface RevenueStatsResponse {
    revenueStats: RevenueStats[];
}

export interface HousekeepingStatsResponse {
    housekeepingStats: HousekeepingStats;
}

export interface OccupancyStatsResponse {
    occupancyStats: OccupancyStats;
}

// Housekeeping Types
export interface HousekeepingTask {
    id: string;
    room: Room;
    taskType: string;
    status: string;
    assignedTo?: string;
    priority: string;
    estimatedTime: number;
    actualTime?: number;
    notes?: string;
    createdAt: string;
    completedAt?: string;
}

export interface HousekeepingTaskInput {
    roomId: string;
    taskType: string;
    priority: string;
    estimatedTime: number;
    assignedTo?: string;
    notes?: string;
}

export interface UpdateHousekeepingTaskInput {
    status?: string;
    assignedTo?: string;
    priority?: string;
    estimatedTime?: number;
    actualTime?: number;
    notes?: string;
}

export interface HousekeepingStats {
    totalCleaned: number;
    cleanedToday: number;
    pendingCleaning: number;
    inProgress: number;
    averageCleaningTime: number;
    totalTasks: number;
}

// Query Response Types
export interface GetHousekeepingTasksResponse {
    housekeepingTasks: HousekeepingTask[];
}

export interface GetHousekeepingTaskResponse {
    housekeepingTask: HousekeepingTask;
}

export interface CreateHousekeepingTaskResponse {
    createHousekeepingTask: HousekeepingTask;
}

export interface UpdateHousekeepingTaskResponse {
    updateHousekeepingTask: HousekeepingTask;
}

export interface CompleteHousekeepingTaskResponse {
    completeHousekeepingTask: HousekeepingTask;
}

export interface UpdateRoomStatusResponse {
    updateRoomStatus: Room;
}

export interface GetHousekeepingStatsResponse {
    housekeepingStats: HousekeepingStats;
}
