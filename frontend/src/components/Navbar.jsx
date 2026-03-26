import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { WorkspaceContext } from '../context/WorkspaceContext'

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { activeWorkspace, setDatasetForWorkspace } = useContext(WorkspaceContext);
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
            <button onClick={() => setShowDropdown(!showDropdown)} className=" hover:text-blue-900">
              Data Source
            </button>
            {showDropdown && activeWorkspace && (
              <div className="absolute top-8 w-48 left-0 mt-2 bg-white text-black rounded shadow-lg z-50 flex flex-col border border-gray-200">
                <div onClick={() => { setDatasetForWorkspace(activeWorkspace, 'sample'); setShowDropdown(false); }} className="cursor-pointer hover:bg-gray-100 p-2 text-sm border-b">Sample Data</div>
                <div onClick={() => { setDatasetForWorkspace(activeWorkspace, 'category'); setShowDropdown(false); }} className="cursor-pointer hover:bg-gray-100 p-2 text-sm border-b">Sales by Category</div>
                <div onClick={() => { setDatasetForWorkspace(activeWorkspace, 'performance'); setShowDropdown(false); }} className="cursor-pointer hover:bg-gray-100 p-2 text-sm border-b">Sales Performance</div>
                <div onClick={() => { setDatasetForWorkspace(activeWorkspace, 'revenue'); setShowDropdown(false); }} className="cursor-pointer hover:bg-gray-100 p-2 text-sm">Monthly Revenue</div>
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