import React, { useState, useEffect } from 'react'
import { supabase } from './config/supabase'
import { Register } from './components/Register'
import './styles/neon.css'

export default function App() {
  // ============= LOGIN COMPONENT STATE =============
  const [loginFormData, setLoginFormData] = useState({
    cadetName: '',
    cadetNo: '',
    password: ''
  })
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginSuccess, setLoginSuccess] = useState('')

  // ============= APP STATE =============
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'dashboard'>('login')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [appLoading, setAppLoading] = useState(true)
  const [appError, setAppError] = useState<string | null>(null)

  // ============= AUTH CHECK =============
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!supabase) {
          setAppError('Supabase is not configured. Please check your environment variables.')
          setAppLoading(false)
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setIsLoggedIn(true)
          setCurrentUser(session.user)
          setCurrentPage('dashboard')
        } else {
          setCurrentPage('login')
        }
        setAppLoading(false)
      } catch (err) {
        console.error('Auth check error:', err)
        setAppError('Failed to connect to authentication service')
        setAppLoading(false)
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

  // ============= LOGIN HANDLERS =============
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginSuccess('')
    setLoginLoading(true)

    try {
      if (!loginFormData.cadetName || !loginFormData.cadetNo || !loginFormData.password) {
        setLoginError('Please fill in all required fields')
        setLoginLoading(false)
        return
      }

      const email = `${loginFormData.cadetNo}@cadetthrust.local`

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: loginFormData.password
      })

      if (signInError) {
        setLoginError(signInError.message || 'Invalid credentials')
        setLoginLoading(false)
        return
      }

      if (!data.user) {
        setLoginError('Login failed. Please try again.')
        setLoginLoading(false)
        return
      }

      const { data: userData, error: fetchError } = await supabase
        .from('auth_users')
        .select('approved')
        .eq('id', data.user.id)
        .single()

      if (fetchError) {
        console.error('Error fetching user data:', fetchError)
        setLoginError('Account status check failed')
        setLoginLoading(false)
        return
      }

      if (!userData?.approved) {
        setLoginError('Your account is pending admin approval. Please check back later.')
        await supabase.auth.signOut()
        setLoginLoading(false)
        return
      }

      setLoginSuccess('Login successful! Redirecting to dashboard...')
      localStorage.setItem('user_id', data.user.id)
      setTimeout(() => {
        setIsLoggedIn(true)
        setCurrentPage('dashboard')
      }, 1500)
    } catch (err) {
      setLoginError('An unexpected error occurred. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoginLoading(false)
    }
  }

  // ============= NAVIGATION HANDLERS =============
  const handleSwitchToRegister = () => {
    setCurrentPage('register')
  }

  const handleSwitchToLogin = () => {
    setCurrentPage('login')
  }

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setIsLoggedIn(false)
    setCurrentUser(null)
    setCurrentPage('login')
    setLoginFormData({ cadetName: '', cadetNo: '', password: '' })
    setLoginError('')
    setLoginSuccess('')
  }

  // ============= LOADING STATE =============
  if (appLoading) {
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

  // ============= ERROR STATE =============
  if (appError) {
    return (
      <div className="error-container">
        <div className="error-box card-neon">
          <h1 className="error-title">⚠️ Configuration Error</h1>
          <p className="error-message">{appError}</p>
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

  // ============= DASHBOARD STATE =============
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

  // ============= REGISTER STATE =============
  if (currentPage === 'register') {
    return (
      <Register 
        onSwitchToLogin={handleSwitchToLogin}
        onRegisterSuccess={handleSwitchToLogin}
      />
    )
  }

  // ============= LOGIN STATE (DEFAULT) - MERGED FROM Login.tsx =============
  return (
    <div className="login-container slide-in-left">
      <div className="card-neon">
        <div className="logo-container">
          <img src="/logo.jpg" alt="Cadet Thrust Logo" className="brand-logo" />
        </div>

        <h1 className="neon-glow-purple">LOGIN</h1>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="text"
              name="cadetName"
              placeholder="Cadet Name"
              value={loginFormData.cadetName}
              onChange={handleLoginChange}
              required
              disabled={loginLoading}
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="cadetNo"
              placeholder="Cadet No."
              value={loginFormData.cadetNo}
              onChange={handleLoginChange}
              required
              disabled={loginLoading}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginFormData.password}
              onChange={handleLoginChange}
              required
              disabled={loginLoading}
            />
          </div>

          {loginError && <div className="error-message">⚠️ {loginError}</div>}
          {loginSuccess && <div className="success-message">✓ {loginSuccess}</div>}

          <button type="submit" className="btn btn-neon-gradient" disabled={loginLoading}>
            {loginLoading ? '⏳ Logging in...' : '⚡ LOG IN'}
          </button>
        </form>

        <div className="register-prompt">
          <p className="text-neon-cyan">Haven't joined yet?</p>
          <button type="button" className="btn btn-neon-cyan" onClick={handleSwitchToRegister} disabled={loginLoading}>
            REGISTER NOW!
          </button>
        </div>
      </div>

      <style>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #000000;
          padding: 20px;
        }

        .card-neon {
          width: 100%;
          max-width: 420px;
        }

        .logo-container {
          text-align: center;
          margin-bottom: 20px;
        }

        .brand-logo {
          max-width: 220px;
          height: auto;
          display: block;
          margin: 0 auto;
        }

        h1.neon-glow-purple {
          text-align: center;
          font-size: 36px;
          margin-bottom: 30px;
          color: #c084fc;
          letter-spacing: 3px;
          font-weight: 700;
          border: none;
          text-shadow: 
            0 0 5px #c084fc,
            0 0 10px #a855f7,
            0 0 20px #7e22ce;
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-group input {
          width: 100%;
        }

        .error-message {
          background-color: rgba(255, 0, 110, 0.15);
          border-left: 4px solid var(--neon-magenta);
          color: #ff99bb;
          padding: 14px 16px;
          border-radius: 6px;
          margin-bottom: 18px;
          font-size: 14px;
        }

        .success-message {
          background-color: rgba(0, 212, 255, 0.15);
          border-left: 4px solid var(--neon-cyan);
          color: #66e6ff;
          padding: 14px 16px;
          border-radius: 6px;
          margin-bottom: 18px;
          font-size: 14px;
        }

        .btn {
          width: 100%;
          margin-bottom: 20px;
        }

        .register-prompt {
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid rgba(0, 212, 255, 0.3);
        }

        .register-prompt p {
          margin-bottom: 14px;
          font-size: 14px;
        }

        .register-prompt .btn {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  )
}
