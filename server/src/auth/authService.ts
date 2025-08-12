import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    };
}

export class AuthService {
    private static generateToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    static async login(credentials: LoginCredentials, ipAddress?: string, userAgent?: string): Promise<LoginResponse> {
        const { email, password } = credentials;

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Check if user is active
        if (user.status !== 'ACTIVE') {
            throw new Error('Account is not active');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid email or password');
        }

        // Generate JWT token
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
            expiresIn: '7d'
        });

        // Generate session token for database tracking
        const sessionToken = this.generateToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        // Create session
        await prisma.session.create({
            data: {
                userId: user.id,
                token: sessionToken,
                expiresAt,
                ipAddress,
                userAgent
            }
        });

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        };
    }

    static async logout(token: string): Promise<void> {
        try {
            // Decode JWT to get user info
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

            // Delete all sessions for this user (or you could track specific session tokens)
            await prisma.session.deleteMany({
                where: { userId: decoded.userId }
            });
        } catch (error) {
            // Even if JWT is invalid, we should try to clean up
            console.error('Error during logout:', error);
        }
    }

    static async register(data: RegisterData, createdBy?: string): Promise<LoginResponse> {
        const { email, password, firstName, lastName, role = 'FRONT_DESK' } = data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                firstName,
                lastName,
                role: role as any,
                createdBy
            }
        });

        // Auto-login after registration
        return this.login({ email, password });
    }

    static async createDefaultAdmin(): Promise<void> {
        const adminEmail = 'admin@hotelmanagement.com';

        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('Admin123!', 12);

            await prisma.user.create({
                data: {
                    email: adminEmail,
                    password: hashedPassword,
                    firstName: 'System',
                    lastName: 'Administrator',
                    role: 'ADMIN'
                }
            });

            console.log('Default admin user created:');
            console.log('Email: admin@hotelmanagement.com');
            console.log('Password: Admin123!');
        }
    }

    static async validateToken(token: string): Promise<any> {
        const session = await prisma.session.findUnique({
            where: { token },
            include: { user: true }
        });

        if (!session || session.expiresAt < new Date()) {
            throw new Error('Invalid or expired token');
        }

        if (session.user.status !== 'ACTIVE') {
            throw new Error('User account is not active');
        }

        return {
            id: session.user.id,
            email: session.user.email,
            firstName: session.user.firstName,
            lastName: session.user.lastName,
            role: session.user.role
        };
    }

    static async refreshToken(oldToken: string): Promise<string> {
        const session = await prisma.session.findUnique({
            where: { token: oldToken },
            include: { user: true }
        });

        if (!session || session.user.status !== 'ACTIVE') {
            throw new Error('Invalid session');
        }

        // Delete old session
        await prisma.session.delete({
            where: { token: oldToken }
        });

        // Create new session
        const newToken = this.generateToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await prisma.session.create({
            data: {
                userId: session.userId,
                token: newToken,
                expiresAt,
                ipAddress: session.ipAddress,
                userAgent: session.userAgent
            }
        });

        return newToken;
    }

    static async cleanupExpiredSessions(): Promise<void> {
        await prisma.session.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        });
    }
}
