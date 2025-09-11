import React from 'react';
import { config } from '@/utils/config';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  return (
    <header className={`bg-white border-b border-neutral-200 shadow-soft ${className}`}>
      <div className='max-w-6xl mx-auto px-4 py-6'>
        <div className='flex items-center justify-between'>
          {/* Logo and Title */}
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-3'>
              {/* Logo/Icon */}
              <div className='w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center'>
                <svg
                  className='w-6 h-6 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                  />
                </svg>
              </div>
              
              {/* App Title */}
              <div>
                <h1 className='text-2xl font-bold text-text-primary gradient-text'>
                  {config.appName}
                </h1>
                <p className='text-sm text-text-secondary font-medium'>
                  讓文字更精準，表達更清晰
                </p>
              </div>
            </div>
          </div>

          {/* Navigation / Actions */}
          <div className='flex items-center space-x-4'>
            {/* Version Badge */}
            <div className='hidden sm:flex items-center px-3 py-1 bg-neutral-100 rounded-full'>
              <span className='text-xs font-medium text-neutral-600'>
                v{config.appVersion}
              </span>
            </div>

            {/* GitHub Link (placeholder) */}
            <a
              href='#'
              className='p-2 text-neutral-500 hover:text-primary-600 transition-colors duration-200'
              aria-label='GitHub Repository'
            >
              <svg
                className='w-5 h-5'
                fill='currentColor'
                viewBox='0 0 20 20'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  fillRule='evenodd'
                  d='M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z'
                  clipRule='evenodd'
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};