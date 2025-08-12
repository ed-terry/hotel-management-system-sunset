import { prisma } from '../db';
import { emailService } from '../services/emailService';
import { InvoiceStatus } from '@prisma/client';

interface Context {
    user?: {
        id: string;
        role: string;
        email: string;
    };
}

export const invoiceResolvers = {
    Query: {
        invoices: async (_: any, { status, guestId, limit = 50, offset = 0 }: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            const where: any = {};

            if (status) {
                where.status = status;
            }

            if (guestId) {
                where.guestId = guestId;
            }

            return await prisma.invoice.findMany({
                where,
                include: {
                    guest: true,
                    booking: {
                        include: {
                            room: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            });
        },

        invoice: async (_: any, { id }: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            return await prisma.invoice.findUnique({
                where: { id },
                include: {
                    guest: true,
                    booking: {
                        include: {
                            room: true,
                        },
                    },
                },
            });
        },

        invoiceStats: async (_: any, __: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            const [
                totalInvoices,
                paidInvoices,
                pendingInvoices,
                overdueInvoices,
                totalRevenue,
                pendingAmount,
            ] = await Promise.all([
                prisma.invoice.count(),
                prisma.invoice.count({ where: { status: InvoiceStatus.PAID } }),
                prisma.invoice.count({ where: { status: InvoiceStatus.PENDING } }),
                prisma.invoice.count({ where: { status: InvoiceStatus.OVERDUE } }),
                prisma.invoice.aggregate({
                    where: { status: InvoiceStatus.PAID },
                    _sum: { total: true },
                }),
                prisma.invoice.aggregate({
                    where: { status: { in: [InvoiceStatus.PENDING, InvoiceStatus.OVERDUE] } },
                    _sum: { total: true },
                }),
            ]);

            return {
                totalInvoices,
                paidInvoices,
                pendingInvoices,
                overdueInvoices,
                totalRevenue: totalRevenue._sum.total || 0,
                pendingAmount: pendingAmount._sum.total || 0,
                collectionRate: totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0,
            };
        },
    },

    Mutation: {
        createInvoice: async (_: any, { input }: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            // Generate invoice number
            const lastInvoice = await prisma.invoice.findFirst({
                orderBy: { createdAt: 'desc' },
            });

            const invoiceNumber = `INV-${new Date().getFullYear()}-${String((lastInvoice ? parseInt(lastInvoice.invoiceNumber.split('-')[2]) : 0) + 1).padStart(4, '0')}`;

            const invoice = await prisma.invoice.create({
                data: {
                    ...input,
                    invoiceNumber,
                },
                include: {
                    guest: true,
                    booking: {
                        include: {
                            room: true,
                        },
                    },
                },
            });

            // Send invoice email if guest has email
            if (invoice.guestEmail) {
                try {
                    await emailService.sendInvoice(invoice.guestEmail, invoice);
                } catch (error) {
                    console.error('Failed to send invoice email:', error);
                }
            }

            return invoice;
        },

        updateInvoice: async (_: any, { id, input }: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            return await prisma.invoice.update({
                where: { id },
                data: input,
                include: {
                    guest: true,
                    booking: {
                        include: {
                            room: true,
                        },
                    },
                },
            });
        },

        markInvoicePaid: async (_: any, { id, paymentMethod }: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            const invoice = await prisma.invoice.update({
                where: { id },
                data: {
                    status: InvoiceStatus.PAID,
                    paidDate: new Date(),
                    paymentMethod,
                },
                include: {
                    guest: true,
                    booking: {
                        include: {
                            room: true,
                        },
                    },
                },
            });

            // Send payment confirmation email
            if (invoice.guestEmail) {
                try {
                    await emailService.sendTemplateEmail('payment-confirmation', invoice.guestEmail, {
                        invoiceNumber: invoice.invoiceNumber,
                        guestName: invoice.guestName,
                        amount: invoice.total.toFixed(2),
                        paymentMethod,
                    });
                } catch (error) {
                    console.error('Failed to send payment confirmation email:', error);
                }
            }

            return invoice;
        },

        sendInvoiceEmail: async (_: any, { id }: any, context: Context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }

            const invoice = await prisma.invoice.findUnique({
                where: { id },
                include: { guest: true },
            });

            if (!invoice) {
                throw new Error('Invoice not found');
            }

            if (!invoice.guestEmail) {
                throw new Error('Guest email not available');
            }

            await emailService.sendInvoice(invoice.guestEmail, invoice);
            return true;
        },

        generateInvoiceFromBooking: async (_: any, { bookingId }: any, context: Context) => {
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

            if (!booking) {
                throw new Error('Booking not found');
            }

            // Check if invoice already exists
            const existingInvoice = await prisma.invoice.findUnique({
                where: { bookingId },
            });

            if (existingInvoice) {
                throw new Error('Invoice already exists for this booking');
            }

            // Calculate stay duration and cost
            const checkIn = new Date(booking.checkIn);
            const checkOut = new Date(booking.checkOut);
            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

            // Get room rate (this would come from room pricing in a real system)
            const roomRate = 150; // Default rate
            const subtotal = nights * roomRate;
            const tax = subtotal * 0.1; // 10% tax
            const total = subtotal + tax;

            const items = [
                {
                    description: `Room ${booking.room?.number || 'TBD'} - ${nights} night(s)`,
                    quantity: nights,
                    rate: roomRate,
                    amount: subtotal,
                },
            ];

            // Generate invoice number
            const lastInvoice = await prisma.invoice.findFirst({
                orderBy: { createdAt: 'desc' },
            });

            const invoiceNumber = `INV-${new Date().getFullYear()}-${String((lastInvoice ? parseInt(lastInvoice.invoiceNumber.split('-')[2]) : 0) + 1).padStart(4, '0')}`;

            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

            const invoice = await prisma.invoice.create({
                data: {
                    invoiceNumber,
                    guestId: booking.guestId,
                    guestName: booking.guestName,
                    guestEmail: booking.guest?.email,
                    bookingId: booking.id,
                    items,
                    subtotal,
                    tax,
                    total,
                    dueDate,
                    status: InvoiceStatus.PENDING,
                },
                include: {
                    guest: true,
                    booking: {
                        include: {
                            room: true,
                        },
                    },
                },
            });

            // Send invoice email
            if (invoice.guestEmail) {
                try {
                    await emailService.sendInvoice(invoice.guestEmail, invoice);
                } catch (error) {
                    console.error('Failed to send invoice email:', error);
                }
            }

            return invoice;
        },

        bulkUpdateInvoiceStatus: async (_: any, { invoiceIds, status }: any, context: Context) => {
            if (!context.user || context.user.role !== 'ADMIN') {
                throw new Error('Admin access required');
            }

            const updateData: any = { status };

            if (status === InvoiceStatus.PAID) {
                updateData.paidDate = new Date();
            }

            await prisma.invoice.updateMany({
                where: {
                    id: { in: invoiceIds },
                },
                data: updateData,
            });

            return await prisma.invoice.findMany({
                where: {
                    id: { in: invoiceIds },
                },
                include: {
                    guest: true,
                    booking: {
                        include: {
                            room: true,
                        },
                    },
                },
            });
        },

        deleteInvoice: async (_: any, { id }: any, context: Context) => {
            if (!context.user || context.user.role !== 'ADMIN') {
                throw new Error('Admin access required');
            }

            await prisma.invoice.delete({
                where: { id },
            });

            return true;
        },
    },
};
