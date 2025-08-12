import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Room } from './Room';
import { BookingStatus } from '../types';

@Entity()
export class Booking {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Room, room => room.bookings, { nullable: false })
    @JoinColumn()
    room!: Room;

    @Column()
    guestName!: string;

    @Column({ type: 'timestamp' })
    checkIn!: Date;

    @Column({ type: 'timestamp' })
    checkOut!: Date;

    @Column({
        type: 'enum',
        enum: BookingStatus,
        default: BookingStatus.CONFIRMED
    })
    status!: BookingStatus;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
