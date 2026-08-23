import React, { useState, useEffect } from 'react'
import { supabase } from './config/supabase'
import { Login } from './components/Login'
import { Register } from './components/Register'
import './styles/neon.css'

export default function App() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setIsLoggedIn(true)
        setCurrentUser(session.user)
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsLoggedIn(true)
        setCurrentUser(session.user)
      } else {
        setIsLoggedIn(false)
        setCurrentUser(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    setCurrentUser(null)
    setIsLogin(true)
  }

  if (isLoggedIn && currentUser) {
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

  return (
    <div className="app">
      {isLogin ? (
        <Login 
          onSwitchToRegister={() => setIsLogin(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        <Register 
          onSwitchToLogin={() => setIsLogin(true)}
          onRegisterSuccess={() => setIsLogin(true)}
        />
      )}
    </div>
  )
}
