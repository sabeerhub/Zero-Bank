import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Building2, Search, AlertCircle, Clock, 
  ChevronDown, Check, QrCode, Sparkles, Receipt, HelpCircle, ClipboardCheck, ArrowUpRight, Coins, Info, ShieldAlert, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { db } from '../firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import TransactionPinModal from '../components/TransactionPinModal';
import TransactionReceipt from '../components/TransactionReceipt';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export default function Interbank() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { isDarkMode } = useTheme();
  
  // Multi-step Wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Inputs
  const [selectedBankId, setSelectedBankId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');

  // Dropdown & Verification status
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Simulated mount skeleton timer for premium UX feel
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const banks = [
    { id: 'gtb', name: 'Guaranty Trust Bank (GTB)' },
    { id: 'access', name: 'Access Bank' },
    { id: 'zenith', name: 'Zenith Bank' },
    { id: 'uba', name: 'United Bank for Africa (UBA)' },
    { id: 'kuda', name: 'Kuda Bank' },
    { id: 'opay', name: 'Opay' },
    { id: 'palmpay', name: 'Palmpay' },
    { id: 'firstbank', name: 'First Bank of Nigeria' },
    { id: 'fcmb', name: 'First City Monument Bank' },
    { id: 'fidelity', name: 'Fidelity Bank' },
    { id: 'sterling', name: 'Sterling Bank' },
    { id: 'stanbic', name: 'Stanbic IBTC Bank' }
  ];

  const selectedBankObj = banks.find(b => b.id === selectedBankId);

  const filteredBanks = banks.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Simulate account validation when 10 digits are filled
  useEffect(() => {
    if (accountNumber.length === 10 && selectedBankId) {
      setIsVerifying(true);
      setError('');
      setVerifiedName('');

      const timer = setTimeout(() => {
        setIsVerifying(false);
        // Simulate successful name verification
        setVerifiedName('John Doe');
      }, 1200);

      return () => clearTimeout(timer);
    } else {
      setVerifiedName('');
      setError('');
    }
  }, [accountNumber, selectedBankId]);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedBankId) {
      setError('Please select a receiving destination bank.');
      return;
    }

    if (accountNumber.length !== 10) {
      setError('Receiving account number must be exactly 10 digits.');
      return;
    }

    if (!verifiedName) {
      setError('Unable to verify receiver. Please enter a valid account number.');
      return;
    }

    const trfAmt = parseFloat(amount);
    if (!amount || isNaN(trfAmt) || trfAmt <= 0) {
      setError('Please enter a valid transfer amount.');
      return;
    }

    if (profile && trfAmt > profile.balance) {
      setError('Insufficient balance in your Zero Bank account.');
      return;
    }

    // Advance to confirmation step
    setStep(2);
  };

  const handleAuthorizeTransfer = () => {
    setIsPinModalOpen(true);
  };

  const executeTransfer = async () => {
    if (!profile || !selectedBankObj) return;

    setIsPinModalOpen(false);
    setIsProcessing(true);
    setError('');

    const purchaseAmount = parseFloat(amount);

    try {
      const batch = writeBatch(db);
      const date = new Date().toISOString();
      const reference = 'TRF-' + Math.random().toString(36).substring(2, 10).toUpperCase();

      // Deduct balance
      const userRef = doc(db, 'users', profile.uid);
      batch.update(userRef, { balance: profile.balance - purchaseAmount });

      // Create transaction
      const txRef = doc(collection(db, 'transactions'));
      const desc = `Interbank Transfer to ${verifiedName} (${selectedBankObj.name})`;
      
      batch.set(txRef, {
        userId: profile.uid,
        type: 'debit',
        amount: purchaseAmount,
        category: 'transfer',
        description: desc,
        date,
        status: 'success',
        reference,
        recipientName: verifiedName,
        recipientAccount: accountNumber,
        bankName: selectedBankObj.name
      });

      // Send Notification
      const notifRef = doc(collection(db, 'notifications'));
      batch.set(notifRef, {
        userId: profile.uid,
        title: 'Interbank Transfer Approved',
        message: `Your transfer of ₦${purchaseAmount.toLocaleString()} to ${verifiedName} has been processed.`,
        type: 'transaction',
        read: false,
        date,
        link: '/transactions'
      });

      await batch.commit();

      setReceiptData({
        amount: purchaseAmount,
        recipientName: verifiedName,
        recipientAccount: accountNumber,
        senderName: profile.name,
        senderAccount: profile.accountNumber,
        reference,
        date,
        description: desc
      });

      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Transaction failed. Please try again.');
      handleFirestoreError(err, OperationType.WRITE, 'transactions');
    } finally {
      setIsProcessing(false);
    }
  };

  // If we are in step 3 (Complete) and receipt is ready, show full receipt screen
  if (step === 3 && receiptData) {
    return (
      <TransactionReceipt
        {...receiptData}
        onBack={() => navigate('/')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070B13] pb-24 font-sans text-[#0F172A] dark:text-slate-100 w-full max-w-7xl mx-auto px-4 md:px-8 transition-colors duration-300">
      {/* Precision Apple-style Header */}
      <header className="pt-8 pb-6 flex items-center justify-between border-b border-slate-100/80 dark:border-slate-800/50 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (step === 2) {
                setStep(1);
              } else {
                navigate(-1);
              }
            }} 
            className="w-11 h-11 rounded-2xl bg-white dark:bg-[#0E1626] border border-slate-200/60 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all shadow-xs group"
          >
            <ArrowLeft className="w-5 h-5 text-[#0F172A] dark:text-slate-200 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">Interbank Transfer</h1>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold tracking-wide uppercase mt-0.5">Instant settlement across external institutions</p>
          </div>
        </div>

        {profile && (
          <div className="hidden sm:flex items-center gap-3 bg-white dark:bg-[#0E1626] border border-slate-150/40 dark:border-slate-800/80 p-2.5 px-4 rounded-2xl shadow-xs">
            <Coins className="w-5 h-5 text-blue-600 dark:text-blue-500" />
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wider uppercase">Zero Wallet</p>
              <p className="text-sm font-black text-[#0F172A] dark:text-white">₦••••••</p>
            </div>
          </div>
        )}
      </header>

      {/* CORE STUDENT SIMULATION DISCLAIMER - CRITICAL WARNING BANNER */}
      <div className="mb-8 p-5 rounded-3xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 text-amber-800 dark:text-amber-300 shadow-md shadow-amber-500/5 flex gap-4 items-start max-w-4xl mx-auto md:max-w-none">
        <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <h4 className="text-xs font-black uppercase tracking-wider">Non-Licensed Simulation Notice</h4>
          <p className="text-[11px] font-semibold leading-relaxed opacity-90">
            Zero Bank is a <strong className="font-extrabold underline">student practical simulation project</strong> and is <strong className="font-extrabold">NOT a licensed bank, nor is it registered with NIBSS</strong> (Nigeria Inter-Bank Settlement System). No actual money will be moved or sent to any external accounts during this exercise.
          </p>
        </div>
      </div>

      {/* Visual Timeline Steps (Apple Design Style) */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-150/40 dark:border-slate-800/80 rounded-2xl p-4.5 mb-8 max-w-xl mx-auto md:max-w-none shadow-xs">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Step 1 */}
          <button 
            type="button"
            disabled={step === 1}
            onClick={() => setStep(1)}
            className="flex items-center gap-2.5 text-left outline-none group"
          >
            <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs font-black transition-all ${
              step >= 1 
                ? 'bg-[#0F172A] dark:bg-blue-600 text-white shadow-md shadow-slate-900/10 dark:shadow-blue-600/10' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
            }`}>
              {step > 1 ? <Check className="w-4 h-4 text-white" strokeWidth={3} /> : '1'}
            </div>
            <span className={`text-xs font-black tracking-tight ${step === 1 ? 'text-[#0F172A] dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>Fill Details</span>
          </button>

          <div className="h-[1.5px] bg-slate-100 dark:bg-slate-850 flex-1 mx-3" />

          {/* Step 2 */}
          <div className="flex items-center gap-2.5 text-left">
            <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs font-black transition-all ${
              step >= 2 
                ? 'bg-[#0F172A] dark:bg-blue-600 text-white shadow-md shadow-slate-900/10' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
            }`}>
              2
            </div>
            <span className={`text-xs font-black tracking-tight ${step === 2 ? 'text-[#0F172A] dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>Review transfer</span>
          </div>

          <div className="h-[1.5px] bg-slate-100 dark:bg-slate-850 flex-1 mx-3" />

          {/* Step 3 */}
          <div className="flex items-center gap-2.5 text-left">
            <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs font-black transition-all ${
              step >= 3 ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
            }`}>
              3
            </div>
            <span className={`text-xs font-black tracking-tight ${step === 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>Receipt</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div key="skele" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-[#0E1626] rounded-[28px] p-8 border border-slate-150/40 dark:border-slate-800/80 h-80 animate-pulse"></div>
            </div>
            <div className="lg:col-span-4 bg-white dark:bg-[#0E1626] rounded-[28px] p-6 border border-slate-150/40 dark:border-slate-800/80 h-64 animate-pulse"></div>
          </div>
        ) : (
          <motion.div 
            key="grid-container"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Column Form Area */}
            <div className="lg:col-span-8">
              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-2xl flex items-center gap-3 font-bold mb-6 shadow-xs">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.form 
                    key="step-1-form"
                    onSubmit={handleStep1Submit} 
                    className="bg-white dark:bg-[#0E1626] rounded-[32px] p-6 md:p-8 border border-slate-150/30 dark:border-slate-800/50 shadow-md shadow-slate-100/50 dark:shadow-none space-y-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="border-b border-slate-100 dark:border-slate-800/60 pb-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Receiver & Destination Bank</h3>
                    </div>

                    {/* Select Bank Dropdown */}
                    <div className="space-y-2.5 relative" ref={dropdownRef}>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">Destination Bank</label>
                      <div className="relative">
                        <Building2 className="absolute left-4.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 z-10" />
                        
                        <div 
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="w-full pl-12 pr-4 py-4.5 bg-[#F8FAFC] dark:bg-[#080E1A]/80 rounded-2xl border border-slate-200/40 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer flex items-center justify-between transition-colors text-[#0F172A] dark:text-white"
                        >
                          <span className={`text-sm font-extrabold truncate ${selectedBankId ? 'text-[#0F172A] dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>
                            {selectedBankId ? selectedBankObj?.name : 'Choose receiving institution...'}
                          </span>
                          <ChevronDown className={`w-4.5 h-4.5 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>

                        <AnimatePresence>
                          {isDropdownOpen && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#111A2E] rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 max-h-72 flex flex-col overflow-hidden"
                            >
                              <div className="p-3 border-b border-slate-100 dark:border-slate-850 sticky top-0 bg-white dark:bg-[#111A2E] z-10">
                                <div className="relative">
                                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                                  <input
                                    type="text"
                                    placeholder="Search banks e.g. GTB, Kuda..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/25 outline-none transition-all font-bold text-[#0F172A] dark:text-white"
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                  />
                                </div>
                              </div>
                              <div className="overflow-y-auto p-2 scrollbar-hide">
                                {filteredBanks.length > 0 ? (
                                  filteredBanks.map(b => (
                                    <button
                                      key={b.id}
                                      type="button"
                                      onClick={() => {
                                        setSelectedBankId(b.id);
                                        setIsDropdownOpen(false);
                                        setSearchQuery('');
                                      }}
                                      className={`w-full text-left px-3.5 py-3 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between ${selectedBankId === b.id ? 'bg-blue-500/5 text-blue-600 dark:text-blue-400' : 'text-[#0F172A] dark:text-slate-300'}`}
                                    >
                                      <span>{b.name}</span>
                                      {selectedBankId === b.id && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={3.5} />}
                                    </button>
                                  ))
                                ) : (
                                  <div className="text-center py-6">
                                    <AlertCircle className="w-5 h-5 text-slate-300 mx-auto mb-1" />
                                    <p className="text-xs font-semibold text-slate-400">No banks found</p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* PREMIUM BANK SHORTCUTS - APPLE UX */}
                      <div className="pt-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-2 pl-0.5">Popular Institutions</span>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {[
                            { id: 'gtb', label: 'GTBank', short: 'GTB' },
                            { id: 'access', label: 'Access', short: 'ACC' },
                            { id: 'zenith', label: 'Zenith', short: 'ZEN' },
                            { id: 'uba', label: 'UBA', short: 'UBA' },
                            { id: 'kuda', label: 'Kuda', short: 'KUD' },
                            { id: 'opay', label: 'Opay', short: 'OPY' }
                          ].map(b => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => setSelectedBankId(b.id)}
                              className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border text-center cursor-pointer ${
                                selectedBankId === b.id 
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                  : 'bg-[#F8FAFC] dark:bg-[#080E1A]/60 text-slate-600 dark:text-slate-400 border-slate-200/40 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Account Number Input */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Account Number</label>
                          {isVerifying && (
                            <div className="flex items-center gap-1.5 text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                              <div className="w-2.5 h-2.5 border border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
                              <span>Verifying...</span>
                            </div>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-4.5 py-4 bg-[#F8FAFC] dark:bg-[#080E1A]/80 border-none tracking-widest rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-[#0F172A] dark:text-white"
                            placeholder="Enter 10-digit account"
                          />
                          <button 
                            type="button" 
                            onClick={async () => {
                              const text = await navigator.clipboard.readText();
                              if (text) {
                                setAccountNumber(text.replace(/\D/g, '').substring(0, 10));
                              }
                            }}
                            className="absolute right-4.5 top-1/2 -translate-y-1/2 text-xs font-black text-blue-600 dark:text-blue-400 hover:text-blue-500"
                          >
                            Paste
                          </button>
                        </div>
                      </div>

                      {/* Amount Input */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">Amount (₦)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-extrabold text-slate-400 dark:text-slate-500">₦</span>
                          <input
                            type="number"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full pl-9 pr-4 py-4 bg-[#F8FAFC] dark:bg-[#080E1A]/80 border-none rounded-2xl text-lg font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-[#0F172A] dark:text-white"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Real-time Verified Result widget */}
                    <AnimatePresence>
                      {verifiedName && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between"
                        >
                          <div>
                            <span className="text-[9px] uppercase tracking-wider font-black text-emerald-600 dark:text-emerald-400">Verified Recipient (NIBSS)</span>
                            <h5 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                              {verifiedName}
                            </h5>
                          </div>
                          <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                            <span>VERIFIED</span>
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Narration */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">Narration (Optional)</label>
                      <input
                        type="text"
                        value={narration}
                        onChange={(e) => setNarration(e.target.value)}
                        className="w-full px-4.5 py-4 bg-[#F8FAFC] dark:bg-[#080E1A]/80 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-[#0F172A] dark:text-white font-semibold"
                        placeholder="Sent from Zero Bank web"
                      />
                    </div>

                    {/* Submit CTA */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="w-full bg-[#0F172A] hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-4.5 rounded-2xl font-black flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        <span>Continue to confirmation</span>
                        <ChevronDown className="-rotate-90 w-4.5 h-4.5" />
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="step-2-confirm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white dark:bg-[#0E1626] rounded-[32px] p-6 md:p-8 border border-slate-150/30 dark:border-slate-800/50 shadow-md space-y-6"
                  >
                    <div className="border-b border-slate-100 dark:border-slate-800/60 pb-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Review Transfer Summary</h3>
                    </div>

                    {/* Visual Invoice Passport mockup */}
                    <div className="border border-slate-150/50 dark:border-slate-800 rounded-3xl p-6 bg-slate-50/50 dark:bg-[#080E1A]/40 space-y-5">
                      <div className="text-center pb-5 border-b border-slate-150/40 dark:border-slate-800/60">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Authorized Settlement Amount</span>
                        <h2 className="text-3xl font-black text-[#0F172A] dark:text-white tracking-tight mt-1.5">₦{parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4.5 gap-x-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase tracking-wider">Recipient Name</span>
                          <strong className="text-[#0F172A] dark:text-white font-black mt-1 block">{verifiedName}</strong>
                        </div>
                        <div className="sm:text-right">
                          <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase tracking-wider">Destination Bank</span>
                          <strong className="text-[#0F172A] dark:text-white font-black mt-1 block truncate max-w-[200px] inline-block">{selectedBankObj?.name}</strong>
                        </div>

                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase tracking-wider">Account Number</span>
                          <strong className="text-[#0F172A] dark:text-white font-mono font-black mt-1 block tracking-widest">{accountNumber}</strong>
                        </div>
                        <div className="sm:text-right">
                          <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase tracking-wider">Dispatch System</span>
                          <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold mt-1 block flex items-center sm:justify-end gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Simulated Instant
                          </strong>
                        </div>

                        <div className="col-span-1 sm:col-span-2 pt-3.5 border-t border-slate-150/30 dark:border-slate-850">
                          <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase tracking-wider">Narration / Note</span>
                          <strong className="text-[#0F172A] dark:text-white font-bold mt-1 block">{narration || 'N/A'}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Final step licensing warning message */}
                    <div className="p-4 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-3.5">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <h6 className="text-xs font-black uppercase text-amber-800 dark:text-amber-400 tracking-wider">Simulated Sandboxed Transfer</h6>
                        <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed mt-1 font-semibold">
                          By clicking authorize, you acknowledge this is a practical student project with <strong className="font-extrabold underline">no connection to NIBSS</strong>. No actual funds will be delivered to any real financial entity.
                        </p>
                      </div>
                    </div>

                    {/* Execute / Pin trigger buttons */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-100 font-black text-xs uppercase tracking-wider rounded-2xl transition-colors cursor-pointer"
                      >
                        Edit Details
                      </button>
                      <button
                        type="button"
                        onClick={handleAuthorizeTransfer}
                        disabled={isProcessing}
                        className="w-full bg-[#0F172A] hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isProcessing ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Authorize Transfer</span>
                            <ArrowUpRight className="w-4.5 h-4.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column (Info widget & quick actions list) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Account Balance Widget */}
              {profile && (
                <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-neutral-950 text-white rounded-[32px] p-6 shadow-xl relative overflow-hidden border border-slate-800">
                  {/* Apple organic glass reflection */}
                  <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Verified Wallet Asset</span>
                  <p className="text-sm font-black text-white mt-1">Zero Bank Savings Account</p>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Acc No: {profile.accountNumber}</p>
                  
                  <div className="pt-6 mt-6 border-t border-slate-800/80 flex justify-between items-end">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Available Balance</span>
                      <strong className="text-xl font-black text-white mt-0.5 block">₦••••••</strong>
                    </div>
                    <span className="text-[9px] bg-white/10 px-2.5 py-1 rounded-full text-white font-extrabold uppercase tracking-widest border border-white/5">Savings</span>
                  </div>
                </div>
              )}

              {/* Supported Banks Summary */}
              <div className="bg-white dark:bg-[#0E1626] rounded-[28px] p-6 border border-slate-150/40 dark:border-slate-800/80 shadow-xs space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Unified Settlement Grid</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">Zero Bank supports simulated settlement across all primary financial networks under the unified Nigerian banking layout:</p>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {banks.slice(0, 9).map(b => (
                    <div key={b.id} className="bg-[#F8FAFC] dark:bg-[#080E1A]/60 rounded-xl p-2.5 text-center border border-slate-200/40 dark:border-slate-850">
                      <span className="text-[9px] font-black text-[#0F172A] dark:text-slate-400 uppercase block truncate">{b.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TransactionPinModal 
        isOpen={isPinModalOpen} 
        onClose={() => setIsPinModalOpen(false)} 
        onSuccess={executeTransfer} 
      />
    </div>
  );
}
