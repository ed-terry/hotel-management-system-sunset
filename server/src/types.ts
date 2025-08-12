import { GraphQLResolveInfo, GraphQLScalarType } from 'graphql';
import { BaseContext } from '@apollo/server';
import {
    RoomType as PrismaRoomType,
    RoomStatus as PrismaRoomStatus,
    BookingStatus as PrismaBookingStatus,
    ReportType as PrismaReportType,
    Room as PrismaRoom,
    Booking as PrismaBooking,
    Report as PrismaReport,
    Prisma
} from '@prisma/client';

// Re-export Prisma enums
export { PrismaRoomType as RoomType };
export { PrismaRoomStatus as RoomStatus };
export { PrismaBookingStatus as BookingStatus };
export { PrismaReportType as ReportType };

// GraphQL Types
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
    room: Room;
    guestName: string;
    checkIn: string;
    checkOut: string;
    status: string;
}

export interface Report {
    id: string;
    title: string;
    type: string;
    data: Prisma.JsonValue;
    summary: string;
    generatedAt: string;
}

export interface RevenueStats {
    month: string;
    revenue: number;
}

export interface Payment {
    id: string;
    amount: number;
    status: string;
    method: string;
    dueDate?: string;
    paidAt?: string;
    createdAt: string;
    booking: {
        id: string;
        guestName: string;
        room: {
            number: string;
        };
    };
}

export interface DashboardStats {
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    maintenanceRooms: number;
    totalGuests: number;
    checkInsToday: number;
    checkOutsToday: number;
    revenue: {
        today: number;
        thisMonth: number;
        thisYear: number;
    };
    occupancyRate: number;
    averageRoomRate: number;
}

export interface UserPreferences {
    id: string;
    theme: string;
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    notifications?: NotificationSettings;
}

export interface NotificationSettings {
    email: boolean;
    push: boolean;
    sms: boolean;
}

export interface UserPreferencesInput {
    theme?: string;
    language?: string;
    timezone?: string;
    dateFormat?: string;
    currency?: string;
    notifications?: NotificationSettingsInput;
}

export interface NotificationSettingsInput {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
}

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

export interface HousekeepingStats {
    totalCleaned: number;
    cleanedToday: number;
    pendingCleaning: number;
    inProgress: number;
    averageCleaningTime: number;
    totalTasks: number;
}

export interface OccupancyStats {
    totalRooms: number;
    occupiedRooms: number;
    occupancyRate: number;
}

export interface RoomInput {
    number: string;
    type: PrismaRoomType;
    status?: PrismaRoomStatus;
    price: number;
}

export interface BookingInput {
    roomId: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    status?: PrismaBookingStatus;
}

export interface ReportInput {
    title: string;
    type: string;
    data: Prisma.JsonValue;
    summary: string;
    recipients?: string[];
}

export interface GenerateReportInput extends ReportInput {
    period?: string;
}

export interface ScheduleReportInput {
    type: PrismaReportType;
    frequency: string;
    scheduledFor: Date;
    parameters?: any;
}

export interface UserPreferencesInput {
    theme?: string;
    language?: string;
    timezone?: string;
    dateFormat?: string;
    currency?: string;
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

export interface Context extends BaseContext {
    prisma: Prisma.TransactionClient;
    user?: {
        id: string;
        email: string;
        role: string;
        firstName: string;
        lastName: string;
    };
}

type ResolverFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo,
) => Promise<TResult> | TResult;

interface QueryResolvers {
    rooms: ResolverFn<Room[], any, Context, { status?: string; type?: string }>;
    room: ResolverFn<Room | null, any, Context, { id: string }>;
    availableRooms: ResolverFn<Room[], any, Context, {}>;
    bookings: ResolverFn<Booking[], any, Context, {}>;
    booking: ResolverFn<Booking | null, any, Context, { id: string }>;
    reports: ResolverFn<Report[], any, Context, {}>;
    report: ResolverFn<Report | null, any, Context, { id: string }>;
    revenueStats: ResolverFn<RevenueStats[], any, Context, { year: number }>;
    housekeepingStats: ResolverFn<HousekeepingStats, any, Context, {}>;
    occupancyStats: ResolverFn<OccupancyStats, any, Context, {}>;
    housekeepingTasks: ResolverFn<HousekeepingTask[], any, Context, { status?: string; roomId?: string }>;
    housekeepingTask: ResolverFn<HousekeepingTask | null, any, Context, { id: string }>;
    userPreferences: ResolverFn<UserPreferences | null, any, Context, {}>;
    recentPayments: ResolverFn<Payment[], any, Context, { limit?: number }>;
    pendingPayments: ResolverFn<Payment[], any, Context, {}>;
    dashboardStats: ResolverFn<DashboardStats, any, Context, {}>;
}

interface MutationResolvers {
    createRoom: ResolverFn<Room, any, Context, { input: RoomInput }>;
    updateRoom: ResolverFn<Room | null, any, Context, { id: string; input: Partial<RoomInput> }>;
    deleteRoom: ResolverFn<boolean, any, Context, { id: string }>;
    createBooking: ResolverFn<Booking, any, Context, { input: BookingInput }>;
    updateBooking: ResolverFn<Booking | null, any, Context, { id: string; input: Partial<BookingInput> }>;
    deleteBooking: ResolverFn<boolean, any, Context, { id: string }>;
    cancelBooking: ResolverFn<boolean, any, Context, { id: string }>;
    createReport: ResolverFn<Report, any, Context, { input: ReportInput }>;
    generateReport: ResolverFn<Report, any, Context, { input: GenerateReportInput }>;
    scheduleReport: ResolverFn<Report, any, Context, { input: ScheduleReportInput }>;
    createHousekeepingTask: ResolverFn<HousekeepingTask, any, Context, { input: HousekeepingTaskInput }>;
    updateHousekeepingTask: ResolverFn<HousekeepingTask | null, any, Context, { id: string; input: UpdateHousekeepingTaskInput }>;
    completeHousekeepingTask: ResolverFn<HousekeepingTask | null, any, Context, { id: string; actualTime?: number; notes?: string }>;
    deleteHousekeepingTask: ResolverFn<boolean, any, Context, { id: string }>;
    updateRoomStatus: ResolverFn<Room | null, any, Context, { roomId: string; status: string }>;
    updateUserPreferences: ResolverFn<UserPreferences, any, Context, { input: UserPreferencesInput }>;
    updateUserTheme: ResolverFn<UserPreferences, any, Context, { theme: string }>;
}

export type Resolvers = {
    Query: QueryResolvers;
    Mutation: MutationResolvers;
    JSON: GraphQLScalarType;
}
