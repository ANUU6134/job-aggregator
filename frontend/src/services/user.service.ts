import { api } from './api';
import type { UserProfile } from '../types/user.types';

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/users/profile');
    return response.data;
  },

  async updateProfile(profileData: Partial<UserProfile>): Promise<void> {
    await api.put('/users/profile', profileData);
  },

  async uploadResume(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('resume', file);
    await api.post('/users/upload-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async getSkills(): Promise<string[]> {
    const response = await api.get('/users/skills');
    return response.data;
  },

  async addSkill(skill: string): Promise<void> {
    await api.post('/users/skills', { skill });
  },

  async removeSkill(skill: string): Promise<void> {
    await api.delete(`/users/skills/${skill}`);
  },
};