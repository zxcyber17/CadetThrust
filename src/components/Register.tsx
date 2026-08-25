import React, { useState } from 'react'
import { supabase } from '../config/supabase'
import '../styles/neon.css'
import { SuccessScreen } from './SuccessScreen';

interface RegisterProps {
  onSwitchToLogin: () => void
  onRegisterSuccess: () => void
}

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    cadetName: '',
    cadetNo: '',
    house: '',
    batch: '',
    bloodGroup: '',
    status: 'RUNNING CADET',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.cadetName.trim()) errors.cadetName = 'Cadet Name is required'
    if (!formData.cadetNo.trim()) errors.cadetNo = 'Cadet No. is required'
    if (!formData.house.trim()) errors.house = 'House is required'
    if (!formData.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format'
    if (!formData.password) errors.password = 'Password is required'
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match'

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) return

    setLoading(true)

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      })

      if (signUpError) {
        setError(signUpError.message || 'Registration failed')
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError('Failed to create account')
        setLoading(false)
        return
      }

      const { error: userError } = await supabase
        .from('auth_users')
        .insert([{
          id: authData.user.id,
          email: formData.email,
          cadet_name: formData.cadetName,
          cadet_number: formData.cadetNo,
          house: formData.house,
          approved: false
        }])

      if (userError) {
        setError('Failed to create user profile')
        setLoading(false)
        return
      }

      const { error: approvalError } = await supabase
        .from('pending_approvals')
        .insert([{
          user_id: authData.user.id,
          registration_data: formData,
          status: 'pending'
        }])

      if (approvalError) console.error('Error creating pending approval:', approvalError)

      setSuccess('✓ Registration successful! Your account is pending admin approval.')
      
      setTimeout(() => {
        onSwitchToLogin()
      }, 3000)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Registration error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container slide-in-right">
      <div className="card-neon">
        <div className="logo-container">
          <img src="/logo.jpg" alt="Cadet Thrust Logo" className="brand-logo" />
        </div>

        <h1 className="neon-glow-purple">REGISTRATION</h1>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <input
              type="text"
              name="cadetName"
              placeholder="Cadet Name"
              value={formData.cadetName}
              onChange={handleChange}
              disabled={loading}
            />
            {validationErrors.cadetName && <span className="field-error">⚠️ {validationErrors.cadetName}</span>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="cadetNo"
              placeholder="Cadet No."
              value={formData.cadetNo}
              onChange={handleChange}
              disabled={loading}
            />
            {validationErrors.cadetNo && <span className="field-error">⚠️ {validationErrors.cadetNo}</span>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="house"
              placeholder="House"
              value={formData.house}
              onChange={handleChange}
              disabled={loading}
            />
            {validationErrors.house && <span className="field-error">⚠️ {validationErrors.house}</span>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="batch"
              placeholder="Batch (e.g., 2020-2023)"
              value={formData.batch}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="bloodGroup"
              placeholder="Blood Group (e.g., O+)"
              value={formData.bloodGroup}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="EX-CADET">EX-CADET</option>
              <option value="RUNNING CADET">RUNNING CADET</option>
            </select>
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            {validationErrors.email && <span className="field-error">⚠️ {validationErrors.email}</span>}
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            {validationErrors.password && <span className="field-error">⚠️ {validationErrors.password}</span>}
          </div>

          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
            {validationErrors.confirmPassword && <span className="field-error">⚠️ {validationErrors.confirmPassword}</span>}
          </div>

          {error && <div className="error-message">⚠️ {error}</div>}
          {success && <div className="success-message">✓ {success}</div>}

          <button type="submit" className="btn btn-neon-gradient" disabled={loading}>
            {loading ? '⏳ Registering...' : '⚡ SUBMIT'}
          </button>
        </form>

        <div className="login-prompt">
          <p className="text-neon-cyan">Already registered?</p>
          <button type="button" className="btn btn-neon-cyan" onClick={onSwitchToLogin} disabled={loading}>
            LOG IN
          </button>
        </div>
      </div>

      <style>{`
        .register-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #000000;
          padding: 20px;
        }

        .card-neon {
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
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
          font-size: 32px;
          margin-bottom: 25px;
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
          margin-bottom: 15px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
        }

        .field-error {
          display: block;
          color: var(--neon-magenta);
          font-size: 12px;
          margin-top: 5px;
          padding-left: 5px;
        }

        .error-message {
          background-color: rgba(255, 0, 110, 0.15);
          border-left: 4px solid var(--neon-magenta);
          color: #ff99bb;
          padding: 12px 14px;
          border-radius: 6px;
          margin-bottom: 15px;
          font-size: 13px;
        }

        .success-message {
          background-color: rgba(0, 212, 255, 0.15);
          border-left: 4px solid var(--neon-cyan);
          color: #66e6ff;
          padding: 12px 14px;
          border-radius: 6px;
          margin-bottom: 15px;
          font-size: 13px;
        }

        .btn {
          width: 100%;
          margin-bottom: 18px;
        }

        .login-prompt {
          text-align: center;
          padding-top: 18px;
          border-top: 1px solid rgba(0, 212, 255, 0.3);
        }

        .login-prompt p {
          margin-bottom: 12px;
          font-size: 13px;
        }

        .login-prompt .btn {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  )
}
