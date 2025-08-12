import { Room as PrismaRoom, Booking as PrismaBooking, Report as PrismaReport } from '@prisma/client';
import { Room, Booking, Report } from '../types';

export const mapPrismaRoomToGraphQL = (room: PrismaRoom & { bookings?: PrismaBooking[] }): Room => {
    return {
        id: room.id,
        number: room.number,
        type: room.type.toString(),
        status: room.status.toString(),
        price: room.price,
        bookings: room.bookings?.map(mapPrismaBookingToGraphQL)
    };
};

export const mapPrismaBookingToGraphQL = (booking: PrismaBooking & { room?: PrismaRoom }): Booking => {
    return {
        id: booking.id,
        room: booking.room ? mapPrismaRoomToGraphQL({ ...booking.room, bookings: [] }) : null!,
        guestName: booking.guestName,
        checkIn: booking.checkIn.toISOString(),
        checkOut: booking.checkOut.toISOString(),
        status: booking.status.toString()
    };
};

export const mapPrismaReportToGraphQL = (report: PrismaReport): Report => {
    return {
        id: report.id,
        title: report.title,
        type: report.type,
        data: report.data,
        summary: report.summary,
        generatedAt: report.createdAt.toISOString()
    };
};
