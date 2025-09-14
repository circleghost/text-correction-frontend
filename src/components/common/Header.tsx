import React from 'react';
import { Link } from 'react-router-dom';
import { config } from '@/utils/config';
import { useAuth } from '@/contexts/AuthContext';
import { LoginButton, UserProfile } from '@/components/auth';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const { user, loading } = useAuth();

  return (
    <header className={`flex items-center justify-between whitespace-nowrap border-b border-solid border-[var(--secondary-color)] px-10 py-4 ${className}`} style={{backgroundColor: 'var(--background-dark)'}}>
      <div className="flex items-center gap-3 text-2xl font-bold text-white">
        <svg className="h-8 w-8 text-[var(--primary-color)]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
        </svg> 
        <div>
          <div className="text-2xl font-bold">{config.appName}</div>
          <div className="text-sm font-medium" style={{color: 'var(--text-secondary)'}}>讓文字更精準，表達更清晰</div>
        </div>
      </div>
      <nav className="hidden md:flex items-center gap-8" style={{color: 'var(--text-primary)'}}>
        <Link to="/" className="text-sm font-medium leading-normal hover:text-[var(--primary-color)] transition-colors" style={{color: 'var(--text-secondary)'}}>首頁</Link>
        <a className="text-sm font-medium leading-normal hover:text-[var(--primary-color)] transition-colors" href="#" style={{color: 'var(--text-secondary)'}}>功能</a>
        <a className="text-sm font-medium leading-normal hover:text-[var(--primary-color)] transition-colors" href="#" style={{color: 'var(--text-secondary)'}}>定價</a>
        {user && (
          <Link to="/dashboard" className="text-sm font-medium leading-normal hover:text-[var(--primary-color)] transition-colors" style={{color: 'var(--text-secondary)'}}>使用量</Link>
        )}
      </nav>
      <div className="flex items-center gap-4">
        {loading ? (
          <div className="w-8 h-8 border-2 border-gray-300 border-t-[var(--primary-color)] rounded-full animate-spin"></div>
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
        <button className="md:hidden p-2 rounded-md hover:bg-[var(--secondary-color)]">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>
    </header>
  );
};