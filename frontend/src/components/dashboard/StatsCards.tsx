import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Bookmark, Calendar, Award } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    savedJobs: number;
    applications: number;
    interviews: number;
    offers: number;
    profileViews: number;
  };
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    { title: 'Saved Jobs', value: stats.savedJobs, icon: Bookmark, color: 'bg-blue-500' },
    { title: 'Applications', value: stats.applications, icon: Briefcase, color: 'bg-green-500' },
    { title: 'Interviews', value: stats.interviews, icon: Calendar, color: 'bg-purple-500' },
    { title: 'Offers', value: stats.offers, icon: Award, color: 'bg-yellow-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{card.value}</p>
            </div>
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};