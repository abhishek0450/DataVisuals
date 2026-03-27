import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { setDatasetForWorkspace } from '../store/workspaceSlice'

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const dispatch = useDispatch();
  const activeWorkspace = useSelector(state => state.workspace.activeWorkspace);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className='fixed top-0 left-0 w-full z-50 bg-gray-200'>
      <div className='flex justify-between items-center p-4 bg-gray-200'>
        <p className='text-xl text-red-900'><Link to='/' >Analytics</Link></p>
        <ul className='flex m-2 gap-4 items-center'>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li className="relative">
            <button onClick={() => setShowDropdown(!showDropdown)} className="text-black cursor-pointer">
              Data Source
            </button>
            {showDropdown && activeWorkspace && (
              <div className="absolute top-8 w-48 left-0 mt-2 bg-white text-black rounded shadow-lg z-50 flex flex-col border border-gray-200">
                <div onClick={() => { dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: 'sample' })); setShowDropdown(false); }} className="cursor-pointer hover:bg-gray-100 p-2 text-sm border-b">Sample Data</div>
                <div onClick={() => { dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: 'category' })); setShowDropdown(false); }} className="cursor-pointer hover:bg-gray-100 p-2 text-sm border-b">Sales by Category</div>
                <div onClick={() => { dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: 'performance' })); setShowDropdown(false); }} className="cursor-pointer hover:bg-gray-100 p-2 text-sm border-b">Sales Performance</div>
                <div onClick={() => { dispatch(setDatasetForWorkspace({ workspaceId: activeWorkspace, datasetName: 'revenue' })); setShowDropdown(false); }} className="cursor-pointer hover:bg-gray-100 p-2 text-sm">Monthly Revenue</div>
              </div>
            )}
          </li>
          <li>
            {token ? (
              <button onClick={handleLogout} className='hover:text-blue-900'>Logout</button>
            ) : (
              <Link to='/login' className='hover:text-blue-900'>Login</Link>
            )}
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Navbar