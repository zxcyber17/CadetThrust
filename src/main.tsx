import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { supabase } from './config/supabase'
import './styles/neon.css'

const Root: React.FC = () => {
  const [view, setView] = useState<'login' | 'app'>('login')
  const [formData, setFormData] = useState({
    cadetName: '',
    cadetNo: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!formData.cadetName || !formData.cadetNo || !formData.password) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      const email = `${formData.cadetNo}@cadetthrust.local`

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password
      })

      if (signInError) {
        setError(signInError.message || 'Invalid credentials')
        setLoading(false)
        return
      }

      if (!data.user) {
        setError('Login failed. Please try again.')
        setLoading(false)
        return
      }

      const { data: userData, error: fetchError } = await supabase
        .from('auth_users')
        .select('approved')
        .eq('id', data.user.id)
        .single()

      if (fetchError) {
        console.error('Error fetching user data:', fetchError)
        setError('Account status check failed')
        setLoading(false)
        return
      }

      if (!userData?.approved) {
        setError('Your account is pending admin approval. Please check back later.')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      setSuccess('Login successful! Redirecting to dashboard...')
      localStorage.setItem('user_id', data.user.id)
      setTimeout(() => {
        setView('app')
      }, 800)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Inline Login view (moved from src/components/Login.tsx)
  const LoginView = (
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
              value={formData.cadetName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="cadetNo"
              placeholder="Cadet No."
              value={formData.cadetNo}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">⚠️ {error}</div>}
          {success && <div className="success-message">✓ {success}</div>}

          <button type="submit" className="btn btn-neon-gradient" disabled={loading}>
            {loading ? '⏳ Logging in...' : '⚡ LOG IN'}
          </button>
        </form>

        <div className="register-prompt">
          <p className="text-neon-cyan">Haven't joined yet?</p>
          <button
            type="button"
            className="btn btn-neon-cyan"
            onClick={() => {
              // আপনি চাইলে এখানে Register view খুলে দিতে পারেন বা App রাউটিং যা চান তাতে পাঠাতে পারেন।
              // আপাতত আমরা App মাউন্ট করছি যাতে পরবর্তী flow (Register/landing) App থেকে নিয়ন্ত্রিত হয়।
              setView('app')
            }}
            disabled={loading}
          >
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

  return view === 'login' ? LoginView : <App />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
