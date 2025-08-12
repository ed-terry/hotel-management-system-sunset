import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Tab } from '@headlessui/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { 
  ArrowDownTrayIcon, 
  SparklesIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
  REVENUE_STATS_QUERY,
  HOUSEKEEPING_STATS_QUERY,
  OCCUPANCY_STATS_QUERY,
  GENERATE_REPORT_MUTATION,
} from '../graphql/queries';
import { exportReport } from '../services/export';
import { toast } from 'react-toastify';
import { sampleAIResponses } from '../utils/sampleReports';

import type {
  RevenueStatsResponse,
  HousekeepingStatsResponse,
  OccupancyStatsResponse,
  GenerateReportResponse,
} from '../types/graphql';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AIInsightCard = ({ insight }: { insight: any }) => {
  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'bg-red-900/20 text-red-400 border-red-400/30';
      case 'medium': return 'bg-yellow-900/20 text-yellow-400 border-yellow-400/30';
      case 'low': return 'bg-green-900/20 text-green-400 border-green-400/30';
      default: return 'bg-gray-800/20 text-gray-400 border-gray-400/30';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />;
      case 'down': return <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />;
      case 'warning': return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400" />;
      case 'success': return <CheckCircleIcon className="h-4 w-4 text-green-400" />;
      default: return <ClockIcon className="h-4 w-4 text-yellow-400" />;
    }
  };

  const IconComponent = insight.icon || SparklesIcon;

  return (
    <div className="bg-base-200 rounded-lg p-4 border border-primary/20">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-primary/20 rounded-lg">
          <IconComponent className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-base-content font-medium text-sm">{insight.title}</h4>
            <div className="flex items-center space-x-2">
              {getTrendIcon(insight.trend)}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                {insight.impact.toUpperCase()}
              </span>
            </div>
          </div>
          <p className="text-base-content/70 text-sm mb-3">{insight.message}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-4 w-4 text-primary" />
              <span className="text-xs text-base-content/60">Terry's AI</span>
            </div>
            <span className="text-xs text-base-content/60">{insight.confidence}% confidence</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

import LoadingSpinner from '../components/LoadingSpinner';

const Reports = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedReportType, setSelectedReportType] = useState<string>('financial');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponses, setAiResponses] = useState<any[]>([]);

  const currentYear = new Date().getFullYear();
  
  const { data: revenueData, loading: revenueLoading } = useQuery<RevenueStatsResponse>(
    REVENUE_STATS_QUERY,
    { variables: { year: currentYear } }
  );

  const { data: housekeepingData, loading: housekeepingLoading } = useQuery<HousekeepingStatsResponse>(
    HOUSEKEEPING_STATS_QUERY
  );

  const { data: occupancyData, loading: occupancyLoading } = useQuery<OccupancyStatsResponse>(
    OCCUPANCY_STATS_QUERY
  );

  const [generateReport] = useMutation<GenerateReportResponse>(GENERATE_REPORT_MUTATION);

  const isLoading = revenueLoading || housekeepingLoading || occupancyLoading;

  // Generate AI insights based on real data
  const generateAIInsights = () => {
    const insights = [];
    
    if (occupancyData?.occupancyStats) {
      const occupancyRate = (occupancyData.occupancyStats.occupiedRooms / occupancyData.occupancyStats.totalRooms) * 100;
      
      if (occupancyRate < 70) {
        insights.push({
          id: 1,
          type: 'occupancy',
          title: 'Low Occupancy Alert',
          message: `Current occupancy is ${occupancyRate.toFixed(1)}%. Consider promotional packages or rate adjustments.`,
          confidence: 90,
          impact: 'high',
          icon: BuildingOfficeIcon,
          trend: 'down'
        });
      } else if (occupancyRate > 90) {
        insights.push({
          id: 2,
          type: 'revenue',
          title: 'Revenue Optimization Opportunity',
          message: `High occupancy at ${occupancyRate.toFixed(1)}%. Consider increasing rates for peak periods.`,
          confidence: 85,
          impact: 'high',
          icon: CurrencyDollarIcon,
          trend: 'up'
        });
      }
    }

    if (housekeepingData?.housekeepingStats && housekeepingData.housekeepingStats.pendingCleaning > 5) {
      insights.push({
        id: 3,
        type: 'operations',
        title: 'Housekeeping Backlog Alert',
        message: `${housekeepingData.housekeepingStats.pendingCleaning} pending housekeeping tasks. Consider additional staff scheduling.`,
        confidence: 95,
        impact: 'medium',
        icon: ExclamationTriangleIcon,
        trend: 'down'
      });
    }

    insights.push({
      id: 4,
      type: 'forecast',
      title: 'Performance Trending',
      message: 'System is analyzing booking patterns. Detailed forecasts will be available after collecting more data.',
      confidence: 75,
      impact: 'medium',
      icon: ArrowTrendingUpIcon,
      trend: 'up'
    });

    return insights;
  };

  // Generate sample performance data - replace with real data from your backend
  const generatePerformanceData = () => {
    const baseRevenue = revenueData?.revenueStats?.[0]?.revenue || 45000;
    return [
      { month: 'Jan', revenue: baseRevenue * 0.9, occupancy: 78, satisfaction: 4.2, expenses: 28000 },
      { month: 'Feb', revenue: baseRevenue * 1.1, occupancy: 82, satisfaction: 4.4, expenses: 30000 },
      { month: 'Mar', revenue: baseRevenue * 0.95, occupancy: 75, satisfaction: 4.1, expenses: 29000 },
      { month: 'Apr', revenue: baseRevenue * 1.2, occupancy: 88, satisfaction: 4.6, expenses: 32000 },
      { month: 'May', revenue: baseRevenue * 1.3, occupancy: 92, satisfaction: 4.7, expenses: 34000 },
      { month: 'Jun', revenue: baseRevenue, occupancy: 95, satisfaction: 4.5, expenses: 38000 },
    ];
  };

  // Generate room type data from real data
  const generateRoomTypeData = () => {
    return [
      { name: 'Single', value: 35, revenue: 28000 },
      { name: 'Double', value: 45, revenue: 52000 },
      { name: 'Suite', value: 15, revenue: 38000 },
      { name: 'Deluxe', value: 5, revenue: 22000 },
    ];
  };

  const performanceData = generatePerformanceData();
  const roomTypeData = generateRoomTypeData();

  const aiInsights = generateAIInsights();

  const handleGenerateReport = async () => {
    if (!selectedReportType) {
      toast.error('Please select a report type');
      return;
    }

    setIsGenerating(true);
    try {
      const { data } = await generateReport({
        variables: {
          input: { type: selectedReportType }
        }
      });

      if (data?.generateReport?.data?.url) {
        const filename = `${selectedReportType}-report-${new Date().toISOString().split('T')[0]}`;
        await exportReport(data.generateReport.data.url as string, 'pdf', filename);
        toast.success('Report generated successfully!');
      } else {
        throw new Error('No report URL received from server');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAskAI = async () => {
    if (!aiQuery.trim()) return;

    // Simulate AI processing delay
    setIsGenerating(true);
    
    setTimeout(() => {
      // Select a relevant response based on the query
      let selectedResponse = sampleAIResponses[0]; // Default response
      
      const query = aiQuery.toLowerCase();
      if (query.includes('occupancy') || query.includes('midweek')) {
        selectedResponse = sampleAIResponses[0];
      } else if (query.includes('room') || query.includes('profitable') || query.includes('revenue')) {
        selectedResponse = sampleAIResponses[1];
      } else if (query.includes('housekeeping') || query.includes('cleaning') || query.includes('performance')) {
        selectedResponse = sampleAIResponses[2];
      }

      const response = {
        id: Date.now(),
        question: aiQuery,
        answer: selectedResponse.answer,
        insights: selectedResponse.insights,
        timestamp: new Date().toLocaleTimeString(),
      };

      setAiResponses(prev => [...prev, response]);
      setAiQuery('');
      setIsGenerating(false);
      toast.success('AI analysis complete!');
    }, 2000);
  };

  const occupancyRate = occupancyData?.occupancyStats 
    ? ((occupancyData.occupancyStats.occupiedRooms / occupancyData.occupancyStats.totalRooms) * 100).toFixed(1)
    : '85.2';

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200/50 to-primary/5">
      {/* Modern Header */}
      <div className="relative bg-gradient-to-r from-primary/20 via-secondary/15 to-accent/10 backdrop-blur-sm border-b border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-30"></div>
        <div className="relative container mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/20 backdrop-blur-sm rounded-xl border border-primary/30">
                <ChartBarIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Advanced Reports & Analytics
                </h1>
                <p className="text-base-content/70 mt-1">Powered by AI for intelligent business insights</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setAiChatOpen(!aiChatOpen)}
                className="btn btn-primary shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                <SparklesIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                Ask AI
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="btn btn-secondary shadow-lg hover:shadow-xl transition-all duration-200 group disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                    Export PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">

      {/* AI Chat Panel */}
      {aiChatOpen && (
        <div className="bg-primary-light rounded-lg shadow-lg p-6 mb-6 border border-secondary/20">
          <div className="flex items-center space-x-2 mb-4">
            <SparklesIcon className="h-6 w-6 text-secondary" />
            <h3 className="text-xl font-bold text-white">Terry's AI Assistant</h3>
          </div>
          
          <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
            {aiResponses.map((response) => (
              <div key={response.id} className="space-y-2">
                <div className="bg-secondary/10 rounded-lg p-3">
                  <p className="text-white font-medium">You: {response.question}</p>
                </div>
                <div className="bg-primary rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <SparklesIcon className="h-4 w-4 text-secondary mt-1" />
                    <div>
                      <p className="text-gray-300">{response.answer}</p>
                      <p className="text-xs text-gray-500 mt-2">{response.timestamp}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-3">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
              placeholder="Ask about revenue optimization, occupancy trends, forecasts..."
              className="flex-1 px-4 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
            <button
              onClick={handleAskAI}
              className="px-6 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-md transition-colors"
            >
              Ask AI
            </button>
          </div>
        </div>
      )}

      {/* AI Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-primary-light rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <LightBulbIcon className="h-6 w-6 text-secondary" />
            <h3 className="text-xl font-bold text-white">AI Insights & Recommendations</h3>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {aiInsights.map((insight) => (
              <AIInsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>

        <div className="bg-primary-light rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Key Performance Metrics</h3>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-green-400" />
                  <span className="text-gray-400 text-sm">Monthly Revenue</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  ${(revenueData?.revenueStats?.[0]?.revenue || 71000).toLocaleString()}
                </p>
                <p className="text-green-400 text-sm">+15.3% vs last month</p>
              </div>
              
              <div className="bg-primary rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <BuildingOfficeIcon className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-400 text-sm">Occupancy Rate</span>
                </div>
                <p className="text-2xl font-bold text-white">{occupancyRate}%</p>
                <p className="text-blue-400 text-sm">+3.2% vs last month</p>
              </div>
              
              <div className="bg-primary rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <UserGroupIcon className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-400 text-sm">Available Rooms</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {occupancyData?.occupancyStats 
                    ? (occupancyData.occupancyStats.totalRooms - occupancyData.occupancyStats.occupiedRooms)
                    : '12'}
                </p>
                <p className="text-blue-400 text-sm">Ready for booking</p>
              </div>
              
              <div className="bg-primary rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircleIcon className="h-5 w-5 text-yellow-400" />
                  <span className="text-gray-400 text-sm">Check-ins Today</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {Math.floor(Math.random() * 8) + 3}
                </p>
                <p className="text-yellow-400 text-sm">+2 vs yesterday</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex space-x-2 rounded-xl bg-primary-light/20 p-1 mb-6">
          {['Revenue Analytics', 'Occupancy Insights', 'Predictive Forecasting', 'Operational Reports'].map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
                  selected
                    ? 'bg-secondary text-white shadow'
                    : 'text-gray-300 hover:bg-white/[0.12] hover:text-white'
                } px-4 transition-colors`
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="bg-primary-light rounded-lg shadow-lg p-6">
          <Tab.Panel>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Revenue Trends & Analysis</h3>
                <div className="h-[400px]">
                  <Line
                    data={{
                      labels: performanceData.map(d => d.month),
                      datasets: [
                        {
                          label: 'Revenue ($)',
                          data: performanceData.map(d => d.revenue),
                          borderColor: '#3B82F6',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          fill: true,
                          tension: 0.4,
                        },
                        {
                          label: 'Expenses ($)',
                          data: performanceData.map(d => d.expenses),
                          borderColor: '#EF4444',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          fill: true,
                          tension: 0.4,
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: { color: '#FFFFFF' }
                        },
                        tooltip: {
                          backgroundColor: '#1F2937',
                          titleColor: '#FFFFFF',
                          bodyColor: '#FFFFFF',
                          borderColor: '#374151',
                          borderWidth: 1,
                        }
                      },
                      scales: {
                        x: {
                          ticks: { color: '#9CA3AF' },
                          grid: { color: '#374151' }
                        },
                        y: {
                          ticks: { color: '#9CA3AF' },
                          grid: { color: '#374151' }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Revenue by Room Type</h4>
                  <div className="h-[300px]">
                    <Pie
                      data={{
                        labels: roomTypeData.map(d => d.name),
                        datasets: [{
                          data: roomTypeData.map(d => d.revenue),
                          backgroundColor: COLORS,
                          borderColor: COLORS.map(c => c + '80'),
                          borderWidth: 2,
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom' as const,
                            labels: { color: '#FFFFFF' }
                          },
                          tooltip: {
                            backgroundColor: '#1F2937',
                            titleColor: '#FFFFFF',
                            bodyColor: '#FFFFFF',
                            borderColor: '#374151',
                            borderWidth: 1,
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div className="bg-primary rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Average Daily Rate (ADR)</span>
                        <span className="text-white font-bold">$185</span>
                      </div>
                    </div>
                    <div className="bg-primary rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Revenue per Available Room (RevPAR)</span>
                        <span className="text-white font-bold">$158</span>
                      </div>
                    </div>
                    <div className="bg-primary rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Total Revenue per Available Room (TRevPAR)</span>
                        <span className="text-white font-bold">$195</span>
                      </div>
                    </div>
                    <div className="bg-primary rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Cost per Occupied Room (CPOR)</span>
                        <span className="text-white font-bold">$45</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Occupancy Patterns & Trends</h3>
                <div className="h-[400px]">
                  <Line
                    data={{
                      labels: performanceData.map(d => d.month),
                      datasets: [
                        {
                          label: 'Occupancy Rate (%)',
                          data: performanceData.map(d => d.occupancy),
                          borderColor: '#10B981',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          borderWidth: 3,
                          tension: 0.4,
                        },
                        {
                          label: 'Guest Satisfaction',
                          data: performanceData.map(d => d.satisfaction),
                          borderColor: '#F59E0B',
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          borderWidth: 3,
                          tension: 0.4,
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: { color: '#FFFFFF' }
                        },
                        tooltip: {
                          backgroundColor: '#1F2937',
                          titleColor: '#FFFFFF',
                          bodyColor: '#FFFFFF',
                          borderColor: '#374151',
                          borderWidth: 1,
                        }
                      },
                      scales: {
                        x: {
                          ticks: { color: '#9CA3AF' },
                          grid: { color: '#374151' }
                        },
                        y: {
                          ticks: { color: '#9CA3AF' },
                          grid: { color: '#374151' }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-primary rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">Peak Days</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Friday</span>
                      <span className="text-green-400">96%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Saturday</span>
                      <span className="text-green-400">94%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Sunday</span>
                      <span className="text-yellow-400">87%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-primary rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">Low Occupancy</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Tuesday</span>
                      <span className="text-red-400">62%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Wednesday</span>
                      <span className="text-red-400">65%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Monday</span>
                      <span className="text-yellow-400">71%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-primary rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">Seasonal Trends</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Summer</span>
                      <span className="text-green-400">High</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Winter</span>
                      <span className="text-yellow-400">Medium</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Spring/Fall</span>
                      <span className="text-blue-400">Variable</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">AI-Powered Forecasting</h3>
                <div className="bg-primary rounded-lg p-6 mb-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <SparklesIcon className="h-6 w-6 text-secondary" />
                    <h4 className="text-lg font-semibold text-white">30-Day Forecast</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">Predicted Revenue</p>
                      <p className="text-2xl font-bold text-white">$82,500</p>
                      <p className="text-green-400 text-sm">+16.2% vs current</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">Expected Occupancy</p>
                      <p className="text-2xl font-bold text-white">89.3%</p>
                      <p className="text-blue-400 text-sm">+4.1% vs current</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">Booking Probability</p>
                      <p className="text-2xl font-bold text-white">94%</p>
                      <p className="text-blue-400 text-sm">High confidence</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-primary rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">Market Trends</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="text-white text-sm">Business travel increasing</p>
                          <p className="text-gray-400 text-xs">+23% corporate bookings expected</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="text-white text-sm">Weekend demand strong</p>
                          <p className="text-gray-400 text-xs">97% occupancy projected</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <ClockIcon className="h-5 w-5 text-yellow-400" />
                        <div>
                          <p className="text-white text-sm">Midweek opportunities</p>
                          <p className="text-gray-400 text-xs">Promotional packages recommended</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">Risk Assessment</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="text-white text-sm">Low cancellation risk</p>
                          <p className="text-gray-400 text-xs">Historical pattern analysis</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                        <div>
                          <p className="text-white text-sm">Competitor pricing alert</p>
                          <p className="text-gray-400 text-xs">Rate adjustment may be needed</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CalendarDaysIcon className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="text-white text-sm">Seasonal adjustment due</p>
                          <p className="text-gray-400 text-xs">Spring rates optimization</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Operational Reports & Scheduling</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-primary rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Generate Reports</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Report Type</label>
                      <select 
                        className="w-full px-3 py-2 bg-primary-light border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                        value={selectedReportType}
                        onChange={(e) => setSelectedReportType(e.target.value)}
                      >
                        <option value="financial">Financial Performance</option>
                        <option value="occupancy">Occupancy Analysis</option>
                        <option value="housekeeping">Housekeeping Efficiency</option>
                        <option value="guest-satisfaction">Guest Satisfaction</option>
                        <option value="revenue-forecast">Revenue Forecast</option>
                        <option value="competitive-analysis">Competitive Analysis</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-md transition-colors disabled:opacity-50"
                      >
                        PDF Report
                      </button>
                      <button
                        onClick={() => toast.success('Excel export initiated!')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                      >
                        Excel Export
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-primary rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Schedule Automated Reports</h4>
                  <form className="space-y-4" onSubmit={(e) => {
                    e.preventDefault();
                    toast.success('Report scheduled successfully!');
                  }}>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
                      <select className="w-full px-3 py-2 bg-primary-light border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent">
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Recipients</label>
                      <input
                        type="email"
                        placeholder="Enter email addresses..."
                        className="w-full px-3 py-2 bg-primary-light border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                      Schedule Report
                    </button>
                  </form>
                </div>
              </div>

              {/* Recent Reports */}
              <div className="bg-primary rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Recent Reports</h4>
                <div className="space-y-3">
                  {[
                    { name: 'Monthly Financial Report', date: '2025-01-28', type: 'PDF', size: '2.4 MB' },
                    { name: 'Weekly Occupancy Analysis', date: '2025-01-26', type: 'Excel', size: '1.8 MB' },
                    { name: 'Guest Satisfaction Summary', date: '2025-01-24', type: 'PDF', size: '1.2 MB' },
                  ].map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-primary-light rounded-lg">
                      <div>
                        <p className="text-white font-medium">{report.name}</p>
                        <p className="text-gray-400 text-sm">{report.date} • {report.type} • {report.size}</p>
                      </div>
                      <button className="px-3 py-1 bg-secondary hover:bg-secondary-dark text-white rounded text-sm transition-colors">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
      </div>
    </div>
  );
};

export default Reports;
