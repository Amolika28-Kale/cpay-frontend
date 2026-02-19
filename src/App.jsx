import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import { Toaster } from 'react-hot-toast';
function App() {
  return (
    <>
     <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0A1F1A',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1rem',
            padding: '1rem',
          },
          success: {
            icon: '✅',
            style: {
              border: '1px solid #00F5A0',
            },
          },
          error: {
            icon: '❌',
            style: {
              border: '1px solid #ff4444',
            },
          },
        }}
      />
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
    </>
  );
}

export default App;
