
import './App.css'
import { Route, Routes } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import Homepage from './pages/Homepage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from "./components/ProtectedRoute"

import GuestRoute from "./components/GuestRoute"

function App() {

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        } />
        <Route path="/signup" element={
          <GuestRoute>
            <Signup />
          </GuestRoute>
        } />
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
