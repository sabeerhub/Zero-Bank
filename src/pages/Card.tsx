import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CreditCard, Eye, EyeOff, Lock, Settings, ShieldCheck, Snowflake, Copy, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import TransactionPinModal from '../components/TransactionPinModal';

export default function Card() {
  const navigate = useNavigate();
  const { profile } = useAuth();
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

  const handleToggleOnlinePayments = async () => {
    if (!profile) return;
    const newValue = !onlinePayments;
    setOnlinePayments(newValue);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        onlinePaymentsEnabled: newValue
      });
    } catch (error) {
      console.error("Error updating online payments status:", error);
      setOnlinePayments(!newValue);
    }
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText('4532123456789012');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    setMessage({ type: 'success', text: 'Card PIN updated successfully' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
      <header className="px-6 py-6 bg-white flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-neutral-text" />
        </button>
        <h1 className="text-xl font-bold text-neutral-text">My Card</h1>
      </header>

      <main className="flex-1 p-6">
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl mb-6 flex items-center gap-3 text-sm font-medium ${
              message.type === 'success' ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p>{message.text}</p>
          </motion.div>
        )}

        <div className="relative w-full h-56 rounded-2xl p-6 text-white overflow-hidden shadow-xl mb-8 transition-all"
             style={{ background: isFrozen ? 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)' : 'linear-gradient(135deg, #1a1a1a 0%, #404040 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-white/70 text-sm font-medium tracking-wider mb-1">Zero Bank</p>
              <CreditCard className="w-8 h-8 text-white/90" />
            </div>
            <div className="w-12 h-8 bg-white/20 rounded flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-white/50 -mr-2"></div>
              <div className="w-6 h-6 rounded-full border-2 border-white/50 bg-white/20"></div>
            </div>
          </div>

          <div className="mt-10 relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <p className="font-mono text-xl tracking-[0.2em]">
                {showDetails ? '4532 1234 5678 9012' : '•••• •••• •••• 9012'}
              </p>
              {showDetails && (
                <button onClick={copyToClipboard} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4 text-white/70" />}
                </button>
              )}
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">Card Holder</p>
                <p className="font-medium tracking-wide">{profile?.name || 'USER'}</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">Valid Thru</p>
                <p className="font-medium tracking-wide">{showDetails ? '12/28' : '••/••'}</p>
              </div>
              {showDetails && (
                <div className="text-right">
                  <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">CVV</p>
                  <p className="font-medium tracking-wide">123</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-primary">
              {showDetails ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </div>
            <span className="text-xs font-medium text-neutral-text">{showDetails ? 'Hide' : 'Show'}</span>
          </button>
          
          <button 
            onClick={handleToggleFreeze}
            className="flex flex-col items-center gap-2"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${isFrozen ? 'bg-blue-100 text-blue-600' : 'bg-white text-primary'}`}>
              <Snowflake className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-neutral-text">{isFrozen ? 'Unfreeze' : 'Freeze'}</span>
          </button>

          <button 
            onClick={() => setShowSettingsModal(true)}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-primary hover:bg-gray-50 transition-colors">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-neutral-text">Settings</span>
          </button>

          <button 
            onClick={() => setIsPinModalOpen(true)}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-primary hover:bg-gray-50 transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-neutral-text">PIN</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-neutral-text mb-4">Card Security</h3>
          <div className="space-y-4">
            <button 
              onClick={handleToggleOnlinePayments}
              className="w-full flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-text group-hover:text-primary transition-colors">Online Payments</p>
                  <p className="text-xs text-neutral-muted">Pay for goods and services online</p>
                </div>
              </div>
              <div className={`w-11 h-6 rounded-full relative transition-colors ${onlinePayments ? 'bg-primary' : 'bg-gray-200'}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${onlinePayments ? 'left-[22px]' : 'left-0.5'}`}></div>
              </div>
            </button>
          </div>
        </div>
      </main>

      <TransactionPinModal 
        isOpen={isPinModalOpen} 
        onClose={() => setIsPinModalOpen(false)} 
        onSuccess={handlePinSuccess}
        mode="change"
      />

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-neutral-text">Card Settings</h2>
                  <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-neutral-muted" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-text mb-2">Monthly Spending Limit (NGN)</label>
                    <input
                      type="number"
                      value={spendingLimit}
                      onChange={(e) => setSpendingLimit(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-neutral-bg border-none rounded-xl text-lg font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="e.g. 500000"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-8">
                  <button 
                    onClick={() => setShowSettingsModal(false)}
                    className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-neutral-text font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveLimit}
                    disabled={isSavingLimit}
                    className="flex-1 py-3.5 bg-primary hover:bg-primary-accent text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isSavingLimit ? 'Saving...' : 'Save Changes'}
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
