import { api } from './api';

export const dashboardService = {
  async getStats(): Promise<any> {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  async getRecentActivity(): Promise<any[]> {
    const response = await api.get('/dashboard/activity');
    return response.data;
  },

  async getRecommendations(): Promise<any[]> {
    const response = await api.get('/dashboard/recommendations');
    return response.data;
  },

  async getActivityChart(days: number = 30): Promise<any[]> {
    const response = await api.get(`/dashboard/activity/chart?days=${days}`);
    return response.data;
  },
};