import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function Nav() {
  const navigate = useNavigate();
  const loggedIn = !!localStorage.getItem('token');
  const logout = () => { localStorage.removeItem('token'); navigate('/login'); };
  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold">DR Test</Link>
        <div className="space-x-4">
          {loggedIn ? (
            <>
              <Link to="/">Dashboard</Link>
              <button onClick={logout} className="px-3 py-1 rounded bg-gray-800 text-white">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="px-3 py-1 rounded bg-gray-800 text-white">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <div className="min-h-full">
      <Nav />
      <div className="max-w-5xl mx-auto p-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
}
