import React from 'react';
import { CheckCircle, Clock, Calendar } from 'lucide-react';

const activities = [
  { id: 1, type: 'application', title: 'Applied to Senior Frontend Developer', company: 'Google', date: '2 hours ago', icon: CheckCircle },
  { id: 2, type: 'interview', title: 'Interview scheduled with', company: 'Microsoft', date: 'Tomorrow', icon: Calendar },
  { id: 3, type: 'saved', title: 'Saved job: Backend Engineer', company: 'Amazon', date: 'Yesterday', icon: Clock },
];

export const RecentActivity: React.FC = () => {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <activity.icon className="w-4 h-4 text-primary-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
            <p className="text-xs text-gray-500">{activity.company} • {activity.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
};