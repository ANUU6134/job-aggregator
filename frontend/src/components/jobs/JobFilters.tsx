// src/components/jobs/JobFilters.tsx
import React from 'react';
import type { JobSearchFilters, JobType, ExperienceLevel, RemoteType } from '../../types/job.types';

interface JobFiltersProps {
  filters: JobSearchFilters;
  onFilterChange: (filters: Partial<JobSearchFilters>) => void;
}

export const JobFilters: React.FC<JobFiltersProps> = ({ filters, onFilterChange }) => {
  const jobTypes: JobType[] = ['full-time', 'part-time', 'contract', 'freelance', 'internship'];
  const experienceLevels: ExperienceLevel[] = ['entry', 'mid', 'senior', 'lead', 'executive'];
  const remoteTypes: RemoteType[] = ['remote', 'hybrid', 'onsite'];

  return (
    <div className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
        Filters
      </h3>
      
      <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        {/* Job Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Job Type
          </label>
          <div className="space-y-2">
            {jobTypes.map((type) => (
              <label key={type} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.jobType?.includes(type) || false}
                  onChange={(e) => {
                    const current = filters.jobType || [];
                    const newValue = e.target.checked
                      ? [...current, type]
                      : current.filter(t => t !== type);
                    onFilterChange({ jobType: newValue });
                  }}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize group-hover:text-primary-600">
                  {type.replace('-', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Experience Level
          </label>
          <div className="space-y-2">
            {experienceLevels.map((level) => (
              <label key={level} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.experienceLevel?.includes(level) || false}
                  onChange={(e) => {
                    const current = filters.experienceLevel || [];
                    const newValue = e.target.checked
                      ? [...current, level]
                      : current.filter(l => l !== level);
                    onFilterChange({ experienceLevel: newValue });
                  }}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize group-hover:text-primary-600">
                  {level}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Remote Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Work Type
          </label>
          <div className="space-y-2">
            {remoteTypes.map((type) => (
              <label key={type} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.remote?.includes(type) || false}
                  onChange={(e) => {
                    const current = filters.remote || [];
                    const newValue = e.target.checked
                      ? [...current, type]
                      : current.filter(t => t !== type);
                    onFilterChange({ remote: newValue });
                  }}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize group-hover:text-primary-600">
                  {type}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Visa Sponsorship */}
        <div>
          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.visaSponsorship || false}
              onChange={(e) => onFilterChange({ visaSponsorship: e.target.checked })}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary-600">
              Visa Sponsorship Available
            </span>
          </label>
        </div>

        {/* Salary Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Salary Range (USD)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.salaryMin || ''}
              onChange={(e) => onFilterChange({ salaryMin: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.salaryMax || ''}
              onChange={(e) => onFilterChange({ salaryMax: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Posted Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Posted Date
          </label>
          <select
            value={filters.postedWithin || 'any'}
            onChange={(e) => onFilterChange({ postedWithin: e.target.value as any })}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="any">Any time</option>
            <option value="day">Last 24 hours</option>
            <option value="week">Last week</option>
            <option value="month">Last month</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Sort By
          </label>
          <select
            value={filters.sortBy || 'relevance'}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="relevance">Relevance</option>
            <option value="date">Latest First</option>
            <option value="salary">Highest Salary</option>
          </select>
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => onFilterChange({
            jobType: [],
            experienceLevel: [],
            remote: [],
            visaSponsorship: false,
            salaryMin: undefined,
            salaryMax: undefined,
            postedWithin: 'any',
            sortBy: 'relevance'
          })}
          className="w-full mt-4 px-4 py-2 text-sm text-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium border border-primary-600 dark:border-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950 transition"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
};