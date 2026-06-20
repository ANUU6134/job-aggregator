// src/components/layout/Header.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Bell, 
  LogOut, 
  Settings, 
  Briefcase,
  ChevronDown,
  LayoutDashboard,
  Bookmark,
  FileText,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../common/Button';
import { ThemeToggle } from '../common/ThemeToggle';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  // Navigation items for authenticated users
  const authNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/jobs', label: 'Browse Jobs', icon: Briefcase },
    { path: '/saved-jobs', label: 'Saved Jobs', icon: Bookmark },
    { path: '/applications', label: 'Applications', icon: FileText },
    { path: '/salary-insights', label: 'Salary Insights', icon: TrendingUp },
  ];

  return (
    <header className="glassmorphism sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <Briefcase className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold gradient-text hidden sm:block">JobHub</span>
          </Link>

          {/* Desktop Navigation - Shows different items based on auth status */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {isAuthenticated ? (
              // Authenticated user nav items
              <>
                {authNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition flex items-center gap-1.5 text-sm lg:text-base whitespace-nowrap"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition flex items-center gap-1.5 text-sm lg:text-base whitespace-nowrap"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
              </>
            ) : (
              // Public nav items
              <>
                <Link to="/jobs" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition whitespace-nowrap">
                  Find Jobs
                </Link>
                <Link to="/companies" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition whitespace-nowrap">
                  Companies
                </Link>
                <Link to="/salary-insights" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition whitespace-nowrap">
                  Salary Insights
                </Link>
              </>
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <>
                <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.firstName} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </span>
                      </div>
                    )}
                    <ChevronDown className="w-4 h-4 hidden sm:block" />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-100 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                      >
                        <Link
                          to="/dashboard"
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          to="/saved-jobs"
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Bookmark className="w-4 h-4" />
                          <span>Saved Jobs</span>
                        </Link>
                        <Link
                          to="/applications"
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <FileText className="w-4 h-4" />
                          <span>Applications</span>
                        </Link>
                        <div className="border-t border-gray-200 dark:border-gray-700" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-red-600"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Register</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col space-y-3">
                {isAuthenticated ? (
                  // Mobile nav for authenticated users
                  <>
                    {authNavItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center space-x-2 px-2 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 px-2 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <BarChart3 className="w-5 h-5" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-2 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  // Mobile nav for public users
                  <>
                    <Link to="/jobs" className="px-2 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition" onClick={() => setIsMenuOpen(false)}>
                      Find Jobs
                    </Link>
                    <Link to="/companies" className="px-2 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition" onClick={() => setIsMenuOpen(false)}>
                      Companies
                    </Link>
                    <Link to="/salary-insights" className="px-2 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition" onClick={() => setIsMenuOpen(false)}>
                      Salary Insights
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex flex-col space-y-2">
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" fullWidth>Login</Button>
                      </Link>
                      <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="primary" fullWidth>Register</Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};