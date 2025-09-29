'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, Users, Download, Filter } from 'lucide-react';

interface AttendanceAnalyticsProps {
  dateRange: string;
}

interface AttendanceData {
  date: string;
  service: string;
  expected: number;
  actual: number;
  percentage: number;
}

interface AttendanceTrend {
  period: string;
  average: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

const AttendanceAnalytics: React.FC<AttendanceAnalyticsProps> = ({ dateRange }) => {
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [trends, setTrends] = useState<AttendanceTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState('all');
  const [viewType, setViewType] = useState('chart');

  useEffect(() => {
    fetchAttendanceData();
  }, [dateRange, selectedService]);

  const fetchAttendanceData = async () => {
    try {
      const response = await fetch(`/api/reports/attendance?range=${dateRange}&service=${selectedService}`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data.attendance || []);
        setTrends(data.trends || []);
      }
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockAttendanceData: AttendanceData[] = [
    { date: '2025-01-05', service: 'Sunday Morning', expected: 280, actual: 245, percentage: 87.5 },
    { date: '2025-01-05', service: 'Sunday Evening', expected: 150, actual: 128, percentage: 85.3 },
    { date: '2025-01-12', service: 'Sunday Morning', expected: 280, actual: 268, percentage: 95.7 },
    { date: '2025-01-12', service: 'Sunday Evening', expected: 150, actual: 142, percentage: 94.7 },
    { date: '2025-01-19', service: 'Sunday Morning', expected: 280, actual: 251, percentage: 89.6 },
    { date: '2025-01-19', service: 'Sunday Evening', expected: 150, actual: 135, percentage: 90.0 },
    { date: '2025-01-26', service: 'Sunday Morning', expected: 280, actual: 275, percentage: 98.2 },
    { date: '2025-01-26', service: 'Sunday Evening', expected: 150, actual: 148, percentage: 98.7 }
  ];

  const mockTrends: AttendanceTrend[] = [
    { period: 'This Month', average: 92.1, change: 5.3, trend: 'up' },
    { period: 'Last Month', average: 86.8, change: -2.1, trend: 'down' },
    { period: 'Last Quarter', average: 88.9, change: 1.2, trend: 'up' },
    { period: 'Year to Date', average: 87.4, change: 3.8, trend: 'up' }
  ];

  const displayData = attendanceData.length > 0 ? attendanceData : mockAttendanceData;
  const displayTrends = trends.length > 0 ? trends : mockTrends;

  const filteredData = selectedService === 'all' 
    ? displayData 
    : displayData.filter(item => item.service === selectedService);

  const services = ['all', ...Array.from(new Set(displayData.map(item => item.service)))];

  const averageAttendance = filteredData.reduce((sum, item) => sum + item.percentage, 0) / filteredData.length;

  const exportData = () => {
    const csvContent = [
      ['Date', 'Service', 'Expected', 'Actual', 'Percentage'].join(','),
      ...filteredData.map(item => [
        item.date,
        item.service,
        item.expected.toString(),
        item.actual.toString(),
        item.percentage.toString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {services.map((service) => (
              <option key={service} value={service}>
                {service === 'all' ? 'All Services' : service}
              </option>
            ))}
          </select>
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="chart">Chart View</option>
            <option value="table">Table View</option>
          </select>
        </div>
        <button
          onClick={exportData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Data</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{averageAttendance.toFixed(1)}%</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Highest Attendance</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.max(...filteredData.map(item => item.percentage)).toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Lowest Attendance</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.min(...filteredData.map(item => item.percentage)).toFixed(1)}%
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Trends Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayTrends.map((trend, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{trend.period}</span>
                <div className={`flex items-center space-x-1 ${
                  trend.trend === 'up' ? 'text-green-600' : trend.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {trend.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : 
                   trend.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : 
                   <div className="w-4 h-1 bg-gray-400 rounded"></div>}
                  <span className="text-xs font-medium">
                    {trend.change > 0 ? '+' : ''}{trend.change}%
                  </span>
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">{trend.average}%</p>
              <p className="text-xs text-gray-500">Average attendance</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Visualization */}
      {viewType === 'chart' ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Chart</h3>
          <div className="h-64 flex items-end justify-center space-x-2">
            {filteredData.slice(-8).map((item, index) => (
              <div key={index} className="flex flex-col items-center space-y-1">
                <div
                  className="bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                  style={{ 
                    height: `${(item.percentage / 100) * 200}px`,
                    width: '40px'
                  }}
                  title={`${item.service} - ${item.percentage}%`}
                ></div>
                <span className="text-xs text-gray-600 transform rotate-45 origin-left">
                  {new Date(item.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Attendance Percentage</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Attendance Data</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.service}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.expected}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.actual}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${
                          item.percentage >= 90 ? 'text-green-600' :
                          item.percentage >= 75 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {item.percentage}%
                        </span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.percentage >= 90 ? 'bg-green-500' :
                              item.percentage >= 75 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Best Performing Periods</h4>
            <div className="space-y-2">
              {filteredData
                .sort((a, b) => b.percentage - a.percentage)
                .slice(0, 3)
                .map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {new Date(item.date).toLocaleDateString()} - {item.service}
                    </span>
                    <span className="text-sm font-medium text-green-600">{item.percentage}%</span>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Areas for Improvement</h4>
            <div className="space-y-2">
              {filteredData
                .sort((a, b) => a.percentage - b.percentage)
                .slice(0, 3)
                .map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {new Date(item.date).toLocaleDateString()} - {item.service}
                    </span>
                    <span className="text-sm font-medium text-red-600">{item.percentage}%</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceAnalytics;
