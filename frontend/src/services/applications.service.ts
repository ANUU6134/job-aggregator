// src/services/applications.service.ts
import { api } from './api';
import type { Application } from '../types/job.types';

export const applicationsService = {
  async getApplications(): Promise<Application[]> {
    const response = await api.get('/applications');
    return response.data;
  },

    async applyToJob(applicationData: {
    job_id: string;
    cover_letter?: string;
    job_title?: string;
    company_name?: string;
    location?: string;
    source_url?: string;
  }): Promise<any> {
    const response = await api.post('/applications/apply', applicationData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  async getMyApplications(): Promise<any[]> {
    const response = await api.get('/applications/my-applications');
    return response.data;
  },

  async getApplicationById(id: string): Promise<Application> {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  async updateApplicationStatus(id: string, status: string, notes?: string): Promise<void> {
    await api.patch(`/applications/${id}`, { status, notes });
  },

    async addInterview(applicationId: string, interviewData: {
    date: string;
    type: string;
    description: string;
    interviewer?: string;
  }): Promise<void> {
    await api.post(`/applications/${applicationId}/interviews`, interviewData);
  },

  async deleteApplication(id: string): Promise<void> {
  await api.delete(`/applications/${id}`);
  },

  async addInterviewNote(applicationId: string, interviewId: string, feedback: string): Promise<void> {
    await api.post(`/applications/${applicationId}/interviews/${interviewId}/feedback`, { feedback });
  },
};