import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Landmark, Calendar, CheckCircle2, X, AlertCircle, Coins, ShieldCheck, Scale, Percent } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../firebase';
import { doc, writeBatch, collection, increment } from 'firebase/firestore';

export default function Loan() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('1');
  const [isApplying, setIsApplying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [showRepayModal, setShowRepayModal] = useState(false);
  const [repayAmount, setRepayAmount] = useState('');
  const [isRepaying, setIsRepaying] = useState(false);

  // Simulated skeletal mount loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const loanBalance = profile?.loanBalance || 0;
  const maxLoan = profile ? profile.balance * 2 + 50000 : 50000;
  const interestRate = 0.05; // 5% per month

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !profile) return;
    
    setIsApplying(true);
    
    try {
      const principal = parseFloat(amount);
      const totalRepayment = principal + (principal * interestRate * parseInt(duration));
      
      const batch = writeBatch(db);
      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      // Add principal to balance, and add totalRepayment to loanBalance
      batch.update(userRef, {
        balance: increment(principal),
        loanBalance: increment(totalRepayment)
      });
      
      // Create transaction record
      const txRef = doc(collection(db, 'transactions'));
      batch.set(txRef, {
        userId: auth.currentUser.uid,
        type: 'credit',
        amount: principal,
        category: 'loan',
        description: `Loan Disbursement (${duration} months)`,
        status: 'success',
        date: new Date().toISOString(),
        reference: `LOAN-${Date.now()}`
      });
      
      // Create notification
      const notifRef = doc(collection(db, 'notifications'));
      batch.set(notifRef, {
        userId: auth.currentUser.uid,
        title: 'Loan Approved',
        message: `Your loan of ₦${principal.toLocaleString()} has been disbursed to your account.`,
        type: 'system',
        read: false,
        date: new Date().toISOString()
      });
      
      await batch.commit();
      setSuccess(true);
    } catch (error) {
      console.error('Error applying for loan:', error);
      alert('Failed to apply for loan. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleRepay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !profile) return;
    
    const amountToRepay = parseFloat(repayAmount);
    if (isNaN(amountToRepay) || amountToRepay <= 0) return;
    
    if (amountToRepay > profile.balance) {
      alert('Insufficient funds in your account');
      return;
    }
    if (amountToRepay > loanBalance) {
      alert('Amount exceeds outstanding loan');
      return;
    }

    setIsRepaying(true);
    try {
      const batch = writeBatch(db);
      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      batch.update(userRef, {
        balance: increment(-amountToRepay),
        loanBalance: increment(-amountToRepay)
      });
      
      const txRef = doc(collection(db, 'transactions'));
      batch.set(txRef, {
        userId: auth.currentUser.uid,
        type: 'debit',
        amount: amountToRepay,
        category: 'loan',
        description: 'Loan Repayment',
        status: 'success',
        date: new Date().toISOString(),
        reference: `REPAY-${Date.now()}`
      });
      
      const notifRef = doc(collection(db, 'notifications'));
      batch.set(notifRef, {
        userId: auth.currentUser.uid,
        title: 'Loan Repayment',
        message: `You have successfully repaid ₦${amountToRepay.toLocaleString()} of your loan.`,
        type: 'system',
        read: false,
        date: new Date().toISOString()
      });
      
      await batch.commit();
      
      setShowRepayModal(false);
      setRepayAmount('');
      alert('Loan repayment successful!');
    } catch (error) {
      console.error('Error repaying loan:', error);
      alert('Failed to process repayment. Please try again.');
    } finally {
      setIsRepaying(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-inner"
        >
          <CheckCircle2 className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
        </motion.div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Loan Disbursement Completed!</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-8 max-w-sm leading-relaxed font-semibold">
          Your loan of <strong>₦{parseFloat(amount).toLocaleString()}</strong> has been approved and instantly loaded to your active wallet balance.
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full max-w-xs bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

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
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Credit & Loans</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold tracking-wider uppercase mt-0.5">Flexible disbursement & repayments</p>
          </div>
        </div>

        {profile && (
          <div className="hidden sm:flex items-center gap-3 bg-white dark:bg-[#0B121F]/80 border border-slate-200 dark:border-slate-800 p-2.5 px-4 rounded-2xl shadow-xs">
            <Coins className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold tracking-wider uppercase">Zero Wallet</p>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">₦••••••</p>
            </div>
          </div>
        )}
      </header>

      {/* Main content grid */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div key="skel" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-white dark:bg-[#0B121F]/80 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800 h-80 animate-pulse"></div>
            <div className="lg:col-span-8 bg-white dark:bg-[#0B121F]/80 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800 h-96 animate-pulse"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (Balances & Eligibility parameters) */}
            <div className="lg:col-span-4 space-y-6">
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider pl-1">Your Credit Score Overview</span>

              {/* Outstanding Loan balances */}
              {loanBalance > 0 ? (
                <div className="bg-orange-50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/40 p-6 rounded-[28px] space-y-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-orange-900 dark:text-orange-400 tracking-wider">Outstanding Loan Balance</span>
                    <h3 className="text-2xl font-black text-orange-700 dark:text-orange-400 mt-1">₦{loanBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                  </div>
                  <button
                    onClick={() => setShowRepayModal(true)}
                    className="w-full py-3 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white text-xs font-bold rounded-2xl transition-colors shadow-sm cursor-pointer"
                  >
                    Repay Loan Instantly
                  </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#0B121F]/80 border border-slate-200 dark:border-slate-800 p-6 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Good standing</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wide mt-0.5">No outstanding credit debt</p>
                  </div>
                </div>
              )}

              {/* Maximum borrowing limits */}
              <div className="bg-[#0F172A] dark:bg-[#0B121F]/80 text-white p-6 rounded-[32px] relative overflow-hidden space-y-3 border border-transparent dark:border-slate-800">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <div>
                  <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest block">Maximum borrowing limit</span>
                  <strong className="text-2xl font-black tracking-tight block mt-1 text-white">₦{maxLoan.toLocaleString()}</strong>
                </div>
                <div className="pt-2 flex items-center gap-2 border-t border-white/10 text-[10px] text-white/70 font-semibold">
                  <Scale className="w-3.5 h-3.5 opacity-80" />
                  <span>Calculated based on average monthly wallet savings</span>
                </div>
              </div>
            </div>

            {/* Right Column (Loan Calculator & Form submission) */}
            <div className="lg:col-span-8">
              <div className="bg-white dark:bg-[#0B121F]/80 rounded-[32px] border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
                <div className="border-b border-slate-200/60 dark:border-slate-800 pb-4 mb-6 flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Configure Loan Application</span>
                </div>

                <form onSubmit={handleApply} className="space-y-6">
                  {/* Amount input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">Principal Amount Required</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₦</span>
                      <input
                        type="number"
                        required
                        min="1000"
                        max={maxLoan}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-none rounded-2xl text-base font-extrabold outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/10 text-slate-900 dark:text-white placeholder-slate-400"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Duration picker */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">Repayment Term</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <select
                        required
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-none rounded-2xl text-xs font-bold outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/10 text-slate-900 dark:text-white appearance-none cursor-pointer"
                      >
                        <option value="1">1 Month Term</option>
                        <option value="3">3 Months Term</option>
                        <option value="6">6 Months Term</option>
                        <option value="12">12 Months Term</option>
                      </select>
                    </div>
                  </div>

                  {/* Interest visual panel */}
                  {amount && parseFloat(amount) > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3.5 text-xs font-semibold">
                      <div className="flex justify-between items-center text-slate-900 dark:text-slate-100">
                        <span className="text-slate-400 dark:text-slate-500">Principal Amount</span>
                        <span className="font-bold">₦{parseFloat(amount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-900 dark:text-slate-100">
                        <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                          <Percent className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>Interest charges ({interestRate * 100}% per month)</span>
                        </span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold">+ ₦{(parseFloat(amount) * interestRate * parseInt(duration)).toLocaleString()}</span>
                      </div>
                      <div className="pt-3.5 border-t border-slate-200/60 dark:border-slate-800 flex justify-between items-center text-sm">
                        <span className="font-extrabold text-slate-900 dark:text-white">Total Repayment Commitment</span>
                        <span className="font-black text-blue-600 dark:text-blue-400">
                          ₦{(parseFloat(amount) + (parseFloat(amount) * interestRate * parseInt(duration))).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isApplying || !amount || parseFloat(amount) > maxLoan}
                    className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white py-3.5 rounded-2xl font-bold text-xs transition-all flex justify-center items-center shadow-md active:scale-95 disabled:opacity-40 cursor-pointer"
                  >
                    {isApplying ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Authorize Loan Disbursement'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Repay Modal Overlay */}
      <AnimatePresence>
        {showRepayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0E1626] rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Repay Credit Loan</h2>
                <button 
                  onClick={() => setShowRepayModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleRepay} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">Amount to Repay</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₦</span>
                    <input
                      type="number"
                      required
                      min="100"
                      max={Math.min(loanBalance, profile?.balance || 0)}
                      value={repayAmount}
                      onChange={(e) => setRepayAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/40 border-none rounded-xl text-xs font-bold outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/10 text-slate-900 dark:text-white placeholder-slate-400"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wide uppercase">
                    <span>Max: ₦{Math.min(loanBalance, profile?.balance || 0).toLocaleString()}</span>
                    <button 
                      type="button"
                      onClick={() => setRepayAmount(Math.min(loanBalance, profile?.balance || 0).toString())}
                      className="text-blue-600 dark:text-blue-400 cursor-pointer"
                    >
                      Pay Maximum
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRepaying || !repayAmount || parseFloat(repayAmount) <= 0 || parseFloat(repayAmount) > (profile?.balance || 0) || parseFloat(repayAmount) > loanBalance}
                  className="w-full py-3.5 bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white font-bold rounded-2xl text-xs transition-colors shadow-md disabled:opacity-40 cursor-pointer"
                >
                  {isRepaying ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Repayment'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
