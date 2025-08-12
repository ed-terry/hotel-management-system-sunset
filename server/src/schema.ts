const typeDefs = `#graphql
  type Room {
    id: ID!
    number: String!
    type: String!
    status: String!
    price: Float!
  }

  type Booking {
    id: ID!
    room: Room!
    guestName: String!
    checkIn: String!
    checkOut: String!
    status: String!
  }

  type Report {
    id: ID!
    title: String!
    type: String!
    data: JSON!
    summary: String!
    generatedAt: String!
  }

  scalar JSON

  type RevenueStats {
    month: String!
    revenue: Float!
  }

  type HousekeepingTask {
    id: ID!
    room: Room!
    taskType: String!
    status: String!
    assignedTo: String
    priority: String!
    estimatedTime: Int!
    actualTime: Int
    notes: String
    createdAt: String!
    completedAt: String
  }

  type HousekeepingStats {
    totalCleaned: Int!
    cleanedToday: Int!
    pendingCleaning: Int!
    inProgress: Int!
    averageCleaningTime: Float!
    totalTasks: Int!
  }

  type OccupancyStats {
    totalRooms: Int!
    occupiedRooms: Int!
    occupancyRate: Float!
  }

  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: String!
    status: String!
    lastLogin: String
    createdAt: String!
    updatedAt: String!
  }

  type UserPreferences {
    id: ID!
    theme: String!
    language: String!
    timezone: String!
    dateFormat: String!
    currency: String!
    notifications: NotificationSettings
  }

  type NotificationSettings {
    email: Boolean!
    push: Boolean!
    sms: Boolean!
  }

  input UserPreferencesInput {
    theme: String
    language: String
    timezone: String
    dateFormat: String
    currency: String
    notifications: NotificationSettingsInput
  }

  input NotificationSettingsInput {
    email: Boolean
    push: Boolean
    sms: Boolean
  }

  type Payment {
    id: ID!
    booking: Booking!
    amount: Float!
    status: String!
    method: String!
    dueDate: String!
    paidAt: String
    createdAt: String!
  }

  type Revenue {
    today: Float!
    thisMonth: Float!
    thisYear: Float!
  }

  type DashboardStats {
    totalRooms: Int!
    occupiedRooms: Int!
    availableRooms: Int!
    maintenanceRooms: Int!
    totalGuests: Int!
    checkInsToday: Int!
    checkOutsToday: Int!
    revenue: Revenue!
    occupancyRate: Float!
    averageRoomRate: Float!
  }

  type Guest {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    address: String
    dateOfBirth: String
    nationality: String
    idNumber: String
    isVip: Boolean!
    preferences: JSON
    notes: String
    totalStays: Int!
    totalSpent: Float!
    lastStay: String
    createdAt: String!
    updatedAt: String!
    bookings: [Booking!]!
    invoices: [Invoice!]!
  }

  type Employee {
    id: ID!
    employeeId: String!
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    department: String!
    position: String!
    hireDate: String!
    salary: Float
    status: String!
    supervisor: String
    emergencyContact: JSON
    notes: String
    createdAt: String!
    updatedAt: String!
  }

  type Invoice {
    id: ID!
    invoiceNumber: String!
    guestId: String
    guestName: String!
    guestEmail: String
    bookingId: String
    booking: Booking
    items: JSON!
    subtotal: Float!
    tax: Float!
    total: Float!
    status: String!
    issueDate: String!
    dueDate: String!
    paidDate: String
    paymentMethod: String
    notes: String
    createdAt: String!
    updatedAt: String!
    guest: Guest
  }

  input GuestInput {
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    address: String
    dateOfBirth: String
    nationality: String
    idNumber: String
    preferences: JSON
    notes: String
  }

  input EmployeeInput {
    employeeId: String!
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    department: String!
    position: String!
    hireDate: String!
    salary: Float
    supervisor: String
    emergencyContact: JSON
    notes: String
  }

  input InvoiceInput {
    guestId: String
    guestName: String!
    guestEmail: String
    bookingId: String
    items: JSON!
    subtotal: Float!
    tax: Float!
    total: Float!
    dueDate: String!
    notes: String
  }

  input PaymentInput {
    bookingId: ID!
    amount: Float!
    method: String!
    dueDate: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    role: String
  }

  type Query {
    rooms(status: String, type: String): [Room!]!
    room(id: ID!): Room
    availableRooms: [Room!]!
    bookings: [Booking!]!
    booking(id: ID!): Booking
    reports: [Report!]!
    report(id: ID!): Report
    revenueStats(year: Int!): [RevenueStats!]!
    housekeepingStats: HousekeepingStats!
    occupancyStats: OccupancyStats!
    housekeepingTasks(status: String, roomId: ID): [HousekeepingTask!]!
    housekeepingTask(id: ID!): HousekeepingTask
    userPreferences: UserPreferences
    
    # Payment queries
    recentPayments(limit: Int): [Payment!]!
    pendingPayments: [Payment!]!
    
    # Dashboard stats
    dashboardStats: DashboardStats!

    # Guest queries
    guests(search: String, vipStatus: String): [Guest!]!
    guest(id: ID!): Guest
    
    # Employee queries
    employees(department: String, status: String): [Employee!]!
    employee(id: ID!): Employee
    
    # Invoice queries
    invoices(status: String, guestId: String): [Invoice!]!
    invoice(id: ID!): Invoice
  }

  input HousekeepingTaskInput {
    roomId: ID!
    taskType: String!
    priority: String!
    estimatedTime: Int!
    assignedTo: String
    notes: String
  }

  input UpdateHousekeepingTaskInput {
    status: String
    assignedTo: String
    priority: String
    estimatedTime: Int
    actualTime: Int
    notes: String
  }

  input RoomInput {
    number: String!
    type: String!
    status: String
    price: Float!
  }

  input BookingInput {
    roomId: ID!
    guestName: String!
    checkIn: String!
    checkOut: String!
  }

  input ReportInput {
    type: String!
    frequency: String
    recipients: [String!]
  }

  type Mutation {
    createRoom(input: RoomInput!): Room!
    updateRoom(id: ID!, input: RoomInput!): Room!
    deleteRoom(id: ID!): Boolean!

    createBooking(input: BookingInput!): Booking!
    updateBooking(id: ID!, input: BookingInput!): Booking!
    deleteBooking(id: ID!): Boolean!
    cancelBooking(id: ID!): Boolean!

    createReport(input: ReportInput!): Report!
    generateReport(input: ReportInput!): Report!
    scheduleReport(input: ReportInput!): Report!

    createHousekeepingTask(input: HousekeepingTaskInput!): HousekeepingTask!
    updateHousekeepingTask(id: ID!, input: UpdateHousekeepingTaskInput!): HousekeepingTask!
    completeHousekeepingTask(id: ID!, actualTime: Int, notes: String): HousekeepingTask!
    deleteHousekeepingTask(id: ID!): Boolean!
    updateRoomStatus(roomId: ID!, status: String!): Room!

    updateUserPreferences(input: UserPreferencesInput!): UserPreferences!
    updateUserTheme(theme: String!): UserPreferences!

    # Guest mutations
    createGuest(input: GuestInput!): Guest!
    updateGuest(id: ID!, input: GuestInput!): Guest!
    deleteGuest(id: ID!): Boolean!
    
    # Employee mutations
    createEmployee(input: EmployeeInput!): Employee!
    updateEmployee(id: ID!, input: EmployeeInput!): Employee!
    deleteEmployee(id: ID!): Boolean!
    
    # Invoice mutations
    createInvoice(input: InvoiceInput!): Invoice!
    updateInvoice(id: ID!, input: InvoiceInput!): Invoice!
    deleteInvoice(id: ID!): Boolean!
    markInvoicePaid(id: ID!, paymentMethod: String!): Invoice!

    # Payment mutations
    processPayment(input: PaymentInput!): Payment!
    updatePayment(id: ID!, input: PaymentInput!): Payment!

    # Auth mutations
    login(email: String!, password: String!): AuthPayload!
    register(input: RegisterInput!): AuthPayload!
    refreshToken: AuthPayload!
    logout: Boolean!
  }
`;

export { typeDefs };
