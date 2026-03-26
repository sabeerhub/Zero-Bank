import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Landmark, Calendar, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../firebase';
import { doc, writeBatch, collection, serverTimestamp, increment } from 'firebase/firestore';

export default function Loan() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('1');
  const [isApplying, setIsApplying] = useState(false);
  const [success, setSuccess] = useState(false);

  const [showRepayModal, setShowRepayModal] = useState(false);
  const [repayAmount, setRepayAmount] = useState('');
  const [isRepaying, setIsRepaying] = useState(false);

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
      alert('Insufficient funds');
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
      <div className="min-h-screen bg-neutral-bg flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-status-success/10 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-status-success" />
        </motion.div>
        <h2 className="text-2xl font-bold text-neutral-text mb-2">Application Received!</h2>
        <p className="text-neutral-muted mb-8">
          Your loan of ₦{parseFloat(amount).toLocaleString()} has been approved and disbursed to your account.
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full max-w-sm bg-primary hover:bg-primary-accent text-white py-4 rounded-xl font-semibold transition-all active:scale-[0.98]"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
      <header className="px-6 py-6 bg-white flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-neutral-text" />
        </button>
        <h1 className="text-xl font-bold text-neutral-text">Request Loan</h1>
      </header>

      <main className="flex-1 p-6">
        {loanBalance > 0 && (
          <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-bold text-orange-900">Outstanding Loan</p>
                <p className="text-2xl font-black text-orange-700 mt-1">₦{loanBalance.toLocaleString()}</p>
              </div>
              <button
                onClick={() => setShowRepayModal(true)}
                className="px-4 py-2 bg-orange-600 text-white text-sm font-bold rounded-xl hover:bg-orange-700 transition-colors"
              >
                Repay
              </button>
            </div>
            <p className="text-xs text-orange-600">
              Available Balance: ₦{profile?.balance?.toLocaleString() || 0}
            </p>
          </div>
        )}

        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-3 mb-8">
          <Landmark className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-emerald-900">Eligible Amount</p>
            <p className="text-xl font-black text-emerald-700 mt-1">₦{maxLoan.toLocaleString()}</p>
            <p className="text-xs text-emerald-600 mt-1">Based on your account history</p>
          </div>
        </div>

        <form onSubmit={handleApply} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-text">How much do you need?</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-neutral-muted">₦</span>
              <input
                type="number"
                required
                min="1000"
                max={maxLoan}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-4 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold text-xl"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-text">Duration (Months)</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-muted" />
              <select
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 transition-all text-sm appearance-none font-medium"
              >
                <option value="1">1 Month</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
              </select>
            </div>
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-muted">Principal</span>
                <span className="font-medium">₦{parseFloat(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-muted">Interest ({interestRate * 100}%/mo)</span>
                <span className="font-medium text-status-error">+ ₦{(parseFloat(amount) * interestRate * parseInt(duration)).toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between">
                <span className="font-bold text-neutral-text">Total Repayment</span>
                <span className="font-bold text-primary">
                  ₦{(parseFloat(amount) + (parseFloat(amount) * interestRate * parseInt(duration))).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isApplying || !amount || parseFloat(amount) > maxLoan}
            className="w-full bg-primary hover:bg-primary-accent text-white py-4 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 mt-8 flex justify-center items-center shadow-lg shadow-primary/20"
          >
            {isApplying ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Apply Now'}
          </button>
        </form>
      </main>

      <AnimatePresence>
        {showRepayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-neutral-text">Repay Loan</h2>
                  <button 
                    onClick={() => setShowRepayModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-muted" />
                  </button>
                </div>

                <form onSubmit={handleRepay} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-text mb-1.5">Amount to Repay</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-neutral-muted">₦</span>
                      <input
                        type="number"
                        required
                        min="100"
                        max={Math.min(loanBalance, profile?.balance || 0)}
                        value={repayAmount}
                        onChange={(e) => setRepayAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-neutral-bg border-none rounded-xl text-lg font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-neutral-muted">
                      <span>Max: ₦{Math.min(loanBalance, profile?.balance || 0).toLocaleString()}</span>
                      <button 
                        type="button"
                        onClick={() => setRepayAmount(Math.min(loanBalance, profile?.balance || 0).toString())}
                        className="text-primary font-semibold"
                      >
                        Pay Max
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isRepaying || !repayAmount || parseFloat(repayAmount) <= 0 || parseFloat(repayAmount) > (profile?.balance || 0) || parseFloat(repayAmount) > loanBalance}
                    className="w-full mt-6 py-3.5 bg-primary hover:bg-primary-accent text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-md shadow-primary/20 flex justify-center items-center"
                  >
                    {isRepaying ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Repayment'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
