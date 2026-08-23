import React, { useState } from 'react'
import { supabase } from '../config/supabase'
import '../styles/neon.css'

interface LoginProps {
  onSwitchToRegister: () => void
  onLoginSuccess: () => void
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onLoginSuccess }) => {
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
        onLoginSuccess()
      }, 1500)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container slide-in-left">
      <div className="card-neon">
        <div className="logo-container">
          <div className="logo-circle glow-cyan">
            <div className="logo-text">
              <span className="logo-letter">T</span>
            </div>
          </div>
        </div>

        <h1 className="neon-glow">LOGIN</h1>

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
              placeholder="Password ••••"
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
          <p className="text-neon-cyan">Haven't join yet?</p>
          <button type="button" className="btn btn-neon-cyan" onClick={onSwitchToRegister} disabled={loading}>
            Register Now!
          </button>
        </div>
      </div>

      <style>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(255, 0, 110, 0.05));
          padding: 20px;
        }

        .card-neon {
          width: 100%;
          max-width: 420px;
        }

        .logo-container {
          text-align: center;
          margin-bottom: 30px;
        }

        .logo-circle {
          width: 140px;
          height: 140px;
          margin: 0 auto;
          background: radial-gradient(circle at 30% 30%, rgba(0, 212, 255, 0.2), rgba(255, 0, 110, 0.1));
          border: 3px solid var(--neon-cyan);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px var(--neon-cyan), 0 0 40px rgba(0, 212, 255, 0.3), inset 0 0 20px rgba(0, 212, 255, 0.1);
          animation: pulse 3s ease-in-out infinite;
        }

        .logo-letter {
          font-size: 80px;
          font-weight: bold;
          background: linear-gradient(135deg, #00d4ff, #0080ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 20px var(--neon-cyan), 0 0 40px rgba(0, 212, 255, 0.3), inset 0 0 20px rgba(0, 212, 255, 0.1);
          }
          50% {
            box-shadow: 0 0 30px var(--neon-cyan), 0 0 60px rgba(0, 212, 255, 0.5), inset 0 0 30px rgba(0, 212, 255, 0.2);
          }
        }

        h1 {
          text-align: center;
          font-size: 36px;
          margin-bottom: 30px;
          color: var(--neon-cyan);
          letter-spacing: 3px;
          font-weight: 700;
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
