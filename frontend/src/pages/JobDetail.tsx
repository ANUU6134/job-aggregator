import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, MapPin, DollarSign, Clock, Building2, 
  Share2, Bookmark, ArrowLeft, ExternalLink,
  Users, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsService } from '../services/jobs.service';
import { applicationsService } from '../services/applications.service';
import type { Job } from '../types/job.types';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';

// Helper function to format distance to now
const formatTimeAgo = (date: Date | string | undefined): string => {
  if (!date) return 'Recently';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    
    return dateObj.toLocaleDateString();
  } catch {
    return 'Recently';
  }
};

// Helper function to format salary
const formatSalaryRange = (min: number, max: number, currency: string = 'USD', period: string = 'yearly'): string => {
  return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()} /${period === 'yearly' ? 'year' : period}`;
};

// Helper function to strip HTML tags
const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  // Remove HTML tags
  const withoutTags = html.replace(/<[^>]*>/g, ' ');
  // Decode HTML entities
  const decoded = withoutTags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<p>/g, '\n\n')
    .replace(/<\/p>/g, '')
    .replace(/<br\s*\/?>/g, '\n');
  // Clean up extra whitespace
  return decoded.replace(/\s+/g, ' ').trim();
};

export const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await jobsService.getJobById(id);
      setJob(data);
      setIsSaved(data.isSaved || data.is_saved || false);
    } catch (error) {
      console.error('Failed to load job:', error);
      toast.error('Job not found');
      navigate('/jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!job) return;
    try {
      if (isSaved) {
        await jobsService.unsaveJob(job.id);
        setIsSaved(false);
        toast.success('Job removed from saved');
      } else {
        await jobsService.saveJob(job.id);
        setIsSaved(true);
        toast.success('Job saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save job');
    }
  };


  const handleApply = async () => {
    if (!job) return;
    setIsApplying(true);
    try {
      // Send job details along with the application
      const applicationData = {
        job_id: job.id,
        cover_letter: "", // You could add a cover letter input
        job_title: job.title,
        company_name: getCompanyName(),
        location: job.location || "Remote",
        source_url: getCompanyWebsite() || job.source_url
      };
      
      await applicationsService.applyToJob(applicationData);
      toast.success('Application recorded! Redirecting to company website...');
      
      // Redirect to company website
      const applyUrl = job.company?.website || job.source_url || getCompanyWebsite();
      if (applyUrl && applyUrl !== '#') {
        setTimeout(() => {
          window.open(applyUrl, '_blank', 'noopener,noreferrer');
        }, 1500);
      } else {
        toast('No external application link available.');
      }
    } catch (error: any) {
      console.error('Failed to submit application:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to record application';
      toast.error(errorMessage);
    } finally {
      setIsApplying(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  // Helper function to safely get company info
  const getCompanyName = () => {
    if (job?.company?.name) return job.company.name;
    if (job?.company_name) return job.company_name;
    return 'Company';
  };

  const getCompanyLogo = () => {
    return job?.company?.logo || null;
  };

  const getCompanyRating = () => {
    return job?.company?.rating || null;
  };

  const getCompanyDescription = () => {
    return job?.company?.description || 'No company description available.';
  };

  const getCompanySize = () => {
    return job?.company?.size || 'Not specified';
  };

  const getCompanyHeadquarters = () => {
    return job?.company?.headquarters || job?.location || 'Not specified';
  };

  const getCompanyWebsite = () => {
    return job?.company?.website || job?.source_url || null;
  };

  // Helper function to safely get job type
  const getJobTypeDisplay = () => {
    if (job?.jobType) return job.jobType.replace('-', ' ');
    if (job?.job_type) return job.job_type.replace('-', ' ');
    return 'Full-time';
  };

  // Helper function to safely get experience level
  const getExperienceLevelDisplay = () => {
    if (job?.experienceLevel) return job.experienceLevel;
    if (job?.experience_level) return job.experience_level;
    return 'Not specified';
  };

  // Helper function to safely get industry
  const getIndustryDisplay = () => {
    return job?.industry || 'Technology';
  };

  // Helper function to safely get applications count
  const getApplicationsCount = () => {
    return job?.applications || 0;
  };

  // Helper function to safely get remote status
  const isRemotePosition = () => {
    if (job?.remote === 'remote') return true;
    if (job?.remote_type === 'remote') return true;
    if (job?.is_remote) return true;
    return false;
  };

  // Helper function to safely get visa sponsorship
  const hasVisaSponsorship = () => {
    return job?.visa_sponsorship || false;
  };

  // Helper function to safely get AI match score
  const getAIMatchScore = () => {
    return job?.ai_match_score || job?.aiMatchScore || null;
  };

  // Helper function to safely get posted date
  const getPostedDateDisplay = () => {
    const date = job?.posted_date || job?.postedDate;
    return formatTimeAgo(date);
  };

  // Helper function to safely get salary
  const getSalaryDisplay = () => {
    if (job?.salary) {
      return formatSalaryRange(job.salary.min, job.salary.max, job.salary.currency, job.salary.period);
    }
    if (job?.salary_min && job?.salary_max) {
      return formatSalaryRange(job.salary_min, job.salary_max, 'USD', 'yearly');
    }
    return null;
  };

  // Helper function to render clean description without HTML
  const getCleanDescription = () => {
    if (!job?.description) return 'No description available.';
    return stripHtmlTags(job.description);
  };

  // Helper function to safely render text arrays
  const renderTextArray = (items: string[] | string | undefined) => {
    if (!items) return null;
    if (Array.isArray(items)) {
      return items.map((item: string, index: number) => (
        <li key={index} className="text-gray-600 dark:text-gray-400">
          {stripHtmlTags(item)}
        </li>
      ));
    }
    // If it's a string, split by newlines and clean HTML
    return stripHtmlTags(items).split('\n').map((item: string, index: number) => (
      <li key={index} className="text-gray-600 dark:text-gray-400">
        {item}
      </li>
    ));
  };

  if (isLoading) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to search
        </button>

        {/* Job Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {getCompanyLogo() ? (
                <img src={getCompanyLogo()!} alt={getCompanyName()} className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {job.title}
                </h1>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-600 dark:text-gray-400">{getCompanyName()}</span>
                  {getCompanyRating() && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-gray-600">{getCompanyRating()}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location || 'Remote'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {getJobTypeDisplay()}
                  </span>
                  {getSalaryDisplay() && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {getSalaryDisplay()}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Posted {getPostedDateDisplay()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleSave}
                className={`p-2 rounded-lg transition ${
                  isSaved ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            {isRemotePosition() && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold rounded-full">
                Fully Remote
              </span>
            )}
            {hasVisaSponsorship() && (
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-semibold rounded-full">
                Visa Sponsorship
              </span>
            )}
            {getAIMatchScore() && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-semibold rounded-full flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {getAIMatchScore()}% Match
              </span>
            )}
          </div>
        </motion.div>

        {/* Job Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Job Description
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <div className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {getCleanDescription().split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>

            {job.responsibilities && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Key Responsibilities
                </h2>
                <ul className="list-disc list-inside space-y-2">
                  {renderTextArray(job.responsibilities)}
                </ul>
              </motion.div>
            )}

            {job.requirements && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Requirements
                </h2>
                <ul className="list-disc list-inside space-y-2">
                  {renderTextArray(job.requirements)}
                </ul>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
            >
              <Button
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isApplying}
                onClick={handleApply}
              >
                Apply Now
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-3">
                You will be redirected to the company website to complete your application
              </p>
              {getCompanyWebsite() && getCompanyWebsite() !== '#' && (
                <p className="text-xs text-gray-400 text-center mt-2">
                  Applying via: {new URL(getCompanyWebsite()!).hostname}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Job Overview
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Job Type</span>
                  <span className="text-gray-900 dark:text-white capitalize">{getJobTypeDisplay()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Experience Level</span>
                  <span className="text-gray-900 dark:text-white capitalize">{getExperienceLevelDisplay()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Industry</span>
                  <span className="text-gray-900 dark:text-white">{getIndustryDisplay()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Applications</span>
                  <span className="text-gray-900 dark:text-white">{getApplicationsCount()}+</span>
                </div>
              </div>
            </motion.div>

            {job.skills && job.skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                About {getCompanyName()}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {stripHtmlTags(getCompanyDescription())}
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{getCompanySize()} employees</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{getCompanyHeadquarters()}</span>
                </div>
                {getCompanyWebsite() && getCompanyWebsite() !== '#' && (
                  <a
                    href={getCompanyWebsite()!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Company Website
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};