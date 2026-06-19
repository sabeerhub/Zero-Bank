import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  UserCheck, 
  AlertCircle, 
  QrCode, 
  Send, 
  Building2, 
  Users, 
  ChevronRight, 
  Coins, 
  ShieldCheck, 
  MapPin, 
  ScanFace 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, writeBatch, doc, getDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import TransactionPinModal from '../components/TransactionPinModal';
import TransactionReceipt from '../components/TransactionReceipt';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export default function Transfer() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  const [recipient, setRecipient] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Apple Pay Sending Sheet States
  const [isConfirmationSheetOpen, setIsConfirmationSheetOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Demo contacts to match the Revolutionary horizontal scroll list
  const recentContacts = [
    { name: 'John Doe', account: '2012345678', avatar: 'JD', grad: 'from-blue-400 to-indigo-500' },
    { name: 'Jane Smith', account: '2023456789', avatar: 'JS', grad: 'from-amber-400 to-rose-500' },
    { name: 'Aliyu Musa', account: '2034567890', avatar: 'AM', grad: 'from-emerald-400 to-teal-500' },
    { name: 'Maryam Bello', account: '2045678901', avatar: 'MB', grad: 'from-purple-400 to-pink-500' },
  ];

  // Beneficiaries list
  const beneficiaries = [
    { name: 'Chinedu Okafor', account: '2056789012', bank: 'Zero Bank' },
    { name: 'Fatima Umar', account: '2067890123', bank: 'Zero Bank' },
    { name: 'Olamide Davies', account: '2078901234', bank: 'Zero Bank' },
  ];

  const verifyAccount = React.useCallback(async (accNum: string) => {
    if (accNum === profile?.accountNumber) {
      setError("You cannot transfer to yourself");
      return;
    }

    setIsVerifying(true);
    setError('');
    
    try {
      const docRef = doc(db, 'public_profiles', accNum);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const profileData = docSnap.data();
        setRecipient({ id: profileData.uid, ...profileData });
      } else {
        // Fallback for demo contacts so they always verify successfully
        const localMatch = recentContacts.find(c => c.account === accNum) || beneficiaries.find(b => b.account === accNum);
        if (localMatch) {
          setRecipient({ id: 'demo-' + accNum, name: localMatch.name, accountNumber: accNum });
        } else {
          setRecipient(null);
          setError("Account not found");
        }
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Failed to verify account");
      handleFirestoreError(err, OperationType.GET, 'public_profiles');
    } finally {
      setIsVerifying(false);
    }
  }, [profile?.accountNumber]);

  // Debounce account verification
  useEffect(() => {
    if (accountNumber.length === 10) {
      verifyAccount(accountNumber);
    } else {
      setRecipient(null);
      setError('');
    }
  }, [accountNumber, verifyAccount]);

  const handleContactClick = (account: string) => {
    setAccountNumber(account);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !recipient) return;
    
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError("Invalid amount");
      return;
    }
    
    if (transferAmount > profile.balance) {
      setError("Insufficient funds");
      return;
    }

    // Open Apple Pay style confirmation sheet first
    setIsConfirmationSheetOpen(true);
  };

  const triggerAuthorisation = () => {
    setIsConfirmationSheetOpen(false);
    setIsPinModalOpen(true);
  };

  const executeTransfer = async () => {
    if (!profile || !recipient) return;
    
    setIsPinModalOpen(false);
    const transferAmount = parseFloat(amount);
    setIsTransferring(true);
    setError('');

    try {
      const date = new Date().toISOString();
      const reference = 'TRF-' + Math.random().toString(36).substring(2, 10).toUpperCase();

      // Only perform DB updates if it's a real user (id doesn't start with demo-)
      if (!recipient.id.startsWith('demo-')) {
        const batch = writeBatch(db);

        // 1. Deduct from sender
        const senderRef = doc(db, 'users', profile.uid);
        batch.update(senderRef, { balance: profile.balance - transferAmount });

        // 2. Add to receiver
        const receiverRef = doc(db, 'users', recipient.id);
        batch.update(receiverRef, { balance: increment(transferAmount) });

        // 3. Create sender transaction (Debit)
        const senderTxRef = doc(collection(db, 'transactions'));
        batch.set(senderTxRef, {
          userId: profile.uid,
          type: 'debit',
          amount: transferAmount,
          category: 'transfer',
          description: description || `Transfer to ${recipient.name}`,
          date,
          status: 'success',
          reference,
          recipientName: recipient.name,
          recipientAccount: recipient.accountNumber
        });

        // 4. Create receiver transaction (Credit)
        const receiverTxRef = doc(collection(db, 'transactions'));
        batch.set(receiverTxRef, {
          userId: recipient.id,
          type: 'credit',
          amount: transferAmount,
          category: 'transfer',
          description: `Transfer from ${profile.name}`,
          date,
          status: 'success',
          reference,
          recipientName: profile.name,
          recipientAccount: profile.accountNumber
        });

        // 5. Create notifications
        const senderNotifRef = doc(collection(db, 'notifications'));
        batch.set(senderNotifRef, {
          userId: profile.uid,
          title: 'Transfer Sent',
          message: `You successfully sent NGN ${transferAmount.toLocaleString()} to ${recipient.name}.`,
          type: 'transaction',
          read: false,
          date,
          link: '/transactions'
        });

        const receiverNotifRef = doc(collection(db, 'notifications'));
        batch.set(receiverNotifRef, {
          userId: recipient.id,
          title: 'Funds Received',
          message: `You received NGN ${transferAmount.toLocaleString()} from ${profile.name}.`,
          type: 'transaction',
          read: false,
          date,
          link: '/transactions'
        });

        await batch.commit();
      } else {
        // Mock transfer for demo accounts
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      setReceiptData({
        amount: transferAmount,
        recipientName: recipient.name,
        recipientAccount: recipient.accountNumber || accountNumber,
        senderName: profile.name,
        senderAccount: profile.accountNumber,
        reference,
        date,
        description: description || `Transfer to ${recipient.name}`
      });
      setSuccess(true);

    } catch (err: any) {
      console.error("Transfer error:", err);
      setError(err.message || "Transfer failed. Please try again.");
      handleFirestoreError(err, OperationType.WRITE, 'transactions/users');
    } finally {
      setIsTransferring(false);
    }
  };

  if (success && receiptData) {
    return (
      <TransactionReceipt
        {...receiptData}
        onBack={() => navigate('/')}
      />
    );
  }

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
          <h1 className="text-sm font-bold text-[#0F172A] tracking-tight">Intra-Bank Transfer</h1>
          <p className="text-[10px] text-neutral-muted font-bold tracking-wide uppercase mt-0.5">Send inside Zero Bank</p>
        </div>
      </header>

      <main className="space-y-6">
        {/* Recipient Account Input & Search */}
        <div className="bg-white rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-[#E2E8F0] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-muted">Enter Recipient</h3>
            {profile && (
              <span className="text-xs font-semibold text-neutral-muted">
                Available: <strong className="text-primary">₦{profile.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
              </span>
            )}
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-muted" />
            <input
              type="text"
              maxLength={10}
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
              className="w-full pl-12 pr-12 py-4 bg-[#F8FAFC] border-none rounded-2xl focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-mono text-lg tracking-widest text-[#0F172A]"
              placeholder="Search or enter 10 digits"
            />
            {isVerifying ? (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <button
                type="button"
                onClick={() => setError("Scan QR is available on the mobile application.")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:bg-primary/5 rounded-xl transition-all"
              >
                <QrCode className="w-5 h-5" />
              </button>
            )}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-50 border border-rose-100 text-status-error p-4 rounded-xl flex items-center gap-3 text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {recipient && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-emerald-950">{recipient.name}</p>
                <p className="text-xs text-emerald-700 font-medium tracking-tight">Verified Zero Bank Account</p>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">OK</span>
            </motion.div>
          )}
        </div>

        {/* Recent Contacts (Horizontal Scroll) */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-muted">Recent Contacts</h3>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {recentContacts.map((contact) => (
              <button
                key={contact.account}
                onClick={() => handleContactClick(contact.account)}
                className="flex flex-col items-center gap-2.5 bg-white p-4 rounded-[22px] border border-[#E2E8F0] min-w-[100px] snap-start hover:border-[#CBD5E1] transition-all active:scale-95"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${contact.grad} flex items-center justify-center text-white font-bold text-sm shadow-inner`}>
                  {contact.avatar}
                </div>
                <span className="text-[11px] font-bold text-[#0F172A] whitespace-nowrap text-center truncate w-20">{contact.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Transfer Options */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-muted">Transfer Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => {}}
              className="bg-white border-2 border-[#2563EB]/40 p-5 rounded-[24px] flex items-start gap-4 transition-all hover:bg-slate-50/50 text-left w-full relative"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Send className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0F172A]">Zero Bank Transfer</p>
                <p className="text-xs text-neutral-muted mt-0.5 font-medium">Instant & totally zero fees</p>
              </div>
              <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />
            </button>

            <button 
              onClick={() => navigate('/interbank')}
              className="bg-white border border-[#E2E8F0] p-5 rounded-[24px] flex items-start gap-4 transition-all hover:border-[#CBD5E1] hover:bg-slate-50/50 text-left w-full group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 group-hover:bg-[#2563EB]/10 group-hover:text-primary transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#0F172A]">Other Bank Transfer</p>
                <p className="text-xs text-neutral-muted mt-0.5 font-medium">To Wema, GTB, Zenith, etc.</p>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-muted mt-1 align-self-center shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </section>

        {/* Core Transfer Form */}
        <AnimatePresence>
          {recipient && (
            <motion.form 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              onSubmit={handleTransferSubmit} 
              className="bg-white rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-[#E2E8F0] space-y-6"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-muted border-b border-[#E2E8F0] pb-3">Payment Details</h3>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-muted">Amount (₦)</label>
                <input
                  type="number"
                  required
                  min="100"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-4 bg-[#F8FAFC] border-none rounded-2xl focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-bold text-2xl text-[#0F172A]"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-muted">Narration</label>
                <input
                  type="text"
                  maxLength={150}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-4 bg-[#F8FAFC] border-none rounded-2xl focus:ring-2 focus:ring-[#2563EB]/40 transition-all text-sm font-medium text-[#0F172A]"
                  placeholder="Sent from Zero Bank mobile"
                />
              </div>

              <button
                type="submit"
                disabled={isTransferring || !amount}
                className="w-full bg-primary hover:bg-primary-accent text-white py-4 rounded-2xl font-bold transition-all active:scale-[0.98] mt-8 flex justify-center items-center shadow-lg shadow-primary/25"
              >
                {isTransferring ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Authorize Transfer'
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Beneficiaries List */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-muted">My Beneficiaries</h3>
          </div>
          
          <div className="bg-white rounded-[26px] border border-[#E2E8F0] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.01)] p-2">
            {beneficiaries.map((b) => (
              <div 
                key={b.account}
                onClick={() => handleContactClick(b.account)}
                className="p-4 flex items-center justify-between hover:bg-[#F8FAFC] rounded-[18px] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs tracking-tight">
                    {b.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A]">{b.name}</h4>
                    <p className="text-xs text-neutral-muted font-medium mt-0.5">{b.bank} • {b.account}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-muted group-hover:translate-x-0.5 transition-transform" />
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* APPLE PAY SENT / CONFIRMATION SLIDE-UP SHEET */}
      <AnimatePresence>
        {isConfirmationSheetOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-md bg-white rounded-t-[32px] overflow-hidden shadow-2xl relative border-t border-[#E2E8F0] pb-safe"
            >
              {/* Drag indicator */}
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-4" />
              
              <div className="p-6 pt-2 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xs italic">Z</div>
                    <span className="text-sm font-bold text-[#0F172A]">Zero Pay Secure</span>
                  </div>
                  <button 
                    onClick={() => setIsConfirmationSheetOpen(false)}
                    className="text-xs font-semibold text-neutral-muted hover:text-neutral-text transition-colors bg-slate-100 py-1.5 px-3 rounded-full"
                  >
                    Cancel
                  </button>
                </div>

                <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-muted mb-1">Transfer Amount</p>
                  <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">
                    ₦{parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-start py-3 border-b border-slate-100">
                    <span className="text-sm font-semibold text-neutral-muted">Sender Card</span>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#0F172A]">Zero Wallet Card</p>
                      <p className="text-[11px] font-semibold text-neutral-muted tracking-tight">Available • ₦{profile?.balance.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-start py-3 border-b border-slate-100">
                    <span className="text-sm font-semibold text-neutral-muted">Pay To</span>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#0F172A]">{recipient?.name}</p>
                      <p className="text-[11px] font-mono font-bold text-neutral-muted tracking-widest">{recipient?.accountNumber || accountNumber}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-start py-3 border-b border-slate-100">
                    <span className="text-sm font-semibold text-neutral-muted">Fee</span>
                    <span className="text-sm font-bold text-emerald-600">Free (₦0.00)</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col items-center gap-3">
                  <button 
                    onClick={triggerAuthorisation}
                    className="w-full bg-[#0F172A] hover:bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2.5 shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] group"
                  >
                    <ScanFace className="w-5 h-5 animate-pulse text-[#38BDF8]" />
                    <span>Authorize with passcode</span>
                  </button>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-muted">Double-check recipient before sending</p>
                </div>
              </div>
            </motion.div>
          </div>
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
