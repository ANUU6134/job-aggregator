// src/pages/Privacy.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Database, Cookie, Mail, Lock, Bell, Trash2 } from 'lucide-react';

export const Privacy: React.FC = () => {
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
              <Shield className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Privacy Policy
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
              <Eye className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Information We Collect</h2>
            </div>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p><strong className="font-semibold">Personal Information:</strong> Name, email address, phone number, resume/CV, work history, education, and skills you voluntarily provide.</p>
              <p><strong className="font-semibold">Account Information:</strong> Username, password, profile preferences, and saved jobs.</p>
              <p><strong className="font-semibold">Usage Data:</strong> How you interact with our platform, including pages visited, searches performed, and time spent.</p>
              <p><strong className="font-semibold">Device Information:</strong> IP address, browser type, operating system, and device identifiers.</p>
              <p><strong className="font-semibold">Application Data:</strong> Jobs you apply to, applications submitted, and interview schedules.</p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">How We Use Your Information</h2>
            </div>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p>• Match you with relevant job opportunities</p>
              <p>• Process job applications on your behalf</p>
              <p>• Personalize your experience on our platform</p>
              <p>• Send job alerts and recommendations based on your preferences</p>
              <p>• Improve our services and develop new features</p>
              <p>• Communicate important updates about your account</p>
              <p>• Prevent fraud and ensure platform security</p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Share2 className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Information Sharing</h2>
            </div>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p>We do not sell your personal information. We may share your information:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>With employers when you apply to their job postings</li>
                <li>With service providers who assist in operating our platform</li>
                <li>When required by law or to protect our legal rights</li>
                <li>With your consent or at your direction</li>
              </ul>
              <p className="mt-2">Job applications are shared directly with employers or third-party job boards as specified.</p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Cookies and Tracking</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We use cookies and similar technologies to enhance your experience, analyze usage, and personalize content. 
              You can control cookie settings through your browser preferences. Essential cookies cannot be disabled as 
              they are necessary for platform functionality.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data Security</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We implement industry-standard security measures to protect your information, including encryption, 
              secure servers, and regular security audits. However, no method of transmission over the internet 
              is 100% secure. We cannot guarantee absolute security but continuously work to protect your data.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Rights</h2>
            </div>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p>Depending on your location, you may have the right to:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Access the personal information we hold about you</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt out of marketing communications</li>
                <li>Export your data in a portable format</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Email Communications</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We may send you job alerts, application updates, and platform announcements. You can manage your 
              email preferences in your account settings or unsubscribe using the link in any marketing email. 
              Transactional emails (related to your applications and account) cannot be opted out of.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data Retention</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We retain your information as long as your account is active or as needed to provide services. 
              If you delete your account, we will delete your personal information within 30 days, except where 
              retention is required for legal compliance or legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Third-Party Links</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Our platform may contain links to third-party websites. We are not responsible for the privacy 
              practices or content of these sites. We encourage you to read their privacy policies before 
              providing any personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Children's Privacy</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              JobHub is not intended for children under 16 years of age. We do not knowingly collect personal 
              information from children under 16. If you believe we have collected such information, please 
              contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">International Data Transfers</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. We ensure 
              appropriate safeguards are in place to protect your data in accordance with applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Updates to This Policy</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We may update this privacy policy periodically. Changes will be posted on this page with an 
              updated revision date. Significant changes will be notified via email or platform notification.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              If you have questions about this Privacy Policy or our data practices, please contact us:<br />
              Email: privacy@jobhub.com<br />
              Address: 123 Job Street, Tech City, TC 12345<br />
              Phone: +1 (555) 123-4567
            </p>
          </section>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 text-center">
              Your privacy matters to us. We are committed to protecting your personal information and being transparent about our practices.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

import { Share2 } from 'lucide-react';