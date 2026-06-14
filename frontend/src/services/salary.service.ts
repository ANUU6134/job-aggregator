// src/services/salary.service.ts
import { api } from './api';
import type { SalaryTrend } from '../types/job.types';

export const salaryService = {
  async getSalaryTrends(jobTitle: string, location: string): Promise<SalaryTrend[]> {
    const response = await api.get(`/salary/trends?job_title=${encodeURIComponent(jobTitle)}&location=${encodeURIComponent(location)}`);
    return response.data;
  },

  async getSalaryByLocation(jobTitle: string): Promise<any[]> {
    const response = await api.get(`/salary/by-location?job_title=${encodeURIComponent(jobTitle)}`);
    return response.data;
  },

  async getSalaryByCompany(jobTitle: string): Promise<any[]> {
    const response = await api.get(`/salary/companies?job_title=${encodeURIComponent(jobTitle)}`);
    return response.data;
  },

  async getSalaryByExperience(jobTitle: string): Promise<any[]> {
    const response = await api.get(`/salary/by-experience?job_title=${encodeURIComponent(jobTitle)}`);
    return response.data;
  },
};