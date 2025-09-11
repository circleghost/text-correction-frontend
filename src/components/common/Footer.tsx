import React from 'react';
import { config } from '@/utils/config';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-neutral-50 border-t border-neutral-200 ${className}`}>
      <div className='max-w-6xl mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* App Info */}
          <div>
            <h3 className='text-lg font-semibold text-text-primary mb-3'>
              {config.appName}
            </h3>
            <p className='text-sm text-text-secondary mb-4 leading-relaxed'>
              {config.appDescription}
            </p>
            <div className='text-xs text-neutral-500'>
              版本 {config.appVersion}
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className='text-md font-medium text-text-primary mb-3'>
              核心功能
            </h4>
            <ul className='space-y-2 text-sm text-text-secondary'>
              <li className='flex items-center'>
                <svg className='w-4 h-4 text-primary-500 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                AI 智能錯字檢測
              </li>
              <li className='flex items-center'>
                <svg className='w-4 h-4 text-primary-500 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                段落智能處理
              </li>
              <li className='flex items-center'>
                <svg className='w-4 h-4 text-primary-500 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                視覺化對比顯示
              </li>
              {config.enableGoogleDocs && (
                <li className='flex items-center'>
                  <svg className='w-4 h-4 text-primary-500 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                  </svg>
                  Google Docs 整合
                </li>
              )}
            </ul>
          </div>

          {/* Links & Support */}
          <div>
            <h4 className='text-md font-medium text-text-primary mb-3'>
              支援與說明
            </h4>
            <ul className='space-y-2 text-sm text-text-secondary'>
              <li>
                <a
                  href='#usage-guide'
                  className='hover:text-primary-600 transition-colors duration-200'
                >
                  使用說明
                </a>
              </li>
              <li>
                <a
                  href='#faq'
                  className='hover:text-primary-600 transition-colors duration-200'
                >
                  常見問題
                </a>
              </li>
              <li>
                <a
                  href='#privacy'
                  className='hover:text-primary-600 transition-colors duration-200'
                >
                  隱私政策
                </a>
              </li>
              <li>
                <a
                  href='#contact'
                  className='hover:text-primary-600 transition-colors duration-200'
                >
                  聯絡我們
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='border-t border-neutral-200 mt-8 pt-6'>
          <div className='flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0'>
            <div className='text-xs text-neutral-500'>
              © {currentYear} AI 錯字檢查. 版權所有.
            </div>
            
            <div className='flex items-center space-x-4 text-xs text-neutral-500'>
              <span>Powered by OpenAI</span>
              <span>•</span>
              <span>Built with React & TypeScript</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};