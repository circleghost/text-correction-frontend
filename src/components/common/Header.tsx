import React from 'react';
import { Link } from 'react-router-dom';
import { config } from '@/utils/config';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LoginButton, UserProfile } from '@/components/auth';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  // Match dark-mode page background (techno-theme --background-dark: #0d1117)
  const headerBgClass = isDark
    ? 'circuit-board-bar border-[#1a2a3a]'
    : 'bg-white border-gray-200';

  return (
    <header 
      className={`flex items-center justify-between whitespace-nowrap border-b border-solid px-10 py-4 ${headerBgClass} transition-colors duration-300 ${className}`}
    >
      <div className="flex items-center gap-3">
        <svg className="h-8 w-8 text-blue-600 dark:text-cyan-400" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
        </svg> 
        <div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white glowing-text' : 'text-gray-900'}`}>{config.appName}</div>
          <div className={`text-sm font-medium ${isDark ? 'text-white/90' : 'text-gray-600'}`}>讓文字更精準，表達更清晰</div>
        </div>
      </div>
      <nav className="hidden md:flex items-center gap-8">
        {user && (
          <Link
            to="/dashboard"
            className="text-sm font-medium leading-normal text-gray-700 hover:text-blue-600 dark:text-white/80 dark:hover:text-white transition-colors"
          >
            使用量統計
          </Link>
        )}
      </nav>
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          aria-label="切換主題"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleTheme();
          }}
          className="p-2 rounded-full ring-1 ring-gray-300/60 bg-white/80 hover:bg-white dark:ring-white/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
          title={theme === 'light' ? '切換到深色模式' : '切換到淺色模式'}
          type="button"
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

        {loading ? (
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
        ) : user ? (
          <UserProfile 
            variant="dropdown" 
            showFullInfo={true}
            className="hidden sm:block"
          />
        ) : (
          <LoginButton 
            variant="outline" 
            size="sm"
            className="hidden sm:block"
          />
        )}
        
        {/* Mobile menu button */}
        <button className="md:hidden p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white transition-colors">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>
    </header>
  );
};
