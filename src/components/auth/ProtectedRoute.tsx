import { ReactNode } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { LoginButton } from './LoginButton'

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
  requireAuth?: boolean
  loadingComponent?: ReactNode
}

export const ProtectedRoute = ({ 
  children, 
  fallback,
  requireAuth = true,
  loadingComponent
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth()

  // Show loading component while checking auth state
  if (loading) {
    return (
      <>
        {loadingComponent || (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">載入中...</p>
            </div>
          </div>
        )}
      </>
    )
  }

  // If auth is not required, always show children
  if (!requireAuth) {
    return <>{children}</>
  }

  // If user is authenticated, show children
  if (user) {
    return <>{children}</>
  }

  // If not authenticated, show fallback or default login screen
  return (
    <>
      {fallback || <DefaultLoginScreen />}
    </>
  )
}

const DefaultLoginScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            需要登入
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            請登入以使用 AI 錯字檢查功能
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <LoginButton 
            className="w-full" 
            variant="primary" 
            size="lg" 
          />
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            登入後您可以享受：
          </p>
          <ul className="mt-2 text-xs text-gray-600 dark:text-gray-300 space-y-1">
            <li>• 每月 50 次免費文字校正</li>
            <li>• 個人化使用記錄</li>
            <li>• 更快的處理速度</li>
            <li>• 多種匯出格式</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Hook for checking auth status in components
export const useAuthGuard = (redirectTo?: string) => {
  const { user, loading } = useAuth()
  
  const isAuthenticated = !loading && !!user
  const isLoading = loading
  const shouldRedirect = !loading && !user && redirectTo
  
  return {
    isAuthenticated,
    isLoading,
    shouldRedirect,
    user
  }
}