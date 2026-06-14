// src/services/companies.service.ts
import { api } from './api';
import type { Company } from '../types/job.types';

export const companiesService = {
  async getCompanies(industry?: string): Promise<Company[]> {
    const url = industry ? `/companies?industry=${encodeURIComponent(industry)}` : '/companies';
    const response = await api.get(url);
    return response.data;
  },

  async getCompanyById(id: string): Promise<Company> {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },

  async getCompanyJobs(companyId: string): Promise<any[]> {
    const response = await api.get(`/companies/${companyId}/jobs`);
    return response.data;
  },
};