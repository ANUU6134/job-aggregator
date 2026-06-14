// src/pages/Terms.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, Scale, Lock, Users, AlertCircle } from 'lucide-react';

export const Terms: React.FC = () => {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
              <Scale className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Terms of Use
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-8 space-y-8"
        >
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              By accessing and using JobHub ("we", "us", "our"), you agree to be bound by these Terms of Use. 
              If you do not agree to these terms, please do not use our platform. These terms apply to all users, 
              including job seekers, employers, and visitors.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. User Accounts</h2>
            </div>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p>• You must be at least 16 years old to create an account</p>
              <p>• You are responsible for maintaining the confidentiality of your account credentials</p>
              <p>• You agree to provide accurate and complete information when creating your account</p>
              <p>• You are solely responsible for all activities that occur under your account</p>
              <p>• You must notify us immediately of any unauthorized use of your account</p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. Job Listings and Applications</h2>
            </div>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p>• Job listings are provided by third-party sources and employers</p>
              <p>• We do not guarantee the accuracy, completeness, or timeliness of job listings</p>
              <p>• Job applications are submitted directly to employers or third-party platforms</p>
              <p>• We are not responsible for hiring decisions made by employers</p>
              <p>• You should exercise caution when sharing personal information with employers</p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">4. User Conduct</h2>
            </div>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p>You agree not to:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Post false, inaccurate, or misleading information</li>
                <li>Impersonate any person or entity</li>
                <li>Upload malicious code or attempt to compromise our systems</li>
                <li>Scrape or harvest data from our platform without permission</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Harass, abuse, or harm other users</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">5. Intellectual Property</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              All content on JobHub, including logos, designs, text, graphics, software, and code, 
              is our property or licensed to us and is protected by copyright, trademark, and other 
              intellectual property laws. You may not reproduce, distribute, or create derivative works 
              without our express written consent.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">6. Disclaimer of Warranties</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              JobHub is provided "as is" without any warranties, express or implied. We do not guarantee 
              that the platform will be uninterrupted, error-free, or free from viruses. We are not responsible 
              for any damages resulting from your use of the platform, including lost opportunities, 
              data loss, or financial losses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              To the maximum extent permitted by law, JobHub and its affiliates shall not be liable for 
              any indirect, incidental, special, consequential, or punitive damages arising from your use 
              of the platform, even if we have been advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Modifications to Terms</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be effective immediately 
              upon posting. Your continued use of the platform constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. Termination</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We may suspend or terminate your account at our sole discretion, without notice, for conduct 
              that violates these terms or is harmful to other users or our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">10. Contact Information</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              If you have any questions about these Terms of Use, please contact us at:<br />
              Email: legal@jobhub.com<br />
              Address: 123 Job Street, Tech City, TC 12345
            </p>
          </section>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 text-center">
              By using JobHub, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

import { Briefcase } from 'lucide-react';