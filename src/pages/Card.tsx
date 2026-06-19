import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  CreditCard, 
  Eye, 
  EyeOff, 
  Lock, 
  Settings, 
  ShieldCheck, 
  Snowflake, 
  Copy, 
  CheckCircle2, 
  X,
  TrendingUp,
  Sliders,
  MoreHorizontal,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import TransactionPinModal from '../components/TransactionPinModal';

export default function Card() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'virtual' | 'physical'>('virtual');
  const [showDetails, setShowDetails] = useState(false);
  const [isFrozen, setIsFrozen] = useState(profile?.isCardFrozen || false);
  const [onlinePayments, setOnlinePayments] = useState(profile?.onlinePaymentsEnabled ?? true);
  const [copied, setCopied] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [spendingLimit, setSpendingLimit] = useState(profile?.cardSpendingLimit || 500000);
  const [isSavingLimit, setIsSavingLimit] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (profile) {
      setIsFrozen(profile.isCardFrozen || false);
      setOnlinePayments(profile.onlinePaymentsEnabled ?? true);
      setSpendingLimit(profile.cardSpendingLimit || 500000);
    }
  }, [profile]);

  const handleToggleFreeze = async () => {
    if (!profile) return;
    const newValue = !isFrozen;
    setIsFrozen(newValue);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        isCardFrozen: newValue
      });
      setMessage({ type: 'success', text: newValue ? 'Card frozen successfully' : 'Card unfrozen successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error("Error updating card freeze status:", error);
      setIsFrozen(!newValue);
      setMessage({ type: 'error', text: 'Failed to update card status' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText('4567453212349012');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveLimit = async () => {
    if (!profile) return;
    setIsSavingLimit(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        cardSpendingLimit: Number(spendingLimit)
      });
      setShowSettingsModal(false);
      setMessage({ type: 'success', text: 'Spending limit updated successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error("Error updating spending limit:", error);
      setMessage({ type: 'error', text: 'Failed to update spending limit' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setIsSavingLimit(false);
    }
  };

  // Mock Spent Analytics chart data corresponding to the iOS visual mockup
  const chartDays = ['1', '5', '10', '15', '20', '25', '30'];
  const chartHeights = [40, 20, 50, 75, 45, 60, 55, 30, 48, 62, 59, 85, 30, 40, 52, 70, 68, 74, 50, 48, 65, 80, 85, 78, 60];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col w-full max-w-4xl mx-auto px-1 pb-16">
      {/* Header section with back option */}
      <header className="pt-8 pb-6 bg-[#F8FAFC]/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="w-11 h-11 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">My Card</h1>
            <p className="text-[11px] text-neutral-muted font-bold tracking-wide uppercase mt-0.5">Manage virtual & physical credit</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/settings')}
          className="w-11 h-11 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all shadow-sm text-neutral-muted"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 space-y-6">
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold ${
              message.type === 'success' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'
            }`}
          >
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
            <p>{message.text}</p>
          </motion.div>
        )}

        {/* Tab Switcher (Virtual VS Physical) */}
        <div className="bg-slate-100 p-1 rounded-2xl grid grid-cols-2 max-w-sm mx-auto mb-2">
          <button
            onClick={() => setActiveTab('virtual')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'virtual' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-neutral-muted hover:text-[#0F172A]'
            }`}
          >
            Virtual Card
          </button>
          <button
            onClick={() => setActiveTab('physical')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'physical' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-neutral-muted hover:text-[#0F172A]'
            }`}
          >
            Physical Card
          </button>
        </div>

        {/* Gorgeous Gradient Neo-Card */}
        <div className="flex justify-center">
          <motion.div 
            layout
            className={`w-full max-w-md rounded-3xl p-6.5 text-white overflow-hidden shadow-2xl relative select-none cursor-pointer border border-white/10 ${
              isFrozen 
                ? 'bg-gradient-to-br from-[#94A3B8] to-[#64748B]' 
                : 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 shadow-indigo-200'
            }`}
          >
            {/* Glossy overlay effect */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex justify-between items-start relative z-10 mb-10">
              <div>
                <span className="text-sm font-extrabold tracking-tight italic block text-white">Zero Bank</span>
                <span className="text-[9px] uppercase tracking-wider py-0.5 px-2 bg-white/15 border border-white/5 rounded-md font-bold mt-1 inline-block">
                  {activeTab === 'virtual' ? 'Virtual' : 'Physical'}
                </span>
              </div>
              <span className="text-xs font-bold tracking-widest text-white/40">⚡ VISA</span>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-3">
                <p className="font-mono text-lg sm:text-xl tracking-[0.25em] font-medium">
                  {showDetails ? '4567 4532 1234 9012' : '•••• •••• •••• 9012'}
                </p>
                {showDetails && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); copyToClipboard(); }} 
                    className="p-1 bg-white/10 hover:bg-white/20 active:scale-95 rounded-md transition-all border border-white/10"
                    title="Copy Card Number"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              <div className="flex justify-between items-end pt-2">
                <div>
                  <span className="text-white/60 text-[8px] uppercase tracking-widest block mb-0.5">Card Holder</span>
                  <p className="font-bold text-sm tracking-wide">{profile?.name ? profile.name.toUpperCase() : 'SABEER MUHAMMED'}</p>
                </div>
                <div className="flex gap-6 text-right">
                  <div>
                    <span className="text-white/60 text-[8px] uppercase tracking-widest block mb-0.5">Expiry</span>
                    <p className="font-bold text-sm tracking-wide">{showDetails ? '12/28' : '••/••'}</p>
                  </div>
                  {showDetails && (
                    <div>
                      <span className="text-white/60 text-[8px] uppercase tracking-widest block mb-0.5">CVV</span>
                      <p className="font-bold text-sm tracking-wide">123</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Quick Operations Buttons (Align exactly with design mockup) */}
        <div className="grid grid-cols-4 gap-3 bg-white p-4.5 rounded-[22px] border border-[#E2E8F0] shadow-sm max-w-lg mx-auto">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 active:scale-95 transition-all text-[#0F172A] shadow-inner">
              {showDetails ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </div>
            <span className="text-[10px] font-bold text-neutral-muted group-hover:text-[#0F172A] transition-colors">Show Details</span>
          </button>

          <button 
            onClick={handleToggleFreeze}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center group-hover:scale-105 active:scale-95 transition-all shadow-inner ${
              isFrozen 
                ? 'bg-rose-50 border-rose-100 text-[#EF4444]' 
                : 'bg-slate-50 border-slate-100 text-[#0F172A]'
            }`}>
              <Snowflake className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-neutral-muted group-hover:text-[#0F172A] transition-colors">
              {isFrozen ? 'Unfreeze' : 'Freeze Card'}
            </span>
          </button>

          <button 
            onClick={() => setShowSettingsModal(true)}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 active:scale-95 transition-all text-[#0F172A] shadow-inner">
              <Sliders className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-neutral-muted group-hover:text-[#0F172A] transition-colors">Card Limits</span>
          </button>

          <button 
            onClick={() => navigate('/services')}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 active:scale-95 transition-all text-[#0F172A] shadow-inner">
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-neutral-muted group-hover:text-[#0F172A] transition-colors">More</span>
          </button>
        </div>

        {/* Card Analytics Block (Match exact iOS chart styling under MY CARD) */}
        <section className="bg-white rounded-[28px] p-6 border border-[#E2E8F0] shadow-sm max-w-lg mx-auto space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-neutral-muted uppercase tracking-wider block">Card Analytics</span>
              <h4 className="text-xl font-extrabold text-[#0F172A] tracking-tight mt-1">₦120,000.00</h4>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-extrabold text-[#22C55E] bg-[#22C55E]/10 py-1 px-2.5 rounded-full">+12.5%</span>
              <span className="text-[9px] font-bold text-neutral-muted mt-1 uppercase">This Month</span>
            </div>
          </div>

          {/* Clean spent chart mockup */}
          <div className="space-y-4">
            <div className="h-28 flex items-end justify-between gap-1.5 pt-4 relative">
              {/* Grid Background Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                <div className="border-t border-slate-900 w-full"></div>
                <div className="border-t border-slate-900 w-full"></div>
                <div className="border-t border-slate-900 w-full"></div>
                <div className="border-t border-slate-900 w-full"></div>
              </div>

              {/* Individual Bar Columns */}
              {chartHeights.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip on Hover */}
                  <span className="absolute bottom-full mb-1 bg-[#0F172A] text-white text-[8px] font-bold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-md">
                    ₦{(h * 1500).toLocaleString()}
                  </span>
                  <div 
                    className="w-full bg-[#2563EB] rounded-t-sm group-hover:bg-[#38BDF8] transition-all"
                    style={{ height: `${h}%` }}
                  ></div>
                </div>
              ))}
            </div>

            {/* Chart X axis items */}
            <div className="flex justify-between text-[10px] font-extrabold text-neutral-muted px-1.5 pt-1 uppercase">
              {chartDays.map((day, i) => (
                <span key={i}>{day}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Security Preferences Card */}
        <section className="bg-white rounded-[28px] p-6 border border-[#E2E8F0] shadow-sm max-w-lg mx-auto">
          <h3 className="text-xs font-bold uppercase text-neutral-muted tracking-wider mb-4">Controls & Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <div className="space-y-0.5 pr-4">
                <p className="text-sm font-bold text-[#0F172A]">Biometric Web Checks</p>
                <p className="text-xs text-neutral-muted font-medium">Verify online payments with automated verification push approvals</p>
              </div>
              <div className="w-10 h-6 bg-primary rounded-full relative p-0.5 cursor-pointer">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5 pr-4">
                <p className="text-sm font-bold text-[#0F172A]">ATM Cashout withdrawals</p>
                <p className="text-xs text-neutral-muted font-medium">Allow physical POS transactions with custom spending caps</p>
              </div>
              <div className="w-10 h-6 bg-slate-200 rounded-full relative p-0.5 cursor-pointer">
                <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Settings Modal popup */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] w-full max-w-sm overflow-hidden shadow-2xl border border-[#E2E8F0]"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">Spending Boundaries</h2>
                  <button onClick={() => setShowSettingsModal(false)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-neutral-muted" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-muted">Monthly Spending Limit (NGN)</label>
                    <input
                      type="number"
                      value={spendingLimit}
                      onChange={(e) => setSpendingLimit(Number(e.target.value))}
                      className="w-full px-4 py-3.5 bg-[#F8FAFC] border-none rounded-2xl text-md font-bold focus:ring-2 focus:ring-primary/20 transition-all text-[#0F172A]"
                      placeholder="e.g. 500000"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowSettingsModal(false)}
                    className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-bold rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveLimit}
                    disabled={isSavingLimit}
                    className="flex-1 py-3.5 bg-primary hover:bg-primary-accent text-white text-xs font-bold rounded-2xl transition-all flex items-center justify-center"
                  >
                    {isSavingLimit ? 'Saving...' : 'Save Limits'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
