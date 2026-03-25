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
    <section className="w-full min-h-screen flex bg-gray-800 items-center justify-center text-white">
      <div className="max-w-md w-full px-6">
        <h1 className="text-4xl font-bold mb-2 text-center">Sign Up</h1>

        {error && <div className="bg-red-500/20 text-red-500 p-3 mb-4 rounded border border-red-500/50">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2">Username</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full px-4 py-3 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-4 py-3 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 font-bold rounded hover:bg-blue-600 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Already have an account? <a href="/login" className="text-blue-500 hover:text-blue-400">Login</a>
        </p>
      </div>
    </section>
  )
}

export default Signup
