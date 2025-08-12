import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { prisma } from '../db';
import { BackupType, BackupStatus } from '@prisma/client';

export interface BackupOptions {
    type: BackupType;
    includeUploads?: boolean;
    includeDatabase?: boolean;
    compression?: boolean;
}

class BackupService {
    private backupDir = path.join(process.cwd(), 'backups');

    constructor() {
        // Ensure backup directory exists
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    async createBackup(userId: string, options: BackupOptions): Promise<string> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${options.type.toLowerCase()}-${timestamp}.zip`;
        const backupPath = path.join(this.backupDir, filename);

        // Create backup record
        const backup = await prisma.systemBackup.create({
            data: {
                filename,
                size: BigInt(0),
                type: options.type,
                status: BackupStatus.RUNNING,
                createdBy: userId,
                path: backupPath,
            },
        });

        try {
            const output = fs.createWriteStream(backupPath);
            const archive = archiver('zip', {
                zlib: { level: options.compression ? 9 : 1 },
            });

            output.on('close', async () => {
                const size = archive.pointer();
                await prisma.systemBackup.update({
                    where: { id: backup.id },
                    data: {
                        status: BackupStatus.COMPLETED,
                        size: BigInt(size),
                        completedAt: new Date(),
                    },
                });
            });

            archive.on('error', async (err) => {
                await prisma.systemBackup.update({
                    where: { id: backup.id },
                    data: {
                        status: BackupStatus.FAILED,
                        error: err.message,
                        completedAt: new Date(),
                    },
                });
                throw err;
            });

            archive.pipe(output);

            // Add database dump if requested
            if (options.includeDatabase) {
                const dbDump = await this.createDatabaseDump();
                archive.append(dbDump, { name: 'database.sql' });
            }

            // Add configuration files
            const configFiles = ['package.json', '.env.example', 'prisma/schema.prisma'];
            for (const file of configFiles) {
                const filePath = path.join(process.cwd(), file);
                if (fs.existsSync(filePath)) {
                    archive.file(filePath, { name: file });
                }
            }

            // Add uploads directory if requested
            if (options.includeUploads) {
                const uploadsDir = path.join(process.cwd(), 'uploads');
                if (fs.existsSync(uploadsDir)) {
                    archive.directory(uploadsDir, 'uploads');
                }
            }

            // Add application source (for FULL backup)
            if (options.type === BackupType.FULL) {
                archive.directory('src', 'src');
                archive.directory('prisma', 'prisma');
            }

            await archive.finalize();

            return backup.id;
        } catch (error) {
            await prisma.systemBackup.update({
                where: { id: backup.id },
                data: {
                    status: BackupStatus.FAILED,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    completedAt: new Date(),
                },
            });
            throw error;
        }
    }

    async createDatabaseDump(): Promise<string> {
        try {
            // Get all data from database
            const [users, guests, rooms, bookings, invoices, reports] = await Promise.all([
                prisma.user.findMany(),
                prisma.guest.findMany(),
                prisma.room.findMany(),
                prisma.booking.findMany(),
                prisma.invoice.findMany(),
                prisma.report.findMany(),
            ]);

            const dump = {
                timestamp: new Date().toISOString(),
                data: {
                    users,
                    guests,
                    rooms,
                    bookings,
                    invoices,
                    reports,
                },
            };

            return JSON.stringify(dump, null, 2);
        } catch (error) {
            console.error('Failed to create database dump:', error);
            throw error;
        }
    }

    async listBackups(): Promise<any[]> {
        return await prisma.systemBackup.findMany({
            include: {
                creator: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                startedAt: 'desc',
            },
        });
    }

    async deleteBackup(backupId: string): Promise<void> {
        const backup = await prisma.systemBackup.findUnique({
            where: { id: backupId },
        });

        if (!backup) {
            throw new Error('Backup not found');
        }

        // Delete file if it exists
        if (fs.existsSync(backup.path)) {
            fs.unlinkSync(backup.path);
        }

        // Delete record
        await prisma.systemBackup.delete({
            where: { id: backupId },
        });
    }

    async restoreBackup(backupId: string): Promise<void> {
        // This is a placeholder for restore functionality
        // In a real implementation, you would extract the backup and restore the data
        console.log(`Restore functionality for backup ${backupId} not implemented yet`);
        throw new Error('Restore functionality not implemented');
    }

    async scheduleBackup(schedule: string, options: BackupOptions): Promise<void> {
        // This would integrate with a job scheduler like node-cron
        console.log('Backup scheduled with options:', { schedule, options });
    }

    getBackupPath(filename: string): string {
        return path.join(this.backupDir, filename);
    }

    async getBackupStats(): Promise<{
        totalBackups: number;
        totalSize: bigint;
        lastBackup: Date | null;
        successfulBackups: number;
        failedBackups: number;
    }> {
        const stats = await prisma.systemBackup.aggregate({
            _count: { id: true },
            _sum: { size: true },
            _max: { completedAt: true },
        });

        const statusCounts = await prisma.systemBackup.groupBy({
            by: ['status'],
            _count: { status: true },
        });

        const successful = statusCounts.find(s => s.status === BackupStatus.COMPLETED)?._count.status || 0;
        const failed = statusCounts.find(s => s.status === BackupStatus.FAILED)?._count.status || 0;

        return {
            totalBackups: stats._count.id,
            totalSize: stats._sum.size || BigInt(0),
            lastBackup: stats._max.completedAt,
            successfulBackups: successful,
            failedBackups: failed,
        };
    }
}

export const backupService = new BackupService();
