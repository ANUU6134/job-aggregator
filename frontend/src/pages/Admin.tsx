import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, Activity, AlertTriangle, RefreshCw, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../services/admin.service';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';

interface AdminStats {
  totalUsers: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  scrapersRunning: boolean;
  lastScrapeTime: string;
}

export const Admin: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScraping, setIsScraping] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load admin stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunScrapers = async () => {
    setIsScraping(true);
    try {
      await adminService.runScrapers();
      toast.success('Scrapers started successfully');
      setTimeout(() => loadStats(), 5000);
    } catch (error) {
      toast.error('Failed to start scrapers');
    } finally {
      setIsScraping(false);
    }
  };

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
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and monitor the platform
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalJobs}</p>
              </div>
              <Briefcase className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.activeJobs}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Applications</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalApplications}</p>
              </div>
              <Eye className="w-8 h-8 text-orange-500" />
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Scraper Management
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded-full text-sm ${stats?.scrapersRunning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {stats?.scrapersRunning ? 'Running' : 'Idle'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Scrape</span>
                <span className="text-gray-900 dark:text-white">
                  {stats?.lastScrapeTime ? new Date(stats.lastScrapeTime).toLocaleString() : 'Never'}
                </span>
              </div>
              <Button
                onClick={handleRunScrapers}
                isLoading={isScraping}
                fullWidth
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Run Scrapers Now
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              System Health
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Database</span>
                <span className="text-green-600">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Redis</span>
                <span className="text-green-600">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">API Status</span>
                <span className="text-green-600">Operational</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Issues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Scraping Issues
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Rate limit hit on LinkedIn</p>
                <p className="text-xs text-yellow-600">2 hours ago</p>
              </div>
              <Button variant="ghost" size="sm">Retry</Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};