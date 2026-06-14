import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, MapPin, Globe } from 'lucide-react';
import { FaGithub, FaLinkedin } from "react-icons/fa";import toast from 'react-hot-toast';
import { userService } from '../services/user.service';
import type { UserProfile } from '../types/user.types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Skeleton } from '../components/common/Skeleton';

const profileSchema = z.object({
  headline: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  github: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getProfile();
      setProfile(data);
      setValue('headline', data.headline || '');
      setValue('bio', data.bio || '');
      setValue('location', data.location || '');
      setValue('phone', data.phone || '');
      setValue('github', data.github || data.github_url || '');
      setValue('linkedin', data.linkedin || data.linkedin_url || '');
      setValue('website', data.website || data.website_url || '');
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await userService.updateProfile(data);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      loadProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    try {
      await userService.uploadResume(file);
      toast.success('Resume uploaded successfully');
      loadProfile();
    } catch (error) {
      toast.error('Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-100 rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">My Profile</h1>
                <p className="text-primary-100 mt-1">Manage your professional information</p>
              </div>
              <Button
                variant="secondary"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Headline
                  </label>
                  <Input {...register('headline')} placeholder="e.g., Senior Software Engineer" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    {...register('bio')}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-200 dark:text-white"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <Input {...register('location')} placeholder="City, Country" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <Input {...register('phone')} placeholder="+1 234 567 8900" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    GitHub URL
                  </label>
                  <Input {...register('github')} placeholder="https://github.com/username" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    LinkedIn URL
                  </label>
                  <Input {...register('linkedin')} placeholder="https://linkedin.com/in/username" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Personal Website
                  </label>
                  <Input {...register('website')} placeholder="https://yourwebsite.com" />
                </div>

                <Button type="submit" fullWidth>
                  Save Changes
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Profile Info */}
                <div className="flex items-start space-x-4">
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                      <User className="w-10 h-10 text-primary-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {profile?.headline || 'Add a headline'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {profile?.bio || 'No bio added yet'}
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    {profile?.location && (
                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                        <MapPin className="w-5 h-5" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile?.phone && (
                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                        <Mail className="w-5 h-5" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                {(profile?.github || profile?.linkedin || profile?.website || 
                  profile?.github_url || profile?.linkedin_url || profile?.website_url) && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Social Links</h3>
                    <div className="space-y-3">
                      {(profile?.github || profile?.github_url) && (
                        <a href={profile?.github || profile?.github_url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-primary-600">
                          <FaGithub className="w-5 h-5" />
                          <span>GitHub</span>
                        </a>
                      )}
                      {(profile?.linkedin || profile?.linkedin_url) && (
                        <a href={profile?.linkedin || profile?.linkedin_url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-primary-600">
                          <FaLinkedin className="w-5 h-5" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                      {(profile?.website || profile?.website_url) && (
                        <a href={profile?.website || profile?.website_url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-primary-600">
                          <Globe className="w-5 h-5" />
                          <span>Portfolio</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Resume Upload */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Resume</h3>
                  {(profile?.resume || profile?.resume_url) ? (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm">Resume uploaded</span>
                      <a href={profile?.resume_url || profile?.resume || '#'} target="_blank" className="text-primary-600 text-sm">View</a>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleResumeUpload}
                        className="hidden"
                        id="resume-upload"
                      />
                      <label
                        htmlFor="resume-upload"
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer"
                      >
                        {uploadingResume ? 'Uploading...' : 'Upload Resume'}
                      </label>
                      <p className="text-xs text-gray-500 mt-2">PDF or DOCX, max 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
};