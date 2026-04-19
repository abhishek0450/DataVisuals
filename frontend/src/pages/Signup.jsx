import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Signup = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, email, password })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        navigate('/login')
      } else {
        setError(data.message || 'Signup failed. User might already exist.')
      }
    } catch (err) {
      setError('Network error, please try again')
    }
  }

  return (
    <section className="auth-shell flex min-h-[calc(100vh-6rem)] w-full items-center justify-center px-6 py-10">
      <div className="fade-up glass-panel w-full max-w-md border-2 px-7 py-9 md:px-9">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-orange-700">Create Account</p>
        <h1 className="mb-2 text-4xl font-bold uppercase text-slate-900">Sign Up</h1>
        <p className="mb-7 text-sm text-slate-700">Set up your account and start building data stories in minutes.</p>

        {error && <div className="mb-5 border border-red-400 bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-700">Username</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your username"
              className="w-full border border-[#c9b9a2] bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border border-[#c9b9a2] bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full border border-[#c9b9a2] bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full border border-[#c9b9a2] bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="brand-button w-full py-3 font-bold uppercase shadow-lg transition hover:-translate-y-0.5"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account? <a href="/login" className="font-semibold text-teal-800 hover:text-teal-900">Login</a>
        </p>
      </div>
    </section>
  )
}

export default Signup
