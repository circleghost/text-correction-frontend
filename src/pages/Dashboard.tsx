import React from 'react';
import { QuotaStatus, UsageStats, UsageHistory } from '@/components/usage';
import UsageTrendsChart from '@/components/usage/UsageTrendsChart';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 dark:border-green-400 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-500 dark:text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">需要登入</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">請先登入以查看使用量儀表板</p>
          <a
            href="/auth"
            className="inline-flex items-center px-6 py-3 bg-blue-600 dark:bg-green-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-green-700 transition-colors"
          >
            前往登入
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Dashboard Navbar */}
      <DashboardNavbar />
      
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-green-900/20 dark:via-gray-900 dark:to-cyan-900/20 z-0"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)] z-0"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Stats and Quota */}
          <div className="xl:col-span-2 space-y-8">
            {/* Usage Statistics */}
            <div>
              <UsageStats />
            </div>

            {/* Usage Trends Chart */}
            <div>
              <UsageTrendsChart />
            </div>
          </div>

          {/* Right Column - Quota Status */}
          <div className="space-y-8">
            {/* Quota Status */}
            <div>
              <QuotaStatus />
            </div>
          </div>
        </div>

        {/* Usage History - Full Width */}
        <div className="mt-8">
          <UsageHistory />
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>資料每分鐘自動更新</span>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            所有時間均為台北時間 (UTC+8)
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;