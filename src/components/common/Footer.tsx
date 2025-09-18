import React from 'react';
import { config } from '@/utils/config';
import { useTheme } from '@/contexts/ThemeContext';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const containerClass = isDark
    ? 'bg-[#0a0e1a] border-t border-[#1a2a3a] neon-border'
    : 'bg-gradient-to-b from-[#FAFBFC] to-white border-t border-[#D0D7DE]';

  return (
    <footer className={`${containerClass} ${className}`}>
      <div className='max-w-6xl mx-auto' style={{padding: '2rem 1rem'}}>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* App Info */}
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-[#1F2328]'}`}>
              {config.appName}
            </h3>
            <p className={`text-sm mb-4 leading-relaxed ${isDark ? 'text-[#8a9eb3]' : 'text-[#656D76]'}`}>
              {config.appDescription}
            </p>
            <div className={`text-xs ${isDark ? 'text-neutral-500' : 'text-[#9199A1]'}`}>
              版本 {config.appVersion}
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className={`text-md font-medium mb-3 ${isDark ? 'text-white tech-subtitle' : 'text-[#1F2328]'}`}>
              核心功能
            </h4>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-[#B0B0B0]' : 'text-[#656D76]'}`}>
              <li className='flex items-center'>
                <svg className={`w-4 h-4 mr-2 ${isDark ? 'text-[#3b82f6]' : 'text-[#0969DA]'}`} fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                AI 智能錯字檢測
              </li>
              <li className='flex items-center'>
                <svg className={`w-4 h-4 mr-2 ${isDark ? 'text-[#3b82f6]' : 'text-[#0969DA]'}`} fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                段落智能處理
              </li>
              <li className='flex items-center'>
                <svg className={`w-4 h-4 mr-2 ${isDark ? 'text-[#3b82f6]' : 'text-[#0969DA]'}`} fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                視覺化對比顯示
              </li>
              {config.enableGoogleDocs && (
                <li className='flex items-center'>
                  <svg className={`w-4 h-4 mr-2 ${isDark ? 'text-[#3b82f6]' : 'text-[#0969DA]'}`} fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                  </svg>
                  Google Docs 整合
                </li>
              )}
            </ul>
          </div>

          {/* Links & Support */}
          <div>
            <h4 className={`text-md font-medium mb-3 ${isDark ? 'text-white' : 'text-[#1F2328]'}`}>
              支援與說明
            </h4>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-[#8a9eb3]' : 'text-[#656D76]'}`}>
              <li>
                <a
                  href='#usage-guide'
                  className={`transition-colors duration-200 ${isDark ? 'hover:text-[#3b82f6]' : 'text-[#1F2328] hover:text-[#0969DA]'}`}
                >
                  使用說明
                </a>
              </li>
              <li>
                <a
                  href='#faq'
                  className={`transition-colors duration-200 ${isDark ? 'hover:text-[#3b82f6]' : 'text-[#1F2328] hover:text-[#0969DA]'}`}
                >
                  常見問題
                </a>
              </li>
              <li>
                <a
                  href='#privacy'
                  className={`transition-colors duration-200 ${isDark ? 'hover:text-[#3b82f6]' : 'text-[#1F2328] hover:text-[#0969DA]'}`}
                >
                  隱私政策
                </a>
              </li>
              <li>
                <a
                  href='#contact'
                  className={`transition-colors duration-200 ${isDark ? 'hover:text-[#3b82f6]' : 'text-[#1F2328] hover:text-[#0969DA]'}`}
                >
                  聯絡我們
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`mt-8 pt-6 border-t ${isDark ? 'border-[#1a2a3a]' : 'border-[#E7ECF0]'}`}>
          <div className='flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0'>
            <div className={`text-xs ${isDark ? 'text-neutral-400' : 'text-[#656D76]'}`}>
              是元魁做的，版權歸 Ordilux 所有。© {currentYear}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
