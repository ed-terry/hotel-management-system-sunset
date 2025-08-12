import { prisma } from '../db';

export async function seedEmailTemplates() {
    const templates = [
        {
            name: 'booking-confirmation',
            subject: 'Booking Confirmation - {{hotelName}}',
            body: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .booking-details { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .footer { background-color: #374151; color: white; padding: 15px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmation</h1>
            </div>
            <div class="content">
              <p>Dear {{guestName}},</p>
              <p>Thank you for choosing {{hotelName}}! Your booking has been confirmed.</p>
              
              <div class="booking-details">
                <h3>Booking Details:</h3>
                <p><strong>Check-in:</strong> {{checkIn}}</p>
                <p><strong>Check-out:</strong> {{checkOut}}</p>
                <p><strong>Room:</strong> {{roomNumber}}</p>
              </div>
              
              <p>We look forward to welcoming you!</p>
              <p>Best regards,<br>{{hotelName}} Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 {{hotelName}}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
            variables: { guestName: 'string', hotelName: 'string', checkIn: 'date', checkOut: 'date', roomNumber: 'string' },
        },
        {
            name: 'invoice',
            subject: 'Invoice {{invoiceNumber}} - {{hotelName}}',
            body: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .invoice-details { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .amount { font-size: 24px; font-weight: bold; color: #dc2626; }
            .footer { background-color: #374151; color: white; padding: 15px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Invoice ` + '{{invoiceNumber}}' + `</h1>
            </div>
            <div class="content">
              <p>Dear ` + '{{guestName}}' + `,</p>
              <p>Please find your invoice below:</p>
              
              <div class="invoice-details">
                <h3>Invoice Details:</h3>
                <p><strong>Invoice Number:</strong> ` + '{{invoiceNumber}}' + `</p>
                <p><strong>Due Date:</strong> ` + '{{dueDate}}' + `</p>
                <p class="amount"><strong>Amount Due:</strong> $` + '{{total}}' + `</p>
              </div>
              
              <p>Please settle this invoice by the due date. Thank you for your business!</p>
              <p>Best regards,<br>` + '{{hotelName}}' + ` Billing Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 ` + '{{hotelName}}' + `. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
            variables: { guestName: 'string', invoiceNumber: 'string', total: 'number', dueDate: 'date', hotelName: 'string' },
        },
        {
            name: 'payment-confirmation',
            subject: 'Payment Confirmation - {{hotelName}}',
            body: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .payment-details { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .success { color: #059669; font-weight: bold; }
            .footer { background-color: #374151; color: white; padding: 15px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Received</h1>
            </div>
            <div class="content">
              <p>Dear ` + '{{guestName}}' + `,</p>
              <p class="success">Thank you! Your payment has been successfully processed.</p>
              
              <div class="payment-details">
                <h3>Payment Details:</h3>
                <p><strong>Invoice:</strong> ` + '{{invoiceNumber}}' + `</p>
                <p><strong>Amount Paid:</strong> $` + '{{amount}}' + `</p>
                <p><strong>Payment Method:</strong> ` + '{{paymentMethod}}' + `</p>
                <p><strong>Date:</strong> ` + '{{date}}' + `</p>
              </div>
              
              <p>Your account is now up to date. Thank you for your business!</p>
              <p>Best regards,<br>` + '{{hotelName}}' + ` Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 ` + '{{hotelName}}' + `. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
            variables: { guestName: 'string', invoiceNumber: 'string', amount: 'number', paymentMethod: 'string', date: 'date', hotelName: 'string' },
        },
        {
            name: 'check-in-reminder',
            subject: 'Check-in Reminder - {{hotelName}}',
            body: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .reminder-details { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .highlight { background-color: #fef3c7; padding: 10px; border-radius: 5px; margin: 10px 0; }
            .footer { background-color: #374151; color: white; padding: 15px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Check-in Reminder</h1>
            </div>
            <div class="content">
              <p>Dear {{guestName}},</p>
              <p>We're excited to welcome you to {{hotelName}}!</p>
              
              <div class="highlight">
                <p><strong>Your check-in is tomorrow: {{checkIn}}</strong></p>
              </div>
              
              <div class="reminder-details">
                <h3>Your Reservation:</h3>
                <p><strong>Check-in:</strong> {{checkIn}}</p>
                <p><strong>Room:</strong> {{roomNumber}}</p>
                <p><strong>Check-in Time:</strong> 3:00 PM</p>
              </div>
              
              <p>Please bring a valid ID and the credit card used for booking. We look forward to seeing you!</p>
              <p>Best regards,<br>{{hotelName}} Front Desk</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 {{hotelName}}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
            variables: { guestName: 'string', hotelName: 'string', checkIn: 'date', roomNumber: 'string' },
        },
    ];

    for (const template of templates) {
        await prisma.emailTemplate.upsert({
            where: { name: template.name },
            update: template,
            create: template,
        });
    }

    console.log('Email templates seeded successfully');
}

if (require.main === module) {
    seedEmailTemplates()
        .catch(console.error)
        .finally(() => prisma.$disconnect());
}
