import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { JobCard } from '../components/jobs/JobCard';
import { JobFilters } from '../components/jobs/JobFilters';
import { JobSearch } from '../components/jobs/JobSearch';
import { jobsService } from '../services/jobs.service';
import type { Job, JobSearchFilters } from '../types/job.types';
import { JobCardSkeleton } from '../components/common/Skeleton';
import { Button } from '../components/common/Button';
import { Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<JobSearchFilters>({
    page: 1,
    limit: 20,
    sortBy: 'relevance'
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadJobs();
  }, [filters]);

  // src/pages/Jobs.tsx - Update the loadJobs function
const loadJobs = async () => {
  setIsLoading(true);
  try {
    const response = await jobsService.searchJobs(filters);
    // Ensure each job has the required fields
    const jobsWithDefaults = response.jobs.map((job: any) => ({
      ...job,
      id: job.id || `job_${Date.now()}_${Math.random()}`,
      location: job.location || 'Remote',
      job_type: job.job_type || 'full-time',
      is_remote: job.is_remote || job.location === 'Remote',
      description: job.description || 'No description available',
      company_name: job.company_name || job.company?.name || 'Unknown Company'
    }));
    setJobs(jobsWithDefaults);
    setTotal(response.total);
  } catch (error) {
    console.error('Failed to load jobs:', error);
  } finally {
    setIsLoading(false);
  }
};

  const handleSearch = (searchParams: any) => {
    setFilters({
      ...filters,
      keyword: searchParams.keyword,
      location: searchParams.location,
      jobType: searchParams.jobType ? [searchParams.jobType] : undefined,
      page: 1
    });
  };

  const handleFilterChange = (newFilters: Partial<JobSearchFilters>) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

    // In src/pages/Jobs.tsx
  const handleSaveJob = async (jobId: string, jobData?: any) => {
  try {
    await jobsService.saveJob(jobId, jobData);
    // Update local state to show saved
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, is_saved: true, isSaved: true } : job
    ));
    toast.success('Job saved successfully');
  } catch (error) {
    console.error('Failed to save job:', error);
    toast.error('Failed to save job');
  }
};

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Find Your Next Opportunity
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {total.toLocaleString()} jobs available
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <JobSearch onSearch={handleSearch} />
        </motion.div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-20"
            >
              <JobFilters filters={filters} onFilterChange={handleFilterChange} />
            </motion.div>
          </div>

          {/* Jobs List */}
          <div className="flex-1">
            {isLoading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <JobCardSkeleton key={i} />
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <>
                <div className="space-y-4">
                  {jobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <JobCard
                        job={job}
                        onSave={handleSaveJob}
                        isSaved={job.isSaved}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {total > filters.limit && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                      disabled={filters.page === 1}
                    >
                      Previous
                    </Button>
                    <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                      Page {filters.page} of {Math.ceil(total / filters.limit)}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                      disabled={filters.page >= Math.ceil(total / filters.limit)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No jobs found. Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};