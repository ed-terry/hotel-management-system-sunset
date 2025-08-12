import { prisma } from '../db';
import { emailService } from '../services/emailService';

interface Context {
    user?: {
        id: string;
        role: string;
        email: string;
    };
}

export const notificationResolvers = {
    Query: {
        notificationSettings: async (_: any, __: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            const settings = await prisma.notificationSettings.findUnique({
                where: { userId: context.user.id },
                include: { user: true },
            });

            if (!settings) {
                // Create default notification settings
                return await prisma.notificationSettings.create({
                    data: {
                        userId: context.user.id,
                        emailNotifications: true,
                        pushNotifications: false,
                        smsNotifications: true,
                        reportSchedule: 'weekly',
                    },
                    include: { user: true },
                });
            }

            return settings;
        },

        emailTemplates: async (_: any, __: any, context: Context) => {
            if (!context.user || context.user.role !== 'ADMIN') {
                throw new Error('Admin access required');
            }

            return await prisma.emailTemplate.findMany({
                orderBy: { createdAt: 'desc' },
            });
        },
    },

    Mutation: {
        updateNotificationSettings: async (_: any, { input }: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            const existingSettings = await prisma.notificationSettings.findUnique({
                where: { userId: context.user.id },
            });

            if (existingSettings) {
                return await prisma.notificationSettings.update({
                    where: { userId: context.user.id },
                    data: input,
                    include: { user: true },
                });
            } else {
                return await prisma.notificationSettings.create({
                    data: {
                        ...input,
                        userId: context.user.id,
                    },
                    include: { user: true },
                });
            }
        },

        createEmailTemplate: async (_: any, { input }: any, context: Context) => {
            if (!context.user || context.user.role !== 'ADMIN') {
                throw new Error('Admin access required');
            }

            return await prisma.emailTemplate.create({
                data: input,
            });
        },

        updateEmailTemplate: async (_: any, { id, input }: any, context: Context) => {
            if (!context.user || context.user.role !== 'ADMIN') {
                throw new Error('Admin access required');
            }

            return await prisma.emailTemplate.update({
                where: { id },
                data: input,
            });
        },

        deleteEmailTemplate: async (_: any, { id }: any, context: Context) => {
            if (!context.user || context.user.role !== 'ADMIN') {
                throw new Error('Admin access required');
            }

            await prisma.emailTemplate.delete({
                where: { id },
            });

            return true;
        },

        sendTestEmail: async (_: any, { to, templateName, variables }: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            try {
                if (templateName) {
                    await emailService.sendTemplateEmail(templateName, to, variables);
                } else {
                    await emailService.sendEmail({
                        to,
                        subject: 'Test Email from Hotel Management System',
                        html: '<h1>Test Email</h1><p>This is a test email sent from the hotel management system.</p>',
                    });
                }
                return true;
            } catch (error) {
                console.error('Failed to send test email:', error);
                throw new Error('Failed to send test email');
            }
        },

        sendBookingNotification: async (_: any, { bookingId, type }: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            const booking = await prisma.booking.findUnique({
                where: { id: bookingId },
                include: {
                    guest: true,
                    room: true,
                },
            });

            if (!booking || !booking.guest) {
                throw new Error('Booking or guest not found');
            }

            const userSettings = await prisma.notificationSettings.findUnique({
                where: { userId: context.user.id },
            });

            if (!userSettings?.emailNotifications) {
                return false;
            }

            try {
                switch (type) {
                    case 'CONFIRMATION':
                        await emailService.sendBookingConfirmation(booking.guest.email, booking);
                        break;
                    case 'REMINDER':
                        await emailService.sendTemplateEmail('check-in-reminder', booking.guest.email, {
                            guestName: booking.guestName,
                            checkIn: new Date(booking.checkIn).toLocaleDateString(),
                            roomNumber: booking.room?.number || 'TBD',
                        });
                        break;
                    default:
                        throw new Error('Invalid notification type');
                }
                return true;
            } catch (error) {
                console.error('Failed to send booking notification:', error);
                throw new Error('Failed to send booking notification');
            }
        },
    },
};
