import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Profile from '@/pages/Profile';
import Dashboard from '@/pages/Dashboard';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthCallback, ProtectedRoute } from '@/components/auth';
import { validateConfig } from '@/utils/config';

function App() {
  // Validate configuration on app startup
  const configValidation = validateConfig();

  if (!configValidation.isValid) {
    console.error(
      'Configuration validation failed:',
      configValidation.errors
    );

    return (
      <div className='min-h-screen bg-[#fafafa] flex items-center justify-center p-4'>
        <div className='card max-w-md'>
          <div className='card-body text-center'>
            <div className='w-16 h-16 bg-[#fee2e2] rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-8 h-8 text-error-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <h2 className='text-xl font-semibold text-[#212121] mb-2'>
              配置錯誤
            </h2>
            <p className='text-[#64748b] mb-4'>
              應用程式配置存在問題，請檢查環境變數設定。
            </p>
            <details className='text-left text-sm text-error-600'>
              <summary className='cursor-pointer font-medium mb-2'>
                錯誤詳情
              </summary>
              <ul className='list-disc pl-4 space-y-1 text-[#dc2626]'>
                {configValidation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </details>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className='App'>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;