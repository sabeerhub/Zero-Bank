import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Check, 
  ChevronRight, 
  CreditCard, 
  Fingerprint, 
  Globe, 
  Lock, 
  Send, 
  Smartphone, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Moon, 
  Sun, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  HelpCircle, 
  ChevronDown, 
  Star, 
  QrCode, 
  Shield, 
  Layers, 
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Premium Custom States for Landing Page
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('zero_bank_dark_mode');
    return saved ? saved === 'true' : false;
  });

  useEffect(() => {
    localStorage.setItem('zero_bank_dark_mode', String(isDarkMode));
  }, [isDarkMode]);
  const [cardColor, setCardColor] = useState<'blue' | 'black' | 'white'>('blue');
  const [isCardFrozen, setIsCardFrozen] = useState<boolean>(false);
  const [showCardNumbers, setShowCardNumbers] = useState<boolean>(false);
  
  // Interactive Simulator States
  const [simAmount, setSimAmount] = useState<string>('5000');
  const [simStatus, setSimStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  
  // Interactive Biometric Scan State
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success'>('idle');

  // FAQ Accordion Active Index
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Transfer demo trigger
  const triggerSimTransfer = () => {
    if (simStatus !== 'idle') return;
    setSimStatus('sending');
    setTimeout(() => {
      setSimStatus('success');
      setTimeout(() => {
        setSimStatus('idle');
      }, 3000);
    }, 1200);
  };

  // Biometric scan trigger
  const triggerBiometricScan = () => {
    if (scanState !== 'idle') return;
    setScanState('scanning');
    setTimeout(() => {
      setScanState('success');
      setTimeout(() => {
        setScanState('idle');
      }, 3000);
    }, 1500);
  };

  const faqs = [
    {
      q: 'How fast are transfers on Zero Bank?',
      a: 'All local transfers and payments are processed in under 0.02 seconds. Our high-fidelity simulated ledger updates instantly and securely.'
    },
    {
      q: 'How does the free ₦100,000 welcome gift work?',
      a: 'To make onboarding and exploring our premium banking features seamless, every new account is automatically credited with ₦100,000 in simulated sandbox funds instantly upon registration.'
    },
    {
      q: 'Can I generate multiple virtual cards?',
      a: 'Yes! You can instantly create custom virtual cards. Each card has its own customizable balance, design finish, and freeze controls to protect your subscription payments.'
    },
    {
      q: 'What security standards do you use?',
      a: 'We implement advanced Firebase Security Protocols and strict client-side PIN encryption. Every high-importance action, including transfers, billing payments, and card unlocks, requires your 4-digit security PIN.'
    }
  ];

  const handleHeroCTA = () => {
    if (user) {
      navigate('/');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans overflow-x-hidden selection:bg-blue-500/10 selection:text-blue-600 ${isDarkMode ? 'bg-[#000000] text-white' : 'bg-[#F8FAFC] text-[#000000]'}`}>
      
      {/* Dynamic Background Gradients - Strictly Blue, White, Black */}
      <div className="absolute top-0 inset-x-0 h-[1000px] overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[-300px] left-1/2 -translate-x-1/2 w-[800px] md:w-[1200px] h-[600px] md:h-[800px] rounded-full blur-[140px] opacity-25 transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-tr from-[#1E3A8A] via-[#1D4ED8] to-[#2563EB]' : 'bg-gradient-to-tr from-blue-100 to-blue-200'}`} />
        <div className={`absolute top-[400px] right-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full blur-[120px] opacity-15 transition-colors duration-500 ${isDarkMode ? 'bg-blue-600/10' : 'bg-blue-100/40'}`} />
        <div className={`absolute top-[800px] left-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full blur-[120px] opacity-15 transition-colors duration-500 ${isDarkMode ? 'bg-blue-800/10' : 'bg-blue-200/20'}`} />
      </div>

      {/* Modern High-End Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${isDarkMode ? 'bg-[#000000]/80 border-neutral-900' : 'bg-white/80 border-slate-200/50'} px-6 py-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-500 rounded-xl flex items-center justify-center text-white font-black text-xl italic tracking-tighter shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              Z
            </div>
            <span className={`text-xl font-bold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Zero Bank</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <a href="#live-card" className={`transition-colors hover:text-blue-500 ${isDarkMode ? 'text-neutral-400' : 'text-slate-600'}`}>Virtual Cards</a>
            <a href="#features" className={`transition-colors hover:text-blue-500 ${isDarkMode ? 'text-neutral-400' : 'text-slate-600'}`}>Features</a>
            <a href="#security" className={`transition-colors hover:text-blue-500 ${isDarkMode ? 'text-neutral-400' : 'text-slate-600'}`}>Security</a>
            <a href="#testimonials" className={`transition-colors hover:text-blue-500 ${isDarkMode ? 'text-neutral-400' : 'text-slate-600'}`}>Reviews</a>
            <a href="#faq" className={`transition-colors hover:text-blue-500 ${isDarkMode ? 'text-neutral-400' : 'text-slate-600'}`}>FAQ</a>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Elegant Theme Switcher */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-full border transition-all hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-blue-400' : 'bg-white border-slate-200 text-slate-500'}`}
              aria-label="Toggle dark mode"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <Link 
                to="/" 
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/10 active:scale-95"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`px-4 py-2.5 text-xs font-bold transition-colors ${isDarkMode ? 'text-neutral-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] ${isDarkMode ? 'bg-white text-black hover:bg-neutral-100' : 'bg-black text-white hover:bg-neutral-900'}`}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Redesigned Premium Hero Section */}
      <section className="relative pt-16 pb-28 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-8 relative z-10 text-center lg:text-left">
            
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${isDarkMode ? 'bg-blue-950/40 border-blue-800/40 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              <span>Zero Bank V2 — Sleek Blue, White & Black Aesthetics</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.1] tracking-tight">
              Banking with <br className="hidden sm:block" />
              unmatched speed & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">absolute clarity.</span>
            </h1>

            <p className={`text-base sm:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium ${isDarkMode ? 'text-neutral-400' : 'text-slate-600'}`}>
              Take control of your finances. Send mock local bank transfers instantly, customize stunning virtual cards, apply for simulated credit, and track your transactions securely.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={handleHeroCTA}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group text-sm cursor-pointer"
              >
                <span>{user ? 'Open Your Dashboard' : 'Create Free Account'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
              </button>
              
              <a
                href="#live-card"
                className={`w-full sm:w-auto px-8 py-4 border rounded-2xl font-bold transition-all text-center text-sm shadow-sm flex items-center justify-center gap-2 hover:scale-[1.01] ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800/80' : 'bg-white border-slate-200 text-[#000000] hover:bg-slate-50'}`}
              >
                <span>See Live Card Customizer</span>
              </a>
            </div>

            {/* Micro Statistics */}
            <div className={`pt-8 border-t grid grid-cols-3 gap-6 max-w-sm mx-auto lg:mx-0 ${isDarkMode ? 'border-neutral-900' : 'border-slate-200/80'}`}>
              <div>
                <p className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-black'}`}>100%</p>
                <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isDarkMode ? 'text-neutral-500' : 'text-slate-400'}`}>Guaranteed Safety</p>
              </div>
              <div>
                <p className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-black'}`}>₦100K</p>
                <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isDarkMode ? 'text-neutral-500' : 'text-slate-400'}`}>Welcome Funds</p>
              </div>
              <div>
                <p className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-black'}`}>0.02s</p>
                <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isDarkMode ? 'text-neutral-500' : 'text-slate-400'}`}>Instant Speed</p>
              </div>
            </div>
          </div>

          {/* Right Phone Showcase Screen */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            
            {/* Phone Body with dynamic outline */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className={`w-[325px] h-[640px] rounded-[52px] border-[10px] relative overflow-hidden shrink-0 flex flex-col justify-between p-5 transition-colors duration-300 ${isDarkMode ? 'bg-neutral-950 border-neutral-800 shadow-[0_30px_100px_rgba(0,0,0,0.8)]' : 'bg-white border-black shadow-[0_35px_90px_rgba(37,99,235,0.08)]'}`}
            >
              {/* Phone Speaker Notch */}
              <div className="absolute top-0 inset-x-0 h-6 bg-transparent flex justify-center items-center z-50">
                <div className={`w-24 h-4 rounded-b-xl ${isDarkMode ? 'bg-neutral-900' : 'bg-black'}`}></div>
              </div>

              {/* Status Bar */}
              <div className="flex justify-between items-center text-[10px] font-semibold opacity-60 px-2 pt-2">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px]">LTE</span>
                  <div className={`w-4 h-2 rounded-sm border ${isDarkMode ? 'border-white' : 'border-black'}`} />
                </div>
              </div>

              {/* Mobile Quick Simulated App Home Screen */}
              <div className="flex-1 flex flex-col justify-between py-6">
                
                {/* Header Profile */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-sm">
                      S
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider opacity-50 block font-bold">Available balance</span>
                      <span className={`text-xs font-bold block ${isDarkMode ? 'text-neutral-300' : 'text-slate-700'}`}>Hello, Sabeer</span>
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800 text-blue-400' : 'bg-slate-50 border-slate-200 text-blue-600'}`}>
                    <Zap className="w-4 h-4" />
                  </div>
                </div>

                {/* Simulated Wallet Card (Strictly Blue/Black theme) */}
                <div className="my-4 bg-gradient-to-tr from-blue-600 to-blue-900 p-5 rounded-3xl text-white shadow-lg relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
                  <span className="text-[9px] font-bold tracking-widest uppercase opacity-75 block mb-1">Total Balance</span>
                  <h3 className="text-2xl font-black tracking-tight mb-2">₦250,000</h3>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-mono text-[9px] tracking-wider opacity-80">Acc. 0123456789</span>
                    <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded font-semibold uppercase">Savings</span>
                  </div>
                </div>

                {/* Fast Action List */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Quick Transfer</span>
                    <span className="text-[9px] text-blue-500 font-bold">Fast-Sync</span>
                  </div>

                  {/* Simulated Micro Sender Widget */}
                  <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-50 dark:bg-neutral-800 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-[10px]">A</div>
                        <span className="text-xs font-semibold">To Amina Bank</span>
                      </div>
                      <span className="text-xs font-bold text-blue-500">₦{simAmount}</span>
                    </div>

                    <button 
                      onClick={triggerSimTransfer}
                      disabled={simStatus !== 'idle'}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      {simStatus === 'idle' && (
                        <>
                          <span>Transfer Instantly</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                      {simStatus === 'sending' && (
                        <>
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Processing 0.02s...</span>
                        </>
                      )}
                      {simStatus === 'success' && (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                          <span className="text-white font-bold">Transferred!</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Animated Simulated Notification */}
                <AnimatePresence>
                  {simStatus === 'success' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="bg-neutral-900 text-white p-3 rounded-2xl border border-neutral-800 flex items-center gap-3 shadow-xl mt-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="text-[10px] font-bold block">Debit Notification</span>
                        <span className="text-[8px] text-neutral-400 block">₦{simAmount} sent to Amina Bank</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Nav Mockup */}
              <div className="border-t border-slate-200/40 dark:border-neutral-800 pt-3 flex justify-around items-center opacity-80 pb-1">
                <div className="flex flex-col items-center gap-0.5 text-blue-500">
                  <Layers className="w-4 h-4" />
                  <span className="text-[8px] font-bold">Wallet</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 text-slate-400">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[8px] font-medium">Cards</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 text-slate-400">
                  <Fingerprint className="w-4 h-4" />
                  <span className="text-[8px] font-medium">Safe</span>
                </div>
              </div>
            </motion.div>

            {/* Floating Live Visa Card Indicator - Interactive */}
            <div className={`absolute -right-12 top-10 p-4.5 rounded-[24px] border shadow-2xl w-48 text-left hidden md:block z-20 space-y-3 backdrop-blur-md transition-all ${isDarkMode ? 'bg-neutral-950/90 border-neutral-800 text-white' : 'bg-white/95 border-slate-200 text-[#000000]'}`}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-wider font-bold text-blue-500">Instant Loan</span>
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              </div>
              <p className="text-xs font-extrabold">Auto-Disbursed</p>
              <p className={`text-[10px] font-medium leading-relaxed ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                Apply for zero-paperwork sandbox loans. Credited in 1-tap.
              </p>
            </div>

            {/* Floating Trust Indicator */}
            <div className={`absolute -left-12 bottom-12 p-4 rounded-[24px] border shadow-xl w-44 text-left hidden md:block z-20 space-y-2.5 backdrop-blur-md transition-all ${isDarkMode ? 'bg-neutral-950/90 border-neutral-800 text-white' : 'bg-white/95 border-slate-200'}`}>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-blue-600">Fully Protected</p>
              <p className={`text-[9px] font-semibold leading-normal ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                Strict PIN validation for secure local database updates.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Trust & Features quick review slider */}
      <section className={`border-y py-8 transition-colors duration-300 ${isDarkMode ? 'bg-neutral-950/40 border-neutral-900' : 'bg-white border-slate-200/60'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <p className={`text-center text-[11px] font-bold uppercase tracking-widest mb-6 ${isDarkMode ? 'text-neutral-500' : 'text-slate-400'}`}>
            Powering sandbox assets with extreme quality
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span className={`flex items-center gap-2.5 ${isDarkMode ? 'text-neutral-300' : 'text-slate-700'}`}>
              <CheckCircle2 className="w-5 h-5 text-blue-500" strokeWidth={2.5} /> Double Encrypted Ledger
            </span>
            <span className={`flex items-center gap-2.5 ${isDarkMode ? 'text-neutral-300' : 'text-slate-700'}`}>
              <CheckCircle2 className="w-5 h-5 text-blue-500" strokeWidth={2.5} /> Real-Time Sync Triggers
            </span>
            <span className={`flex items-center gap-2.5 ${isDarkMode ? 'text-neutral-300' : 'text-slate-700'}`}>
              <CheckCircle2 className="w-5 h-5 text-blue-500" strokeWidth={2.5} /> ₦100K Sandbox Capital
            </span>
          </div>
        </div>
      </section>

      {/* Redesigned Live Interactive Banking Card Customizer Section */}
      <section id="live-card" className={`py-24 px-6 border-b transition-colors duration-300 ${isDarkMode ? 'bg-neutral-950/20 border-neutral-900' : 'bg-gradient-to-br from-blue-50/40 via-white to-blue-50/20 border-slate-200/60'}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Text and Interactive Card Color Selection Panel */}
          <div className="lg:col-span-6 space-y-8">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-500 bg-blue-500/5 px-3 py-1 rounded-full">Interactive Custom Cards</span>
            
            <h2 className={`text-3xl md:text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Virtual cards built for digital safety
            </h2>
            
            <p className={`text-sm sm:text-base leading-relaxed font-medium ${isDarkMode ? 'text-neutral-400' : 'text-slate-600'}`}>
              Generate active, secure billing cards. Instantly freeze the card if compromised, or toggle number visibility to copy safely. Try out the controls below.
            </p>

            {/* Premium Interactive Widget Controls */}
            <div className="space-y-6 pt-2">
              <div className="space-y-2.5">
                <span className={`text-[11px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>Choose Card Finish</span>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setCardColor('blue')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${cardColor === 'blue' ? 'bg-blue-600 text-white border-transparent shadow' : isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-white border-slate-200 text-slate-600'}`}
                  >
                    Classic Blue
                  </button>
                  <button 
                    onClick={() => setCardColor('black')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${cardColor === 'black' ? 'bg-black text-white border-transparent shadow dark:bg-white dark:text-black' : isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-white border-slate-200 text-slate-600'}`}
                  >
                    Midnight Black
                  </button>
                  <button 
                    onClick={() => setCardColor('white')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${cardColor === 'white' ? 'bg-white text-black border-transparent shadow dark:bg-neutral-800 dark:text-white' : isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-white border-slate-200 text-slate-600'}`}
                  >
                    Arctic White
                  </button>
                </div>
              </div>

              {/* Dynamic Action Toggles */}
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setIsCardFrozen(!isCardFrozen)}
                  className={`px-5 py-3 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 ${isCardFrozen ? 'bg-black text-white border-transparent shadow dark:bg-white dark:text-black' : isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-850' : 'bg-white border-slate-200 text-black hover:bg-slate-50'}`}
                >
                  <Lock className="w-4 h-4 text-blue-500" />
                  <span>{isCardFrozen ? 'Card is Frozen' : 'Freeze Card'}</span>
                </button>

                <button 
                  onClick={() => setShowCardNumbers(!showCardNumbers)}
                  className={`px-5 py-3 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-850' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                  {showCardNumbers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-blue-500" />}
                  <span>{showCardNumbers ? 'Hide Numbers' : 'View Card Numbers'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Live Card Visual Container */}
          <div className="lg:col-span-6 flex justify-center items-center">
            
            {/* Visual 3D style Card */}
            <motion.div 
              animate={{ rotateY: showCardNumbers ? 0 : 3, scale: isCardFrozen ? 0.98 : 1 }}
              transition={{ duration: 0.5 }}
              className={`w-[340px] h-[215px] rounded-3xl p-6 text-white relative shadow-2xl overflow-hidden flex flex-col justify-between transition-all duration-500 ${
                isCardFrozen ? 'opacity-90 saturate-50' : ''
              } ${
                cardColor === 'blue' ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-950 shadow-blue-500/20' :
                cardColor === 'black' ? 'bg-gradient-to-br from-neutral-800 via-neutral-900 to-black shadow-black/30' :
                'bg-gradient-to-br from-white via-slate-100 to-slate-200 text-black shadow-slate-400/20'
              }`}
            >
              
              {/* Frozen Glass Overlay */}
              <AnimatePresence>
                {isCardFrozen && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 backdrop-blur-md bg-black/60 z-20 flex flex-col items-center justify-center gap-2"
                  >
                    <div className="p-2 bg-white/10 rounded-full border border-white/20">
                      <Lock className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-xs font-black tracking-widest uppercase text-white/90">Card Frozen</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Shimmer Light reflection */}
              <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-45 pointer-events-none" />

              {/* Card Brand Header */}
              <div className="flex justify-between items-center z-10">
                <span className={`text-sm font-black tracking-tight italic ${cardColor === 'white' ? 'text-black' : 'text-white'}`}>Zero Bank</span>
                <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-bold backdrop-blur-sm ${cardColor === 'white' ? 'bg-black/10' : 'bg-white/20'}`}>Visa Debit</span>
              </div>

              {/* Card Chip Visual */}
              <div className="w-10 h-7 bg-blue-500/20 rounded-md border border-blue-400/40 self-start my-1 overflow-hidden relative z-10">
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-blue-600/30" />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-600/30" />
              </div>

              {/* Card Numbers and Expiry */}
              <div className="space-y-4 z-10">
                <div className="space-y-1">
                  <span className="text-[8px] uppercase tracking-wider block font-bold opacity-60">Card Number</span>
                  <p className="font-mono text-base sm:text-lg tracking-widest block leading-none">
                    {showCardNumbers ? '4567 8901 2345 6789' : '•••• •••• •••• 6789'}
                  </p>
                </div>

                <div className="flex justify-between items-end text-[9px]">
                  <div>
                    <span className="opacity-60 uppercase tracking-wide text-[7px] block font-semibold">Card Holder</span>
                    <span className="font-bold">Sabeer Muhammed</span>
                  </div>
                  <div>
                    <span className="opacity-60 uppercase tracking-wide text-[7px] block font-semibold">Expiry</span>
                    <span className="font-bold">12 / 28</span>
                  </div>
                  <div className="text-right">
                    <span className="opacity-60 uppercase tracking-wide text-[7px] block font-semibold">CVV</span>
                    <span className="font-bold">{showCardNumbers ? '123' : '•••'}</span>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>

        </div>
      </section>

      {/* Bento Grid Features Layout Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 space-y-16">
        
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <span className="text-xs uppercase font-black text-blue-500 tracking-widest block font-sans">Features</span>
          <h2 className={`text-3xl md:text-4xl font-black tracking-tight leading-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Powering your financial freedom
          </h2>
          <p className={`text-sm font-semibold leading-relaxed ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
            A sandbox environment tailored to test simulated ledger transfers, active custom billing cards, and instant credit.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Fast Transfer */}
          <div className={`border rounded-[32px] p-8 space-y-4 group transition-all duration-300 ${isDarkMode ? 'bg-neutral-950 border-neutral-900 hover:border-blue-500/30 hover:shadow-[0_20px_50px_rgba(37,99,235,0.1)]' : 'bg-white border-slate-200 hover:border-blue-500/25 hover:shadow-[0_20px_50px_rgba(0,0,0,0.02)]'}`}>
            <div className="w-12 h-12 bg-blue-50 dark:bg-neutral-900 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Send className="w-6 h-6" strokeWidth={2} />
            </div>
            <h3 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>Instant Bank Transfers</h3>
            <p className={`text-xs leading-relaxed font-semibold ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
              Send mock funds securely in 0.02 seconds to anyone in Nigeria. Fast and completed instantly.
            </p>
          </div>

          {/* Card 2: Custom Billing Cards */}
          <div className={`border rounded-[32px] p-8 space-y-4 group transition-all duration-300 ${isDarkMode ? 'bg-neutral-950 border-neutral-900 hover:border-blue-500/30 hover:shadow-[0_20px_50px_rgba(37,99,235,0.1)]' : 'bg-white border-slate-200 hover:border-blue-500/25 hover:shadow-[0_20px_50px_rgba(0,0,0,0.02)]'}`}>
            <div className="w-12 h-12 bg-blue-50 dark:bg-neutral-900 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" strokeWidth={2} />
            </div>
            <h3 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>Virtual Custom Cards</h3>
            <p className={`text-xs leading-relaxed font-semibold ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
              Create personal billing cards, change card skins, and instantly lock them to secure your subscription payments.
            </p>
          </div>

          {/* Card 3: Free capital */}
          <div className={`border rounded-[32px] p-8 space-y-4 group transition-all duration-300 ${isDarkMode ? 'bg-neutral-950 border-neutral-900 hover:border-blue-500/30 hover:shadow-[0_20px_50px_rgba(37,99,235,0.1)]' : 'bg-white border-slate-200 hover:border-blue-500/25 hover:shadow-[0_20px_50px_rgba(0,0,0,0.02)]'}`}>
            <div className="w-12 h-12 bg-blue-50 dark:bg-neutral-900 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" strokeWidth={2} />
            </div>
            <h3 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>Welcome Sandbox Capital</h3>
            <p className={`text-xs leading-relaxed font-semibold ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
              Every verified account immediately receives ₦100,000 completely free sandbox balance to test with.
            </p>
          </div>

        </div>
      </section>

      {/* Redesigned Security Section with Interactive Biometric Scan */}
      <section id="security" className={`py-24 px-6 transition-colors duration-300 ${isDarkMode ? 'bg-neutral-950 border-y border-neutral-900' : 'bg-[#000000] text-white'}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-400">
              <Lock className="w-3.5 h-3.5" /> SECURE LEDGER PROTOCOLS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Safe, robust, and protected.</h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-medium">
              We leverage strict encryption alongside real-time PIN validation. Every transfer, card creation, and account fund action is protected behind your customizable security PIN.
            </p>
            
            <ul className="space-y-4 pt-2 text-xs font-semibold text-slate-300">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </div>
                <span>Passwords fully protected via Secure Auth</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </div>
                <span>4-digit customizable security PIN validations</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </div>
                <span>Encrypted real-time database transactions</span>
              </li>
            </ul>
          </div>

          {/* Right Interactive Biometric Showcase */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-8 text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
              
              <h3 className="text-lg font-bold text-white tracking-tight">Interactive Biometric Authorization</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
                Simulate how high-importance PIN actions verify. Hold the scanner below to verify identity.
              </p>

              {/* Biometric Interactive Button Scanner */}
              <div className="py-4 flex flex-col items-center justify-center">
                <button 
                  onMouseDown={triggerBiometricScan}
                  onTouchStart={triggerBiometricScan}
                  className={`w-20 h-20 rounded-full border transition-all duration-300 flex items-center justify-center relative cursor-pointer ${
                    scanState === 'scanning' ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]' :
                    scanState === 'success' ? 'bg-blue-600/30 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.6)]' :
                    'bg-white/5 border-white/15 hover:border-white/25 hover:bg-white/10'
                  }`}
                >
                  
                  {/* Circular scanning line */}
                  {scanState === 'scanning' && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: 1.3, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full border border-blue-500"
                    />
                  )}

                  <Fingerprint className={`w-10 h-10 transition-colors duration-300 ${
                    scanState === 'scanning' ? 'text-blue-400' :
                    scanState === 'success' ? 'text-blue-300' :
                    'text-slate-300'
                  }`} />
                </button>

                <div className="mt-4 text-xs font-bold tracking-wide">
                  {scanState === 'idle' && <span className="text-slate-400">Tap / Click Scanner to Hold</span>}
                  {scanState === 'scanning' && <span className="text-blue-400 animate-pulse">Scanning PIN Authorization...</span>}
                  {scanState === 'success' && <span className="text-blue-400">PIN Authorization Verified</span>}
                </div>
              </div>

              {/* PDF Document statement teaser */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-left text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-blue-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>Download Signed PDF statements anytime.</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center transition-all">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { metric: '₦50M+', label: 'Total simulated transactions processed' },
            { metric: '0.02s', label: 'Average transaction speed' },
            { metric: '25,000+', label: 'Simulated accounts globally' },
            { metric: '100%', label: 'Sandbox uptime status' }
          ].map((stat, index) => (
            <div key={index} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-neutral-900' : 'bg-white border-slate-200/60 shadow-sm'}`}>
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">{stat.metric}</h3>
              <p className={`text-xs font-semibold mt-1.5 ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className={`py-24 px-6 border-y transition-colors duration-300 ${isDarkMode ? 'bg-neutral-950 border-neutral-900' : 'bg-slate-50 border-slate-200/60'}`}>
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <span className="text-xs uppercase font-black text-blue-500 tracking-widest block font-sans">User Testimonials</span>
            <h2 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
              What digital users are saying
            </h2>
            <p className={`text-sm font-semibold leading-relaxed ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
              Discover how customers rely on our simulated banking environment for seamless utility tests.
            </p>
          </div>

          {/* Testimonial Cards Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Olawale Adebayo', text: '“Zero Bank has changed how I verify API transactions. The speed is unbelievable, and getting ₦100,000 to test immediately is so helpful.”', role: 'Digital Creator', initial: 'O' },
              { name: 'Chioma Obi', text: '“The card freezing control is beautiful. I can toggle color styles, check statements in PDF, and send simulated cash instantly.”', role: 'Product Manager', initial: 'C' },
              { name: 'Mustapha Abdulsalam', text: '“Absolute masterpiece of an interface. It feels so premium and behaves exactly like a world-class banking app should.”', role: 'Software Engineer', initial: 'M' }
            ].map((test, idx) => (
              <div 
                key={idx} 
                className={`p-6 rounded-3xl border flex flex-col justify-between space-y-6 ${isDarkMode ? 'bg-neutral-950 border-neutral-900' : 'bg-white border-slate-200 shadow-sm'}`}
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current text-blue-500" />
                  ))}
                </div>

                <p className={`text-xs font-semibold leading-relaxed ${isDarkMode ? 'text-neutral-300' : 'text-slate-650'}`}>{test.text}</p>
                
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm text-white">
                    {test.initial}
                  </div>
                  <div>
                    <span className={`text-xs font-black block ${isDarkMode ? 'text-white' : 'text-black'}`}>{test.name}</span>
                    <span className={`text-[10px] font-semibold block ${isDarkMode ? 'text-neutral-500' : 'text-slate-400'}`}>{test.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Redesigned Mobile App Showcase & Download App QR Code Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="p-8 md:p-16 rounded-[44px] relative overflow-hidden text-white bg-black border border-neutral-900 shadow-2xl">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Texts & QR Code */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="text-xs uppercase font-extrabold tracking-widest bg-blue-600/20 text-blue-400 px-3.5 py-1.5 rounded-full inline-block">Download Sandbox Application</span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Banking beautifully, on any device.</h2>
              <p className="text-xs md:text-sm text-neutral-400 max-w-md mx-auto lg:mx-0 font-semibold leading-relaxed">
                Scan the QR code below or visit our register link to open your free account in less than 3 minutes. Start using your free welcome credit today.
              </p>

              {/* App Store and QR Code section */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-4">
                
                {/* Mock QR Code Visual */}
                <div className="bg-white p-2.5 rounded-2xl w-24 h-24 flex items-center justify-center shadow-lg shrink-0">
                  <QrCode className="w-20 h-20 text-black" />
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Scan to get started</span>
                  <p className="text-xs text-neutral-300 font-semibold leading-relaxed max-w-[200px]">
                    Access Zero Bank directly on your mobile browser or secure dashboard.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side Phone Mockup strictly following palette */}
            <div className="lg:col-span-5 flex justify-center relative">
              <div className="absolute -inset-10 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="w-[240px] h-[480px] rounded-[40px] border-[8px] border-neutral-800 bg-neutral-950 p-4 flex flex-col justify-between shadow-2xl relative z-10">
                <div className="w-20 h-3 bg-neutral-800 rounded-b-lg mx-auto" />
                
                <div className="flex-1 flex flex-col justify-center text-center space-y-4 py-8">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-lg shadow">
                    Z
                  </div>
                  <h4 className="text-sm font-bold">Zero Mobile App</h4>
                  <p className="text-[10px] text-neutral-400 px-2 leading-relaxed">
                    Designed with precision. Fully verified sandbox actions.
                  </p>
                  
                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl text-left space-y-2">
                    <span className="text-[8px] text-blue-400 font-bold uppercase tracking-wider">Active State</span>
                    <div className="flex justify-between items-center text-[10px]">
                      <span>Secure Wallet</span>
                      <span className="font-bold text-white">Active</span>
                    </div>
                  </div>
                </div>

                <span className="text-[8px] text-center text-neutral-500 pb-1">Zero Bank Mobile V2</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className={`py-24 px-6 border-t transition-colors duration-300 ${isDarkMode ? 'border-neutral-900' : 'border-slate-200/60'}`}>
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-4">
            <span className="text-xs uppercase font-black text-blue-500 tracking-widest block">Frequently Asked Questions</span>
            <h2 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Have questions? We have answers.
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className={`border rounded-2xl overflow-hidden transition-colors ${
                  isDarkMode ? 'bg-neutral-950 border-neutral-900' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left gap-4 font-bold text-xs sm:text-sm"
                >
                  <span className={isDarkMode ? 'text-white' : 'text-black'}>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-blue-500 transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence initial={false}>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`px-6 pb-6 pt-1 text-xs leading-relaxed font-semibold ${isDarkMode ? 'text-neutral-400' : 'text-slate-650'}`}>
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Redesigned Download/CTA Final Showcase */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center">
        <div className={`max-w-4xl mx-auto rounded-[32px] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl border ${isDarkMode ? 'bg-neutral-950 border-neutral-900' : 'bg-black'}`}>
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 space-y-6 max-w-lg mx-auto">
            <h2 className="text-2xl md:text-4xl font-black tracking-tight">Start banking beautifully today.</h2>
            <p className="text-xs md:text-sm text-neutral-400 leading-relaxed font-semibold">
              Create your secure digital account in under 3 minutes. Zero paperwork, zero setup fees, and premium sandboxed banking tools.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer inline-flex items-center gap-2"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Clean elegant footer */}
      <footer className={`py-12 px-6 text-center text-[11px] font-bold uppercase tracking-widest max-w-7xl mx-auto border-t transition-colors duration-350 ${isDarkMode ? 'border-neutral-900 text-neutral-500' : 'border-slate-200/60 text-slate-400'}`}>
        <p>© {new Date().getFullYear()} Zero Bank. All rights reserved.</p>
        <p className="mt-2 text-[10px] text-neutral-500 leading-relaxed font-medium normal-case max-w-md mx-auto">
          Zero Bank is a premium digital simulated wallet and personal finance application. All ledger balance values are virtual credits intended to showcase high-fidelity interfaces.
        </p>
      </footer>
    </div>
  );
}
