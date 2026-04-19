import React from 'react'
import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <section className="relative flex min-h-[calc(100vh-6rem)] w-full items-center justify-center overflow-hidden px-6 py-12">
      <div className="absolute -left-20 top-8 h-72 w-72 bg-teal-600/20 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-80 w-80 bg-orange-500/20 blur-3xl" />

      <div className="glass-panel fade-up relative z-10 w-full max-w-4xl border-2 px-8 py-14 text-center md:px-16 md:py-16">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0.35em] text-teal-800">Data Studio</p>
        <h1 className="mx-auto mb-6 max-w-3xl text-4xl font-extrabold uppercase leading-tight text-slate-900 md:text-6xl">
          Build dashboards that look sharp
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-base text-slate-600 md:text-xl">
          Compare trends, pin insights, and present analytics with a clean and structured workspace.
        </p>
        <Link to="/dashboard" className="brand-button inline-flex items-center border-2 px-10 py-3.5 text-base font-bold uppercase tracking-wide shadow-lg transition hover:-translate-y-0.5">
          Enter Dashboard
        </Link>
      </div>
    </section>
  )
}

export default Hero