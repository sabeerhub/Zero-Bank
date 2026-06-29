import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, writeBatch } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion } from 'motion/react';
import { 
  Mail, 
  Lock, 
  User, 
  AlertCircle, 
  KeyRound, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Fingerprint, 
  Eye, 
  EyeOff,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();

  // Dark mode state synced with localStorage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('zero_bank_dark_mode');
    return saved ? saved === 'true' : false;
  });

  useEffect(() => {
    localStorage.setItem('zero_bank_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // Core register form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Focus tracking for input container glows
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'No Password' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    return { score, label: labels[score] };
  };

  const strength = getPasswordStrength(password);

  // Production Register Action
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
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
      
      setMessage('Account initialized securely! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between p-4 sm:p-6 font-sans relative overflow-hidden transition-colors duration-300 selection:bg-blue-600/30 selection:text-blue-300 ${isDarkMode ? 'bg-[#020205] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Absolute Premium Background Elements (strictly blue, black, white) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className={`absolute top-[-10%] left-[5%] w-[40vw] h-[40vw] rounded-full blur-[150px] transition-colors duration-300 ${isDarkMode ? 'bg-blue-900/10' : 'bg-blue-500/5'}`} />
        <div className={`absolute bottom-[-10%] right-[5%] w-[45vw] h-[45vw] rounded-full blur-[180px] transition-colors duration-300 ${isDarkMode ? 'bg-blue-600/5' : 'bg-blue-500/3'}`} />
        {/* Subtle grid pattern */}
        <div className={`absolute inset-0 bg-[size:4rem_4rem] transition-all duration-300 opacity-30 ${
          isDarkMode 
            ? 'bg-[linear-gradient(to_right,#0a0a16_1px,transparent_1px),linear-gradient(to_bottom,#0a0a16_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]' 
            : 'bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]'
        }`} />
      </div>

      {/* Modern High-End Header */}
      <header className="max-w-7xl w-full mx-auto flex justify-between items-center relative z-20 py-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/')}
            className={`px-4 py-2 rounded-full flex items-center gap-2 active:scale-95 transition-all shadow-lg text-xs font-semibold group ${
              isDarkMode 
                ? 'bg-neutral-900/80 border border-neutral-800/80 hover:bg-neutral-800/80 hover:border-neutral-700/80 text-white hover:text-blue-400' 
                : 'bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 hover:text-blue-500'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-blue-500" />
            <span>Home</span>
          </button>

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
            className={`w-full max-w-[440px] border rounded-[32px] p-6 sm:p-10 relative overflow-hidden transition-all duration-300 ${
              isDarkMode 
                ? 'bg-neutral-900/45 backdrop-blur-3xl border-neutral-800/80 shadow-[0_32px_80px_rgba(0,0,0,0.8)]' 
                : 'bg-white border-slate-200 shadow-[0_32px_80px_rgba(15,23,42,0.06)]'
            }`}
          >
            {/* Premium Top Corner glow */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className={`text-2xl font-black tracking-tight sm:text-3xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Get Started</h2>
                <p className={`text-xs font-semibold leading-relaxed ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Create a password-protected sandbox bank account.
                </p>
              </div>

                {/* Alert banner for error messages */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl flex items-start gap-3 text-xs font-semibold leading-relaxed border ${
                      isDarkMode 
                        ? 'bg-neutral-950 border-blue-900/40 text-blue-400' 
                        : 'bg-blue-50/50 border-blue-100 text-blue-600'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
                    <p>{error}</p>
                  </motion.div>
                )}

                {/* Alert banner for success messages */}
                {message && (
                  <motion.div 
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl flex items-start gap-3 text-xs font-semibold leading-relaxed border ${
                      isDarkMode 
                        ? 'bg-neutral-950 border-white/20 text-white' 
                        : 'bg-blue-50 border-blue-100 text-blue-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p>{message}</p>
                  </motion.div>
                )}

                {/* Core Register Form */}
                <form onSubmit={handleRegister} className="space-y-4">
                  
                  {/* Full Name field with active state border glow */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-black tracking-wider uppercase block ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>Full Name</label>
                    <div className={`relative rounded-2xl transition-all duration-350 border ${
                      focusedField === 'name' 
                        ? 'border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.25)] ' + (isDarkMode ? 'bg-neutral-950' : 'bg-white')
                        : (isDarkMode ? 'border-neutral-800 bg-black/60 hover:border-neutral-700' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300')
                    }`}>
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full pl-11 pr-4 py-3.5 bg-transparent rounded-2xl text-xs font-bold outline-none transition-colors ${
                          isDarkMode ? 'text-white placeholder-neutral-600' : 'text-slate-800 placeholder-slate-400'
                        }`}
                        placeholder="Sabeer Muhammed"
                      />
                    </div>
                  </div>

                  {/* Email address field with glow */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-black tracking-wider uppercase block ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>Email address</label>
                    <div className={`relative rounded-2xl transition-all duration-350 border ${
                      focusedField === 'email' 
                        ? 'border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.25)] ' + (isDarkMode ? 'bg-neutral-950' : 'bg-white')
                        : (isDarkMode ? 'border-neutral-800 bg-black/60 hover:border-neutral-700' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300')
                    }`}>
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-11 pr-4 py-3.5 bg-transparent rounded-2xl text-xs font-bold outline-none transition-colors ${
                          isDarkMode ? 'text-white placeholder-neutral-600' : 'text-slate-800 placeholder-slate-400'
                        }`}
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  {/* Password field with dynamic strength meter */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-black tracking-wider uppercase block ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>Password</label>
                    <div className={`relative rounded-2xl transition-all duration-350 border ${
                      focusedField === 'password' 
                        ? 'border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.25)] ' + (isDarkMode ? 'bg-neutral-950' : 'bg-white')
                        : (isDarkMode ? 'border-neutral-800 bg-black/60 hover:border-neutral-700' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300')
                    }`}>
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-11 pr-12 py-3.5 bg-transparent rounded-2xl text-xs font-bold outline-none transition-colors ${
                          isDarkMode ? 'text-white placeholder-neutral-600' : 'text-slate-800 placeholder-slate-400'
                        }`}
                        placeholder="Min. 8 characters"
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

                    {/* Segmented Password Strength Indicator inside specified palette (blue, white, black) */}
                    {password && (
                      <div className="space-y-1.5 pt-1">
                        <div className={`flex justify-between items-center text-[9px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                          <span>Password Strength</span>
                          <span className="text-blue-500">{strength.label}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[...Array(4)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`h-1.5 rounded-full transition-colors duration-300 ${
                                i < strength.score ? 'bg-blue-500' : (isDarkMode ? 'bg-neutral-800' : 'bg-slate-200')
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Secure 4 digit PIN input with bullet style mask */}
                  <div className={`space-y-1.5 border-t pt-5 ${isDarkMode ? 'border-neutral-800' : 'border-slate-100'}`}>
                    <div className="flex justify-between items-center">
                      <label className={`text-[10px] font-black tracking-wider uppercase ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>Security PIN (4 Digits)</label>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">High Importance</span>
                    </div>
                    <div className={`relative rounded-2xl transition-all duration-350 border ${
                      focusedField === 'pin' 
                        ? 'border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.25)] ' + (isDarkMode ? 'bg-neutral-950' : 'bg-white')
                        : (isDarkMode ? 'border-neutral-800 bg-black/60 hover:border-neutral-700' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300')
                    }`}>
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={pin}
                        onFocus={() => setFocusedField('pin')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className={`w-full pl-11 pr-4 py-3.5 bg-transparent rounded-2xl text-xs font-bold tracking-widest outline-none transition-all ${
                          isDarkMode ? 'text-white placeholder-neutral-600' : 'text-slate-800 placeholder-slate-400'
                        }`}
                        placeholder="••••"
                      />
                    </div>
                    <p className={`text-[10px] font-semibold leading-snug ${isDarkMode ? 'text-neutral-500' : 'text-slate-400'}`}>Used to authorize mock bank transfers, billing, and card freezing.</p>
                  </div>

                  {/* Trigger Registration */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white py-4 rounded-2xl font-bold transition-all disabled:opacity-70 relative flex justify-center items-center gap-2 text-xs mt-6 cursor-pointer shadow-lg shadow-blue-500/10"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Initialize Sandbox Wallet</span>
                        <ArrowRight className="w-4 h-4 text-white" strokeWidth={2.5} />
                      </>
                    )}
                  </button>
                </form>

                <p className={`text-center text-xs font-semibold ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-500 hover:text-blue-600 font-bold transition-colors">
                    Log In
                  </Link>
                </p>
              </div>

            </motion.div>
        </div>
      </main>

      {/* Sleek bottom footer */}
      <footer className={`w-full max-w-7xl mx-auto text-center text-[10px] py-4 font-bold tracking-wider uppercase relative z-20 border-t pt-6 ${
        isDarkMode ? 'text-neutral-600 border-neutral-950' : 'text-slate-400 border-slate-200'
      }`}>
        © {new Date().getFullYear()} Zero Bank. All transactions are secure offline simulated sandbox activities.
      </footer>
    </div>
  );
}
