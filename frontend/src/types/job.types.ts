// Job Type Definitions
export type JobType = 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
export type RemoteType = 'remote' | 'hybrid' | 'onsite';
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
export type JobSource = 'linkedin' | 'indeed' | 'glassdoor' | 'wellfound' | 'remoteok' | 'weworkremotely' | 'angellist' | 'monster' | 'careerjet' | 'ziprecruiter' | 'flexjobs' | 'dice' | 'direct';
export type ApplicationStatus = 'applied' | 'reviewing' | 'interview' | 'assessment' | 'offer' | 'accepted' | 'rejected';

// Social Links Interface
export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
  facebook?: string;
  instagram?: string;
}

// Salary Range Interface
export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
}

// Salary Interface
export interface Salary {
  min: number;
  max: number;
  currency: string;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
}

// Company Interface
export interface Company {
  id: string;
  name: string;
  logo?: string;
  description: string;
  website: string;
  industry: string;
  size: CompanySize;
  founded?: number;
  headquarters: string;
  socialLinks?: SocialLinks;
  openJobs: number;
  rating?: number;
  reviews?: number;
}

// src/types/job.types.ts - Add optional fields for live search results
export interface Job {
  id: string;
  title: string;
  company?: {
    id?: string;
    name: string;
    logo?: string;
    description?: string;
    headquarters?: string;
    size?: string;
    rating?: number;
    website?: string;
  };
  company_name?: string; // For live search results
  description: string;
  requirements?: string[] | string;
  responsibilities?: string[] | string;
  location: string;
  country?: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  salary_min?: number; // For live search results
  salary_max?: number; // For live search results
  job_type?: string;
  jobType?: JobType;
  experience_level?: string;
  experienceLevel?: ExperienceLevel;
  industry?: string;
  remote_type?: string;
  remote?: RemoteType;
  is_remote?: boolean;
  posted_date?: string;
  postedDate?: Date;
  skills?: string[];
  source?: string;
  source_url?: string;
  views?: number;
  applications?: number;
  is_active?: boolean;
  is_featured?: boolean;
  visa_sponsorship?: boolean;
  ai_match_score?: number;
  aiMatchScore?: number;
  is_saved?: boolean;
  isSaved?: boolean;
}

// Salary Trend Data Point
export interface SalaryDataPoint {
  date: Date;
  salary: number;
  count: number;
}

// Salary Trend Interface
export interface SalaryTrend {
  jobTitle: string;
  location: string;
  average: number;
  median: number;
  range: SalaryRange;
  trend: 'increasing' | 'decreasing' | 'stable';
  percentChange: number;
  dataPoints: SalaryDataPoint[];
}

// Job Search Filters
export interface JobSearchFilters {
  keyword?: string;
  company?: string;
  location?: string;
  country?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType?: JobType[];
  experienceLevel?: ExperienceLevel[];
  industry?: string[];
  remote?: RemoteType[];
  postedWithin?: 'day' | 'week' | 'month' | 'any';
  visaSponsorship?: boolean;
  page: number;
  limit: number;
  sortBy?: 'relevance' | 'date' | 'salary' | 'match';
}

// Saved Job Interface
export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  job: Job;
  savedAt: Date;
  notes?: string;
  status: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected';
}

// Interview Interface
export interface Interview {
  id: string;
  date: Date;
  type: 'phone' | 'video' | 'onsite' | 'technical' | 'hr';
  description: string;
  interviewer?: string;
  feedback?: string;
}

// Offer Interface
export interface Offer {
  salary?: number;
  equity?: number;
  benefits?: string;
  startDate?: Date;
  expiresAt: Date;
  accepted?: boolean;
}

// Application Event Interface
export interface ApplicationEvent {
  id: string;
  date: Date;
  status: ApplicationStatus;
  note?: string;
}

// Application Interface
export interface Application {
  id: string;
  userId: string;
  jobId: string;
  job: Job;
  appliedAt: Date;
  status: ApplicationStatus;
  notes?: string;
  interviews: Interview[];
  offers?: Offer[];
  timeline: ApplicationEvent[];
}