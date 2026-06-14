import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Bookmark, 
  Calendar,
  TrendingUp,
  ArrowUp,
  Award
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { dashboardService } from '../services/dashboard.service';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';

interface DashboardStats {
  savedJobs: number;
  applications: number;
  interviews: number;
  offers: number;
  profileViews: number;
  applicationRate: number;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  company: string;
  date: string;
  status: string;
}

interface Recommendation {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  postedDate: string;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, activityData, recommendationsData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivity(),
        dashboardService.getRecommendations()
      ]);
      setStats(statsData);
      setRecentActivity(activityData || []);
      setRecommendations(recommendationsData || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Saved Jobs',
      value: stats?.savedJobs || 0,
      icon: Bookmark,
      color: 'bg-blue-500',
      link: '/saved-jobs'
    },
    {
      title: 'Applications',
      value: stats?.applications || 0,
      icon: Briefcase,
      color: 'bg-green-500',
      link: '/applications',
      change: stats?.applicationRate ? `${stats.applicationRate}% rate` : null
    },
    {
      title: 'Interviews',
      value: stats?.interviews || 0,
      icon: Calendar,
      color: 'bg-purple-500',
      link: '/applications'
    },
    {
      title: 'Offers',
      value: stats?.offers || 0,
      icon: Award,
      color: 'bg-yellow-500',
      link: '/applications'
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <Briefcase className="w-4 h-4 text-blue-500" />;
      case 'saved':
        return <Bookmark className="w-4 h-4 text-green-500" />;
      default:
        return <Calendar className="w-4 h-4 text-purple-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'interview':
      case 'interviewing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'offer':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Here's what's happening with your job search today.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))
          ) : (
            statCards.map((stat, index) => (
              <Link to={stat.link} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      {stat.change && (
                        <div className="flex items-center mt-2">
                          <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-500">{stat.change}</span>
                        </div>
                      )}
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))
          )}
        </div>

        {/* Recent Activity and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-gray-700 rounded-lg">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.company}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
                        {activity.status || activity.type}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent activity</p>
                <Link to="/jobs">
                  <Button variant="outline" size="sm" className="mt-3">
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Recommended Jobs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recommended for You
            </h3>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.slice(0, 5).map((job) => (
                  <Link key={job.id} to={`/jobs/${job.id}`}>
                    <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{job.title}</h4>
                          <p className="text-sm text-gray-500">{job.company}</p>
                          <p className="text-xs text-gray-400 mt-1">{job.location}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-green-600">{job.matchScore}% Match</span>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(job.postedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recommendations yet</p>
                <p className="text-xs text-gray-400 mt-2">Start saving jobs to get personalized recommendations</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/jobs">
            <div className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all">
              <Briefcase className="w-12 h-12 text-primary-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Browse Jobs</h3>
              <p className="text-sm text-gray-500 mt-1">Find your next opportunity</p>
            </div>
          </Link>
          <Link to="/profile">
            <div className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all">
              <Bookmark className="w-12 h-12 text-primary-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Update Profile</h3>
              <p className="text-sm text-gray-500 mt-1">Improve your match rate</p>
            </div>
          </Link>
          <Link to="/applications">
            <div className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all">
              <Calendar className="w-12 h-12 text-primary-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Track Applications</h3>
              <p className="text-sm text-gray-500 mt-1">Monitor your progress</p>
            </div>
          </Link>
        </div>

        {/* AI Insights */}
        {stats && stats.applicationRate > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">AI Career Insights</h3>
                <p className="opacity-90">
                  {stats.savedJobs > 0 && stats.applications === 0 && (
                    <>You've saved {stats.savedJobs} jobs but haven't applied yet. Start applying to increase your chances!</>
                  )}
                  {stats.applications > 0 && stats.interviews === 0 && (
                    <>You've submitted {stats.applications} applications. Consider tailoring your resume to each job for better response rates.</>
                  )}
                  {stats.interviews > 0 && stats.offers === 0 && (
                    <>Great job on getting {stats.interviews} interviews! Practice common questions to convert them into offers.</>
                  )}
                  {stats.offers > 0 && (
                    <>Congratulations on your offers! Compare compensation, benefits, and growth opportunities before deciding.</>
                  )}
                  {stats.savedJobs === 0 && stats.applications === 0 && (
                    <>Start by saving jobs that match your skills. We'll recommend the best opportunities for you!</>
                  )}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 opacity-75" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};