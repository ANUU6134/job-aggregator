// src/types/user.types.ts
import type { JobType, ExperienceLevel, SalaryRange } from './job.types';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  userId: string;
  headline?: string;
  bio?: string;
  location?: string;
  country?: string;
  phone?: string;
  skills: UserSkill[];
  experience: WorkExperience[];
  education: Education[];
  certifications: Certification[];
  resume?: string;
  resume_url?: string;
  avatar?: string;
  avatar_url?: string;
  portfolioLinks?: string[];
  github?: string;
  github_url?: string;
  linkedin?: string;
  linkedin_url?: string;
  website?: string;
  website_url?: string;
  preferredJobTypes: JobType[];
  preferredLocations: string[];
  salaryExpectation?: SalaryRange;
  visaSponsorshipRequired: boolean;
  remotePreference: 'remote' | 'hybrid' | 'onsite' | 'any';
}

export interface UserSkill {
  id?: string;
  name: string;
  skill_name?: string;
  yearsExperience?: number;
  years_experience?: number;
  proficiencyLevel?: string;
  proficiency_level?: string;
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: Date;
  start_date?: Date;
  endDate?: Date;
  end_date?: Date;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  degree: string;
  field: string;
  field_of_study?: string;
  institution: string;
  location: string;
  startDate: Date;
  start_date?: Date;
  endDate?: Date;
  end_date?: Date;
  current: boolean;
  description?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
}