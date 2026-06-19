import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'motion/react';
import { Mail, Lock, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

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
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect email or password.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please type your email to reset your password.');
      return;
    }
    setResetLoading(true);
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between p-6 font-sans text-[#0F172A] relative overflow-hidden">
      {/* Background visual circles */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-200/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header bar */}
      <header className="max-w-7xl w-full mx-auto flex justify-between items-center relative z-20">
        <button 
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 text-[#0F172A] group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center text-white font-bold text-sm italic">Z</div>
          <span className="text-sm font-bold text-[#0F172A] tracking-tight">Zero Bank</span>
        </div>
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center py-10 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-white rounded-3xl border border-[#E2E8F0] shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-8 space-y-6"
        >
          <div className="text-center md:text-left space-y-1">
            <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">Welcome back</h2>
            <p className="text-xs text-[#64748B] font-semibold">Sign in to manage your money and view your wallet.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-50 border border-rose-100/60 text-[#EF4444] p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444]" />
              <p>{error}</p>
            </motion.div>
          )}

          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 border border-emerald-100/60 text-[#16A34A] p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold leading-relaxed"
            >
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
              <p>{message}</p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:border-[#2563EB] focus:bg-white transition-all text-xs font-bold outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Password</label>
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="text-[10px] font-bold text-[#2563EB] hover:text-blue-700 transition-colors disabled:opacity-50"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:border-[#2563EB] focus:bg-white transition-all text-[#0F172A] text-xs font-bold outline-none"
                  placeholder="Type your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F172A] hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-75 relative flex justify-center items-center gap-1.5 text-xs mt-6"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs font-semibold text-[#64748B]">
            New to Zero Bank?{' '}
            <Link to="/register" className="text-[#2563EB] hover:text-blue-700 font-bold">
              Create an account
            </Link>
          </p>
        </motion.div>
      </main>

      {/* Clean footer */}
      <footer className="w-full max-w-7xl mx-auto text-center text-[10px] text-[#64748B] py-4 font-bold tracking-tight">
        © {new Date().getFullYear()} Zero Bank. All rights reserved.
      </footer>
    </div>
  );
}
