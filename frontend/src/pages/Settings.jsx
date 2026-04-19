import React, { useState } from 'react'

const Settings = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
      <p className="text-gray-500 mb-8">Manage your account preferences</p>

      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Profile</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
            {(user.name || user.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-800">{user.name || 'User'}</p>
            <p className="text-sm text-gray-500">{user.email || 'No email'}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Display Name</label>
            <input
              type="text"
              defaultValue={user.name || ''}
              placeholder="Your name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              defaultValue={user.email || ''}
              placeholder="your@email.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Preferences</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Email Notifications</p>
              <p className="text-xs text-gray-400">Receive updates and alerts via email</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-11 h-6 rounded-full transition-colors duration-200 ${notifications ? 'bg-blue-600' : 'bg-gray-300'} relative`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 absolute top-1 ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Dark Mode</p>
              <p className="text-xs text-gray-400">Toggle dark theme across the app</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-11 h-6 rounded-full transition-colors duration-200 ${darkMode ? 'bg-blue-600' : 'bg-gray-300'} relative`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 absolute top-1 ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-medium hover:bg-blue-700 transition">
        Save Changes
      </button>
    </div>
  )
}

export default Settings
