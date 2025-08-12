import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ReportType {
    REVENUE = 'REVENUE',
    OCCUPANCY = 'OCCUPANCY',
    MAINTENANCE = 'MAINTENANCE',
    CUSTOM = 'CUSTOM'
}

@Entity()
export class Report {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    title!: string;

    @Column({
        type: 'enum',
        enum: ReportType,
        default: ReportType.CUSTOM
    })
    type!: ReportType;

    @Column('jsonb')
    data!: Record<string, any>;

    @Column({ type: 'text' })
    summary!: string;

    @CreateDateColumn()
    generatedAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
