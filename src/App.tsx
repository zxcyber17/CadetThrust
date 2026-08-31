import React, { useState, useEffect } from 'react'
import { supabase } from './config/supabase'
import { Login } from './components/Login'
import { Register } from './components/Register'
import './styles/neon.css'

export default function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'dashboard'>('login')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if Supabase is properly configured
        if (!supabase) {
          setError('Supabase is not configured. Please check your environment variables.')
          setLoading(false)
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setIsLoggedIn(true)
          setCurrentUser(session.user)
          setCurrentPage('dashboard')
        } else {
          // Always default to login if no session
          setCurrentPage('login')
        }
        setLoading(false)
      } catch (err) {
        console.error('Auth check error:', err)
        setError('Failed to connect to authentication service')
        setLoading(false)
      }
    }

    checkAuth()

    if (!supabase) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (session?.user) {
        setIsLoggedIn(true)
        setCurrentUser(session.user)
        setCurrentPage('dashboard')
      } else {
        setIsLoggedIn(false)
        setCurrentUser(null)
        setCurrentPage('login')
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    setCurrentPage('dashboard')
  }

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setIsLoggedIn(false)
    setCurrentUser(null)
    setCurrentPage('login')
  }

  const handleSwitchToRegister = () => {
    setCurrentPage('register')
  }

  const handleSwitchToLogin = () => {
    setCurrentPage('login')
  }

  // Loading State
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
        <style>{`
          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(255, 0, 110, 0.05));
          }

          .loading-spinner {
            text-align: center;
          }

          .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(0, 212, 255, 0.2);
            border-top: 4px solid #00d4ff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .loading-spinner p {
            color: #00d4ff;
            font-size: 18px;
            letter-spacing: 2px;
          }
        `}</style>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="error-container">
        <div className="error-box card-neon">
          <h1 className="error-title">⚠️ Configuration Error</h1>
          <p className="error-message">{error}</p>
          <div className="error-instructions">
            <h2>🔧 Fix Instructions:</h2>
            <ol>
              <li>Create a file named <code>.env.local</code> in your project root (same folder as package.json)</li>
              <li>Add your Supabase credentials:
                <pre>VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here</pre>
              </li>
              <li>Save the file</li>
              <li>Restart the development server: Stop it (Ctrl+C) and run <code>npm run dev</code> again</li>
              <li>Refresh the browser (F5)</li>
            </ol>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-neon-cyan"
            style={{marginTop: '20px'}}
          >
            Retry
          </button>
        </div>
        <style>{`
          .error-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(255, 0, 110, 0.05));
            padding: 20px;
          }

          .error-box {
            width: 100%;
            max-width: 600px;
          }

          .error-title {
            color: var(--neon-magenta);
            font-size: 28px;
            margin-bottom: 20px;
            text-align: center;
          }

          .error-message {
            color: var(--text-light);
            font-size: 16px;
            margin-bottom: 30px;
            text-align: center;
            line-height: 1.6;
          }

          .error-instructions {
            background-color: rgba(255, 0, 110, 0.1);
            border-left: 4px solid var(--neon-magenta);
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }

          .error-instructions h2 {
            color: var(--neon-cyan);
            margin-bottom: 15px;
            font-size: 18px;
          }

          .error-instructions ol {
            color: var(--text-light);
            margin-left: 20px;
            line-height: 2;
          }

          .error-instructions li {
            margin-bottom: 10px;
          }

          .error-instructions code {
            background-color: rgba(0, 212, 255, 0.1);
            color: var(--neon-cyan);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
          }

          .error-instructions pre {
            background-color: rgba(26, 31, 58, 0.8);
            border: 1px solid var(--neon-cyan);
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            color: var(--neon-cyan);
            font-size: 14px;
            margin-top: 10px;
            font-family: 'Courier New', monospace;
          }
        `}</style>
      </div>
    )
  }

  // Dashboard State (Logged In)
  if (currentPage === 'dashboard' && isLoggedIn && currentUser) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <h1 className="welcome-text neon-glow">Welcome, {currentUser.email}! 👋</h1>
          <p className="subtitle">Your dashboard is being prepared...</p>
          <div className="dashboard-box card-neon">
            <h2 className="text-neon-cyan">🚀 Coming Soon</h2>
            <p>Your cadet profile, achievement badges, and more features are under development.</p>
            <button className="btn btn-neon-gradient" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <style>{`
          .dashboard-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(255, 0, 110, 0.05));
            padding: 20px;
          }

          .dashboard-content {
            width: 100%;
            max-width: 600px;
            text-align: center;
          }

          .welcome-text {
            font-size: 36px;
            margin-bottom: 15px;
            letter-spacing: 1px;
          }

          .subtitle {
            color: var(--text-muted);
            margin-bottom: 30px;
            font-size: 16px;
          }

          .dashboard-box {
            padding: 40px;
            text-align: center;
          }

          .dashboard-box h2 {
            margin-bottom: 20px;
            font-size: 24px;
          }

          .dashboard-box p {
            color: var(--text-muted);
            margin-bottom: 30px;
            line-height: 1.6;
          }

          .dashboard-box .btn {
            width: auto;
            padding: 12px 40px;
          }
        `}</style>
      </div>
    )
  }

  // Login/Register State - DEFAULT TO LOGIN
  return (
    <div className="app">
      {currentPage === 'login' ? (
        <Login 
          onSwitchToRegister={handleSwitchToRegister}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        <Register 
          onSwitchToLogin={handleSwitchToLogin}
          onRegisterSuccess={() => handleSwitchToLogin()}
        />
      )}
    </div>
  )
}
