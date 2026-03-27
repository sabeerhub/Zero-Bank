import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, writeBatch } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion } from 'motion/react';
import { ShieldCheck, Mail, Lock, User, AlertCircle, KeyRound } from 'lucide-react';

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
      setError('Transaction PIN must be exactly 4 digits');
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
        balance: 0, // Start with zero balance
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
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
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
        
        <h2 className="text-3xl font-bold text-neutral-text mb-2">Create Account</h2>
        <p className="text-neutral-muted mb-8">Start your financial journey with us</p>

        {error && (
          <div className="bg-status-error/10 text-status-error p-4 rounded-xl mb-6 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-text">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-muted" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-neutral-bg border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                placeholder="John Doe"
              />
            </div>
          </div>

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
                placeholder="Create a password"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-text">Transaction PIN (4 Digits)</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-muted" />
              <input
                type="password"
                required
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full pl-12 pr-4 py-3.5 bg-neutral-bg border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium tracking-widest"
                placeholder="••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-accent text-white py-4 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 mt-8 flex justify-center items-center"
          >
            {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-8 text-neutral-muted text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
      </motion.div>
    </div>
  );
}
