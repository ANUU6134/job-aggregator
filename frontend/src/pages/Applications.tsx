// src/pages/Applications.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, ExternalLink, 
  Briefcase, Building2, MapPin, Plus, Send, Edit2, Trash2, 
  Filter, X, Eye
} from 'lucide-react';
//import { Clock, Award, XCircle, CheckCircle } from 'lucide-react'; --- IGNORE ---
import { applicationsService } from '../services/applications.service';
import { Skeleton } from '../components/common/Skeleton';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Interview {
  id: string;
  date: string;
  type: string;
  description: string;
  interviewer?: string;
  feedback?: string;
}

interface Application {
  id: string;
  job_id: string;
  job: {
    id: string;
    title: string;
    company: {
      name: string;
    };
    location?: string;
    description?: string;
  };
  status: string;
  applied_at: string;
  notes?: string;
  cover_letter?: string;
  interviews?: Interview[];
}

type StatusFilter = 'all' | 'applied' | 'reviewing' | 'interview' | 'offer' | 'rejected';

export const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  //const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showCoverLetter, setShowCoverLetter] = useState<string | null>(null);
  const [showAddInterview, setShowAddInterview] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [newInterview, setNewInterview] = useState({
    date: '',
    type: 'phone',
    description: '',
    interviewer: ''
  });

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [statusFilter, applications]);

  const parseJobDetailsFromNotes = (notes: string): { title: string; company: string; location: string } => {
    if (!notes) return { title: 'Job Application', company: 'Unknown Company', location: '' };
    
    let title = 'Job Application';
    let company = 'Unknown Company';
    let location = '';
    
    const titleMatch = notes.match(/Title: ([^,]+)/);
    if (titleMatch) title = titleMatch[1].trim();
    
    const companyMatch = notes.match(/Company: ([^,]+)/);
    if (companyMatch) company = companyMatch[1].trim();
    
    const locationMatch = notes.match(/Location: ([^,]+)/);
    if (locationMatch) location = locationMatch[1].trim();
    
    return { title, company, location };
  };

  const filterApplications = () => {
    if (statusFilter === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === statusFilter));
    }
  };

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const data = await applicationsService.getApplications();
      const processedData = (data || []).map((app: any) => {
        if ((app.job?.id === 'live_job' || app.job_id === 'live_job') && app.notes) {
          const parsedDetails = parseJobDetailsFromNotes(app.notes);
          return {
            ...app,
            job: {
              ...app.job,
              id: app.job_id || 'live_job',
              title: parsedDetails.title,
              company: { name: parsedDetails.company },
              location: parsedDetails.location
            },
            job_id: app.job_id || 'live_job'
          };
        }
        return app;
      });
      setApplications(processedData);
      setFilteredApplications(processedData);
    } catch (error) {
      console.error('Failed to load applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = async (appId: string, newStatus: string) => {
    try {
      await applicationsService.updateApplicationStatus(appId, newStatus);
      setApplications(prev => prev.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      ));
      toast.success(`Application status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deleteApplication = async (appId: string) => {
    try {
      await applicationsService.deleteApplication(appId);
      setApplications(prev => prev.filter(app => app.id !== appId));
      setShowDeleteConfirm(null);
      toast.success('Application deleted successfully');
    } catch (error) {
      toast.error('Failed to delete application');
    }
  };

  const addInterview = async (appId: string) => {
    if (!newInterview.date) {
      toast.error('Please select an interview date');
      return;
    }
    
    try {
      await applicationsService.addInterview(appId, newInterview);
      toast.success('Interview scheduled successfully');
      setShowAddInterview(null);
      setNewInterview({ date: '', type: 'phone', description: '', interviewer: '' });
      loadApplications(); // Reload to get updated interviews
    } catch (error) {
      toast.error('Failed to schedule interview');
    }
  };

  /*
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'applied': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'reviewing': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'interview':
      case 'interviewing': return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'offer': return <Award className="w-5 h-5 text-green-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };
  */

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'applied': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'interview':
      case 'interviewing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'offer': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusCount = (status: string) => {
    if (status === 'all') return applications.length;
    return applications.filter(app => app.status === status).length;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return 'Date unknown';
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Date unknown';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Date unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Applications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your job applications ({applications.length} total)
          </p>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-100 rounded-lg shadow-sm hover:shadow-md transition"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter by Status</span>
              {statusFilter !== 'all' && (
                <span className="ml-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs rounded-full">
                  {getStatusCount(statusFilter)}
                </span>
              )}
            </button>
            
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
                Clear filter
              </button>
            )}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-dark-100 rounded-lg shadow-sm">
                  {['all', 'applied', 'reviewing', 'interview', 'offer', 'rejected'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status as StatusFilter);
                        setShowFilters(false);
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                        statusFilter === status
                          ? `${getStatusColor(status)} ring-2 ring-offset-2 ring-primary-500`
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                      <span className="ml-1 opacity-75">({getStatusCount(status)})</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-4">
            {filteredApplications.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-dark-100 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className={`h-1 ${getStatusColor(app.status).split(' ')[0]}`}></div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-5 h-5 text-primary-500" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {app.job?.title || 'Job Application'}
                        </h3>
                        {app.job?.id === 'live_job' && (
                          <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full">
                            External
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400">
                          {app.job?.company?.name || 'Unknown Company'}
                        </p>
                      </div>
                      
                      {app.job?.location && (
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-500">{app.job.location}</p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                        <span>Applied: {formatDate(app.applied_at)}</span>
                        {app.interviews && app.interviews.length > 0 && (
                          <span className="flex items-center gap-1 text-purple-600">
                            <Calendar className="w-3 h-3" />
                            Next Interview: {formatDate(app.interviews[0]?.date)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <select
                        value={app.status}
                        onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold cursor-pointer ${getStatusColor(app.status)}`}
                      >
                        <option value="applied">Applied</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="interview">Interview</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      
                      <button
                        onClick={() => setShowDeleteConfirm(app.id)}
                        className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Delete Confirmation */}
                  {showDeleteConfirm === app.id && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-300 mb-2">
                        Are you sure you want to delete this application?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => deleteApplication(app.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-3">
                    {/* View Job Details Button - Fixed to work properly */}
                    {app.job?.id !== 'live_job' && app.job_id !== 'live_job' && app.job_id !== 'unknown' && (
                      <Link 
                        to={`/jobs/${app.job_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-sm font-medium hover:bg-primary-100 transition"
                      >
                        <Eye className="w-3 h-3" />
                        View Job Details
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                    
                    {app.cover_letter && (
                      <button
                        onClick={() => setShowCoverLetter(showCoverLetter === app.id ? null : app.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                      >
                        <Edit2 className="w-3 h-3" />
                        {showCoverLetter === app.id ? 'Hide Cover Letter' : 'View Cover Letter'}
                      </button>
                    )}
                    
                    <button
                      onClick={() => setShowAddInterview(showAddInterview === app.id ? null : app.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 transition"
                    >
                      <Plus className="w-3 h-3" />
                      Schedule Interview
                    </button>
                  </div>

                  {/* Cover Letter Display */}
                  {showCoverLetter === app.id && app.cover_letter && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Cover Letter</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {app.cover_letter}
                      </p>
                    </div>
                  )}

                  {/* Add Interview Form */}
                  {showAddInterview === app.id && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Schedule New Interview</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="datetime-local"
                          value={newInterview.date}
                          onChange={(e) => setNewInterview({ ...newInterview, date: e.target.value })}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                        />
                        <select
                          value={newInterview.type}
                          onChange={(e) => setNewInterview({ ...newInterview, type: e.target.value })}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                        >
                          <option value="phone">Phone Interview</option>
                          <option value="video">Video Interview</option>
                          <option value="onsite">Onsite Interview</option>
                          <option value="technical">Technical Interview</option>
                          <option value="hr">HR Interview</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Interviewer name"
                          value={newInterview.interviewer}
                          onChange={(e) => setNewInterview({ ...newInterview, interviewer: e.target.value })}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                        />
                        <input
                          type="text"
                          placeholder="Description / Notes"
                          value={newInterview.description}
                          onChange={(e) => setNewInterview({ ...newInterview, description: e.target.value })}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                        />
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => addInterview(app.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                        >
                          <Send className="w-3 h-3 inline mr-1" />
                          Schedule
                        </button>
                        <button
                          onClick={() => setShowAddInterview(null)}
                          className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 transition text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Interviews List */}
                  {app.interviews && app.interviews.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Interviews ({app.interviews.length})
                      </h4>
                      <div className="space-y-2">
                        {app.interviews.map((interview) => (
                          <div key={interview.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium capitalize text-gray-900 dark:text-white">
                                  {interview.type || 'Interview'}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {interview.description || 'No description provided'}
                                </p>
                                {interview.interviewer && (
                                  <p className="text-xs text-gray-400 mt-2">
                                    Interviewer: {interview.interviewer}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {formatDateTime(interview.date)}
                                </p>
                                {interview.feedback && (
                                  <details className="mt-2">
                                    <summary className="text-xs text-primary-600 cursor-pointer">View Feedback</summary>
                                    <p className="text-xs text-gray-500 mt-1">{interview.feedback}</p>
                                  </details>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white dark:bg-dark-100 rounded-xl shadow-lg"
          >
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {statusFilter !== 'all' ? `No ${statusFilter} applications` : 'No applications yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {statusFilter !== 'all' 
                ? `You don't have any applications with status "${statusFilter}"`
                : 'Start applying to jobs to see them here'}
            </p>
            {statusFilter !== 'all' ? (
              <button
                onClick={() => setStatusFilter('all')}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                View All Applications
              </button>
            ) : (
              <Link to="/jobs">
                <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                  Browse Jobs
                </button>
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};