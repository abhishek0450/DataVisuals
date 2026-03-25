
import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className='fixed top-0 left-0 w-full z-50 bg-gray-200'>
      <div className='flex justify-between items-center p-4 bg-gray-200'>
        <p className='text-xl text-red-900'><Link to='/' >Analytics</Link></p>
        <ul className='flex m-2 gap-4'>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>Data Source</li>
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