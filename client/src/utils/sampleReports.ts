// Sample Reports Data for Sunset Hotel Management System
// This provides realistic sample data for demonstration purposes

export interface ReportData {
    revenue: {
        daily: Array<{ date: string; amount: number; bookings: number }>;
        monthly: Array<{ month: string; amount: number; growth: number }>;
        yearly: { total: number; growth: number; projectedGrowth: number };
    };
    occupancy: {
        current: number;
        trend: 'up' | 'down' | 'stable';
        weeklyData: Array<{ day: string; rate: number }>;
        roomTypes: Array<{ type: string; occupancy: number; revenue: number }>;
    };
    guest: {
        satisfaction: number;
        averageStay: number;
        repeatGuests: number;
        demographics: Array<{ segment: string; percentage: number }>;
    };
    operations: {
        housekeeping: {
            efficiency: number;
            tasksCompleted: number;
            averageCleanTime: number;
        };
        maintenance: {
            requests: number;
            completionRate: number;
            averageResponseTime: number;
        };
        frontDesk: {
            checkInTime: number;
            checkOutTime: number;
            satisfactionRating: number;
        };
    };
}

export const sampleReportData: ReportData = {
    revenue: {
        daily: [
            { date: '2025-01-20', amount: 45600, bookings: 28 },
            { date: '2025-01-21', amount: 52300, bookings: 32 },
            { date: '2025-01-22', amount: 48900, bookings: 30 },
            { date: '2025-01-23', amount: 61200, bookings: 38 },
            { date: '2025-01-24', amount: 68500, bookings: 42 },
            { date: '2025-01-25', amount: 72100, bookings: 45 },
            { date: '2025-01-26', amount: 69800, bookings: 43 },
        ],
        monthly: [
            { month: 'January', amount: 1450000, growth: 8.3 },
            { month: 'February', amount: 1380000, growth: 5.7 },
            { month: 'March', amount: 1620000, growth: 12.4 },
            { month: 'April', amount: 1580000, growth: 9.8 },
            { month: 'May', amount: 1720000, growth: 15.2 },
            { month: 'June', amount: 1890000, growth: 18.7 },
        ],
        yearly: {
            total: 18750000,
            growth: 12.8,
            projectedGrowth: 15.2
        }
    },
    occupancy: {
        current: 87.3,
        trend: 'up',
        weeklyData: [
            { day: 'Monday', rate: 72.5 },
            { day: 'Tuesday', rate: 68.2 },
            { day: 'Wednesday', rate: 71.8 },
            { day: 'Thursday', rate: 79.4 },
            { day: 'Friday', rate: 92.1 },
            { day: 'Saturday', rate: 96.8 },
            { day: 'Sunday', rate: 89.3 },
        ],
        roomTypes: [
            { type: 'Standard Double', occupancy: 85.2, revenue: 1250000 },
            { type: 'Executive Suite', occupancy: 78.9, revenue: 980000 },
            { type: 'Presidential Suite', occupancy: 92.1, revenue: 650000 },
            { type: 'Family Room', occupancy: 88.7, revenue: 720000 },
            { type: 'Deluxe Ocean View', occupancy: 94.3, revenue: 1150000 },
        ]
    },
    guest: {
        satisfaction: 4.6,
        averageStay: 2.8,
        repeatGuests: 34.7,
        demographics: [
            { segment: 'Business Travelers', percentage: 42.3 },
            { segment: 'Leisure Travelers', percentage: 38.7 },
            { segment: 'Families', percentage: 12.8 },
            { segment: 'Groups/Events', percentage: 6.2 },
        ]
    },
    operations: {
        housekeeping: {
            efficiency: 94.2,
            tasksCompleted: 1847,
            averageCleanTime: 28.5
        },
        maintenance: {
            requests: 156,
            completionRate: 92.3,
            averageResponseTime: 3.2
        },
        frontDesk: {
            checkInTime: 4.2,
            checkOutTime: 3.8,
            satisfactionRating: 4.7
        }
    }
};

export const sampleAIResponses = [
    {
        question: "How can we improve our midweek occupancy rates?",
        answer: "Based on your data analysis, I recommend implementing a 'Midweek Escape' package with 20% discount for Tuesday-Wednesday stays. Your current midweek occupancy is 15% below weekend rates. Consider partnering with local businesses for exclusive experiences and targeting business travelers with extended stay discounts.",
        insights: [
            "Midweek occupancy averages 71% vs 93% on weekends",
            "Business travelers represent 42% of guests but prefer weekends",
            "Revenue opportunity: $180K annually with 10% midweek improvement"
        ]
    },
    {
        question: "What's our most profitable room type?",
        answer: "The Deluxe Ocean View rooms show the highest profitability with 94.3% occupancy and $1.15M revenue. Despite having fewer units, they generate 23% more revenue per room than Standard Doubles. I recommend increasing marketing focus on these premium accommodations.",
        insights: [
            "Revenue per available room (RevPAR): $285 for Ocean View vs $198 Standard",
            "Guest satisfaction for Ocean View: 4.8/5 vs 4.4/5 overall",
            "Opportunity: Convert 3 Standard rooms to Ocean View for $320K annual increase"
        ]
    },
    {
        question: "How is our housekeeping performance?",
        answer: "Housekeeping shows excellent performance with 94.2% efficiency and 28.5-minute average cleaning time, which is 12% better than industry standard. The team completed 1,847 tasks this period. Consider implementing smart room sensors to optimize cleaning schedules further.",
        insights: [
            "Cleaning time 12% faster than industry average (32.5 minutes)",
            "Guest satisfaction with room cleanliness: 4.9/5",
            "Cost efficiency: $2.30 per room vs $2.85 industry average"
        ]
    }
];

export const generateReportInsights = (data: ReportData) => {
    const insights = [];

    // Revenue insights
    if (data.revenue.yearly.growth > 10) {
        insights.push({
            type: 'success',
            title: 'Strong Revenue Growth',
            message: `Your annual revenue growth of ${data.revenue.yearly.growth}% significantly exceeds industry average of 6-8%`,
            priority: 'high'
        });
    }

    // Occupancy insights
    if (data.occupancy.current > 85) {
        insights.push({
            type: 'success',
            title: 'Excellent Occupancy Rate',
            message: `Current occupancy of ${data.occupancy.current}% indicates strong demand and optimal pricing strategy`,
            priority: 'medium'
        });
    }

    // Operational insights
    if (data.operations.housekeeping.efficiency > 90) {
        insights.push({
            type: 'success',
            title: 'Outstanding Housekeeping Performance',
            message: `Housekeeping efficiency of ${data.operations.housekeeping.efficiency}% demonstrates operational excellence`,
            priority: 'medium'
        });
    }

    // Guest satisfaction insights
    if (data.guest.satisfaction > 4.5) {
        insights.push({
            type: 'success',
            title: 'High Guest Satisfaction',
            message: `Guest satisfaction score of ${data.guest.satisfaction}/5 positions you in the top 15% of hotels`,
            priority: 'high'
        });
    }

    return insights;
};
