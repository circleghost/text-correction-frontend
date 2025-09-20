import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { config } from '@/utils/config';

const DashboardNavbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const navBgClass = isDark
    ? 'bg-gray-900 border-gray-800'
    : 'bg-white border-gray-200';

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || 
           user?.user_metadata?.name || 
           user?.email?.split('@')[0] || 
           '使用者';
  };

  const getUserAvatar = () => {
    return user?.user_metadata?.picture;
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.substring(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };

  return (
    <nav className={`relative z-20 shadow-sm border-b transition-colors duration-300 ${navBgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <svg className="h-8 w-8 text-blue-600 dark:text-green-400" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-800 dark:text-white">{config.appName}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">儀表板</span>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-white/80 dark:hover:text-white transition-colors"
              >
                返回首頁
              </Link>
              <span className="text-sm font-semibold text-blue-600 dark:text-white">
                使用量統計
              </span>
            </div>
          </div>

          {/* Right side - User info and Theme toggle */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full ring-1 ring-gray-300/60 dark:ring-white/20 bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition-colors"
              title={theme === 'light' ? '切換到深色模式' : '切換到淺色模式'}
              aria-label="切換主題"
            >
              {theme === 'light' ? (
                <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.64 13a9 9 0 11-10.63-10.63 1 1 0 00-1.26 1.26A7 7 0 1019.74 14.9a1 1 0 001.9-.51z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm0 15a5 5 0 110-10 5 5 0 010 10zm9-4a1 1 0 100-2h-2a1 1 0 100 2h2zM5 12a1 1 0 10-1 1H2a1 1 0 100-2h2a1 1 0 001 1zm13.66 6.66a1 1 0 00-1.41 0l-1.42 1.42a1 1 0 001.41 1.41l1.42-1.41a1 1 0 000-1.42zM6.76 5.05a1 1 0 00-1.41 0L3.93 6.47a1 1 0 101.41 1.41l1.42-1.41a1 1 0 000-1.42zm0 13.9L5.34 20.37a1 1 0 101.41 1.41l1.42-1.41a1 1 0 10-1.41-1.41zM18.66 4.34l-1.42 1.41a1 1 0 001.41 1.41l1.42-1.41a1 1 0 10-1.41-1.41z" />
                </svg>
              )}
            </button>

            {/* User Profile Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                {/* User Avatar */}
                <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-green-600 flex items-center justify-center overflow-hidden">
                  {getUserAvatar() ? (
                    <img 
                      src={getUserAvatar()} 
                      alt={getUserDisplayName()}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-sm">
                      {getUserInitials()}
                    </span>
                  )}
                </div>
                
                {/* User Name */}
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-gray-800 dark:text-white">
                    {getUserDisplayName()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {user?.email}
                  </div>
                </div>

                {/* Dropdown Arrow */}
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    個人設定
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    登出
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
