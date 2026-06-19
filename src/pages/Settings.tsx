import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, User, Shield, Info, CreditCard, Key, 
  ToggleLeft, ToggleRight, Smartphone, Eye, EyeOff, CheckCircle2, AlertCircle, X, ChevronRight, Lock, Fingerprint
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
  
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    setMessage({ type: 'success', text: 'Transaction PIN updated successfully' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handlePasswordSuccess = () => {
    setIsPasswordModalOpen(false);
    setMessage({ type: 'success', text: 'Password reset link sent to your email' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans w-full max-w-md mx-auto px-4">
      {/* Header */}
      <header className="pt-8 pb-6 bg-[#F8FAFC]/90 backdrop-blur-md sticky top-0 z-20 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
        </button>
        <div>
          <h1 className="text-sm font-bold text-[#0F172A] tracking-tight">Settings</h1>
          <p className="text-[10px] text-neutral-muted font-bold tracking-wide uppercase mt-0.5">App preferences & security</p>
        </div>
      </header>

      <main className="space-y-6">
        {/* Alerts */}
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold ${
              message.type === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' : 'bg-rose-50 border border-rose-100 text-rose-800'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <p>{message.text}</p>
          </motion.div>
        )}

        {/* Section: Account */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-muted px-2">Account</h3>
          
          <div className="bg-white rounded-[26px] border border-[#E2E8F0] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.01)] p-1">
            <button
              onClick={() => navigate('/profile')}
              className="w-full p-4 flex items-center justify-between border-b border-slate-50 hover:bg-[#F8FAFC] rounded-2xl transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">Personal Information</p>
                  <p className="text-xs text-neutral-muted mt-0.5">Name, email, and active profile details</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>

            <button
              onClick={() => navigate('/upgrade')}
              className="w-full p-4 flex items-center justify-between border-b border-slate-50 hover:bg-[#F8FAFC] rounded-2xl transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#0F172A]">Upgrade Tier</p>
                  <p className="text-xs text-neutral-muted mt-0.5">Current Tier: <strong className="text-primary text-xs">Silver Member</strong></p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs font-bold text-neutral-muted mr-1">Current: Silver</span>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>
            </button>

            <button
              onClick={() => setShowLimitsModal(true)}
              className="w-full p-4 flex items-center justify-between border-b border-slate-50 hover:bg-[#F8FAFC] rounded-2xl transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">Account Limits</p>
                  <p className="text-xs text-neutral-muted mt-0.5">Daily transfer limits & account balances</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>

            <button
              onClick={() => setShowLinkedModal(true)}
              className="w-full p-4 flex items-center justify-between hover:bg-[#F8FAFC] rounded-2xl transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">Linked Accounts</p>
                  <p className="text-xs text-neutral-muted mt-0.5">Manage connected widgets or credit cards</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </section>

        {/* Section: Security */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-muted px-2">Security</h3>
          
          <div className="bg-white rounded-[26px] border border-[#E2E8F0] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.01)] p-1">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full p-4 flex items-center justify-between border-b border-slate-50 hover:bg-[#F8FAFC] rounded-2xl transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">Password & PIN</p>
                  <p className="text-xs text-neutral-muted mt-0.5">Reset password or update transaction PIN</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>

            <div className="w-full p-4 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">Biometric Login</p>
                  <p className="text-xs text-neutral-muted mt-0.5">Access Zero Bank via Face ID or Fingerprint</p>
                </div>
              </div>
              <button 
                onClick={() => setBiometricEnabled(!biometricEnabled)}
                className="focus:outline-none"
              >
                {biometricEnabled ? (
                  <ToggleRight className="w-10 h-10 text-emerald-500 hover:text-emerald-600 transition-colors" strokeWidth={1.5} />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-300 hover:text-slate-400 transition-colors" strokeWidth={1.5} />
                )}
              </button>
            </div>

            <div className="w-full p-4 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#38BDF8]/10 text-primary flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">Two-Factor Authentication</p>
                  <p className="text-xs text-neutral-muted mt-0.5">Authorize important actions via OTP email alerts</p>
                </div>
              </div>
              <button 
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className="focus:outline-none"
              >
                {twoFactorEnabled ? (
                  <ToggleRight className="w-10 h-10 text-emerald-500 hover:text-emerald-600 transition-colors" strokeWidth={1.5} />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-300 hover:text-slate-400 transition-colors" strokeWidth={1.5} />
                )}
              </button>
            </div>

            <button
              onClick={() => setShowDeviceModal(true)}
              className="w-full p-4 flex items-center justify-between hover:bg-[#F8FAFC] rounded-2xl transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">Devices & Sessions</p>
                  <p className="text-xs text-neutral-muted mt-0.5">Log out other active browser sessions</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </section>
      </main>

      {/* Device Modal */}
      <AnimatePresence>
        {showDeviceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-extrabold text-neutral-text">Active Login Sessions</h2>
                  <button onClick={() => setShowDeviceModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                    <X className="w-5 h-5 text-neutral-muted" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 border border-emerald-100 bg-emerald-50/20 rounded-2xl flex items-center gap-4">
                    <Smartphone className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-[#0F172A]">Active Device (Current)</p>
                      <p className="text-xs text-neutral-muted">Vite Web Console Platform</p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-1">Online & Active</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowDeviceModal(false)}
                  className="w-full mt-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-bold rounded-2xl transition-all text-sm active:scale-95"
                >
                  Close Settings Panel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Limits Modal */}
      <AnimatePresence>
        {showLimitsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-extrabold text-neutral-text">Account Limits (Silver)</h2>
                  <button onClick={() => setShowLimitsModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                    <X className="w-5 h-5 text-neutral-muted" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-neutral-muted uppercase">Daily Transfer Limit</p>
                    <p className="text-xl font-black text-primary mt-1">₦2,500,000.00</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-neutral-muted uppercase">Maximum Card Balance</p>
                    <p className="text-xl font-black text-[#0F172A] mt-1">₦10,000,000.00</p>
                  </div>
                  
                  <p className="text-xs text-neutral-muted font-medium text-center">Need higher limits? Navigate to profile page & select Upgrade Tier.</p>
                </div>
                
                <button 
                  onClick={() => setShowLimitsModal(false)}
                  className="w-full mt-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-bold rounded-2xl transition-all text-sm active:scale-95"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Linked Accounts Modal */}
      <AnimatePresence>
        {showLinkedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-extrabold text-[#0F172A]">Linked Bank Cards</h2>
                  <button onClick={() => setShowLinkedModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                    <X className="w-5 h-5 text-neutral-muted" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 border border-slate-100 bg-slate-50 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-7 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-[10px]">VISA</div>
                      <div>
                        <p className="text-xs font-bold text-[#0F172A]">Debit Card **** 4567</p>
                        <p className="text-[10px] text-neutral-muted">Exp: 12/28</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase font-black tracking-widest px-1.5 py-0.5 rounded-full">Primary</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowLinkedModal(false)}
                  className="w-full mt-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-bold rounded-2xl transition-all text-sm active:scale-95"
                >
                  Close Panel
                </button>
              </div>
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
