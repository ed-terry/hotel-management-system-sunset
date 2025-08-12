import { prisma } from '../db';
import { Context } from '../types';

export const userPreferencesResolvers = {
    Query: {
        userPreferences: async (_: any, __: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            const userPreferences = await prisma.userPreferences.findUnique({
                where: { userId: context.user.id },
                include: {
                    user: {
                        include: {
                            notificationSettings: true
                        }
                    }
                }
            });

            if (!userPreferences) {
                // Create default preferences if they don't exist
                const newPreferences = await prisma.userPreferences.create({
                    data: {
                        userId: context.user.id,
                        theme: 'dark',
                        language: 'en',
                        timezone: 'UTC',
                        dateFormat: 'MM/dd/yyyy',
                        currency: 'USD'
                    },
                    include: {
                        user: {
                            include: {
                                notificationSettings: true
                            }
                        }
                    }
                });
                return mapUserPreferencesToGraphQL(newPreferences);
            }

            return mapUserPreferencesToGraphQL(userPreferences);
        }
    },

    Mutation: {
        updateUserPreferences: async (_: any, { input }: { input: any }, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            // Update or create user preferences
            const userPreferences = await prisma.userPreferences.upsert({
                where: { userId: context.user.id },
                update: {
                    theme: input.theme || undefined,
                    language: input.language || undefined,
                    timezone: input.timezone || undefined,
                    dateFormat: input.dateFormat || undefined,
                    currency: input.currency || undefined,
                },
                create: {
                    userId: context.user.id,
                    theme: input.theme || 'dark',
                    language: input.language || 'en',
                    timezone: input.timezone || 'UTC',
                    dateFormat: input.dateFormat || 'MM/dd/yyyy',
                    currency: input.currency || 'USD'
                },
                include: {
                    user: {
                        include: {
                            notificationSettings: true
                        }
                    }
                }
            });

            // Update notification settings if provided
            if (input.notifications) {
                await prisma.notificationSettings.upsert({
                    where: { userId: context.user.id },
                    update: {
                        emailNotifications: input.notifications.email ?? undefined,
                        pushNotifications: input.notifications.push ?? undefined,
                        smsNotifications: input.notifications.sms ?? undefined,
                    },
                    create: {
                        userId: context.user.id,
                        emailNotifications: input.notifications.email ?? true,
                        pushNotifications: input.notifications.push ?? false,
                        smsNotifications: input.notifications.sms ?? true,
                    }
                });
            }

            return mapUserPreferencesToGraphQL(userPreferences);
        },

        updateUserTheme: async (_: any, { theme }: { theme: string }, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            const userPreferences = await prisma.userPreferences.upsert({
                where: { userId: context.user.id },
                update: { theme },
                create: {
                    userId: context.user.id,
                    theme,
                    language: 'en',
                    timezone: 'UTC',
                    dateFormat: 'MM/dd/yyyy',
                    currency: 'USD'
                },
                include: {
                    user: {
                        include: {
                            notificationSettings: true
                        }
                    }
                }
            });

            return mapUserPreferencesToGraphQL(userPreferences);
        }
    }
};

function mapUserPreferencesToGraphQL(userPreferences: any) {
    return {
        id: userPreferences.id,
        theme: userPreferences.theme,
        language: userPreferences.language,
        timezone: userPreferences.timezone,
        dateFormat: userPreferences.dateFormat,
        currency: userPreferences.currency,
        notifications: userPreferences.user.notificationSettings ? {
            email: userPreferences.user.notificationSettings.emailNotifications,
            push: userPreferences.user.notificationSettings.pushNotifications,
            sms: userPreferences.user.notificationSettings.smsNotifications
        } : {
            email: true,
            push: false,
            sms: true
        }
    };
}
