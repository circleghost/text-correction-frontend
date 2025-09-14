import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../config/supabase'

export const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error.message)
          // Redirect to home with error
          navigate('/?error=auth_failed', { replace: true })
          return
        }

        if (data.session) {
          // Successful authentication, redirect to home
          console.log('Authentication successful:', data.session.user.email)
          navigate('/', { replace: true })
        } else {
          // No session found, redirect to home
          navigate('/', { replace: true })
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        navigate('/?error=auth_error', { replace: true })
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          正在登入...
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          請稍候，我們正在為您完成登入程序
        </p>
      </div>
    </div>
  )
}