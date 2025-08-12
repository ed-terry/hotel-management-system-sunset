import { prisma } from '../db';
import { reportService } from '../services/reportService';
import { ReportType } from '@prisma/client';

interface Context {
    user?: {
        id: string;
        role: string;
        email: string;
    };
}

export const reportsResolvers = {
    Query: {
        revenueReport: async (_: any, { startDate, endDate }: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            const start = new Date(startDate);
            const end = new Date(endDate);

            return await reportService.generateRevenueReport(start, end);
        },

        occupancyReport: async (_: any, { startDate, endDate }: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            const start = new Date(startDate);
            const end = new Date(endDate);

            return await reportService.generateOccupancyReport(start, end);
        },

        guestAnalyticsReport: async (_: any, { startDate, endDate }: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            const start = new Date(startDate);
            const end = new Date(endDate);

            return await reportService.generateGuestAnalyticsReport(start, end);
        },

        scheduledReports: async (_: any, __: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            return await prisma.scheduledReport.findMany({
                include: {
                    creator: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        },

        dashboardStats: async (_: any, __: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);

            const [
                totalRooms,
                occupiedRooms,
                totalGuests,
                recentBookings,
                pendingInvoices,
                monthlyRevenue,
            ] = await Promise.all([
                prisma.room.count(),
                prisma.booking.count({
                    where: {
                        status: 'CHECKED_IN',
                    },
                }),
                prisma.guest.count(),
                prisma.booking.count({
                    where: {
                        createdAt: {
                            gte: startDate,
                        },
                    },
                }),
                prisma.invoice.count({
                    where: {
                        status: 'PENDING',
                    },
                }),
                prisma.invoice.aggregate({
                    where: {
                        createdAt: {
                            gte: startDate,
                            lte: endDate,
                        },
                        status: 'PAID',
                    },
                    _sum: {
                        total: true,
                    },
                }),
            ]);

            const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

            return {
                totalRooms,
                occupiedRooms,
                occupancyRate,
                totalGuests,
                recentBookings,
                pendingInvoices,
                monthlyRevenue: monthlyRevenue._sum.total || 0,
            };
        },

        reportsOverview: async (_: any, __: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7); // Last 7 days

            const [revenueReport, occupancyReport] = await Promise.all([
                reportService.generateRevenueReport(startDate, endDate),
                reportService.generateOccupancyReport(startDate, endDate),
            ]);

            return {
                revenue: {
                    total: revenueReport.data.totalRevenue,
                    average: revenueReport.data.averageRevenue,
                    trend: revenueReport.charts?.[0]?.data || null,
                },
                occupancy: {
                    rate: revenueReport.data.averageOccupancy || 0,
                    peak: occupancyReport.data.peakOccupancy || 0,
                    trend: occupancyReport.charts?.[0]?.data || null,
                },
                period: { startDate, endDate },
            };
        },
    },

    Mutation: {
        scheduleReport: async (_: any, { input }: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            if (context.user.role !== 'ADMIN' && context.user.role !== 'MANAGER') {
                throw new Error('Manager or Admin access required');
            }

            const reportId = await reportService.scheduleReport({
                name: input.name,
                type: input.type as ReportType,
                schedule: input.schedule,
                recipients: input.recipients,
                parameters: input.parameters,
                createdBy: context.user.id,
            });

            return await prisma.scheduledReport.findUnique({
                where: { id: reportId },
                include: {
                    creator: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            });
        },

        updateScheduledReport: async (_: any, { id, input }: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            const report = await prisma.scheduledReport.findUnique({
                where: { id },
            });

            if (!report) {
                throw new Error('Scheduled report not found');
            }

            if (report.createdBy !== context.user.id && context.user.role !== 'ADMIN') {
                throw new Error('Access denied');
            }

            return await prisma.scheduledReport.update({
                where: { id },
                data: input,
                include: {
                    creator: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            });
        },

        deleteScheduledReport: async (_: any, { id }: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            const report = await prisma.scheduledReport.findUnique({
                where: { id },
            });

            if (!report) {
                throw new Error('Scheduled report not found');
            }

            if (report.createdBy !== context.user.id && context.user.role !== 'ADMIN') {
                throw new Error('Access denied');
            }

            await prisma.scheduledReport.delete({
                where: { id },
            });

            return true;
        },

        generateCustomReport: async (_: any, { input }: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            const { type, startDate, endDate, parameters } = input;
            const start = new Date(startDate);
            const end = new Date(endDate);

            let reportData;

            switch (type) {
                case 'REVENUE':
                    reportData = await reportService.generateRevenueReport(start, end);
                    break;
                case 'OCCUPANCY':
                    reportData = await reportService.generateOccupancyReport(start, end);
                    break;
                case 'GUEST_ANALYTICS':
                    reportData = await reportService.generateGuestAnalyticsReport(start, end);
                    break;
                default:
                    throw new Error('Invalid report type');
            }

            // Save the generated report
            const savedReport = await prisma.report.create({
                data: {
                    type: 'custom',
                    title: reportData.title,
                    data: JSON.parse(JSON.stringify(reportData)),
                    summary: reportData.summary,
                    createdAt: new Date(),
                },
            });

            return {
                ...reportData,
                id: savedReport.id,
            };
        },

        exportReport: async (_: any, { reportId, format = 'PDF' }: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            // This would generate and return a downloadable report
            // For now, we'll return a placeholder URL
            return {
                success: true,
                downloadUrl: `/api/reports/${reportId}/download?format=${format.toLowerCase()}`,
                filename: `report-${reportId}.${format.toLowerCase()}`,
            };
        },
    },
};
