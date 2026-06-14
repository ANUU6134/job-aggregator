import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsService } from '../services/jobs.service';
import type { Job } from '../types/job.types';
import { JobCard } from '../components/jobs/JobCard';
import { JobCardSkeleton } from '../components/common/Skeleton';
import { Button } from '../components/common/Button';

export const SavedJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    setIsLoading(true);
    try {
      const data = await jobsService.getSavedJobs();
      setJobs(data);
    } catch (error) {
      console.error('Failed to load saved jobs:', error);
      toast.error('Failed to load saved jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsave = async (jobId: string) => {
    try {
      await jobsService.unsaveJob(jobId);
      setJobs(jobs.filter(job => job.id !== jobId));
      toast.success('Job removed from saved');
    } catch (error) {
      toast.error('Failed to remove job');
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Saved Jobs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {jobs.length} jobs saved
            </p>
          </div>
          <Bookmark className="w-8 h-8 text-primary-600" />
        </motion.div>

        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                <JobCard
                  job={job}
                  onSave={() => handleUnsave(job.id)}
                  isSaved={true}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No saved jobs yet
            </h3>
            <p className="text-gray-500 mb-4">
              Start saving jobs you're interested in
            </p>
            <Button onClick={() => window.location.href = '/jobs'}>
              Browse Jobs
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};