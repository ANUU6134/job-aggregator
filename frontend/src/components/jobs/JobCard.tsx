// src/components/jobs/JobCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  Heart,
  Building2,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from '../../utils/formatter';

interface JobCardProps {
  job: any;
  onSave?: (jobId: string, jobData?: any) => void;
  isSaved?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

export const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onSave, 
  isSaved = false,
  variant = 'default' 
}) => {
  // Handle both formats: job.company object or direct company_name
  const companyName = job.company?.name || job.company_name || 'Unknown Company';
  const companyLogo = job.company?.logo || null;
  const companyId = job.company?.id || null;
  
  // Handle salary format
  const getSalaryDisplay = () => {
    if (job.salary) {
      return `${job.salary.currency || 'USD'} ${job.salary.min?.toLocaleString()} - ${job.salary.max?.toLocaleString()} ${job.salary.period || 'yearly'}`;
    }
    if (job.salary_min) {
      return `$${job.salary_min?.toLocaleString()} - $${job.salary_max?.toLocaleString()} yearly`;
    }
    return 'Salary not specified';
  };

  const getTimeAgo = () => {
    const date = job.posted_date || job.postedDate;
    if (!date) return 'Recently posted';
    return formatDistanceToNow(new Date(date));
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSave) {
      // Pass job data for live jobs to store in database
      onSave(job.id, {
        title: job.title,
        company_name: companyName,
        location: job.location || 'Remote',
        source_url: job.source_url || ''
      });
    }
  };

  // For compact variant
  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white dark:bg-dark-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
      >
        <Link to={`/jobs/${job.id}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{job.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{companyName}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {job.location || 'Remote'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {getTimeAgo()}
                </span>
              </div>
            </div>
            {job.ai_match_score && (
              <div className="text-right">
                <div className="text-sm font-semibold text-primary-600">{job.ai_match_score}% Match</div>
              </div>
            )}
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`bg-white dark:bg-dark-100 rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
        variant === 'featured' ? 'ring-2 ring-primary-500' : 'hover:shadow-xl'
      }`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {/* Company Logo */}
            {companyLogo ? (
              <img src={companyLogo} alt={companyName} className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            )}
            
            <div>
              <Link to={`/jobs/${job.id}`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition">
                  {job.title}
                </h3>
              </Link>
              <Link to={companyId ? `/companies/${companyId}` : '#'} className="text-gray-600 dark:text-gray-400 hover:text-primary-600">
                {companyName}
              </Link>
              
              <div className="flex flex-wrap gap-3 mt-2">
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  {job.location || 'Remote'}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Briefcase className="w-4 h-4" />
                  {job.job_type || job.jobType?.replace('-', ' ') || 'Full-time'}
                </span>
                {(job.salary || job.salary_min) && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <DollarSign className="w-4 h-4" />
                    {getSalaryDisplay()}
                  </span>
                )}
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {getTimeAgo()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {job.ai_match_score && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-600">{job.ai_match_score}% Match</span>
              </div>
            )}
            
            <button
              onClick={handleSaveClick}
              className={`p-2 rounded-full transition ${
                isSaved 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {job.description && (
          <div className="mt-4">
            <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
              {job.description.substring(0, 200)}...
            </p>
          </div>
        )}

        {job.skills && job.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {job.skills.slice(0, 3).map((skill: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                {skill}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                +{job.skills.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {job.is_remote && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                Remote
              </span>
            )}
            {job.visa_sponsorship && (
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded-full">
                Visa Sponsorship
              </span>
            )}
            {job.source && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                {job.source}
              </span>
            )}
          </div>
          
          <Link to={`/jobs/${job.id}`}>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-semibold">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};