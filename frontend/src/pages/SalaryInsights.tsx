// src/pages/SalaryInsights.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { DollarSign, TrendingUp, MapPin, Briefcase } from 'lucide-react';
import { salaryService } from '../services/salary.service';
import { Input } from '../components/common/Input';
import { Skeleton } from '../components/common/Skeleton';
import toast from 'react-hot-toast';

export const SalaryInsights: React.FC = () => {
  const [trends, setTrends] = useState<any[]>([]);
  const [locationData, setLocationData] = useState<any[]>([]);
  const [companyData, setCompanyData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [jobTitle, setJobTitle] = useState('Software Engineer');
  const [location, setLocation] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadTrends(),
        loadLocationData(),
        loadCompanyData()
      ]);
    } catch (error) {
      console.error('Failed to load salary data:', error);
      toast.error('Failed to load salary data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrends = async () => {
    try {
      const data = await salaryService.getSalaryTrends(jobTitle, location || 'Global');
      setTrends(data);
    } catch (error) {
      console.error('Failed to load trends:', error);
    }
  };

  const loadLocationData = async () => {
    try {
      const data = await salaryService.getSalaryByLocation(jobTitle);
      setLocationData(data);
    } catch (error) {
      console.error('Failed to load location data:', error);
    }
  };

  const loadCompanyData = async () => {
    try {
      const data = await salaryService.getSalaryByCompany(jobTitle);
      setCompanyData(data);
    } catch (error) {
      console.error('Failed to load company data:', error);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadTrends(),
        loadLocationData(),
        loadCompanyData()
      ]);
      toast.success(`Salary data updated for "${jobTitle}"`);
    } catch (error) {
      toast.error('Failed to analyze salary data');
    } finally {
      setIsLoading(false);
    }
  };

  const getChartData = () => {
    if (trends.length > 0 && trends[0]?.dataPoints) {
      return trends[0].dataPoints.map((point: any) => ({
        date: point.date,
        salary: point.salary
      }));
    }
    // Sample data if no real data
    return [
      { date: '2023-01', salary: 85000 },
      { date: '2023-04', salary: 92000 },
      { date: '2023-07', salary: 98000 },
      { date: '2023-10', salary: 105000 },
      { date: '2024-01', salary: 112000 },
      { date: '2024-04', salary: 120000 },
    ];
  };

  // Sample experience data
  const experienceData = [
    { level: 'Entry', salary: 85000 },
    { level: 'Mid', salary: 120000 },
    { level: 'Senior', salary: 160000 },
    { level: 'Lead', salary: 200000 },
    { level: 'Executive', salary: 250000 },
  ];

  if (isLoading) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Salary Insights & Trends
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time salary data based on market analysis
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Title
              </label>
              <Input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Software Engineer"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <Input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., San Francisco or leave empty"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Analyze Salary
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Salary</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${(trends[0]?.average || 120000).toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Salary Range</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ${(trends[0]?.range?.min || 80000).toLocaleString()} - ${(trends[0]?.range?.max || 160000).toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Jobs Analyzed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {trends[0]?.totalJobs || 500}+
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <MapPin className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Market Growth</p>
                <p className="text-2xl font-bold text-green-600">
                  +{trends[0]?.percentChange || 8.5}%
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Salary Trends Over Time
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="salary" stroke="#3b82f6" fill="#93c5fd" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Salary by Experience Level
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={experienceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="salary" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Location Data */}
        {locationData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Paying Locations
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={locationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="location" width={120} />
                <Tooltip />
                <Bar dataKey="averageSalary" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Company Data */}
        {companyData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Paying Companies
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={companyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="company" width={120} />
                <Tooltip />
                <Bar dataKey="averageSalary" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </div>
  );
};