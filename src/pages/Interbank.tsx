import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Building2, Search, AlertCircle, Clock, 
  ChevronDown, Check, QrCode, Sparkles, Receipt, HelpCircle, ClipboardCheck, ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import TransactionPinModal from '../components/TransactionPinModal';
import TransactionReceipt from '../components/TransactionReceipt';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export default function Interbank() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
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

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans w-full max-w-md mx-auto px-4">
      {/* Precision Apple-style Header */}
      <header className="pt-8 pb-6 bg-[#F8FAFC]/90 backdrop-blur-md sticky top-0 z-20 flex items-center gap-4">
        <button 
          onClick={() => {
            if (step === 2) {
              setStep(1);
            } else {
              navigate(-1);
            }
          }} 
          className="w-10 h-10 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
        </button>
        <div>
          <h1 className="text-sm font-bold text-[#0F172A] tracking-tight">Other Bank Transfer</h1>
          <p className="text-[10px] text-neutral-muted font-bold tracking-wide uppercase mt-0.5">Send outside Zero Bank</p>
        </div>
      </header>

      {/* Visual Timeline Steps (Match Screen 6) */}
      <div className="sticky top-[84px] bg-[#F8FAFC] z-10 py-3 mb-6 border-b border-slate-100">
        <div className="flex items-center justify-between max-w-xs mx-auto">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step >= 1 ? 'bg-primary text-white shadow-sm' : 'bg-slate-200 text-neutral-muted'
            }`}>
              1
            </div>
            <span className={`text-xs font-bold ${step === 1 ? 'text-primary' : 'text-neutral-muted'}`}>Details</span>
          </div>

          <div className="h-[2px] w-8 bg-slate-200 flex-1 mx-2" />

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step >= 2 ? 'bg-primary text-white shadow-sm' : 'bg-slate-200 text-neutral-muted'
            }`}>
              2
            </div>
            <span className={`text-xs font-bold ${step === 2 ? 'text-[#0F172A]' : 'text-neutral-muted'}`}>Confirm</span>
          </div>

          <div className="h-[2px] w-8 bg-slate-200 flex-1 mx-2" />

          {/* Step 3 */}
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step >= 3 ? 'bg-primary text-white shadow-sm' : 'bg-slate-200 text-neutral-muted'
            }`}>
              3
            </div>
            <span className={`text-xs font-bold ${step === 3 ? 'text-[#0F172A]' : 'text-neutral-muted'}`}>Receipt</span>
          </div>
        </div>
      </div>

      <main className="space-y-6">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-status-error text-xs rounded-xl flex items-center gap-2 font-medium">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form 
              key="step-1-form"
              onSubmit={handleStep1Submit} 
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Select Bank Dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-muted">Select Bank</label>
                <div className="relative" ref={dropdownRef}>
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-muted z-10" />
                  
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-[#E2E8F0] hover:border-slate-300 shadow-sm cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <span className={`text-sm font-semibold truncate ${selectedBankId ? 'text-[#0F172A]' : 'text-neutral-muted'}`}>
                      {selectedBankId ? selectedBankObj?.name : 'Choose a destination bank...'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-neutral-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 max-h-72 flex flex-col overflow-hidden">
                      <div className="p-3 border-b border-slate-100 sticky top-0 bg-white z-10">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
                          <input
                            type="text"
                            placeholder="Search banks e.g. GTB..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none transition-all"
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto p-2">
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
                              className={`w-full text-left px-3 py-2.5 text-xs rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between ${selectedBankId === b.id ? 'bg-primary/5 text-primary font-bold' : 'text-[#0F172A]'}`}
                            >
                              <span>{b.name}</span>
                              {selectedBankId === b.id && <Check className="w-4 h-4 text-primary" />}
                            </button>
                          ))
                        ) : (
                          <p className="text-xs text-neutral-muted py-4 text-center">No banks match query</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Number Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-muted">Account Number</label>
                  {isVerifying && (
                    <div className="flex items-center gap-1.5 text-[10px] text-primary font-bold">
                      <div className="w-2.5 h-2.5 border border-primary border-t-transparent rounded-full animate-spin shrink-0"></div>
                      <span>Verifying via NIBSS...</span>
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
                    className="w-full px-4 py-3.5 bg-white border border-[#E2E8F0] tracking-wider rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/40 outline-none transition-all text-[#0F172A]"
                    placeholder="Enter 10-digit account number"
                  />
                  <button 
                    type="button"
                    onClick={async () => {
                      const text = await navigator.clipboard.readText();
                      if (text) {
                        setAccountNumber(text.replace(/\D/g, '').substring(0, 10));
                      }
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-primary hover:text-primary-accent"
                  >
                    Paste
                  </button>
                </div>
              </div>

              {/* Real-time Verified Result widget */}
              {verifiedName && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-emerald-50/80 border border-emerald-100/50 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-neutral-muted">Verified Account Owner</span>
                    <h5 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      {verifiedName}
                    </h5>
                  </div>
                  <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm shadow-emerald-500/10">
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    <span>VERIFIED</span>
                  </span>
                </motion.div>
              )}

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-muted">Amount (Currency NGN)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-extrabold text-[#0F172A]">₦</span>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-4 bg-white border border-[#E2E8F0] rounded-2xl text-lg font-bold focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/40 outline-none transition-all text-[#0F172A]"
                    placeholder="0.00"
                  />
                </div>
                {profile && (
                  <div className="flex justify-between items-center text-xs pl-1">
                    <span className="text-neutral-muted">Available: ₦{profile.balance.toLocaleString()}</span>
                    <button 
                      type="button" 
                      onClick={() => setAmount(profile.balance.toString())}
                      className="text-xs font-bold text-primary hover:text-primary-accent"
                    >
                      Sweep All
                    </button>
                  </div>
                )}
              </div>

              {/* Narration (Optional) */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-muted">Narration (Optional)</label>
                <input
                  type="text"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white border border-[#E2E8F0] rounded-2xl text-sm focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/40 outline-none transition-all text-[#0F172A] font-semibold"
                  placeholder="What is this transfer for?"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full bg-[#0F172A] hover:bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all shadow-md active:scale-95"
                >
                  <span>Continue</span>
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div 
              key="step-2-confirm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Transfer Details Card */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-muted">Transfer Details Summary</label>
                <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="text-center pb-4 border-b border-slate-50">
                    <span className="text-[10px] font-bold text-neutral-muted uppercase tracking-wider block">Transfer Amount</span>
                    <h2 className="text-2xl font-black text-[#0F172A] tracking-tight mt-1">₦{parseFloat(amount).toLocaleString()}</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 text-xs">
                    <div>
                      <span className="text-neutral-muted block">Recipient Name</span>
                      <strong className="text-[#0F172A] font-bold mt-0.5 block">{verifiedName}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-muted block">Destination Bank</span>
                      <strong className="text-[#0F172A] font-bold mt-0.5 block truncate max-w-[150px] inline-block">{selectedBankObj?.name}</strong>
                    </div>

                    <div>
                      <span className="text-neutral-muted block">Account Number</span>
                      <strong className="text-[#0F172A] font-bold mt-0.5 block font-mono">{accountNumber}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-muted block">Fee</span>
                      <strong className="text-emerald-600 font-extrabold mt-0.5 block">₦0.00 Forever!</strong>
                    </div>

                    <div className="col-span-2 pt-2 border-t border-slate-50">
                      <span className="text-neutral-muted block">Narration</span>
                      <strong className="text-[#0F172A] font-bold mt-0.5 block">{narration || 'N/A'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security info card */}
              <div className="p-4 bg-blue-50/70 border border-blue-100/50 rounded-2xl flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h6 className="text-xs font-bold text-blue-900">Zero Fees Secured</h6>
                  <p className="text-[11px] text-blue-700 leading-normal mt-0.5">Your money is transferred immediately using security protocols. Please enter your transaction passcode on next prompt.</p>
                </div>
              </div>

              {/* Execute / Pin trigger buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-bold rounded-xl text-sm transition-colors"
                >
                  Edit Form
                </button>
                <button
                  type="button"
                  onClick={handleAuthorizeTransfer}
                  disabled={isProcessing}
                  className="w-full bg-[#0F172A] hover:bg-black text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Authorize</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <TransactionPinModal 
        isOpen={isPinModalOpen} 
        onClose={() => setIsPinModalOpen(false)} 
        onSuccess={executeTransfer} 
      />
    </div>
  );
}
