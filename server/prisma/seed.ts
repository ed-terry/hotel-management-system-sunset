import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create default admin user
    const adminEmail = 'admin@hotelmanagement.com';
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('Admin123!', 12);

        const admin = await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                firstName: 'System',
                lastName: 'Administrator',
                role: 'ADMIN'
            }
        });

        console.log('Created admin user:', admin.email);
    } else {
        console.log('Admin user already exists');
    }

    // Create sample rooms
    const existingRooms = await prisma.room.count();
    if (existingRooms === 0) {
        const rooms: any[] = [];

        // Single rooms (101-110)
        for (let i = 1; i <= 10; i++) {
            rooms.push({
                number: `10${i}`,
                type: 'SINGLE',
                status: 'AVAILABLE',
                price: 100.0
            });
        }

        // Double rooms (201-215)
        for (let i = 1; i <= 15; i++) {
            rooms.push({
                number: `20${i.toString().padStart(2, '0')}`,
                type: 'DOUBLE',
                status: 'AVAILABLE',
                price: 150.0
            });
        }

        // Suite rooms (301-305)
        for (let i = 1; i <= 5; i++) {
            rooms.push({
                number: `30${i}`,
                type: 'SUITE',
                status: 'AVAILABLE',
                price: 300.0
            });
        }

        // Deluxe rooms (401-403)
        for (let i = 1; i <= 3; i++) {
            rooms.push({
                number: `40${i}`,
                type: 'DELUXE',
                status: 'AVAILABLE',
                price: 500.0
            });
        }

        await prisma.room.createMany({
            data: rooms
        });

        console.log(`Created ${rooms.length} rooms`);
    } else {
        console.log('Rooms already exist');
    }

    // Create sample guests
    const existingGuests = await prisma.guest.count();
    if (existingGuests === 0) {
        const guests = [
            {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@email.com',
                phone: '+1234567890',
                address: '123 Main St, City, State 12345',
                nationality: 'US',
                isVip: false
            },
            {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@email.com',
                phone: '+1234567891',
                address: '456 Oak Ave, City, State 12345',
                nationality: 'US',
                isVip: true
            },
            {
                firstName: 'Robert',
                lastName: 'Johnson',
                email: 'robert.johnson@email.com',
                phone: '+1234567892',
                address: '789 Pine St, City, State 12345',
                nationality: 'CA',
                isVip: false
            }
        ];

        await prisma.guest.createMany({
            data: guests
        });

        console.log(`Created ${guests.length} sample guests`);
    } else {
        console.log('Guests already exist');
    }

    // Create sample employees
    const existingEmployees = await prisma.employee.count();
    if (existingEmployees === 0) {
        const employees = [
            {
                employeeId: 'EMP001',
                firstName: 'Sarah',
                lastName: 'Wilson',
                email: 'sarah.wilson@hotel.com',
                phone: '+1234567893',
                department: 'Front Desk',
                position: 'Front Desk Manager',
                hireDate: new Date('2023-01-15'),
                salary: 45000,
                status: 'ACTIVE' as const
            },
            {
                employeeId: 'EMP002',
                firstName: 'Mike',
                lastName: 'Brown',
                email: 'mike.brown@hotel.com',
                phone: '+1234567894',
                department: 'Housekeeping',
                position: 'Housekeeping Supervisor',
                hireDate: new Date('2023-03-01'),
                salary: 38000,
                status: 'ACTIVE' as const
            },
            {
                employeeId: 'EMP003',
                firstName: 'Lisa',
                lastName: 'Davis',
                email: 'lisa.davis@hotel.com',
                phone: '+1234567895',
                department: 'Maintenance',
                position: 'Maintenance Technician',
                hireDate: new Date('2023-06-10'),
                salary: 42000,
                status: 'ACTIVE'
            }
        ] as any;

        await prisma.employee.createMany({
            data: employees
        });

        console.log(`Created ${employees.length} sample employees`);
    } else {
        console.log('Employees already exist');
    }

    // Create sample housekeeping tasks
    const existingTasks = await prisma.housekeepingTask.count();
    if (existingTasks === 0) {
        // Get some rooms to assign tasks to
        const rooms = await prisma.room.findMany({ take: 10 });

        if (rooms.length > 0) {
            const tasks = [
                {
                    roomId: rooms[0].id,
                    taskType: 'CLEANING',
                    status: 'PENDING',
                    assignedTo: 'EMP002',
                    priority: 'HIGH',
                    estimatedTime: 45,
                    notes: 'Deep cleaning required after checkout'
                },
                {
                    roomId: rooms[1].id,
                    taskType: 'CLEANING',
                    status: 'IN_PROGRESS',
                    assignedTo: 'EMP002',
                    priority: 'MEDIUM',
                    estimatedTime: 30,
                    actualTime: 25,
                    notes: 'Standard cleaning'
                },
                {
                    roomId: rooms[2].id,
                    taskType: 'MAINTENANCE',
                    status: 'PENDING',
                    assignedTo: 'EMP003',
                    priority: 'HIGH',
                    estimatedTime: 60,
                    notes: 'AC unit needs servicing'
                },
                {
                    roomId: rooms[3].id,
                    taskType: 'CLEANING',
                    status: 'COMPLETED',
                    assignedTo: 'EMP002',
                    priority: 'MEDIUM',
                    estimatedTime: 30,
                    actualTime: 35,
                    completedAt: new Date(),
                    notes: 'Room ready for next guest'
                },
                {
                    roomId: rooms[4].id,
                    taskType: 'INSPECTION',
                    status: 'PENDING',
                    priority: 'LOW',
                    estimatedTime: 15,
                    notes: 'Routine room inspection'
                },
                {
                    roomId: rooms[5].id,
                    taskType: 'RESTOCKING',
                    status: 'PENDING',
                    assignedTo: 'EMP002',
                    priority: 'MEDIUM',
                    estimatedTime: 20,
                    notes: 'Restock minibar and amenities'
                }
            ] as any;

            await prisma.housekeepingTask.createMany({
                data: tasks
            });

            console.log(`Created ${tasks.length} sample housekeeping tasks`);
        }
    } else {
        console.log('Housekeeping tasks already exist');
    }

    console.log('Database seeding completed!');
    console.log('\nDefault login credentials:');
    console.log('Email: admin@hotelmanagement.com');
    console.log('Password: Admin123!');
}

main()
    .catch((e) => {
        console.error(e);
        if (typeof process !== 'undefined') {
            process.exit(1);
        }
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
