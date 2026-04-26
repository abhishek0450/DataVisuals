import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { setDatasetForWorkspace } from '../store/workspaceSlice'
import { clearAuthSession, hasAccessToken } from '../utils/auth'

const Navbar = () => {
  const navigate = useNavigate();
  const token = hasAccessToken();
  const dispatch = useDispatch();
  const activeWorkspace = useSelector(state => state.workspace.activeWorkspace);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/user/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout request failed', error);
    }

    clearAuthSession();
    navigate('/login');
  };

  return (
    <header className='fixed top-0 left-0 w-full z-50 px-4 pt-4'>
      <div className='glass-panel mx-auto flex h-14 max-w-7xl items-center justify-between border-2 px-5 md:px-7'>
        <p className='text-lg font-bold tracking-tight text-slate-900 md:text-xl'>
          <Link to='/' className='transition-opacity hover:opacity-75'>Analytics</Link>
        </p>
        <ul className='flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-600 md:gap-4 md:text-[0.86rem]'>
          <li>
            <Link to="/dashboard" className='border border-transparent px-3 py-1.5 transition hover:border-[#c9b9a2] hover:bg-[#f6f1e7] hover:text-slate-900'>Dashboard</Link>
          </li>
          <li className="relative">
            <button onClick={() => setShowDropdown(!showDropdown)} className="cursor-pointer border border-transparent px-3 py-1.5 transition hover:border-[#c9b9a2] hover:bg-[#f6f1e7] hover:text-slate-900">
              Data Source
            </button>
            {showDropdown && activeWorkspace && (
              <div className="absolute left-0 top-9 z-50 mt-2 flex w-56 flex-col overflow-hidden border-2 border-[#c9b9a2] bg-[#fffdf8] shadow-xl">
                <div onClick={() => { dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: 'sample' })); setShowDropdown(false); }} className="cursor-pointer border-b border-[#e2d8c8] px-3 py-2.5 text-sm text-slate-700 transition hover:bg-[#f5eee3]">Sample Data</div>
                <div onClick={() => { dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: 'category' })); setShowDropdown(false); }} className="cursor-pointer border-b border-[#e2d8c8] px-3 py-2.5 text-sm text-slate-700 transition hover:bg-[#f5eee3]">Sales by Category</div>
                <div onClick={() => { dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: 'performance' })); setShowDropdown(false); }} className="cursor-pointer border-b border-[#e2d8c8] px-3 py-2.5 text-sm text-slate-700 transition hover:bg-[#f5eee3]">Sales Performance</div>
                <div onClick={() => { dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: 'revenue' })); setShowDropdown(false); }} className="cursor-pointer px-3 py-2.5 text-sm text-slate-700 transition hover:bg-[#f5eee3]">Monthly Revenue</div>
              </div>
            )}
          </li>
          <li>
            {token ? (
              <button onClick={handleLogout} className='border-2 border-[#102238] bg-[#0d1f36] px-3.5 py-1.5 text-white transition hover:bg-[#162945]'>Logout</button>
            ) : (
              <Link to='/login' className='border-2 border-[#102238] bg-[#0d1f36] px-3.5 py-1.5 text-white transition hover:bg-[#162945]'>Login</Link>
            )}
          </li>
        </ul>
      </div>
    </header>
  )
}

export default Navbar