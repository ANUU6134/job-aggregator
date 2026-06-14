import { api } from './api';
import type { Job, JobSearchFilters } from '../types/job.types';

export const jobsService = {
  async searchJobs(filters: JobSearchFilters): Promise<{ jobs: Job[]; total: number; page: number; pages: number }> {
    const params = new URLSearchParams();
    
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.location) params.append('location', filters.location);
    
    params.append('page', filters.page.toString());
    params.append('limit', filters.limit.toString());
    
    // This will search live from multiple job sites
    const response = await api.get(`/jobs/search?${params.toString()}`);
    return response.data;
  },

  async getJobById(id: string): Promise<Job> {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

    // src/services/jobs.service.ts - Update the saveJob method

  async saveJob(jobId: string, jobData?: any): Promise<void> {
    // Send job data along with the ID for live jobs
    const payload = { job_id: jobId };
    if (jobData) {
      Object.assign(payload, {
        title: jobData.title,
        company_name: jobData.company_name,
        location: jobData.location,
        source_url: jobData.source_url
      });
    }
    await api.post('/jobs/save', payload);
  },

  async unsaveJob(jobId: string): Promise<void> {
    await api.delete(`/jobs/save/${jobId}`);
  },

  async getSavedJobs(): Promise<Job[]> {
    const response = await api.get('/jobs/saved');
    return response.data;
  },

  async getRecommendedJobs(limit: number = 10): Promise<Job[]> {
    const response = await api.get(`/jobs/recommended?limit=${limit}`);
    return response.data;
  },

  async getSimilarJobs(jobId: string, limit: number = 5): Promise<Job[]> {
    const response = await api.get(`/jobs/${jobId}/similar?limit=${limit}`);
    return response.data;
  },

  async applyToJob(jobId: string, coverLetter?: string, resumeFile?: File): Promise<void> {
    const formData = new FormData();
    formData.append('job_id', jobId);
    if (coverLetter) formData.append('cover_letter', coverLetter);
    if (resumeFile) formData.append('resume', resumeFile);
    
    const response = await api.post('/applications/apply', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    return response.data;
  },
};