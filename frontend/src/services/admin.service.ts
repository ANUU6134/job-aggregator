import { api } from './api';

export const adminService = {
  async getStats(): Promise<any> {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  async getUsers(page: number = 1, limit: number = 20): Promise<any> {
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  async updateUserRole(userId: string, role: string): Promise<void> {
    await api.patch(`/admin/users/${userId}/role`, { role });
  },

  async banUser(userId: string): Promise<void> {
    await api.post(`/admin/users/${userId}/ban`);
  },

  async runScrapers(): Promise<void> {
    await api.post('/admin/scrapers/run');
  },

  async getScrapingLogs(): Promise<any[]> {
    const response = await api.get('/admin/scraping-logs');
    return response.data;
  },
};