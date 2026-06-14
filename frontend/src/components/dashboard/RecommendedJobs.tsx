import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const recommendations = [
  { id: 1, title: 'Senior Frontend Developer', company: 'Stripe', location: 'Remote', matchScore: 95 },
  { id: 2, title: 'React Engineer', company: 'Shopify', location: 'San Francisco, CA', matchScore: 88 },
  { id: 3, title: 'Full Stack Developer', company: 'Airbnb', location: 'New York, NY', matchScore: 82 },
];

export const RecommendedJobs: React.FC = () => {
  return (
    <div className="space-y-4">
      {recommendations.map((job) => (
        <Link key={job.id} to={`/jobs/${job.id}`} className="block">
          <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{job.title}</h4>
                <p className="text-sm text-gray-500">{job.company}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <MapPin className="w-3 h-3" />
                  {job.location}
                </div>
              </div>
              <div className="text-sm font-semibold text-green-600">{job.matchScore}%</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};