import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'motion/react';
import { ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first to reset your password.');
      return;
    }
    setResetLoading(true);
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl flex flex-col px-8 py-12"
      >
        <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Zero Bank</h1>
        </div>
        
        <h2 className="text-2xl font-bold text-neutral-text mb-2">Welcome Back</h2>
        <p className="text-neutral-muted mb-8">Sign in to manage your finances</p>

        {error && (
          <div className="bg-status-error/10 text-status-error p-4 rounded-xl mb-6 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-status-success/10 text-status-success p-4 rounded-xl mb-6 flex items-center gap-3 text-sm">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <p>{message}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-text">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-neutral-bg border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-text">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-neutral-bg border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                placeholder="Enter your password"
              />
            </div>
            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={handleForgotPassword}
                disabled={resetLoading}
                className="text-xs font-semibold text-primary hover:text-primary-accent transition-colors disabled:opacity-50"
              >
                {resetLoading ? 'Sending...' : 'Forgot Password?'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-accent text-white py-4 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 mt-8 flex justify-center items-center"
          >
            {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-8 text-neutral-muted text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
      </motion.div>
    </div>
  );
}
