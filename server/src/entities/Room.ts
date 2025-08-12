import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Booking } from './Booking';
import { RoomType, RoomStatus } from '../types';

@Entity()
export class Room {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    number!: string;

    @Column({
        type: 'enum',
        enum: RoomType,
        default: RoomType.SINGLE
    })
    type!: RoomType;

    @Column({
        type: 'enum',
        enum: RoomStatus,
        default: RoomStatus.AVAILABLE
    })
    status!: RoomStatus;

    @Column('decimal', { precision: 10, scale: 2 })
    price!: number;

    @OneToMany(() => Booking, booking => booking.room)
    bookings!: Booking[];
}
