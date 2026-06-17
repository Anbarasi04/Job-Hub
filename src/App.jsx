import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './Jobs';
import JobDetail from './JobDetail';

// Candidate Pages
import CandidateDashboard from './candidate/Dashboard';
import Profile from './candidate/Profile';
import MyApplications from './candidate/Applications';

// Recruiter Pages
import Dashboard from './Dashboard';
import MyJobs from './MyJobs';
import PostJob from './pages/PostJob';
import Applicants from './Applicants';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>

          {/* ── Public Routes ── */}
          <Route path="/"           element={<Navigate to="/jobs" replace />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/register"   element={<Register />} />
          <Route path="/jobs"       element={<Jobs />} />
          <Route path="/jobs/:id"   element={<JobDetail />} />

          {/* ── Candidate Routes (role = "candidate") ── */}
          <Route path="/candidate/dashboard"
            element={<ProtectedRoute role="candidate"><CandidateDashboard /></ProtectedRoute>} />
          <Route path="/candidate/profile"
            element={<ProtectedRoute role="candidate"><Profile /></ProtectedRoute>} />
          <Route path="/candidate/applications"
            element={<ProtectedRoute role="candidate"><MyApplications /></ProtectedRoute>} />

          {/* ── Recruiter Routes (role = "recruiter") ── */}
          <Route path="/recruiter/dashboard"
            element={<ProtectedRoute role="recruiter"><Dashboard /></ProtectedRoute>} />
          <Route path="/recruiter/jobs"
            element={<ProtectedRoute role="recruiter"><MyJobs /></ProtectedRoute>} />
          <Route path="/recruiter/jobs/new"
            element={<ProtectedRoute role="recruiter"><PostJob /></ProtectedRoute>} />
          <Route path="/recruiter/jobs/:id/edit"
            element={<ProtectedRoute role="recruiter"><PostJob /></ProtectedRoute>} />
          <Route path="/recruiter/jobs/:id/applicants"
            element={<ProtectedRoute role="recruiter"><Applicants /></ProtectedRoute>} />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/jobs" replace />} />

        </Routes>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#16161f',
              color: '#e8e8f0',
              border: '1px solid #1e1e2e',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#00d68f', secondary: '#16161f' } },
            error:   { iconTheme: { primary: '#ff4d6d', secondary: '#16161f' } },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;