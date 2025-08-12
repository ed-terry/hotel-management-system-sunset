// GraphQL Response Types
export interface RevenueStats {
    month: string;
    revenue: number;
}

export interface RevenueStatsResponse {
    revenueStats: RevenueStats[];
}

export interface HousekeepingStats {
    cleaningSatisfaction: number;
    status: {
        clean: number;
        dirty: number;
        maintenance: number;
    };
}

export interface HousekeepingStatsResponse {
    housekeepingStats: HousekeepingStats;
}

export interface RoomTypeStats {
    name: string;
    occupancy: number;
}

export interface OccupancyStats {
    roomTypes: RoomTypeStats[];
    totalRooms: number;
    occupiedRooms: number;
}

export interface OccupancyStatsResponse {
    occupancyStats: OccupancyStats;
}

export interface GenerateReportResponse {
    generateReport: {
        url: string;
        filename: string;
    };
}

export interface ScheduleReportResponse {
    scheduleReport: {
        success: boolean;
        message: string;
    };
}

export interface ReportInput {
    type: 'financial' | 'occupancy' | 'housekeeping';
    format: 'pdf' | 'excel';
    frequency?: 'daily' | 'weekly' | 'monthly';
    recipients?: string[];
}
