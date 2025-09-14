import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface UserProfileProps {
  showFullInfo?: boolean
  className?: string
  variant?: 'dropdown' | 'card' | 'minimal'
}

export const UserProfile = ({ 
  showFullInfo = true,
  className = '',
  variant = 'dropdown' 
}: UserProfileProps) => {
  const { user, signOut } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  if (!user) return null

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      const { error } = await signOut()
      if (error) {
        console.error('Sign out error:', error.message)
      }
    } catch (err) {
      console.error('Unexpected error during sign out:', err)
    } finally {
      setIsSigningOut(false)
      setIsDropdownOpen(false)
    }
  }

  const getUserDisplayName = () => {
    return user.user_metadata?.full_name || 
           user.user_metadata?.name || 
           user.email?.split('@')[0] || 
           '使用者'
  }

  const getUserInitials = () => {
    const name = getUserDisplayName()
    return name.substring(0, 2).toUpperCase()
  }

  // Minimal variant - just avatar and name
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          {user.user_metadata?.picture ? (
            <img 
              src={user.user_metadata.picture} 
              alt={getUserDisplayName()}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <span className="text-white text-sm font-medium">
              {getUserInitials()}
            </span>
          )}
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {getUserDisplayName()}
        </span>
      </div>
    )
  }

  // Card variant - full info display
  if (variant === 'card') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            {user.user_metadata?.picture ? (
              <img 
                src={user.user_metadata.picture} 
                alt={getUserDisplayName()}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <span className="text-white font-medium">
                {getUserInitials()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {getUserDisplayName()}
            </p>
            {showFullInfo && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            )}
          </div>
        </div>
        {showFullInfo && (
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="mt-3 w-full px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors disabled:opacity-50"
          >
            {isSigningOut ? '登出中...' : '登出'}
          </button>
        )}
      </div>
    )
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          {user.user_metadata?.picture ? (
            <img 
              src={user.user_metadata.picture} 
              alt={getUserDisplayName()}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <span className="text-white text-sm font-medium">
              {getUserInitials()}
            </span>
          )}
        </div>
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {getUserDisplayName()}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <p className="font-medium text-gray-900 dark:text-white">
                {getUserDisplayName()}
              </p>
              {showFullInfo && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {user.email}
                </p>
              )}
            </div>
            
            <div className="p-2">
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
              >
                {isSigningOut ? '登出中...' : '登出'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}