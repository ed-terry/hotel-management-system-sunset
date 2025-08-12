import { Resolvers } from './generated/types';
import { prisma } from './db';
import { BookingStatus, RoomType, RoomStatus } from '@prisma/client';
import { mapPrismaRoomToGraphQL, mapPrismaBookingToGraphQL, mapPrismaReportToGraphQL } from './utils/mappers';
import { GraphQLScalarType, Kind } from 'graphql';
import { userPreferencesResolvers } from './resolvers/userPreferencesResolvers';

// Define resolvers for the GraphQL schema
export const resolvers = {
    Query: {
        rooms: async (_, { status, type }) => {
            const where: any = {};

            if (status) {
                where.status = status;
            }

            if (type) {
                where.type = type;
            }

            const rooms = await prisma.room.findMany({
                where,
                include: { bookings: true },
                orderBy: { number: 'asc' }
            });
            return rooms.map(mapPrismaRoomToGraphQL);
        },
        room: async (_, { id }) => {
            const room = await prisma.room.findUnique({
                where: { id },
                include: { bookings: true }
            });
            return room ? mapPrismaRoomToGraphQL(room) : null;
        },
        availableRooms: async () => {
            const rooms = await prisma.room.findMany({
                where: {
                    status: RoomStatus.AVAILABLE
                },
                include: { bookings: true },
                orderBy: { number: 'asc' }
            });
            return rooms.map(mapPrismaRoomToGraphQL);
        },
        bookings: async () => {
            const bookings = await prisma.booking.findMany({
                include: { room: true }
            });
            return bookings.map(mapPrismaBookingToGraphQL);
        },
        booking: async (_, { id }) => {
            const booking = await prisma.booking.findUnique({
                where: { id },
                include: { room: true }
            });
            return booking ? mapPrismaBookingToGraphQL(booking) : null;
        },
        reports: async () => {
            const reports = await prisma.report.findMany();
            return reports.map(mapPrismaReportToGraphQL);
        },
        report: async (_, { id }) => {
            const report = await prisma.report.findUnique({
                where: { id }
            });
            return report ? mapPrismaReportToGraphQL(report) : null;
        },
        revenueStats: async (_, { year }) => {
            const bookings = await prisma.booking.findMany({
                where: {
                    checkIn: {
                        gte: new Date(year, 0, 1),
                        lt: new Date(year + 1, 0, 1)
                    },
                    status: BookingStatus.CHECKED_OUT
                },
                include: { room: true }
            });

            // Return array of monthly revenue stats
            return Array.from({ length: 12 }, (_, month) => {
                const monthlyBookings = bookings.filter(booking => booking.checkIn.getMonth() === month);
                const revenue = monthlyBookings.reduce((sum, booking) => {
                    const days = Math.ceil((booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24));
                    return sum + (booking.room.price * days);
                }, 0);

                return {
                    month: new Date(year, month).toLocaleString('default', { month: 'long' }),
                    revenue
                };
            });
        },
        housekeepingStats: async () => {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const tasks = await prisma.housekeepingTask.findMany();
            const totalTasks = tasks.length;
            const totalCleaned = tasks.filter(task => task.status === 'COMPLETED').length;
            const cleanedToday = tasks.filter(task =>
                task.status === 'COMPLETED' &&
                task.completedAt &&
                task.completedAt >= startOfDay
            ).length;
            const pendingCleaning = tasks.filter(task => task.status === 'PENDING').length;
            const inProgress = tasks.filter(task => task.status === 'IN_PROGRESS').length;

            const completedTasks = tasks.filter(task => task.status === 'COMPLETED' && task.actualTime);
            const averageCleaningTime = completedTasks.length > 0
                ? completedTasks.reduce((sum, task) => sum + (task.actualTime || 0), 0) / completedTasks.length
                : 0;

            return {
                totalCleaned,
                cleanedToday,
                pendingCleaning,
                inProgress,
                averageCleaningTime,
                totalTasks
            };
        },
        occupancyStats: async () => {
            const totalRooms = await prisma.room.count();
            const occupiedRooms = await prisma.room.count({
                where: {
                    status: RoomStatus.OCCUPIED
                }
            });

            return {
                totalRooms,
                occupiedRooms,
                occupancyRate: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0
            };
        },
        housekeepingTasks: async (_, { status, roomId }) => {
            const where: any = {};

            if (status) {
                where.status = status;
            }

            if (roomId) {
                where.roomId = roomId;
            }

            const tasks = await prisma.housekeepingTask.findMany({
                where,
                include: { room: true },
                orderBy: { createdAt: 'desc' }
            });

            return tasks.map(task => ({
                id: task.id,
                room: mapPrismaRoomToGraphQL(task.room),
                taskType: task.taskType,
                status: task.status,
                assignedTo: task.assignedTo || undefined,
                priority: task.priority,
                estimatedTime: task.estimatedTime,
                actualTime: task.actualTime || undefined,
                notes: task.notes || undefined,
                createdAt: task.createdAt.toISOString(),
                completedAt: task.completedAt?.toISOString()
            }));
        },
        housekeepingTask: async (_, { id }) => {
            const task = await prisma.housekeepingTask.findUnique({
                where: { id },
                include: { room: true }
            });

            if (!task) return null;

            return {
                id: task.id,
                room: mapPrismaRoomToGraphQL(task.room),
                taskType: task.taskType,
                status: task.status,
                assignedTo: task.assignedTo || undefined,
                priority: task.priority,
                estimatedTime: task.estimatedTime,
                actualTime: task.actualTime || undefined,
                notes: task.notes || undefined,
                createdAt: task.createdAt.toISOString(),
                completedAt: task.completedAt?.toISOString()
            };
        },
        userPreferences: userPreferencesResolvers.Query.userPreferences,

        // Payment resolvers (temporarily returning empty array until migration is complete)
        recentPayments: async (_, { limit = 10 }) => {
            try {
                // @ts-ignore - Payment model will be available after migration
                const payments = await prisma.payment.findMany({
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        booking: {
                            include: {
                                room: true
                            }
                        }
                    }
                });

                return payments.map(payment => ({
                    id: payment.id,
                    amount: payment.amount,
                    status: payment.status,
                    method: payment.method || 'CREDIT_CARD',
                    dueDate: payment.dueDate?.toISOString(),
                    paidAt: payment.paidAt?.toISOString(),
                    createdAt: payment.createdAt.toISOString(),
                    booking: {
                        id: payment.booking.id,
                        guestName: payment.booking.guestName,
                        room: {
                            number: payment.booking.room.number
                        }
                    }
                }));
            } catch (error) {
                console.log('Payment table not yet available:', error);
                return [];
            }
        },

        pendingPayments: async () => {
            try {
                // @ts-ignore - Payment model will be available after migration
                const payments = await prisma.payment.findMany({
                    where: { status: 'PENDING' },
                    orderBy: { dueDate: 'asc' },
                    include: {
                        booking: {
                            include: {
                                room: true
                            }
                        }
                    }
                });

                return payments.map(payment => ({
                    id: payment.id,
                    amount: payment.amount,
                    status: payment.status,
                    method: payment.method || 'CREDIT_CARD',
                    dueDate: payment.dueDate?.toISOString(),
                    paidAt: payment.paidAt?.toISOString(),
                    createdAt: payment.createdAt.toISOString(),
                    booking: {
                        id: payment.booking.id,
                        guestName: payment.booking.guestName,
                        room: {
                            number: payment.booking.room.number
                        }
                    }
                }));
            } catch (error) {
                console.log('Payment table not yet available:', error);
                return [];
            }
        },

        // Dashboard stats resolver
        dashboardStats: async () => {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfYear = new Date(now.getFullYear(), 0, 1);

            // Get room stats
            const totalRooms = await prisma.room.count();
            const occupiedRooms = await prisma.room.count({
                where: { status: 'OCCUPIED' }
            });
            const availableRooms = await prisma.room.count({
                where: { status: 'AVAILABLE' }
            });
            const maintenanceRooms = await prisma.room.count({
                where: { status: 'MAINTENANCE' }
            });

            // Get booking stats
            const checkInsToday = await prisma.booking.count({
                where: {
                    checkIn: {
                        gte: startOfDay,
                        lt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
                    }
                }
            });

            const checkOutsToday = await prisma.booking.count({
                where: {
                    checkOut: {
                        gte: startOfDay,
                        lt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
                    }
                }
            });

            // Get total guests (current active bookings)
            const totalGuests = await prisma.booking.count({
                where: {
                    status: 'CHECKED_IN'
                }
            });

            // Get revenue stats
            const todayBookings = await prisma.booking.findMany({
                where: {
                    createdAt: {
                        gte: startOfDay
                    }
                },
                include: { room: true }
            });

            const monthBookings = await prisma.booking.findMany({
                where: {
                    createdAt: {
                        gte: startOfMonth
                    }
                },
                include: { room: true }
            });

            const yearBookings = await prisma.booking.findMany({
                where: {
                    createdAt: {
                        gte: startOfYear
                    }
                },
                include: { room: true }
            });

            const calculateRevenue = (bookings: any[]) => {
                return bookings.reduce((sum, booking) => {
                    const days = Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24));
                    return sum + (booking.room.price * days);
                }, 0);
            };

            const revenueToday = calculateRevenue(todayBookings);
            const revenueThisMonth = calculateRevenue(monthBookings);
            const revenueThisYear = calculateRevenue(yearBookings);

            // Calculate occupancy rate
            const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

            // Calculate average room rate
            const allRooms = await prisma.room.findMany();
            const averageRoomRate = allRooms.length > 0
                ? allRooms.reduce((sum, room) => sum + room.price, 0) / allRooms.length
                : 0;

            return {
                totalRooms,
                occupiedRooms,
                availableRooms,
                maintenanceRooms,
                totalGuests,
                checkInsToday,
                checkOutsToday,
                revenue: {
                    today: revenueToday,
                    thisMonth: revenueThisMonth,
                    thisYear: revenueThisYear
                },
                occupancyRate,
                averageRoomRate
            };
        },

        // Guest queries
        guests: async (_, { search, vipStatus }) => {
            const where: any = {};

            if (search) {
                where.OR = [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } }
                ];
            }

            if (vipStatus !== undefined) {
                where.isVip = vipStatus === 'true';
            }

            const guests = await prisma.guest.findMany({
                where,
                include: {
                    bookings: { include: { room: true } },
                    invoices: true
                },
                orderBy: { createdAt: 'desc' }
            });

            return guests.map(guest => ({
                ...guest,
                phone: guest.phone || undefined,
                address: guest.address || undefined,
                nationality: guest.nationality || undefined,
                idNumber: guest.idNumber || undefined,
                notes: guest.notes || undefined,
                totalStays: guest.bookings.length,
                totalSpent: guest.invoices.reduce((sum, invoice) => sum + invoice.total, 0),
                lastStay: guest.bookings.length > 0
                    ? guest.bookings.sort((a, b) => new Date(b.checkOut).getTime() - new Date(a.checkOut).getTime())[0].checkOut.toISOString()
                    : undefined,
                dateOfBirth: guest.dateOfBirth?.toISOString(),
                createdAt: guest.createdAt.toISOString(),
                updatedAt: guest.updatedAt.toISOString(),
                bookings: guest.bookings.map(mapPrismaBookingToGraphQL),
                invoices: guest.invoices.map(invoice => ({
                    ...invoice,
                    guestId: invoice.guestId || undefined,
                    guestEmail: invoice.guestEmail || undefined,
                    bookingId: invoice.bookingId || undefined,
                    notes: invoice.notes || undefined,
                    paidDate: invoice.paidDate?.toISOString(),
                    paymentMethod: invoice.paymentMethod || undefined,
                    issueDate: invoice.issueDate.toISOString(),
                    dueDate: invoice.dueDate.toISOString(),
                    createdAt: invoice.createdAt.toISOString(),
                    updatedAt: invoice.updatedAt.toISOString()
                }))
            }));
        },

        guest: async (_, { id }) => {
            const guest = await prisma.guest.findUnique({
                where: { id },
                include: {
                    bookings: { include: { room: true } },
                    invoices: true
                }
            });

            if (!guest) return null;

            return {
                ...guest,
                phone: guest.phone || undefined,
                address: guest.address || undefined,
                nationality: guest.nationality || undefined,
                idNumber: guest.idNumber || undefined,
                notes: guest.notes || undefined,
                totalStays: guest.bookings.length,
                totalSpent: guest.invoices.reduce((sum, invoice) => sum + invoice.total, 0),
                lastStay: guest.bookings.length > 0
                    ? guest.bookings.sort((a, b) => new Date(b.checkOut).getTime() - new Date(a.checkOut).getTime())[0].checkOut.toISOString()
                    : undefined,
                dateOfBirth: guest.dateOfBirth?.toISOString(),
                createdAt: guest.createdAt.toISOString(),
                updatedAt: guest.updatedAt.toISOString(),
                bookings: guest.bookings.map(mapPrismaBookingToGraphQL),
                invoices: guest.invoices.map(invoice => ({
                    ...invoice,
                    guestId: invoice.guestId || undefined,
                    guestEmail: invoice.guestEmail || undefined,
                    bookingId: invoice.bookingId || undefined,
                    notes: invoice.notes || undefined,
                    paidDate: invoice.paidDate?.toISOString(),
                    paymentMethod: invoice.paymentMethod || undefined,
                    issueDate: invoice.issueDate.toISOString(),
                    dueDate: invoice.dueDate.toISOString(),
                    createdAt: invoice.createdAt.toISOString(),
                    updatedAt: invoice.updatedAt.toISOString()
                }))
            };
        },

        // Employee queries
        employees: async (_, { department, status }) => {
            const where: any = {};

            if (department) {
                where.department = department;
            }

            if (status) {
                where.status = status;
            }

            const employees = await prisma.employee.findMany({
                where,
                orderBy: { createdAt: 'desc' }
            });

            return employees.map(employee => ({
                ...employee,
                hireDate: employee.hireDate.toISOString(),
                createdAt: employee.createdAt.toISOString(),
                updatedAt: employee.updatedAt.toISOString()
            }));
        },

        employee: async (_, { id }) => {
            const employee = await prisma.employee.findUnique({
                where: { id }
            });

            if (!employee) return null;

            return {
                ...employee,
                hireDate: employee.hireDate.toISOString(),
                createdAt: employee.createdAt.toISOString(),
                updatedAt: employee.updatedAt.toISOString()
            };
        },

        // Invoice queries
        invoices: async (_, { status, guestId }) => {
            const where: any = {};

            if (status) {
                where.status = status;
            }

            if (guestId) {
                where.guestId = guestId;
            }

            const invoices = await prisma.invoice.findMany({
                where,
                include: {
                    guest: true,
                    booking: { include: { room: true } }
                },
                orderBy: { createdAt: 'desc' }
            });

            return invoices.map(invoice => ({
                ...invoice,
                issueDate: invoice.issueDate.toISOString(),
                dueDate: invoice.dueDate.toISOString(),
                paidDate: invoice.paidDate?.toISOString(),
                createdAt: invoice.createdAt.toISOString(),
                updatedAt: invoice.updatedAt.toISOString()
            }));
        },

        invoice: async (_, { id }) => {
            const invoice = await prisma.invoice.findUnique({
                where: { id },
                include: {
                    guest: true,
                    booking: { include: { room: true } }
                }
            });

            if (!invoice) return null;

            return {
                ...invoice,
                issueDate: invoice.issueDate.toISOString(),
                dueDate: invoice.dueDate.toISOString(),
                paidDate: invoice.paidDate?.toISOString(),
                createdAt: invoice.createdAt.toISOString(),
                updatedAt: invoice.updatedAt.toISOString()
            };
        }
    },
    Mutation: {
        createRoom: async (_, { input }) => {
            try {
                // Check if room number already exists
                const existingRoom = await prisma.room.findFirst({
                    where: { number: input.number }
                });

                if (existingRoom) {
                    throw new Error(`Room number ${input.number} already exists`);
                }

                const room = await prisma.room.create({
                    data: {
                        ...input,
                        type: input.type as any,
                        status: (input.status || 'AVAILABLE') as any
                    },
                    include: { bookings: true }
                });
                return mapPrismaRoomToGraphQL(room);
            } catch (error) {
                console.error('Error creating room:', error);
                throw error;
            }
        },
        updateRoom: async (_, { id, input }) => {
            try {
                // Check if room exists
                const existingRoom = await prisma.room.findUnique({
                    where: { id }
                });

                if (!existingRoom) {
                    throw new Error(`Room with ID ${id} not found`);
                }

                // If updating room number, check for duplicates
                if (input.number && input.number !== existingRoom.number) {
                    const duplicateRoom = await prisma.room.findFirst({
                        where: {
                            number: input.number,
                            id: { not: id }
                        }
                    });

                    if (duplicateRoom) {
                        throw new Error(`Room number ${input.number} already exists`);
                    }
                }

                const room = await prisma.room.update({
                    where: { id },
                    data: input,
                    include: { bookings: true }
                });
                return mapPrismaRoomToGraphQL(room);
            } catch (error) {
                console.error('Error updating room:', error);
                throw error;
            }
        },
        deleteRoom: async (_, { id }) => {
            try {
                // Check if room exists
                const existingRoom = await prisma.room.findUnique({
                    where: { id },
                    include: { bookings: true }
                });

                if (!existingRoom) {
                    throw new Error(`Room with ID ${id} not found`);
                }

                // Check if room has active bookings
                const activeBookings = existingRoom.bookings.filter(booking =>
                    booking.status === BookingStatus.CONFIRMED ||
                    booking.status === BookingStatus.CHECKED_IN
                );

                if (activeBookings.length > 0) {
                    throw new Error(`Cannot delete room ${existingRoom.number}. It has ${activeBookings.length} active booking(s)`);
                }

                await prisma.room.delete({
                    where: { id }
                });

                console.log(`Room ${existingRoom.number} deleted successfully`);
                return true;
            } catch (error) {
                console.error('Error deleting room:', error);
                if (error instanceof Error) {
                    throw error;
                }
                return false;
            }
        },
        createBooking: async (_, { input }) => {
            const { roomId, ...bookingData } = input;
            const booking = await prisma.booking.create({
                data: {
                    ...bookingData,
                    checkIn: new Date(bookingData.checkIn),
                    checkOut: new Date(bookingData.checkOut),
                    status: bookingData.status || BookingStatus.CONFIRMED,
                    room: {
                        connect: { id: roomId }
                    }
                },
                include: { room: true }
            });
            return mapPrismaBookingToGraphQL(booking);
        },
        updateBooking: async (_, { id, input }) => {
            const { roomId, ...bookingData } = input;
            const booking = await prisma.booking.update({
                where: { id },
                data: {
                    ...bookingData,
                    ...(bookingData.checkIn && { checkIn: new Date(bookingData.checkIn) }),
                    ...(bookingData.checkOut && { checkOut: new Date(bookingData.checkOut) }),
                    ...(roomId && {
                        room: {
                            connect: { id: roomId }
                        }
                    })
                },
                include: { room: true }
            });
            return mapPrismaBookingToGraphQL(booking);
        },
        cancelBooking: async (_, { id }) => {
            try {
                await prisma.booking.update({
                    where: { id },
                    data: { status: BookingStatus.CANCELLED }
                });
                return true;
            } catch (error) {
                return false;
            }
        },
        deleteBooking: async (_, { id }) => {
            try {
                await prisma.booking.delete({
                    where: { id }
                });
                return true;
            } catch (error) {
                return false;
            }
        },
        createReport: async (_, { input }) => {
            const report = await prisma.report.create({
                data: {
                    ...input,
                    data: input.data as any,
                    recipients: input.recipients || [],
                    lastRun: new Date()
                }
            });
            return mapPrismaReportToGraphQL(report);
        },
        generateReport: async (_, { input }) => {
            const { period, ...reportData } = input;
            const report = await prisma.report.create({
                data: {
                    ...reportData,
                    data: reportData.data as any,
                    recipients: reportData.recipients || [],
                    lastRun: new Date()
                }
            });
            return mapPrismaReportToGraphQL(report);
        },
        scheduleReport: async (_, { input }) => {
            const report = await prisma.report.create({
                data: {
                    title: `Scheduled ${input.type} Report`,
                    summary: `Scheduled report of type ${input.type}`,
                    type: input.type,
                    data: input.parameters || {},
                    schedule: input.frequency,
                    lastRun: null
                }
            });
            return mapPrismaReportToGraphQL(report);
        },
        createHousekeepingTask: async (_, { input }) => {
            const task = await prisma.housekeepingTask.create({
                data: {
                    roomId: input.roomId,
                    taskType: input.taskType as any,
                    priority: input.priority as any,
                    estimatedTime: input.estimatedTime,
                    assignedTo: input.assignedTo,
                    notes: input.notes
                },
                include: { room: true }
            });

            return {
                id: task.id,
                room: mapPrismaRoomToGraphQL(task.room),
                taskType: task.taskType,
                status: task.status,
                assignedTo: task.assignedTo || undefined,
                priority: task.priority,
                estimatedTime: task.estimatedTime,
                actualTime: task.actualTime || undefined,
                notes: task.notes || undefined,
                createdAt: task.createdAt.toISOString(),
                completedAt: task.completedAt?.toISOString()
            };
        },
        updateHousekeepingTask: async (_, { id, input }) => {
            try {
                const task = await prisma.housekeepingTask.update({
                    where: { id },
                    data: {
                        ...(input.status && { status: input.status as any }),
                        ...(input.assignedTo !== undefined && { assignedTo: input.assignedTo }),
                        ...(input.priority && { priority: input.priority as any }),
                        ...(input.estimatedTime && { estimatedTime: input.estimatedTime }),
                        ...(input.actualTime !== undefined && { actualTime: input.actualTime }),
                        ...(input.notes !== undefined && { notes: input.notes })
                    },
                    include: { room: true }
                });

                return {
                    id: task.id,
                    room: mapPrismaRoomToGraphQL(task.room),
                    taskType: task.taskType,
                    status: task.status,
                    assignedTo: task.assignedTo || undefined,
                    priority: task.priority,
                    estimatedTime: task.estimatedTime,
                    actualTime: task.actualTime || undefined,
                    notes: task.notes || undefined,
                    createdAt: task.createdAt.toISOString(),
                    completedAt: task.completedAt?.toISOString()
                };
            } catch (error) {
                return null;
            }
        },
        completeHousekeepingTask: async (_, { id, actualTime, notes }) => {
            try {
                const task = await prisma.housekeepingTask.update({
                    where: { id },
                    data: {
                        status: 'COMPLETED' as any,
                        completedAt: new Date(),
                        ...(actualTime && { actualTime }),
                        ...(notes && { notes })
                    },
                    include: { room: true }
                });

                return {
                    id: task.id,
                    room: mapPrismaRoomToGraphQL(task.room),
                    taskType: task.taskType,
                    status: task.status,
                    assignedTo: task.assignedTo || undefined,
                    priority: task.priority,
                    estimatedTime: task.estimatedTime,
                    actualTime: task.actualTime || undefined,
                    notes: task.notes || undefined,
                    createdAt: task.createdAt.toISOString(),
                    completedAt: task.completedAt?.toISOString()
                };
            } catch (error) {
                return null;
            }
        },
        deleteHousekeepingTask: async (_, { id }) => {
            try {
                await prisma.housekeepingTask.delete({
                    where: { id }
                });
                return true;
            } catch (error) {
                return false;
            }
        },
        updateRoomStatus: async (_, { roomId, status }) => {
            try {
                const room = await prisma.room.update({
                    where: { id: roomId },
                    data: { status: status as any },
                    include: { bookings: true }
                });
                return mapPrismaRoomToGraphQL(room);
            } catch (error) {
                return null;
            }
        },
        updateUserPreferences: userPreferencesResolvers.Mutation.updateUserPreferences,
        updateUserTheme: userPreferencesResolvers.Mutation.updateUserTheme,

        // Guest mutations
        createGuest: async (_, { input }) => {
            try {
                const guest = await prisma.guest.create({
                    data: {
                        ...input,
                        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
                        isVip: false
                    },
                    include: {
                        bookings: { include: { room: true } },
                        invoices: true
                    }
                });

                return {
                    ...guest,
                    totalStays: 0,
                    totalSpent: 0,
                    lastStay: null,
                    dateOfBirth: guest.dateOfBirth?.toISOString(),
                    createdAt: guest.createdAt.toISOString(),
                    updatedAt: guest.updatedAt.toISOString()
                };
            } catch (error) {
                throw new Error(`Failed to create guest: ${error}`);
            }
        },

        updateGuest: async (_, { id, input }) => {
            try {
                const guest = await prisma.guest.update({
                    where: { id },
                    data: {
                        ...input,
                        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined
                    },
                    include: {
                        bookings: { include: { room: true } },
                        invoices: true
                    }
                });

                return {
                    ...guest,
                    totalStays: guest.bookings.length,
                    totalSpent: guest.invoices.reduce((sum, invoice) => sum + invoice.total, 0),
                    lastStay: guest.bookings.length > 0
                        ? guest.bookings.sort((a, b) => new Date(b.checkOut).getTime() - new Date(a.checkOut).getTime())[0].checkOut
                        : null,
                    dateOfBirth: guest.dateOfBirth?.toISOString(),
                    createdAt: guest.createdAt.toISOString(),
                    updatedAt: guest.updatedAt.toISOString()
                };
            } catch (error) {
                throw new Error(`Failed to update guest: ${error}`);
            }
        },

        deleteGuest: async (_, { id }) => {
            try {
                await prisma.guest.delete({
                    where: { id }
                });
                return true;
            } catch (error) {
                return false;
            }
        },

        // Employee mutations
        createEmployee: async (_, { input }) => {
            try {
                const employee = await prisma.employee.create({
                    data: {
                        ...input,
                        hireDate: new Date(input.hireDate),
                        status: 'ACTIVE'
                    }
                });

                return {
                    ...employee,
                    hireDate: employee.hireDate.toISOString(),
                    createdAt: employee.createdAt.toISOString(),
                    updatedAt: employee.updatedAt.toISOString()
                };
            } catch (error) {
                throw new Error(`Failed to create employee: ${error}`);
            }
        },

        updateEmployee: async (_, { id, input }) => {
            try {
                const employee = await prisma.employee.update({
                    where: { id },
                    data: {
                        ...input,
                        hireDate: input.hireDate ? new Date(input.hireDate) : undefined
                    }
                });

                return {
                    ...employee,
                    hireDate: employee.hireDate.toISOString(),
                    createdAt: employee.createdAt.toISOString(),
                    updatedAt: employee.updatedAt.toISOString()
                };
            } catch (error) {
                throw new Error(`Failed to update employee: ${error}`);
            }
        },

        deleteEmployee: async (_, { id }) => {
            try {
                await prisma.employee.delete({
                    where: { id }
                });
                return true;
            } catch (error) {
                return false;
            }
        },

        // Invoice mutations
        createInvoice: async (_, { input }) => {
            try {
                const invoiceNumber = `INV-${Date.now()}`;
                const invoice = await prisma.invoice.create({
                    data: {
                        ...input,
                        invoiceNumber,
                        status: 'PENDING',
                        issueDate: new Date(),
                        dueDate: new Date(input.dueDate)
                    },
                    include: {
                        guest: true,
                        booking: { include: { room: true } }
                    }
                });

                return {
                    ...invoice,
                    issueDate: invoice.issueDate.toISOString(),
                    dueDate: invoice.dueDate.toISOString(),
                    paidDate: invoice.paidDate?.toISOString(),
                    createdAt: invoice.createdAt.toISOString(),
                    updatedAt: invoice.updatedAt.toISOString()
                };
            } catch (error) {
                throw new Error(`Failed to create invoice: ${error}`);
            }
        },

        updateInvoice: async (_, { id, input }) => {
            try {
                const invoice = await prisma.invoice.update({
                    where: { id },
                    data: {
                        ...input,
                        dueDate: input.dueDate ? new Date(input.dueDate) : undefined
                    },
                    include: {
                        guest: true,
                        booking: { include: { room: true } }
                    }
                });

                return {
                    ...invoice,
                    issueDate: invoice.issueDate.toISOString(),
                    dueDate: invoice.dueDate.toISOString(),
                    paidDate: invoice.paidDate?.toISOString(),
                    createdAt: invoice.createdAt.toISOString(),
                    updatedAt: invoice.updatedAt.toISOString()
                };
            } catch (error) {
                throw new Error(`Failed to update invoice: ${error}`);
            }
        },

        deleteInvoice: async (_, { id }) => {
            try {
                await prisma.invoice.delete({
                    where: { id }
                });
                return true;
            } catch (error) {
                return false;
            }
        },

        markInvoicePaid: async (_, { id, paymentMethod }) => {
            try {
                const invoice = await prisma.invoice.update({
                    where: { id },
                    data: {
                        status: 'PAID',
                        paidDate: new Date(),
                        paymentMethod
                    },
                    include: {
                        guest: true,
                        booking: { include: { room: true } }
                    }
                });

                return {
                    ...invoice,
                    issueDate: invoice.issueDate.toISOString(),
                    dueDate: invoice.dueDate.toISOString(),
                    paidDate: invoice.paidDate?.toISOString(),
                    createdAt: invoice.createdAt.toISOString(),
                    updatedAt: invoice.updatedAt.toISOString()
                };
            } catch (error) {
                throw new Error(`Failed to mark invoice as paid: ${error}`);
            }
        }
    },
    JSON: new GraphQLScalarType({
        name: 'JSON',
        description: 'JSON scalar type',
        serialize: (value: any) => value,
        parseValue: (value: any) => value,
        parseLiteral: (ast) => {
            switch (ast.kind) {
                case Kind.STRING:
                    return JSON.parse(ast.value);
                case Kind.OBJECT:
                    return ast.fields?.reduce((acc, field) => {
                        acc[field.name.value] = field.value;
                        return acc;
                    }, {} as any) || {};
                default:
                    return null;
            }
        }
    })
} as any as Resolvers;
