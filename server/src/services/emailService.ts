import nodemailer from 'nodemailer';
import { prisma } from '../db';

export interface EmailOptions {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    attachments?: Array<{
        filename: string;
        content: Buffer;
        contentType?: string;
    }>;
}

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendEmail(options: EmailOptions): Promise<void> {
        try {
            const mailOptions = {
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
                attachments: options.attachments,
            };

            await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully to:', options.to);
        } catch (error) {
            console.error('Failed to send email:', error);
            throw error;
        }
    }

    async sendTemplateEmail(templateName: string, to: string | string[], variables: Record<string, any> = {}): Promise<void> {
        try {
            const template = await prisma.emailTemplate.findUnique({
                where: { name: templateName, isActive: true },
            });

            if (!template) {
                throw new Error(`Email template '${templateName}' not found or inactive`);
            }

            let subject = template.subject;
            let body = template.body;

            // Replace variables in template
            Object.keys(variables).forEach(key => {
                const placeholder = `{{${key}}}`;
                subject = subject.replace(new RegExp(placeholder, 'g'), variables[key]);
                body = body.replace(new RegExp(placeholder, 'g'), variables[key]);
            });

            await this.sendEmail({
                to,
                subject,
                html: body,
            });
        } catch (error) {
            console.error('Failed to send template email:', error);
            throw error;
        }
    }

    async sendBookingConfirmation(email: string, bookingDetails: any): Promise<void> {
        await this.sendTemplateEmail('booking-confirmation', email, {
            guestName: bookingDetails.guestName,
            checkIn: new Date(bookingDetails.checkIn).toLocaleDateString(),
            checkOut: new Date(bookingDetails.checkOut).toLocaleDateString(),
            roomNumber: bookingDetails.room?.number || 'TBD',
            hotelName: 'Grand Hotel', // This will come from HotelSettings
        });
    }

    async sendInvoice(email: string, invoiceData: any): Promise<void> {
        await this.sendTemplateEmail('invoice', email, {
            invoiceNumber: invoiceData.invoiceNumber,
            guestName: invoiceData.guestName,
            total: invoiceData.total.toFixed(2),
            dueDate: new Date(invoiceData.dueDate).toLocaleDateString(),
        });
    }

    async sendScheduledReport(recipients: string[], reportData: any): Promise<void> {
        const attachments = reportData.attachments ? [
            {
                filename: `${reportData.name}-${new Date().toISOString().split('T')[0]}.pdf`,
                content: reportData.attachments,
                contentType: 'application/pdf',
            }
        ] : undefined;

        await this.sendEmail({
            to: recipients,
            subject: `Scheduled Report: ${reportData.name}`,
            html: `
        <h2>${reportData.name}</h2>
        <p>Please find attached your scheduled report for ${new Date().toLocaleDateString()}.</p>
        <div>
          <h3>Summary:</h3>
          <p>${reportData.summary || 'Report generated successfully.'}</p>
        </div>
      `,
            attachments,
        });
    }

    async testConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            return true;
        } catch (error) {
            console.error('Email service connection test failed:', error);
            return false;
        }
    }
}

export const emailService = new EmailService();
