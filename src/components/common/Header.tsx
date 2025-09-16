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

  // Inline fallback to guarantee dark patterned background even if CSS order changes
  const darkHeaderStyle = isDark
    ? {
        background:
          'linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, transparent 50%, rgba(0, 0, 0, 0.6) 100%),\
           linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),\
           linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),\
           #0d1117',
        backgroundSize: '100% 100%, 40px 40px, 40px 40px, 100% 100%',
        backgroundPosition: '0 0, 0 0, 0 0, 0 0',
      } as React.CSSProperties
    : undefined;

  return (
    <header 
      className={`flex items-center justify-between whitespace-nowrap border-b border-solid px-10 py-4 ${headerBgClass} transition-colors duration-300 ${className}`}
      style={darkHeaderStyle}
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
        <Link to="/" className="text-sm font-medium leading-normal text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">首頁</Link>
        <a className="text-sm font-medium leading-normal text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors" href="#">功能</a>
        <a className="text-sm font-medium leading-normal text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors" href="#">定價</a>
        {user && (
          <Link to="/dashboard" className="text-sm font-medium leading-normal text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">使用量</Link>
        )}
      </nav>
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleTheme();
          }}
          className="relative z-30 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-green-400"
          title={theme === 'light' ? '切換到深色模式' : '切換到淺色模式'}
          type="button"
        >
          {theme === 'light' ? (
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
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
