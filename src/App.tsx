/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Transfer from './pages/Transfer';
import Interbank from './pages/Interbank';
import Services from './pages/Services';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import Support from './pages/Support';
import Card from './pages/Card';
import Loan from './pages/Loan';
import AddFunds from './pages/AddFunds';
import Notifications from './pages/Notifications';
import UpgradeAccount from './pages/UpgradeAccount';
import GiftCards from './pages/GiftCards';
import Settings from './pages/Settings';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

const RootRoute = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) {
    return <Landing />;
  }
  return <Layout><Dashboard /></Layout>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-neutral-bg font-sans text-neutral-text dark:bg-slate-950 dark:text-slate-100 transition-colors duration-250">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/" element={<RootRoute />} />
                <Route path="/transfer" element={<ProtectedRoute><Transfer /></ProtectedRoute>} />
                <Route path="/interbank" element={<ProtectedRoute><Interbank /></ProtectedRoute>} />
                <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
                <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                <Route path="/card" element={<ProtectedRoute><Card /></ProtectedRoute>} />
                <Route path="/loan" element={<ProtectedRoute><Loan /></ProtectedRoute>} />
                <Route path="/add-funds" element={<ProtectedRoute><AddFunds /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                <Route path="/upgrade" element={<ProtectedRoute><UpgradeAccount /></ProtectedRoute>} />
                <Route path="/gift-cards" element={<ProtectedRoute><GiftCards /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
