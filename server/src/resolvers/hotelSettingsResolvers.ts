import { prisma } from '../db';

interface Context {
    user?: {
        id: string;
        role: string;
        email: string;
    };
}

export const hotelSettingsResolvers = {
    Query: {
        hotelSettings: async () => {
            const settings = await prisma.hotelSettings.findFirst();
            if (!settings) {
                // Create default settings if none exist
                return await prisma.hotelSettings.create({
                    data: {
                        name: 'Grand Hotel',
                        currency: 'USD',
                        timezone: 'UTC',
                        language: 'en',
                        theme: 'dark',
                    },
                });
            }
            return settings;
        },
    },

    Mutation: {
        updateHotelSettings: async (_: any, { input }: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            if (context.user.role !== 'ADMIN') {
                throw new Error('Admin access required');
            }

            const existingSettings = await prisma.hotelSettings.findFirst();

            if (existingSettings) {
                return await prisma.hotelSettings.update({
                    where: { id: existingSettings.id },
                    data: input,
                });
            } else {
                return await prisma.hotelSettings.create({
                    data: input,
                });
            }
        },

        uploadHotelLogo: async (_: any, { file }: any, context: Context) => {
            if (!context.user || context.user.role !== 'ADMIN') {
                throw new Error('Admin access required');
            }

            // This would integrate with file upload handling
            // For now, we'll just update the logo URL
            const logoUrl = `/uploads/logo-${Date.now()}.png`;

            const settings = await prisma.hotelSettings.findFirst();
            if (settings) {
                return await prisma.hotelSettings.update({
                    where: { id: settings.id },
                    data: { logo: logoUrl },
                });
            } else {
                return await prisma.hotelSettings.create({
                    data: {
                        name: 'Grand Hotel',
                        logo: logoUrl,
                    },
                });
            }
        },
    },
};
