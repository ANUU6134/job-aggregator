import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa'; 

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-dark-100 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold gradient-text">JobHub</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Find your dream job with AI-powered matching and real-time insights.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <FaGithub className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <FaLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">For Job Seekers</h3>
            <ul className="space-y-2">
              <li><Link to="/jobs" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 text-sm">Browse Jobs</Link></li>
              <li><Link to="/companies" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 text-sm">Companies</Link></li>
              <li><Link to="/salary-insights" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 text-sm">Salary Insights</Link></li>
              <li><Link to="/career-advice" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 text-sm">Career Advice</Link></li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">For Employers</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 text-sm">Post a Job</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 text-sm">Pricing</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 text-sm">Talent Search</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 text-sm">Resources</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 text-sm">Help Center</Link></li>
              <li><Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 text-sm">Contact Us</Link></li>
              <li><Link to="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 text-sm">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} JobHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};