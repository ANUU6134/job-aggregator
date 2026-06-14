// src/pages/CompanyDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, MapPin, Briefcase, Star, Calendar, ArrowLeft, Globe } from 'lucide-react';
import { companiesService } from '../services/companies.service';
import { Skeleton } from '../components/common/Skeleton';
import toast from 'react-hot-toast';

export const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCompany();
    }
  }, [id]);

  const loadCompany = async () => {
    setIsLoading(true);
    try {
      const data = await companiesService.getCompanyById(id!);
      setCompany(data);
    } catch (error) {
      console.error('Failed to load company:', error);
      toast.error('Company not found');
      navigate('/companies');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!company) return null;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to companies
        </button>

        {/* Company Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-100 rounded-xl shadow-lg overflow-hidden mb-6"
        >
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
            <div className="flex items-center gap-4">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="w-20 h-20 rounded-xl object-cover border-4 border-white" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-white/20 flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{company.name}</h1>
                <div className="flex items-center gap-4 text-white/90">
                  {company.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{company.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {company.industry && <span>{company.industry}</span>}
                  {company.size && <span>{company.size} employees</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">About</h3>
                <p className="text-gray-600 dark:text-gray-400">{company.description}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Company Info</h3>
                <div className="space-y-2">
                  {company.headquarters && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{company.headquarters}</span>
                    </div>
                  )}
                  {company.founded && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Founded: {company.founded}</span>
                    </div>
                  )}
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-600 hover:underline">
                      <Globe className="w-4 h-4" />
                      <span>{company.website}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Open Jobs */}
        {company.jobs && company.jobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Open Positions ({company.jobs.length})
            </h2>
            <div className="space-y-3">
              {company.jobs.map((job: any) => (
                <Link key={job.id} to={`/jobs/${job.id}`}>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                        <p className="text-sm text-gray-500">{job.location}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500 capitalize">{job.job_type}</span>
                        {job.salary_min && job.salary_max && (
                          <p className="text-sm text-primary-600">
                            ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};