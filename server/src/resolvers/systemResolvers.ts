import { prisma } from '../db';
import { backupService } from '../services/backupService';
import { githubService } from '../services/githubService';
import { BackupType } from '@prisma/client';

interface Context {
    user?: {
        id: string;
        role: string;
        email: string;
    };
}

export const systemResolvers = {
    Query: {
        systemBackups: async (_: any, __: any, context: Context) => {
            if (!context.user || context.user.role !== 'ADMIN') {
                throw new Error('Admin access required');
            }

            return await backupService.listBackups();
        },

        backupStats: async (_: any, __: any, context: Context) => {
            if (!context.user || context.user.role !== 'ADMIN') {
                throw new Error('Admin access required');
            }

            return await backupService.getBackupStats();
        },

        systemInfo: async (_: any, __: any, context: Context) => {
            if (!context.user || context.user.role !== 'ADMIN') {
                throw new Error('Admin access required');
            }

            const [gitInfo, systemInfo] = await Promise.all([
                githubService.getRepositoryInfo(),
                githubService.getSystemInfo(),
            ]);

            return {
                ...systemInfo,
                repository: gitInfo,
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
            };
        },

        checkUpdates: async (_: any, __: any, context: Context) => {
            if (!context.user || context.user.role !== 'ADMIN') {
                throw new Error('Admin access required');
            }

            return await githubService.checkForUpdates();
        },

        changelog: async (_: any, { limit = 10 }: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            return await githubService.getChangeLog(limit);
        },
    },

    Mutation: {
        createBackup: async (_: any, { type, options = {} }: any, context: Context) => {
            if (!context.user || context.user.role !== 'ADMIN') {
                throw new Error('Admin access required');
            }

            const backupType = type as BackupType;
            const backupId = await backupService.createBackup(context.user.id, {
                type: backupType,
                includeUploads: options.includeUploads || false,
                includeDatabase: options.includeDatabase !== false, // Default true
                compression: options.compression !== false, // Default true
            });

            return await prisma.systemBackup.findUnique({
                where: { id: backupId },
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

        deleteBackup: async (_: any, { id }: any, context: Context) => {
            if (!context.user || context.user.role !== 'ADMIN') {
                throw new Error('Admin access required');
            }

            await backupService.deleteBackup(id);
            return true;
        },

        exportData: async (_: any, { format, tables }: any, context: Context) => {
            if (!context.user || context.user.role !== 'ADMIN') {
                throw new Error('Admin access required');
            }

            // This would generate and return export data
            // For now, we'll create a backup and return the path
            const backupId = await backupService.createBackup(context.user.id, {
                type: BackupType.DATA_ONLY,
                includeDatabase: true,
                compression: true,
            });

            const backup = await prisma.systemBackup.findUnique({
                where: { id: backupId },
            });

            return {
                success: true,
                downloadUrl: `/api/download/backup/${backupId}`,
                filename: backup?.filename || 'export.zip',
            };
        },

        pullUpdates: async (_: any, __: any, context: Context) => {
            if (!context.user || context.user.role !== 'ADMIN') {
                throw new Error('Admin access required');
            }

            // Create backup before updating
            await githubService.createBackupBranch();

            const result = await githubService.pullUpdates();
            return result;
        },

        scheduleBackup: async (_: any, { schedule, options }: any, context: Context) => {
            if (!context.user || context.user.role !== 'ADMIN') {
                throw new Error('Admin access required');
            }

            await backupService.scheduleBackup(schedule, {
                type: options.type || BackupType.INCREMENTAL,
                includeUploads: options.includeUploads || false,
                includeDatabase: options.includeDatabase !== false,
                compression: options.compression !== false,
            });

            return true;
        },

        testEmailConnection: async (_: any, __: any, context: Context) => {
            if (!context.user || context.user.role !== 'ADMIN') {
                throw new Error('Admin access required');
            }

            const { emailService } = await import('../services/emailService');
            const isConnected = await emailService.testConnection();

            return {
                success: isConnected,
                message: isConnected ? 'Email connection successful' : 'Email connection failed',
            };
        },

        cleanupOldBackups: async (_: any, { olderThanDays = 30 }: any, context: Context) => {
            if (!context.user || context.user.role !== 'ADMIN') {
                throw new Error('Admin access required');
            }

            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

            const oldBackups = await prisma.systemBackup.findMany({
                where: {
                    startedAt: {
                        lt: cutoffDate,
                    },
                    status: 'COMPLETED',
                },
            });

            let deletedCount = 0;
            for (const backup of oldBackups) {
                try {
                    await backupService.deleteBackup(backup.id);
                    deletedCount++;
                } catch (error) {
                    console.error(`Failed to delete backup ${backup.id}:`, error);
                }
            }

            return {
                success: true,
                deletedCount,
                message: `Deleted ${deletedCount} old backups`,
            };
        },
    },
};
