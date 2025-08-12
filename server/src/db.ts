import { prisma } from './prisma';
import 'dotenv/config';

export { prisma };

export const initializeDatabase = async () => {
    try {
        await prisma.$connect();
        console.log('Database connection initialized');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};
