import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
// import Auth from './pages/Auth.jsx'
// import AdminUsers from './pages/AdminUsers.jsx'
// import AdminTransactions from './pages/AdminTransactions.jsx'
// import AdminWallets from './pages/AdminWallets.jsx'
// import AdminDeposits from './pages/AdminDeposits.jsx'
// import AdminConversions from './pages/AdminConversions.jsx'
// import AdminScanners from './pages/AdminScanners.jsx'
// import AdminSettings from './pages/AdminSettings.jsx'
// import Dashboard from './pages/Dashboard.jsx'
// import AdminDashboard from './pages/AdminDashboard.jsx'

// function ProtectedRoute({ children }) {
//   const token = localStorage.getItem('token');
//   return token ? children : <Navigate to="/auth" />;
// }

// function PublicRoute({ children }) {
//   const token = localStorage.getItem('token');
//   return token ? <Navigate to="/dashboard" /> : children;
// }

// function AdminRoute({ children }) {
//   const token = localStorage.getItem('token');
//   const user = JSON.parse(localStorage.getItem('user') || '{}');
//   return token && user.role === 'admin' ? children : <Navigate to="/dashboard" />;
// }

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard user={user} /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard user={user} /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers user={user} /></AdminRoute>} />
        <Route path="/admin/transactions" element={<AdminRoute><AdminTransactions user={user} /></AdminRoute>} />
        <Route path="/admin/wallets" element={<AdminRoute><AdminWallets user={user} /></AdminRoute>} />
        <Route path="/admin/deposits" element={<AdminRoute><AdminDeposits user={user} /></AdminRoute>} />
        <Route path="/admin/conversions" element={<AdminRoute><AdminConversions user={user} /></AdminRoute>} />
        <Route path="/admin/scanners" element={<AdminRoute><AdminScanners user={user} /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminSettings user={user} /></AdminRoute>} /> */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
