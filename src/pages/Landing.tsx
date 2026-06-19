import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Send, 
  CreditCard, 
  Sparkles, 
  Smartphone,
  Check,
  ChevronRight,
  TrendingUp,
  Fingerprint,
  Activity,
  Zap,
  Globe,
  Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If user is already logged in, they can go straight to the layout dashboard
  const handleHeroCTA = () => {
    if (user) {
      navigate('/');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans overflow-x-hidden selection:bg-primary/10 selection:text-primary">
      {/* Styled Top Header / Navigation bar */}
      <header className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center text-white font-black text-xl italic tracking-tighter shadow-md">
            Z
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0F172A]">Zero Bank</span>
        </div>

        {/* Desktop Menu links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#64748B]">
          <a href="#features" className="hover:text-primary transition-colors">Visual Features</a>
          <a href="#security" className="hover:text-primary transition-colors">Double Encryption</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <Link 
              to="/" 
              className="px-5 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link 
                to="/login" 
                className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-all rounded-full"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="px-5 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-full text-xs font-bold transition-all shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:py-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Glow effect at backgrounds */}
        <div className="absolute top-1/4 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-sky-200/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Left Side: Editorial Typography & Copy */}
        <div className="lg:col-span-6 space-y-8 relative z-10 text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0F172A] leading-[1.1] tracking-tight">
            Beautiful banking <br />
            built with <br />
            <span className="text-primary italic font-serif">absolute clarity.</span>
          </h1>

          <p className="text-md md:text-lg text-[#64748B] leading-relaxed max-w-md mx-auto lg:mx-0 font-medium">
            Manage your daily finances, enjoy instant transfers, secure digital wallets, utility bill payments, and smart personal assets — all within an elegant, lightning-fast application.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              onClick={handleHeroCTA}
              className="w-full sm:w-auto px-8 py-4.5 bg-primary hover:bg-primary-accent text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 group text-sm"
            >
              <span>{user ? 'Go to Dashboard' : 'Create Free Account'}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={3} />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4.5 bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] text-[#0F172A] font-bold rounded-2xl hover:bg-slate-50 transition-all text-center text-sm shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
            >
              Explore Interface features
            </a>
          </div>

          {/* Social Proof Stats Bar */}
          <div className="pt-8 border-t border-[#E2E8F0] grid grid-cols-3 gap-6 max-w-sm mx-auto lg:mx-0">
            <div>
              <p className="text-2xl font-extrabold text-[#0F172A]">100%</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-muted mt-0.5">Secure Ledger</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#0F172A]">₦100K</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-muted mt-0.5">Welcome Capital</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#0F172A]">0.02s</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-muted mt-0.5">Local Transfers</p>
            </div>
          </div>
        </div>

        {/* Right Side: High-Fidelity UI Screens Mockups */}
        <div className="lg:col-span-6 relative flex justify-center items-center">
          {/* Main Simulated Phone Screen Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="w-[320px] bg-white rounded-[44px] shadow-[0_30px_100px_rgba(15,23,42,0.12)] border-[8px] border-[#0F172A] relative overflow-hidden shrink-0"
          >
            {/* Phone Top Notch bar */}
            <div className="absolute top-0 inset-x-0 h-6 bg-[#0F172A] flex justify-center items-center z-50">
              <div className="w-20 h-4 bg-black rounded-b-xl"></div>
            </div>

            {/* Inner Phone Layout Screen */}
            <div className="pt-10 pb-6 px-5 space-y-6 select-none bg-[#F8FAFC]">
              {/* App bar */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700">
                    S
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-tight text-neutral-muted block">Good Evening</span>
                    <span className="text-xs font-extrabold text-[#0F172A] block leading-none">Sabeer</span>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
              </div>

              {/* Main Navy Balance Card (Match exact original balance layout in screenshot) */}
              <div className="bg-primary rounded-[20px] p-5 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                <span className="text-[9px] font-bold tracking-wider uppercase opacity-80 block mb-1">Available Balance</span>
                <h3 className="text-2xl font-black tracking-tight mb-2">₦250,000.00</h3>
                <div className="flex items-center gap-1.5 text-[10px] bg-white/10 w-fit px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/5">
                  <span className="font-mono text-[9px] tracking-widest text-white/90">0123456789</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="bg-white text-primary text-[11px] font-bold py-2 px-3 rounded-lg text-center shadow-sm">Add Funds</div>
                  <div className="bg-white/10 hover:bg-white/15 text-white text-[11px] font-bold py-2 px-3 rounded-lg text-center border border-white/10">Transfer</div>
                </div>
              </div>

              {/* Services quick shortcuts menu */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-muted">Quick Services</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Airtime', icon: Smartphone, bg: 'bg-blue-50 text-blue-600' },
                    { label: 'Data', icon: Globe, bg: 'bg-sky-50 text-sky-600' },
                    { label: 'Electricity', icon: Zap, bg: 'bg-amber-50 text-amber-600' },
                    { label: 'More', icon: ChevronRight, bg: 'bg-slate-100 text-slate-600' }
                  ].map((s, i) => (
                    <div key={i} className="bg-white border border-[#E2E8F0] p-2.5 rounded-[14px] flex flex-col items-center gap-1.5 shadow-sm text-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg}`}>
                        <s.icon className="w-4 h-4" strokeWidth={2.5} />
                      </div>
                      <span className="text-[8px] font-bold text-[#0F172A]">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent transaction history log */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-muted">Recent Transaction</span>
                </div>
                <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-2.5 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center">JD</div>
                      <div>
                        <span className="text-[10px] font-bold text-[#0F172A] block leading-none mb-0.5">John Doe</span>
                        <span className="text-[8px] text-neutral-muted font-semibold block uppercase">Received</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-extrabold text-emerald-600">+₦20,000</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Side Floating Mini Card 1: Security Passcode Info */}
          <motion.div 
            initial={{ opacity: 0, x: -30, y: -40 }}
            animate={{ opacity: 1, x: 0, y: -40 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="absolute -left-12 top-1/3 bg-white p-4.5 rounded-[24px] border border-[#E2E8F0] shadow-xl w-48 text-left hidden sm:block z-20 space-y-2.5"
          >
            <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-[#0F172A]">Instant Security</p>
            <p className="text-[10px] font-medium text-[#64748B] leading-normal">
              Authorize all transactions with your customized 4-digit security PIN.
            </p>
          </motion.div>

          {/* Side Floating Mini Card 2: Visa Virtual Card preview */}
          <motion.div 
            initial={{ opacity: 0, x: 30, y: 40 }}
            animate={{ opacity: 1, x: 0, y: 40 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute -right-12 bottom-1/3 bg-gradient-to-br from-indigo-600 to-purple-600 p-4.5 rounded-[20px] shadow-2xl w-48 text-white hidden sm:block z-20 space-y-4"
          >
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold tracking-tight opacity-90 italic">Zero Bank</span>
              <span className="text-[8px] uppercase tracking-wider py-0.5 px-1.5 bg-white/20 rounded-md font-bold">Virtual</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-semibold opacity-70 block">Card Number</span>
              <span className="font-mono text-xs tracking-widest block leading-none">•••• •••• •••• 4567</span>
            </div>
            <div className="flex justify-between items-end border-t border-white/10 pt-2 text-[9px]">
              <div>
                <span className="opacity-70 uppercase tracking-wide text-[7px] block">Expiry</span>
                <span className="font-bold">12/28</span>
              </div>
              <span className="font-black italic text-[11px] tracking-tight">VISA</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust & Certifications banner list */}
      <section className="bg-white border-y border-[#E2E8F0] py-6 text-center" id="features-banner">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-8 md:gap-16 text-xs font-bold text-neutral-muted uppercase tracking-wider">
          <span className="flex items-center gap-2 text-primary font-extrabold text-[#0F172A]">
            <CheckCircle2 className="w-5 h-5 text-primary" strokeWidth={2.5} /> MULTI-ASSET WALLET
          </span>
          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
          <span className="flex items-center gap-2 text-primary font-extrabold text-[#0F172A]">
            <CheckCircle2 className="w-5 h-5 text-primary" strokeWidth={2.5} /> INSTANT ENCRYPTED TRANSFERS
          </span>
          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
          <span className="flex items-center gap-2 text-primary font-extrabold text-[#0F172A]">
            <CheckCircle2 className="w-5 h-5 text-primary" strokeWidth={2.5} /> VIRTUAL BILLING CARDS
          </span>
        </div>
      </section>

      {/* Bento Grid Features Layout Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 space-y-16">
        <div className="text-center space-y-3.5 max-w-xl mx-auto">
          <span className="text-xs uppercase font-extrabold text-primary tracking-widest block font-sans">Premium Digital Features</span>
          <h2 className="text-3xl md:text-4xl font-black text-[#0F172A] tracking-tight leading-tight">
            Every banking service you need, unified.
          </h2>
          <p className="text-sm font-semibold text-[#64748B] leading-relaxed">
            Combining elegant interfaces with swift payments, real-time balance tracking, card asset management, and advanced database security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-[#E2E8F0] rounded-[28px] p-8 space-y-4 hover:border-primary/25 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Send className="w-6 h-6" strokeWidth={2} />
            </div>
            <h3 className="text-md sm:text-lg font-extrabold text-[#0F172A] tracking-tight">Instant Interbank Transfers</h3>
            <p className="text-xs leading-relaxed text-[#64748B] font-medium">
              Send money instantly to accounts securely with automated, real-time database-backed ledger updates.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-[#E2E8F0] rounded-[28px] p-8 space-y-4 hover:border-primary/25 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <CreditCard className="w-6 h-6" strokeWidth={2} />
            </div>
            <h3 className="text-md sm:text-lg font-extrabold text-[#0F172A] tracking-tight">Elegant Virtual Cards</h3>
            <p className="text-xs leading-relaxed text-[#64748B] font-medium">
              Generate active, digital virtual cards to fund online bills, manage limits, and control sub-accounts seamlessly.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-[#E2E8F0] rounded-[28px] p-8 space-y-4 hover:border-primary/25 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" strokeWidth={2} />
            </div>
            <h3 className="text-md sm:text-lg font-extrabold text-[#0F172A] tracking-tight">Instant Micro-Credit & Loans</h3>
            <p className="text-xs leading-relaxed text-[#64748B] font-medium">
              Calculate flexible repayment terms instantly and apply for real-time credit disbursed directly to your wallet balance.
            </p>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="bg-[#0F172A] text-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#38BDF8]">
              <Lock className="w-4 h-4" /> SECURE PROTOCOLS
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Modern encryption protecting your local state.</h2>
            <p className="text-sm font-medium text-slate-400 leading-relaxed">
              We leverage advanced Firebase Firestore access security and secure biometric-ready authentication protocols to keep your personal records fully protected. Your transactions and balances can only be managed by you using your secure personal security PIN.
            </p>
            <ul className="space-y-3 pt-2 text-xs font-semibold text-slate-300">
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-[#38BDF8] shrink-0" strokeWidth={3} />
                <span>Encrypted secure password hashing on databases</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-[#38BDF8] shrink-0" strokeWidth={3} />
                <span>Instant automated real-time local verification triggers</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-[#38BDF8] shrink-0" strokeWidth={3} />
                <span>2-Factor Identity verification security protocols</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/5 rounded-3xl p-8 border border-white/10 text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
            <h3 className="text-lg font-bold text-white tracking-tight">Download PDF Ledger Statements</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
              Easily generate complete multi-month financial ledger statements in PDF format with digital check signatures to use for official processes.
            </p>
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto border border-white/15">
              <Fingerprint className="w-8 h-8 text-[#38BDF8]" />
            </div>
          </div>
        </div>
      </section>

      {/* Call to action footer */}
      <section className="bg-white py-20 px-6 border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-[#1D4ED8] rounded-[32px] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 space-y-6 max-w-lg mx-auto">
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">Join the future of modern personal finance today.</h2>
            <p className="text-xs md:text-sm text-white/80 leading-relaxed font-semibold">
              Create your secure digital account in under 3 minutes. Zero unnecessary paperwork, zero setup fees, and elite cloud security.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-primary hover:bg-slate-50 font-extrabold rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all text-sm inline-flex items-center gap-2.5"
            >
              <span>Get Started Absolutely Free</span>
              <ArrowRight className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>
        </div>
      </section>

      {/* Humblest bottom section footer */}
      <footer className="bg-[#F8FAFC] py-12 px-6 text-center text-[11px] font-bold text-[#64748B] uppercase tracking-widest max-w-7xl mx-auto">
        <p>© {new Date().getFullYear()} Zero Bank. All rights reserved.</p>
        <p className="mt-2 text-[10px] text-neutral-muted leading-relaxed font-medium normal-case">
          Zero Bank is a modern digital ledger and wallet management application. All transactions on this application are processed instantly in real-time under high-end encrypted database states.
        </p>
      </footer>
    </div>
  );
}
