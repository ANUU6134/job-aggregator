// src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Bookmark, 
  FileText, 
  TrendingUp, 
  Settings,
  BarChart3,
  Users,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/jobs', icon: Briefcase, label: 'Browse Jobs' },
  { path: '/saved-jobs', icon: Bookmark, label: 'Saved Jobs' },
  { path: '/applications', icon: FileText, label: 'Applications' },
  { path: '/salary-insights', icon: TrendingUp, label: 'Salary Insights' },
  { path: '/profile', icon: Settings, label: 'Profile' },
];

const adminItems = [
  { path: '/admin', icon: BarChart3, label: 'Admin Panel' },
  { path: '/admin/users', icon: Users, label: 'Manage Users' },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  
  // Don't show sidebar on auth pages
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
  
  if (isAuthPage) {
    return null;
  }
  
  return (
    <aside className="hidden lg:block w-64 bg-white dark:bg-dark-100 border-r border-gray-200 dark:border-gray-800 min-h-screen">
      <div className="sticky top-16 p-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
          
          {user?.role === 'admin' && (
            <>
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-4" />
              {adminItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
          
          <div className="h-px bg-gray-200 dark:bg-gray-700 my-4" />
          
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};