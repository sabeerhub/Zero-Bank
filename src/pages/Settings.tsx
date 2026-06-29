import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, User, Shield, Info, CreditCard, Key, 
  ToggleLeft, ToggleRight, Smartphone, Eye, EyeOff, CheckCircle2, AlertCircle, X, ChevronRight, Lock, Fingerprint,
  Sliders, ShieldCheck, HelpCircle, Laptop, Bell, Coins
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import TransactionPinModal from '../components/TransactionPinModal';
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function Settings() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showLimitsModal, setShowLimitsModal] = useState(false);
  const [showLinkedModal, setShowLinkedModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // simulated loading skeleton state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    setMessage({ type: 'success', text: 'Transaction PIN updated successfully' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3500);
  };

  const handlePasswordSuccess = () => {
    setIsPasswordModalOpen(false);
    setMessage({ type: 'success', text: 'Password reset link sent to your email' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="pb-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="w-10 h-10 rounded-xl bg-white dark:bg-[#0B121F]/80 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all shadow-xs group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-900 dark:text-slate-100 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">System Settings</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold tracking-wider uppercase mt-0.5">Preferences & Account Safeguards</p>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div key="skele" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-white dark:bg-[#0B121F]/80 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800 h-80 animate-pulse"></div>
            <div className="lg:col-span-8 bg-white dark:bg-[#0B121F]/80 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800 h-96 animate-pulse"></div>
          </div>
        ) : (
          <motion.div 
            key="settings-grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Panel: Tier Summary and Rapid Limits Tracker */}
            <div className="lg:col-span-4 space-y-6">
              {/* Silver member tracker card */}
              <div className="bg-white dark:bg-[#0B121F]/80 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.01)] space-y-5">
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest block">Linked Account Tier</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Silver Membership</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Verified Account limits active</p>
                  </div>
                </div>

                <div className="border-t border-slate-200/60 dark:border-slate-800 pt-4 space-y-3.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 dark:text-slate-500">Daily Limit:</span>
                    <strong className="text-slate-900 dark:text-white font-extrabold">₦2,500,000.00</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 dark:text-slate-500">Max Balance:</span>
                    <strong className="text-slate-900 dark:text-white font-extrabold">₦10,000,000.00</strong>
                  </div>
                </div>

                <button 
                  onClick={() => setShowLimitsModal(true)}
                  className="w-full py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  View Limit Breakdowns
                </button>
              </div>

              {/* Connected visa indicator */}
              <div className="bg-slate-950 dark:bg-[#0B121F] text-white rounded-[28px] p-6 space-y-4 relative overflow-hidden border border-transparent dark:border-slate-800">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                <div className="flex items-center justify-between">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 uppercase font-black tracking-widest px-2 py-0.5 rounded-full">Primary Card</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-300">Debit Card **** 4567</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Exp: 12/28</p>
                </div>
                <button 
                  onClick={() => setShowLinkedModal(true)}
                  className="text-[10px] text-indigo-400 font-bold hover:underline block pt-2 cursor-pointer"
                >
                  Manage Linked Bank Cards →
                </button>
              </div>
            </div>

            {/* Right Panel: Settings Categories */}
            <div className="lg:col-span-8 space-y-6">
              {/* Alert message */}
              {message.text && (
                <motion.div 
                   initial={{ opacity: 0, y: -10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
                     message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-150 dark:border-emerald-850 text-emerald-800 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-500/10 border border-rose-150 dark:border-rose-850 text-rose-800 dark:text-rose-300'
                   }`}
                >
                   {message.type === 'success' ? <CheckCircle2 className="w-4.5 h-4.5 shrink-0" /> : <AlertCircle className="w-4.5 h-4.5 shrink-0" />}
                   <p>{message.text}</p>
                </motion.div>
              )}

              {/* Category: General Preferences */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider pl-1">General Profile Settings</h3>
                <div className="bg-white dark:bg-[#0B121F]/80 rounded-[28px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.01)] divide-y divide-slate-100 dark:divide-slate-800">
                  {/* Personal info link */}
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Personal Information</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Name, email address, and membership tier details</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {/* Upgrade Tier link */}
                  <button
                    onClick={() => navigate('/upgrade')}
                    className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Upgrade Tier Level</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Submit verification items to expand your daily transfer limits</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Category: Security Preferences */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider pl-1">Security & Passcode</h3>
                <div className="bg-white dark:bg-[#0B121F]/80 rounded-[28px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.01)] divide-y divide-slate-100 dark:divide-slate-800">
                  {/* Reset password trigger */}
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <Key className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Password & Security PIN</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Reset your sign-in password or transaction authorization PIN</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {/* Biometric login */}
                  <div className="w-full p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Fingerprint className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Biometric Fingerprint Sign-in</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Authorize access to your wallet via native Face ID or Touch ID</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setBiometricEnabled(!biometricEnabled)}
                      className="focus:outline-none transition-transform active:scale-95 shrink-0 cursor-pointer"
                    >
                      {biometricEnabled ? (
                        <ToggleRight className="w-11 h-11 text-emerald-500 hover:text-emerald-600 transition-colors" strokeWidth={1.2} />
                      ) : (
                        <ToggleLeft className="w-11 h-11 text-slate-300 dark:text-slate-700 hover:text-slate-400 transition-colors" strokeWidth={1.2} />
                      )}
                    </button>
                  </div>

                  {/* Two factor toggle */}
                  <div className="w-full p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                        <Lock className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Deliver automatic email OTP challenge notifications before transactions</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                      className="focus:outline-none transition-transform active:scale-95 shrink-0 cursor-pointer"
                    >
                      {twoFactorEnabled ? (
                        <ToggleRight className="w-11 h-11 text-emerald-500 hover:text-emerald-600 transition-colors" strokeWidth={1.2} />
                      ) : (
                        <ToggleLeft className="w-11 h-11 text-slate-300 dark:text-slate-700 hover:text-slate-400 transition-colors" strokeWidth={1.2} />
                      )}
                    </button>
                  </div>

                  {/* Active device sessions */}
                  <button
                    onClick={() => setShowDeviceModal(true)}
                    className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-slate-50 dark:bg-slate-800/20 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
                        <Smartphone className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Active Devices & Sessions</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Monitor and terminate other logged-in device browser sessions</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Device Session Modal */}
      <AnimatePresence>
        {showDeviceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0E1626] rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Active Browser Sessions</h2>
                <button onClick={() => setShowDeviceModal(false)} className="w-8 h-8 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border border-emerald-100 dark:border-emerald-800/40 bg-emerald-50/20 dark:bg-emerald-500/5 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">Vite Web Applet Container</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Vite Dev Console • Port 3000</p>
                    <p className="text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 font-black px-1.5 py-0.5 rounded-md inline-block uppercase tracking-wider mt-1.5">Online Now</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setShowDeviceModal(false)}
                className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-extrabold rounded-2xl transition-all text-xs cursor-pointer"
              >
                Close Sessions List
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Account Limits modal details */}
      <AnimatePresence>
        {showLimitsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0E1626] rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Silver Limits Cap</h2>
                <button onClick={() => setShowLimitsModal(false)} className="w-8 h-8 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100/50 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Single Transfer Limit</p>
                  <p className="text-lg font-black text-blue-600 dark:text-blue-400 mt-1">₦1,000,000.00</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100/50 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cumulative Daily Transfers</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white mt-1">₦2,500,000.00</p>
                </div>
                
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold text-center leading-relaxed">
                  Need to expand transactions to premium limit levels? Navigate to Profile section and select Upgrade Tier.
                </p>
              </div>
              
              <button 
                onClick={() => setShowLimitsModal(false)}
                className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-extrabold rounded-2xl transition-all text-xs cursor-pointer"
              >
                Understood
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Linked Credit Cards Modal */}
      <AnimatePresence>
        {showLinkedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0E1626] rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Linked Bank Cards</h2>
                <button onClick={() => setShowLinkedModal(false)} className="w-8 h-8 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4.5 border border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold text-[10px] shadow-sm">VISA</div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Debit Card **** 4567</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Exp: 12/28</p>
                    </div>
                  </div>
                  <span className="text-[8px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Primary</span>
                </div>
              </div>
              
              <button 
                onClick={() => setShowLinkedModal(false)}
                className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-extrabold rounded-2xl transition-all text-xs cursor-pointer"
              >
                Close Linked Cards Panel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TransactionPinModal 
        isOpen={isPinModalOpen} 
        onClose={() => setIsPinModalOpen(false)} 
        onSuccess={handlePinSuccess}
        mode="change"
      />

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        onSuccess={handlePasswordSuccess}
      />
    </div>
  );
}
