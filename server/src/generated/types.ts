import { GraphQLResolveInfo } from 'graphql';

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
    data: any;
    summary: string;
    generatedAt: string;
}

export interface RevenueStats {
    month: string;
    revenue: number;
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

export interface Payment {
    id: string;
    booking: Booking;
    amount: number;
    status: string;
    method: string;
    dueDate: string;
    paidAt?: string;
    createdAt: string;
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

export interface Guest {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    nationality?: string;
    idNumber?: string;
    isVip: boolean;
    preferences?: any;
    notes?: string;
    totalStays: number;
    totalSpent: number;
    lastStay?: string;
    createdAt: string;
    updatedAt: string;
    bookings: Booking[];
    invoices: Invoice[];
}

export interface Employee {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    department: string;
    position: string;
    hireDate: string;
    salary?: number;
    status: string;
    supervisor?: string;
    emergencyContact?: any;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    guestId?: string;
    guestName: string;
    guestEmail?: string;
    bookingId?: string;
    booking?: Booking;
    items: any;
    subtotal: number;
    tax: number;
    total: number;
    status: string;
    issueDate: string;
    dueDate: string;
    paidDate?: string;
    paymentMethod?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    guest?: Guest;
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

export interface UserPreferences {
    id: string;
    theme: string;
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    notifications?: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
}

// Input types
export interface RoomInput {
    number: string;
    type: string;
    status?: string;
    price: number;
}

export interface BookingInput {
    roomId: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    status?: string;
}

export interface ReportInput {
    title?: string;
    type: string;
    data?: any;
    summary?: string;
    period?: string;
    parameters?: any;
    frequency?: string;
    recipients?: string[];
}

export interface GuestInput {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    nationality?: string;
    idNumber?: string;
    preferences?: any;
    notes?: string;
}

export interface EmployeeInput {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    department: string;
    position: string;
    hireDate: string;
    salary?: number;
    supervisor?: string;
    emergencyContact?: any;
    notes?: string;
}

export interface InvoiceInput {
    guestId?: string;
    guestName: string;
    guestEmail?: string;
    bookingId?: string;
    items: any;
    subtotal: number;
    tax: number;
    total: number;
    dueDate: string;
    notes?: string;
}

export interface UserPreferencesInput {
    theme?: string;
    language?: string;
    timezone?: string;
    dateFormat?: string;
    currency?: string;
    notifications?: {
        email?: boolean;
        push?: boolean;
        sms?: boolean;
    };
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

export interface PaymentInput {
    bookingId: string;
    amount: number;
    method: string;
    dueDate: string;
}

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export interface QueryResolvers {
    rooms: ResolverFn<Room[], any, any, { status?: string; type?: string }>;
    room: ResolverFn<Room | null, any, any, { id: string }>;
    availableRooms: ResolverFn<Room[], any, any, {}>;
    bookings: ResolverFn<Booking[], any, any, {}>;
    booking: ResolverFn<Booking | null, any, any, { id: string }>;
    reports: ResolverFn<Report[], any, any, {}>;
    report: ResolverFn<Report | null, any, any, { id: string }>;
    revenueStats: ResolverFn<RevenueStats[], any, any, { year: number }>;
    housekeepingStats: ResolverFn<HousekeepingStats, any, any, {}>;
    occupancyStats: ResolverFn<OccupancyStats, any, any, {}>;
    housekeepingTasks: ResolverFn<HousekeepingTask[], any, any, { status?: string; roomId?: string }>;
    housekeepingTask: ResolverFn<HousekeepingTask | null, any, any, { id: string }>;
    userPreferences: ResolverFn<UserPreferences | null, any, any, {}>;
    recentPayments: ResolverFn<Payment[], any, any, { limit?: number }>;
    pendingPayments: ResolverFn<Payment[], any, any, {}>;
    dashboardStats: ResolverFn<DashboardStats, any, any, {}>;
    guests: ResolverFn<Guest[], any, any, { search?: string; vipStatus?: string }>;
    guest: ResolverFn<Guest | null, any, any, { id: string }>;
    employees: ResolverFn<Employee[], any, any, { department?: string; status?: string }>;
    employee: ResolverFn<Employee | null, any, any, { id: string }>;
    invoices: ResolverFn<Invoice[], any, any, { status?: string; guestId?: string }>;
    invoice: ResolverFn<Invoice | null, any, any, { id: string }>;
}

export interface MutationResolvers {
    createRoom: ResolverFn<Room, any, any, { input: RoomInput }>;
    updateRoom: ResolverFn<Room, any, any, { id: string; input: RoomInput }>;
    deleteRoom: ResolverFn<boolean, any, any, { id: string }>;
    createBooking: ResolverFn<Booking, any, any, { input: BookingInput }>;
    updateBooking: ResolverFn<Booking, any, any, { id: string; input: BookingInput }>;
    deleteBooking: ResolverFn<boolean, any, any, { id: string }>;
    cancelBooking: ResolverFn<boolean, any, any, { id: string }>;
    createReport: ResolverFn<Report, any, any, { input: ReportInput }>;
    generateReport: ResolverFn<Report, any, any, { input: ReportInput }>;
    scheduleReport: ResolverFn<Report, any, any, { input: ReportInput }>;
    createHousekeepingTask: ResolverFn<HousekeepingTask, any, any, { input: HousekeepingTaskInput }>;
    updateHousekeepingTask: ResolverFn<HousekeepingTask, any, any, { id: string; input: UpdateHousekeepingTaskInput }>;
    completeHousekeepingTask: ResolverFn<HousekeepingTask, any, any, { id: string; actualTime?: number; notes?: string }>;
    deleteHousekeepingTask: ResolverFn<boolean, any, any, { id: string }>;
    updateRoomStatus: ResolverFn<Room, any, any, { roomId: string; status: string }>;
    updateUserPreferences: ResolverFn<UserPreferences, any, any, { input: UserPreferencesInput }>;
    updateUserTheme: ResolverFn<UserPreferences, any, any, { theme: string }>;
    createGuest: ResolverFn<Guest, any, any, { input: GuestInput }>;
    updateGuest: ResolverFn<Guest, any, any, { id: string; input: GuestInput }>;
    deleteGuest: ResolverFn<boolean, any, any, { id: string }>;
    createEmployee: ResolverFn<Employee, any, any, { input: EmployeeInput }>;
    updateEmployee: ResolverFn<Employee, any, any, { id: string; input: EmployeeInput }>;
    deleteEmployee: ResolverFn<boolean, any, any, { id: string }>;
    createInvoice: ResolverFn<Invoice, any, any, { input: InvoiceInput }>;
    updateInvoice: ResolverFn<Invoice, any, any, { id: string; input: InvoiceInput }>;
    deleteInvoice: ResolverFn<boolean, any, any, { id: string }>;
    markInvoicePaid: ResolverFn<Invoice, any, any, { id: string; paymentMethod: string }>;
    processPayment: ResolverFn<Payment, any, any, { input: PaymentInput }>;
    updatePayment: ResolverFn<Payment, any, any, { id: string; input: PaymentInput }>;
}

export interface Resolvers {
    Query: QueryResolvers;
    Mutation: MutationResolvers;
}
