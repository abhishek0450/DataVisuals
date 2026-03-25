import React from 'react'
import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <section className="w-full min-h-screen flex bg-gray-800 items-center justify-center text-white text-center">
      <div className="max-w-2xl px-6">
        <h1 className="text-5xl font-bold mb-6 leading-tight">Visualize Your Data</h1>
        <p className="text-xl mb-10 opacity-90">Transform data into visualizations</p>
        <Link to="/dashboard" className="bg-blue-500 text-white px-10 py-3 font-bold rounded hover:bg-blue-600">Get Started</Link>
      </div>
    </section>
  )
}

export default Hero