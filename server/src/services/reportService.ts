import { prisma } from '../db';
import { ReportType, ScheduledReportStatus } from '@prisma/client';
import { emailService } from './emailService';
import * as cron from 'node-cron';

export interface ReportData {
    title: string;
    period: { start: Date; end: Date };
    data: any;
    summary: string;
    charts?: Array<{
        type: 'bar' | 'line' | 'pie' | 'doughnut';
        title: string;
        data: any;
    }>;
}

class ReportService {
    private scheduledJobs = new Map<string, cron.ScheduledTask>();

    constructor() {
        this.initializeScheduledReports();
    }

    async generateRevenueReport(startDate: Date, endDate: Date): Promise<ReportData> {
        const bookings = await prisma.booking.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                status: 'CHECKED_OUT',
            },
            include: {
                room: true,
                invoice: true,
            },
        });

        const totalRevenue = bookings.reduce((sum, booking) => {
            return sum + (booking.invoice?.total || 0);
        }, 0);

        const averageRevenue = bookings.length > 0 ? totalRevenue / bookings.length : 0;

        // Group revenue by day
        const dailyRevenue = bookings.reduce((acc: Record<string, number>, booking) => {
            const date = booking.createdAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + (booking.invoice?.total || 0);
            return acc;
        }, {});

        // Group revenue by room type
        const revenueByRoomType = bookings.reduce((acc: Record<string, number>, booking) => {
            const roomType = booking.room?.type || 'Unknown';
            acc[roomType] = (acc[roomType] || 0) + (booking.invoice?.total || 0);
            return acc;
        }, {});

        return {
            title: 'Revenue Report',
            period: { start: startDate, end: endDate },
            data: {
                totalRevenue,
                averageRevenue,
                totalBookings: bookings.length,
                dailyRevenue,
                revenueByRoomType,
            },
            summary: `Total revenue of $${totalRevenue.toFixed(2)} from ${bookings.length} bookings with an average of $${averageRevenue.toFixed(2)} per booking.`,
            charts: [
                {
                    type: 'line',
                    title: 'Daily Revenue Trend',
                    data: {
                        labels: Object.keys(dailyRevenue),
                        datasets: [{
                            label: 'Revenue ($)',
                            data: Object.values(dailyRevenue),
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        }],
                    },
                },
                {
                    type: 'pie',
                    title: 'Revenue by Room Type',
                    data: {
                        labels: Object.keys(revenueByRoomType),
                        datasets: [{
                            data: Object.values(revenueByRoomType),
                            backgroundColor: [
                                '#FF6384',
                                '#36A2EB',
                                '#FFCE56',
                                '#4BC0C0',
                                '#9966FF',
                            ],
                        }],
                    },
                },
            ],
        };
    }

    async generateOccupancyReport(startDate: Date, endDate: Date): Promise<ReportData> {
        const totalRooms = await prisma.room.count();

        const bookings = await prisma.booking.findMany({
            where: {
                OR: [
                    {
                        checkIn: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                    {
                        checkOut: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                    {
                        AND: [
                            { checkIn: { lte: startDate } },
                            { checkOut: { gte: endDate } },
                        ],
                    },
                ],
                status: { in: ['CONFIRMED', 'CHECKED_IN'] },
            },
            include: {
                room: true,
            },
        });

        // Calculate occupancy by day
        const dailyOccupancy: Record<string, number> = {};
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        for (let i = 0; i <= daysDiff; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            const occupiedRooms = bookings.filter(booking => {
                const checkIn = new Date(booking.checkIn);
                const checkOut = new Date(booking.checkOut);
                return checkIn <= date && checkOut > date;
            }).length;

            dailyOccupancy[dateStr] = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
        }

        const averageOccupancy = Object.values(dailyOccupancy).reduce((sum, occ) => sum + occ, 0) / Object.values(dailyOccupancy).length;

        // Occupancy by room type
        const occupancyByRoomType = await this.getOccupancyByRoomType(startDate, endDate);

        return {
            title: 'Occupancy Report',
            period: { start: startDate, end: endDate },
            data: {
                totalRooms,
                averageOccupancy,
                dailyOccupancy,
                occupancyByRoomType,
                peakOccupancy: Math.max(...Object.values(dailyOccupancy)),
                lowestOccupancy: Math.min(...Object.values(dailyOccupancy)),
            },
            summary: `Average occupancy of ${averageOccupancy.toFixed(1)}% across ${totalRooms} rooms with peak occupancy of ${Math.max(...Object.values(dailyOccupancy)).toFixed(1)}%.`,
            charts: [
                {
                    type: 'line',
                    title: 'Daily Occupancy Rate',
                    data: {
                        labels: Object.keys(dailyOccupancy),
                        datasets: [{
                            label: 'Occupancy (%)',
                            data: Object.values(dailyOccupancy),
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        }],
                    },
                },
                {
                    type: 'bar',
                    title: 'Occupancy by Room Type',
                    data: {
                        labels: Object.keys(occupancyByRoomType),
                        datasets: [{
                            label: 'Occupancy (%)',
                            data: Object.values(occupancyByRoomType),
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        }],
                    },
                },
            ],
        };
    }

    async generateGuestAnalyticsReport(startDate: Date, endDate: Date): Promise<ReportData> {
        const bookings = await prisma.booking.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                guest: true,
                room: true,
            },
        });

        const uniqueGuests = new Set(bookings.map(b => b.guestId).filter(Boolean)).size;
        const repeatGuests = await this.getRepeatGuestCount(startDate, endDate);
        const averageStayDuration = this.calculateAverageStayDuration(bookings);

        // Guest demographics (this would be enhanced with real guest data)
        const guestsByCountry = await this.getGuestsByDemographic('country', startDate, endDate);
        const guestsByAge = await this.getGuestsByDemographic('ageGroup', startDate, endDate);

        return {
            title: 'Guest Analytics Report',
            period: { start: startDate, end: endDate },
            data: {
                totalBookings: bookings.length,
                uniqueGuests,
                repeatGuests,
                repeatGuestRate: uniqueGuests > 0 ? (repeatGuests / uniqueGuests) * 100 : 0,
                averageStayDuration,
                guestsByCountry,
                guestsByAge,
            },
            summary: `${uniqueGuests} unique guests with ${repeatGuests} repeat visitors (${uniqueGuests > 0 ? ((repeatGuests / uniqueGuests) * 100).toFixed(1) : 0}% repeat rate) and average stay of ${averageStayDuration.toFixed(1)} days.`,
            charts: [
                {
                    type: 'doughnut',
                    title: 'Guest Distribution by Country',
                    data: {
                        labels: Object.keys(guestsByCountry),
                        datasets: [{
                            data: Object.values(guestsByCountry),
                            backgroundColor: [
                                '#FF6384',
                                '#36A2EB',
                                '#FFCE56',
                                '#4BC0C0',
                                '#9966FF',
                                '#FF9F40',
                            ],
                        }],
                    },
                },
            ],
        };
    }

    async scheduleReport(reportConfig: {
        name: string;
        type: ReportType;
        schedule: string;
        recipients: string[];
        parameters?: any;
        createdBy: string;
    }): Promise<string> {
        // Validate cron schedule
        if (!cron.validate(reportConfig.schedule)) {
            throw new Error('Invalid cron schedule format');
        }

        // Calculate next run time
        const nextRun = new Date();

        const scheduledReport = await prisma.scheduledReport.create({
            data: {
                name: reportConfig.name,
                type: reportConfig.type,
                schedule: reportConfig.schedule,
                recipients: reportConfig.recipients,
                parameters: reportConfig.parameters,
                createdBy: reportConfig.createdBy,
                nextRun,
            },
        });

        // Start the scheduled job
        this.startScheduledJob(scheduledReport.id, reportConfig.schedule);

        return scheduledReport.id;
    }

    private startScheduledJob(reportId: string, schedule: string): void {
        const task = cron.schedule(schedule, async () => {
            await this.runScheduledReport(reportId);
        });

        this.scheduledJobs.set(reportId, task);
        task.start();
    }

    private async runScheduledReport(reportId: string): Promise<void> {
        try {
            const scheduledReport = await prisma.scheduledReport.findUnique({
                where: { id: reportId },
            });

            if (!scheduledReport || !scheduledReport.isActive) {
                return;
            }

            // Generate report based on type
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30); // Default to last 30 days

            let reportData: ReportData;

            switch (scheduledReport.type) {
                case ReportType.REVENUE:
                    reportData = await this.generateRevenueReport(startDate, endDate);
                    break;
                case ReportType.OCCUPANCY:
                    reportData = await this.generateOccupancyReport(startDate, endDate);
                    break;
                case ReportType.GUEST_ANALYTICS:
                    reportData = await this.generateGuestAnalyticsReport(startDate, endDate);
                    break;
                default:
                    throw new Error(`Unsupported report type: ${scheduledReport.type}`);
            }

            // Send email with report
            await emailService.sendScheduledReport(scheduledReport.recipients, {
                name: scheduledReport.name,
                summary: reportData.summary,
                // You could generate PDF here and attach it
            });

            // Update last run time and calculate next run
            const nextRun = new Date();
            nextRun.setDate(nextRun.getDate() + 1); // Simplified - should use proper cron calculation

            await prisma.scheduledReport.update({
                where: { id: reportId },
                data: {
                    lastRun: new Date(),
                    nextRun,
                },
            });

        } catch (error) {
            console.error(`Failed to run scheduled report ${reportId}:`, error);

            await prisma.scheduledReport.update({
                where: { id: reportId },
                data: {
                    status: ScheduledReportStatus.ERROR,
                },
            });
        }
    }

    private async initializeScheduledReports(): Promise<void> {
        const activeReports = await prisma.scheduledReport.findMany({
            where: { isActive: true },
        });

        for (const report of activeReports) {
            this.startScheduledJob(report.id, report.schedule);
        }
    }

    private async getOccupancyByRoomType(startDate: Date, endDate: Date): Promise<Record<string, number>> {
        const roomTypes = await prisma.room.groupBy({
            by: ['type'],
            _count: { type: true },
        });

        const occupancyByType: Record<string, number> = {};

        for (const roomType of roomTypes) {
            const totalRoomsOfType = roomType._count.type;
            const bookingsOfType = await prisma.booking.count({
                where: {
                    room: { type: roomType.type },
                    checkIn: { lte: endDate },
                    checkOut: { gte: startDate },
                    status: { in: ['CONFIRMED', 'CHECKED_IN'] },
                },
            });

            occupancyByType[roomType.type] = totalRoomsOfType > 0 ? (bookingsOfType / totalRoomsOfType) * 100 : 0;
        }

        return occupancyByType;
    }

    private async getRepeatGuestCount(startDate: Date, endDate: Date): Promise<number> {
        const guestBookingCounts = await prisma.booking.groupBy({
            by: ['guestId'],
            where: {
                createdAt: { gte: startDate, lte: endDate },
                guestId: { not: null },
            },
            _count: { guestId: true },
        });

        return guestBookingCounts.filter(g => g._count.guestId > 1).length;
    }

    private calculateAverageStayDuration(bookings: any[]): number {
        if (bookings.length === 0) return 0;

        const totalDays = bookings.reduce((sum, booking) => {
            const checkIn = new Date(booking.checkIn);
            const checkOut = new Date(booking.checkOut);
            const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
            return sum + days;
        }, 0);

        return totalDays / bookings.length;
    }

    private async getGuestsByDemographic(demographic: string, startDate: Date, endDate: Date): Promise<Record<string, number>> {
        // This is a simplified implementation
        // In a real app, you'd have guest demographic data
        return {
            'USA': 45,
            'Canada': 25,
            'UK': 15,
            'Other': 15,
        };
    }
}

export const reportService = new ReportService();
