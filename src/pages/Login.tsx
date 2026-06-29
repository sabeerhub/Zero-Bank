import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Fingerprint, 
  Smartphone, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw,
  Clock,
  KeyRound,
  Sun,
  Moon
} from 'lucide-react';

export default function Login() {
  // Navigation
  const navigate = useNavigate();

  // Dark mode state synced with localStorage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('zero_bank_dark_mode');
    return saved ? saved === 'true' : false;
  });

  useEffect(() => {
    localStorage.setItem('zero_bank_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // Active View State: 'login' | 'forgot' | 'pin_auth' | 'reset' | 'email_verify'
  const [activeView, setActiveView] = useState<'login' | 'forgot' | 'pin_auth' | 'reset' | 'email_verify'>('login');

  // Firebase Auth states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // PIN login states
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [pinStatus, setPinStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');

  // Simulated Reset Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Countdown timer for resending verification code/email
  const [countdown, setCountdown] = useState(45);
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && (activeView === 'email_verify')) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, activeView]);

  const handleResend = () => {
    setCountdown(45);
    // Simulated resend feedback
    setMessage('Verification code resent successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  // Focus tracking for glow rings
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'No Password', color: 'bg-neutral-850' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    const colors = [
      'bg-neutral-800', // weak
      'bg-blue-900',   // fair
      'bg-blue-700',   // good
      'bg-blue-500',   // strong
      'bg-white'       // excellent
    ];
    return { score, label: labels[score], color: colors[score] };
  };

  const strength = getPasswordStrength(newPassword || password);

  // Real production login submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch user profile from firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userDocRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        
        // Check if account is currently blocked (for 24 hours)
        if (userData.blockedUntil) {
          const blockedUntilTime = new Date(userData.blockedUntil).getTime();
          if (blockedUntilTime > Date.now()) {
            await auth.signOut();
            const remainingMs = blockedUntilTime - Date.now();
            const remainingHrs = Math.floor(remainingMs / (60 * 60 * 1000));
            const remainingMins = Math.ceil((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
            setError(`This account is temporarily blocked due to multiple incorrect PIN attempts. Try again in ${remainingHrs}h ${remainingMins}m.`);
            setLoading(false);
            return;
          }
        }
        
        setLoggedInUser({ uid: user.uid, ...userData });
        // Transition to 4-digit PIN authentication view
        setActiveView('pin_auth');
        setPinDigits(['', '', '', '']);
        setPinStatus('idle');
      } else {
        // No user document? Send to dashboard (it will handle redirect if needed)
        navigate('/');
      }
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

  // Real password reset email request
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address to reset your password.');
      return;
    }
    setResetLoading(true);
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset link sent to your email. Check your spam folder if you do not see it.');
      setActiveView('email_verify');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setResetLoading(false);
    }
  };

  // Real 4-digit PIN verification submit with 3-strikes 24h block lockout logic
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInUser) return;
    
    setPinStatus('verifying');
    setError('');
    
    const enteredPin = pinDigits.join('');
    if (enteredPin.length !== 4) {
      setError('PIN must be exactly 4 digits.');
      setPinStatus('error');
      return;
    }
    
    try {
      const userDocRef = doc(db, 'users', loggedInUser.uid);
      
      // Fetch latest data to verify block status & pin attempts
      const userSnapshot = await getDoc(userDocRef);
      if (!userSnapshot.exists()) {
        setError('Account document not found.');
        setPinStatus('error');
        return;
      }
      
      const userData = userSnapshot.data();
      const actualPin = userData.pin;
      
      // Check if blocked
      if (userData.blockedUntil) {
        const blockedUntilTime = new Date(userData.blockedUntil).getTime();
        if (blockedUntilTime > Date.now()) {
          await auth.signOut();
          setError('This account is blocked. Please try again later.');
          setActiveView('login');
          return;
        }
      }
      
      // If user hasn't set a PIN yet, allow entry and they'll set it in the app
      if (!actualPin) {
        setPinStatus('success');
        setTimeout(() => {
          navigate('/');
        }, 1000);
        return;
      }
      
      if (enteredPin === actualPin) {
        setPinStatus('success');
        // Reset failed attempts in Firestore
        await updateDoc(userDocRef, {
          failedPinAttempts: 0,
          blockedUntil: null
        });
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        // Wrong PIN entered!
        const currentAttempts = (userData.failedPinAttempts || 0) + 1;
        
        if (currentAttempts >= 3) {
          // Block account for 24 hours
          const blockedTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
          await updateDoc(userDocRef, {
            failedPinAttempts: 3,
            blockedUntil: blockedTime
          });
          
          await auth.signOut();
          setError('Incorrect PIN. Your account has been blocked for 24 hours due to 3 incorrect attempts.');
          setPinStatus('error');
          setTimeout(() => {
            setActiveView('login');
            setPinDigits(['', '', '', '']);
            setLoggedInUser(null);
          }, 4000);
        } else {
          // Update failed attempts count
          await updateDoc(userDocRef, {
            failedPinAttempts: currentAttempts
          });
          // Update local state so we have the correct count if they try again without reloading
          setLoggedInUser({
            ...loggedInUser,
            failedPinAttempts: currentAttempts
          });
          
          setError(`Incorrect PIN. ${3 - currentAttempts} attempt(s) remaining.`);
          setPinDigits(['', '', '', '']);
          setPinStatus('error');
          // Reset focus to first input
          setTimeout(() => {
            const firstInput = document.getElementById('pin-0');
            firstInput?.focus();
          }, 100);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Verification failed. Please try again.');
      setPinStatus('error');
    }
  };

  const handlePinDigitChange = (value: string, index: number) => {
    const cleanVal = value.replace(/\D/g, '').slice(0, 1);
    const newPin = [...pinDigits];
    newPin[index] = cleanVal;
    setPinDigits(newPin);

    // Auto-focus next field
    if (cleanVal && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Simulated password reset submit
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setResetStatus('idle');
    setTimeout(() => {
      setResetStatus('success');
      setMessage('Your password has been reset successfully! You can now log in.');
      setTimeout(() => {
        setActiveView('login');
        setNewPassword('');
        setConfirmPassword('');
        setResetStatus('idle');
      }, 2000);
    }, 1200);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between p-4 sm:p-6 font-sans relative overflow-hidden transition-colors duration-300 selection:bg-blue-600/30 selection:text-blue-300 ${
      isDarkMode ? 'bg-[#020205] text-white' : 'bg-gradient-to-br from-[#F8FAFC] via-[#EDF2F7] to-[#E2E8F0] text-slate-900'
    }`}>
      
      {/* Absolute Premium Background Elements (strictly blue, black, white) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className={`absolute top-[-10%] left-[5%] w-[40vw] h-[40vw] rounded-full blur-[150px] transition-all duration-300 ${
          isDarkMode ? 'bg-blue-900/10' : 'bg-blue-200/20'
        }`} />
        <div className={`absolute bottom-[-10%] right-[5%] w-[45vw] h-[45vw] rounded-full blur-[180px] transition-all duration-300 ${
          isDarkMode ? 'bg-blue-600/5' : 'bg-blue-400/10'
        }`} />
        {/* Subtle grid pattern */}
        <div className={`absolute inset-0 bg-[linear-gradient(to_right,#0a0a16_1px,transparent_1px),linear-gradient(to_bottom,#0a0a16_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] ${
          isDarkMode ? 'opacity-30' : 'opacity-10 mix-blend-overlay'
        }`} />
      </div>

      {/* Modern High-End Header */}
      <header className="max-w-7xl w-full mx-auto flex justify-between items-center relative z-20 py-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className={`px-4 py-2 rounded-full flex items-center gap-2 active:scale-95 transition-all shadow-lg text-xs font-semibold group ${
              isDarkMode 
                ? 'bg-neutral-900/80 border border-neutral-800/80 text-white hover:bg-neutral-800/80 hover:border-neutral-700/80 hover:text-blue-400' 
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-blue-500" />
            <span>Home</span>
          </button>

          {/* Elegant Theme Switcher */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full border transition-all hover:scale-105 active:scale-95 ${
              isDarkMode 
                ? 'bg-neutral-900/80 border-neutral-800 text-blue-400 hover:text-blue-300' 
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 shadow-md'
            }`}
            aria-label="Toggle dark mode"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-blue-500 rounded-xl flex items-center justify-center text-white font-black text-lg italic tracking-tighter shadow-lg shadow-blue-500/20">
            Z
          </div>
          <span className={`text-base font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Zero Bank</span>
        </div>
      </header>

      {/* Main Container - Centered Form Card */}
      <main className="flex-1 flex items-center justify-center py-6 relative z-10 w-full max-w-md mx-auto px-2">
        <div className="flex items-center justify-center w-full">
          <motion.div
            layout
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full max-w-[440px] border rounded-[32px] p-6 sm:p-10 shadow-[0_32px_80px_rgba(0,0,0,0.15)] relative overflow-hidden transition-all duration-300 ${
              isDarkMode 
                ? 'bg-neutral-900/45 border-neutral-800/80 backdrop-blur-3xl shadow-[0_32px_80px_rgba(0,0,0,0.8)]' 
                : 'bg-white border-slate-200/80 shadow-[0_20px_60px_rgba(0,0,0,0.05)]'
            }`}
          >
            {/* Premium Top Corner glow */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <AnimatePresence mode="wait">
              {/* 1. LOGIN SCREEN */}
              {activeView === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className={`text-2xl font-black tracking-tight sm:text-3xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Welcome Back</h2>
                    <p className={`text-xs font-semibold leading-relaxed ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                      Sign in to access your secure digital sandbox ledger.
                    </p>
                  </div>


                    {/* Alert banner for error messages (styled strictly blue, black, white) */}
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`border p-4 rounded-2xl flex items-start gap-3 text-xs font-semibold leading-relaxed ${
                          isDarkMode 
                            ? 'bg-neutral-950 border-blue-900/40 text-blue-400' 
                            : 'bg-blue-50 border-blue-100 text-blue-700'
                        }`}
                      >
                        <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isDarkMode ? 'text-blue-500' : 'text-blue-600'}`} />
                        <p>{error}</p>
                      </motion.div>
                    )}

                    {/* Success notification banner */}
                    {message && (
                      <motion.div 
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`border p-4 rounded-2xl flex items-start gap-3 text-xs font-semibold leading-relaxed ${
                          isDarkMode 
                            ? 'bg-neutral-950 border-white/20 text-white' 
                            : 'bg-slate-50 border-slate-200 text-slate-800 shadow-sm'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <p>{message}</p>
                      </motion.div>
                    )}

                    {/* Core Login Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                      
                      {/* Email address field with premium glow ring */}
                      <div className="space-y-1.5">
                        <label className={`text-[10px] font-black tracking-wider uppercase block ${isDarkMode ? 'text-neutral-400' : 'text-slate-550'}`}>Email address</label>
                        <div className={`relative rounded-2xl transition-all duration-350 border ${
                          focusedField === 'email' 
                            ? isDarkMode 
                              ? 'border-blue-500 bg-neutral-950 shadow-[0_0_15px_rgba(37,99,235,0.25)]' 
                              : 'border-blue-500 bg-white shadow-[0_0_15px_rgba(37,99,235,0.12)]'
                            : isDarkMode 
                              ? 'border-neutral-800 bg-black/60 hover:border-neutral-700' 
                              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                        }`}>
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-550" />
                          <input
                            type="email"
                            required
                            value={email}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full pl-11 pr-4 py-3.5 bg-transparent rounded-2xl text-xs font-bold outline-none transition-colors ${
                              isDarkMode ? 'text-white placeholder-neutral-600' : 'text-slate-900 placeholder-slate-400'
                            }`}
                            placeholder="name@example.com"
                          />
                        </div>
                      </div>

                      {/* Password field with show/hide and active borders */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className={`text-[10px] font-black tracking-wider uppercase ${isDarkMode ? 'text-neutral-400' : 'text-slate-550'}`}>Password</label>
                          <button 
                            type="button" 
                            onClick={() => setActiveView('forgot')}
                            className={`text-[10px] font-black transition-colors ${
                              isDarkMode ? 'text-blue-500 hover:text-white' : 'text-blue-600 hover:text-slate-900'
                            }`}
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <div className={`relative rounded-2xl transition-all duration-350 border ${
                          focusedField === 'password' 
                            ? isDarkMode 
                              ? 'border-blue-500 bg-neutral-950 shadow-[0_0_15px_rgba(37,99,235,0.25)]' 
                              : 'border-blue-500 bg-white shadow-[0_0_15px_rgba(37,99,235,0.12)]'
                            : isDarkMode 
                              ? 'border-neutral-800 bg-black/60 hover:border-neutral-700' 
                              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                        }`}>
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-550" />
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full pl-11 pr-12 py-3.5 bg-transparent rounded-2xl text-xs font-bold outline-none transition-colors ${
                              isDarkMode ? 'text-white placeholder-neutral-600' : 'text-slate-900 placeholder-slate-400'
                            }`}
                            placeholder="Type your secure password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors p-1 rounded-full ${
                              isDarkMode ? 'text-neutral-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-blue-500" />}
                          </button>
                        </div>
                      </div>

                      {/* Login Trigger */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white py-4 rounded-2xl font-bold transition-all disabled:opacity-70 relative flex justify-center items-center gap-2 text-xs mt-6 cursor-pointer shadow-lg shadow-blue-500/10"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Authorize Secure Log In</span>
                            <ArrowRight className="w-4 h-4 text-white" strokeWidth={2.5} />
                          </>
                        )}
                      </button>
                    </form>

                    <p className={`text-center text-xs font-semibold ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                      New to Zero Bank?{' '}
                      <Link to="/register" className={`font-bold transition-colors ${isDarkMode ? 'text-blue-500 hover:text-white' : 'text-blue-600 hover:text-slate-900'}`}>
                        Create a free account
                      </Link>
                    </p>
                  </motion.div>
                )}

                {/* 2. FORGOT PASSWORD SCREEN */}
                {activeView === 'forgot' && (
                  <motion.div
                    key="forgot"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Reset Credentials</h2>
                      <p className={`text-xs font-semibold leading-relaxed ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                        Input your email and we will dispatch a dynamic secure reset hyperlink to configure your account credentials.
                      </p>
                    </div>

                    {error && (
                      <div className={`border p-4 rounded-2xl flex items-start gap-3 text-xs font-semibold ${
                        isDarkMode 
                          ? 'bg-neutral-950 border-blue-900/40 text-blue-400' 
                          : 'bg-blue-50 border-blue-100 text-blue-700'
                      }`}>
                        <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isDarkMode ? 'text-blue-500' : 'text-blue-600'}`} />
                        <p>{error}</p>
                      </div>
                    )}

                    {message && (
                      <div className={`border p-4 rounded-2xl flex items-start gap-3 text-xs font-semibold ${
                        isDarkMode 
                          ? 'bg-neutral-950 border-white/20 text-white' 
                          : 'bg-slate-50 border-slate-200 text-slate-850 shadow-sm'
                      }`}>
                        <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <p>{message}</p>
                      </div>
                    )}

                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
                      <div className="space-y-1.5">
                        <label className={`text-[10px] font-black tracking-wider uppercase block ${isDarkMode ? 'text-neutral-400' : 'text-slate-550'}`}>Your Email Address</label>
                        <div className={`relative rounded-2xl transition-all border ${
                          focusedField === 'forgot-email' 
                            ? isDarkMode 
                              ? 'border-blue-500 bg-neutral-950' 
                              : 'border-blue-500 bg-white'
                            : isDarkMode 
                              ? 'border-neutral-800 bg-black/60' 
                              : 'border-slate-200 bg-slate-50'
                        }`}>
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-550" />
                          <input
                            type="email"
                            required
                            value={email}
                            onFocus={() => setFocusedField('forgot-email')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full pl-11 pr-4 py-3.5 bg-transparent rounded-2xl text-xs font-bold outline-none ${
                              isDarkMode ? 'text-white placeholder-neutral-600' : 'text-slate-900 placeholder-slate-400'
                            }`}
                            placeholder="name@example.com"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white py-4 rounded-2xl font-bold transition-all disabled:opacity-70 flex justify-center items-center gap-2 text-xs cursor-pointer shadow-lg shadow-blue-500/10"
                      >
                        {resetLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Dispatch Reset Credentials</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveView('login');
                          setError('');
                          setMessage('');
                        }}
                        className={`w-full py-3.5 rounded-2xl border transition-all text-xs font-bold flex justify-center items-center gap-2 ${
                          isDarkMode 
                            ? 'border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-900' 
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Return to Sign In</span>
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* 3. TRANSACTION PIN AUTH SCREEN */}
                {activeView === 'pin_auth' && (
                  <motion.div
                    key="pin_auth"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                        isDarkMode 
                          ? 'bg-blue-600/10 border-blue-500/30 text-blue-500' 
                          : 'bg-blue-50 border-blue-200 text-blue-600'
                      }`}>
                        <Lock className="w-6 h-6 animate-pulse" />
                      </div>
                      <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Authorize Sandbox Access</h2>
                      <p className={`text-xs font-semibold leading-relaxed ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                        Enter your secure 4-digit Transaction PIN to complete the login authorization and unlock your digital ledger.
                      </p>
                    </div>

                    {error && (
                      <div className={`border p-4 rounded-2xl flex items-start gap-3 text-xs font-semibold ${
                        isDarkMode 
                          ? 'bg-neutral-950 border-blue-900/40 text-blue-400' 
                          : 'bg-blue-50 border-blue-100 text-blue-700'
                      }`}>
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>{error}</p>
                      </div>
                    )}

                    <form onSubmit={handleVerifyPin} className="space-y-6">
                      
                      {/* 4 Digit Box Layout */}
                      <div className="flex justify-center gap-4">
                        {pinDigits.map((digit, index) => (
                          <input
                            key={index}
                            id={`pin-${index}`}
                            type="password"
                            maxLength={1}
                            required
                            value={digit}
                            onChange={(e) => handlePinDigitChange(e.target.value, index)}
                            onKeyDown={(e) => handlePinKeyDown(e, index)}
                            className={`w-14 h-14 border rounded-xl text-center text-xl font-black outline-none transition-all ${
                              isDarkMode 
                                ? 'bg-black/60 border-neutral-800 focus:border-blue-500 focus:shadow-[0_0_15px_rgba(37,99,235,0.25)] text-white' 
                                : 'bg-slate-50 border-slate-200 focus:border-blue-500 focus:shadow-[0_0_15px_rgba(37,99,235,0.12)] text-slate-900'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        type="submit"
                        disabled={pinStatus === 'verifying'}
                        className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white py-4 rounded-2xl font-bold transition-all disabled:opacity-75 flex justify-center items-center gap-2 text-xs shadow-lg shadow-blue-500/10 cursor-pointer"
                      >
                        {pinStatus === 'verifying' ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-white" />
                            <span>Verifying security clearance...</span>
                          </>
                        ) : pinStatus === 'success' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-white" />
                            <span>Authorized Successfully</span>
                          </>
                        ) : (
                          <>
                            <span>Verify Transaction PIN</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          await auth.signOut();
                          setActiveView('login');
                          setPinDigits(['', '', '', '']);
                          setError('');
                        }}
                        className={`w-full py-3 text-xs font-bold transition-colors ${
                          isDarkMode ? 'text-neutral-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Cancel & Sign Out
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* 4. RESET PASSWORD SCREEN */}
                {activeView === 'reset' && (
                  <motion.div
                    key="reset"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Reset Password</h2>
                      <p className={`text-xs font-semibold leading-relaxed ${isDarkMode ? 'text-neutral-400' : 'text-slate-550'}`}>
                        Configure a premium secure account password utilizing capital letters, digits, and special characters.
                      </p>
                    </div>

                    {error && (
                      <div className={`border p-4 rounded-2xl flex items-start gap-3 text-xs font-semibold ${
                        isDarkMode 
                          ? 'bg-neutral-950 border-blue-900/40 text-blue-400' 
                          : 'bg-blue-50 border-blue-100 text-blue-700'
                      }`}>
                        <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isDarkMode ? 'text-blue-500' : 'text-blue-600'}`} />
                        <p>{error}</p>
                      </div>
                    )}

                    {message && (
                      <div className={`border p-4 rounded-2xl flex items-start gap-3 text-xs font-semibold ${
                        isDarkMode 
                          ? 'bg-neutral-950 border-white/20 text-white' 
                          : 'bg-slate-50 border-slate-200 text-slate-850 shadow-sm'
                      }`}>
                        <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <p>{message}</p>
                      </div>
                    )}

                    <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                      
                      {/* New password */}
                      <div className="space-y-1.5">
                        <label className={`text-[10px] font-black tracking-wider uppercase block ${isDarkMode ? 'text-neutral-400' : 'text-slate-550'}`}>New Password</label>
                        <div className={`relative rounded-2xl transition-all border ${
                          focusedField === 'new-pass' 
                            ? isDarkMode ? 'border-blue-500 bg-neutral-950' : 'border-blue-500 bg-white'
                            : isDarkMode ? 'border-neutral-800 bg-black/60' : 'border-slate-200 bg-slate-50'
                        }`}>
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-550" />
                          <input
                            type="password"
                            required
                            value={newPassword}
                            onFocus={() => setFocusedField('new-pass')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={`w-full pl-11 pr-4 py-3.5 bg-transparent rounded-2xl text-xs font-bold outline-none ${
                              isDarkMode ? 'text-white placeholder-neutral-600' : 'text-slate-900 placeholder-slate-400'
                            }`}
                            placeholder="Min. 8 characters"
                          />
                        </div>

                        {/* Segemented Password Strength Indicator in Blue, Black, White */}
                        {newPassword && (
                          <div className="space-y-1.5 pt-1">
                            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-neutral-500">
                              <span>Password Strength</span>
                              <span className="text-blue-500">{strength.label}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                              {[...Array(4)].map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`h-1.5 rounded-full transition-colors duration-300 ${
                                    i < strength.score 
                                      ? 'bg-blue-500' 
                                      : isDarkMode ? 'bg-neutral-800' : 'bg-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirm password */}
                      <div className="space-y-1.5">
                        <label className={`text-[10px] font-black tracking-wider uppercase block ${isDarkMode ? 'text-neutral-400' : 'text-slate-550'}`}>Confirm Password</label>
                        <div className={`relative rounded-2xl transition-all border ${
                          focusedField === 'confirm-pass' 
                            ? isDarkMode ? 'border-blue-500 bg-neutral-950' : 'border-blue-500 bg-white'
                            : isDarkMode ? 'border-neutral-800 bg-black/60' : 'border-slate-200 bg-slate-50'
                        }`}>
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-550" />
                          <input
                            type="password"
                            required
                            value={confirmPassword}
                            onFocus={() => setFocusedField('confirm-pass')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full pl-11 pr-4 py-3.5 bg-transparent rounded-2xl text-xs font-bold outline-none ${
                              isDarkMode ? 'text-white placeholder-neutral-600' : 'text-slate-900 placeholder-slate-400'
                            }`}
                            placeholder="Verify password"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={resetStatus === 'success'}
                        className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white py-4 rounded-2xl font-bold transition-all disabled:opacity-70 flex justify-center items-center gap-2 text-xs mt-4 cursor-pointer shadow-lg shadow-blue-500/10"
                      >
                        {resetStatus === 'success' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-white" />
                            <span>Password Set! Redirection...</span>
                          </>
                        ) : (
                          <>
                            <span>Change Credentials</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* 5. EMAIL VERIFICATION PREVIEW SCREEN */}
                {activeView === 'email_verify' && (
                  <motion.div
                    key="email_verify"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6 text-center"
                  >
                    <div className="space-y-2 flex flex-col items-center">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 border ${
                        isDarkMode 
                          ? 'bg-blue-600/10 border-blue-500/30 text-blue-500' 
                          : 'bg-blue-50 border-blue-200 text-blue-600'
                      }`}>
                        <Mail className="w-7 h-7" />
                      </div>
                      <h2 className={`text-2xl font-black tracking-tight text-left self-stretch ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Verify Your Email</h2>
                      <p className={`text-xs font-semibold leading-relaxed text-left self-stretch ${isDarkMode ? 'text-neutral-400' : 'text-slate-550'}`}>
                        We have dispatched a verification link to your active mailbox. Access the link to unlock your Zero Bank balance and secure card actions.
                      </p>
                    </div>

                    <div className={`p-4 rounded-2xl text-left space-y-1.5 border ${
                      isDarkMode 
                        ? 'bg-neutral-950 border-neutral-850/60' 
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-500 block">Sent Target</span>
                      <span className={`text-xs font-mono font-semibold break-all block ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{email || "your-email@example.com"}</span>
                    </div>

                    {message && (
                      <div className={`border p-4 rounded-2xl flex items-start gap-3 text-xs font-semibold text-left ${
                        isDarkMode 
                          ? 'bg-neutral-950 border-white/20 text-white' 
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}>
                        <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <p>{message}</p>
                      </div>
                    )}

                    <div className="space-y-3 pt-2">
                      <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white py-4 rounded-2xl font-bold transition-all flex justify-center items-center gap-2 text-xs shadow-lg shadow-blue-500/10"
                      >
                        <span>I have verified my email</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <div className="flex justify-between items-center text-xs px-1 pt-2">
                        <span className={`font-semibold ${isDarkMode ? 'text-neutral-500' : 'text-slate-400'}`}>No email received?</span>
                        {countdown > 0 ? (
                          <span className={`font-mono ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Resend link in {countdown}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResend}
                            className={`font-bold transition-all ${isDarkMode ? 'text-blue-500 hover:text-white' : 'text-blue-600 hover:text-slate-900'}`}
                          >
                            Resend Link
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveView('login');
                          setError('');
                          setMessage('');
                        }}
                        className={`w-full py-3.5 mt-2 rounded-2xl border transition-all text-xs font-bold ${
                          isDarkMode 
                            ? 'border-neutral-850 text-neutral-400 hover:text-white hover:bg-neutral-900' 
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Return to Sign In
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
        </div>
      </main>

      {/* Sleek bottom footer */}
      <footer className={`w-full max-w-7xl mx-auto text-center text-[10px] py-4 font-bold tracking-wider uppercase relative z-20 border-t pt-6 ${
        isDarkMode ? 'border-neutral-950 text-neutral-600' : 'border-slate-200 text-slate-400'
      }`}>
        © {new Date().getFullYear()} Zero Bank. All transactions are secure offline simulated sandbox activities.
      </footer>
    </div>
  );
}
