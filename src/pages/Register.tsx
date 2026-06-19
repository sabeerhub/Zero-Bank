import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, writeBatch } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion } from 'motion/react';
import { Mail, Lock, User, AlertCircle, KeyRound, ArrowLeft, ArrowRight } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (pin.length !== 4) {
      setError('Your Security PIN must be exactly 4 digits.');
      setLoading(false);
      return;
    }

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Auto-generate 10-digit account number (starting with 2 for realism)
      const accountNumber = '2' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
      
      const batch = writeBatch(db);
      
      const userRef = doc(db, 'users', user.uid);
      batch.set(userRef, {
        uid: user.uid,
        name,
        email,
        accountNumber,
        balance: 100000, // Gift a realistic 100k start balance for direct onboarding ease & demo engagement
        pin,
        createdAt: new Date().toISOString()
      });
      
      const publicProfileRef = doc(db, 'public_profiles', accountNumber);
      batch.set(publicProfileRef, {
        uid: user.uid,
        name,
        accountNumber
      });
      
      await batch.commit();
      
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create your account. Please try again.');
    } finally {
      setLoading(false);
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
            <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">Create Account</h2>
            <p className="text-xs text-[#64748B] font-semibold">Join us today to set up your personal wallet.</p>
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

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:border-[#2563EB] focus:bg-white transition-all text-xs font-bold outline-none"
                  placeholder="Sabeer Muhammed"
                />
              </div>
            </div>

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
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:border-[#2563EB] focus:bg-white transition-all text-xs font-bold outline-none"
                  placeholder="Create password"
                />
              </div>
            </div>

            <div className="space-y-1.5 border-t border-[#F1F5F9] pt-4">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-0.5">Security PIN (4 Digits)</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:border-[#2563EB] focus:bg-white transition-all text-xs font-bold tracking-widest text-[#0F172A] outline-none"
                  placeholder="••••"
                />
              </div>
              <p className="text-[9px] font-bold text-[#64748B] leading-snug">Used to approve your transfers and payments cleanly.</p>
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
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs font-semibold text-[#64748B]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#2563EB] hover:text-blue-700 font-bold">
              Log In
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
