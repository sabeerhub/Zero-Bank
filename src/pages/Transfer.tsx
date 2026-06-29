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
  ScanFace,
  History,
  CreditCard,
  Info,
  DollarSign
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
  
  // Custom screen state elements
  const [isLoading, setIsLoading] = useState(true);
  const [beneficiarySearch, setBeneficiarySearch] = useState('');

  // Apple Pay Sending Sheet States
  const [isConfirmationSheetOpen, setIsConfirmationSheetOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Simulated initial mount skeleton timer for native experience
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Demo contacts to match the Revolutionary horizontal scroll list
  const recentContacts = [
    { name: 'John Doe', account: '2012345678', avatar: 'JD', grad: 'from-blue-500 via-blue-600 to-indigo-600' },
    { name: 'Jane Smith', account: '2023456789', avatar: 'JS', grad: 'from-amber-400 via-orange-500 to-rose-500' },
    { name: 'Aliyu Musa', account: '2034567890', avatar: 'AM', grad: 'from-emerald-400 via-teal-500 to-emerald-600' },
    { name: 'Maryam Bello', account: '2045678901', avatar: 'MB', grad: 'from-purple-400 via-fuchsia-500 to-pink-500' },
  ];

  // Beneficiaries list
  const beneficiaries = [
    { name: 'Chinedu Okafor', account: '2056789012', bank: 'Zero Bank' },
    { name: 'Fatima Umar', account: '2067890123', bank: 'Zero Bank' },
    { name: 'Olamide Davies', account: '2078901234', bank: 'Zero Bank' },
  ];

  const filteredBeneficiaries = beneficiaries.filter(b => 
    b.name.toLowerCase().includes(beneficiarySearch.toLowerCase()) ||
    b.account.includes(beneficiarySearch)
  );

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
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-[#0F172A] w-full max-w-7xl mx-auto px-4 md:px-8">
      {/* Premium Header */}
      <header className="pt-8 pb-6 flex items-center justify-between border-b border-slate-100/80 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-11 h-11 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all shadow-sm group"
          >
            <ArrowLeft className="w-5 h-5 text-[#0F172A] group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">Intra-Bank Transfer</h1>
            <p className="text-[11px] text-neutral-muted font-bold tracking-wide uppercase mt-0.5">Send securely inside Zero Bank</p>
          </div>
        </div>

        {profile && (
          <div className="hidden sm:flex items-center gap-3 bg-white border border-slate-100 p-2.5 px-4 rounded-2xl shadow-sm">
            <Coins className="w-5 h-5 text-[#2563EB]" />
            <div>
              <p className="text-[10px] text-neutral-muted font-bold tracking-wider uppercase">Available Wallet</p>
              <p className="text-sm font-extrabold text-[#0F172A]">₦••••••</p>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Layout Grid */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div key="skeleton" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {/* Recipient skeleton */}
              <div className="bg-white rounded-[28px] p-6 border border-slate-100 space-y-4">
                <div className="h-4 bg-slate-100 rounded-full w-24 animate-pulse"></div>
                <div className="h-14 bg-slate-100 rounded-2xl w-full animate-pulse"></div>
              </div>
              {/* Recents skeleton */}
              <div className="space-y-3">
                <div className="h-4 bg-slate-100 rounded-full w-32 animate-pulse"></div>
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-[100px] h-[110px] bg-white rounded-[22px] border border-slate-100 flex flex-col items-center p-4 gap-2 shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 animate-pulse"></div>
                      <div className="h-3 bg-slate-100 rounded-full w-12 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-[28px] p-6 border border-slate-100 h-64 animate-pulse"></div>
            </div>
          </div>
        ) : (
          <motion.div 
            key="main-layout"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Column (Core Transfer Functions) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Mobile Available Balance Display */}
              {profile && (
                <div className="sm:hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-blue-100">Zero Bank Wallet</span>
                  <h3 className="text-2xl font-black tracking-tight mt-1">₦••••••</h3>
                  <p className="text-[11px] text-blue-100 mt-3 font-semibold">Ready for instant transactions</p>
                </div>
              )}

              {/* Recipient Account Enter and Verify */}
              <section className="bg-white rounded-[28px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] border border-slate-100 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-muted">Enter Destination Account</h3>
                  <span className="text-xs font-bold text-[#2563EB] bg-blue-50/60 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Secure Transfer
                  </span>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-muted" />
                  <input
                    type="text"
                    maxLength={10}
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-12 py-4.5 bg-[#F8FAFC] border-none rounded-2xl focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-mono text-lg font-bold tracking-widest text-[#0F172A] placeholder-slate-400"
                    placeholder="Search or enter 10 digits"
                  />
                  {isVerifying ? (
                    <div className="absolute right-4.5 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setError("Scan QR is available on the mobile application.")}
                      className="absolute right-4.5 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/5 rounded-xl transition-all"
                    >
                      <QrCode className="w-5.5 h-5.5" />
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="bg-rose-50 border border-rose-100 text-status-error p-4 rounded-xl flex items-center gap-3 text-xs font-bold"
                    >
                      <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                      <p>{error}</p>
                    </motion.div>
                  )}

                  {recipient && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="bg-emerald-50/70 border border-emerald-100 p-4.5 rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                          <UserCheck className="w-5.5 h-5.5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-emerald-950">{recipient.name}</p>
                          <p className="text-xs text-emerald-700 font-bold tracking-tight">Verified Zero Bank Account</p>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
                        OK
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Recent Contacts List */}
              <section className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-muted">Recent Contacts</h3>
                </div>
                
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
                  {recentContacts.map((contact) => (
                    <button
                      key={contact.account}
                      onClick={() => handleContactClick(contact.account)}
                      className="flex flex-col items-center gap-3 bg-white p-5 rounded-[24px] border border-slate-100 min-w-[110px] snap-start hover:border-[#2563EB]/30 hover:shadow-md transition-all active:scale-95 group shrink-0"
                    >
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${contact.grad} flex items-center justify-center text-white font-extrabold text-sm shadow-md group-hover:scale-105 transition-transform`}>
                        {contact.avatar}
                      </div>
                      <span className="text-[11px] font-bold text-[#0F172A] whitespace-nowrap text-center truncate w-24 group-hover:text-primary transition-colors">{contact.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Transfer Destination Options */}
              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-muted px-1">Transfer Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border-2 border-primary p-6 rounded-[24px] flex items-start gap-4 shadow-sm relative">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Send className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0F172A]">Zero Bank Transfer</h4>
                      <p className="text-xs text-neutral-muted mt-1 font-medium leading-relaxed">Instant delivery & ₦0 transfer fees across our ecosystem.</p>
                    </div>
                    <span className="absolute top-6 right-6 w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                  </div>

                  <button 
                    onClick={() => navigate('/interbank')}
                    className="bg-white border border-slate-100 p-6 rounded-[24px] flex items-start gap-4 text-left hover:border-[#2563EB]/30 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0 group-hover:bg-[#2563EB]/10 group-hover:text-primary transition-colors">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-[#0F172A]">Other Bank Transfer</h4>
                      <p className="text-xs text-neutral-muted mt-1 font-medium leading-relaxed">To GTB, Zenith, Access, Kuda, etc.</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-muted mt-1 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>
                </div>
              </section>

              {/* Core Form */}
              <AnimatePresence>
                {recipient && (
                  <motion.form 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    onSubmit={handleTransferSubmit} 
                    className="bg-white rounded-[28px] p-6 md:p-8 shadow-[0_12px_40px_rgb(0,0,0,0.015)] border border-slate-100/90 space-y-6"
                  >
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-xs font-black uppercase tracking-wider text-neutral-muted">Payment Configuration</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-muted pl-1">Amount (₦)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-extrabold text-neutral-muted">₦</span>
                          <input
                            type="number"
                            required
                            min="100"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full pl-9 pr-4 py-4 bg-[#F8FAFC] border-none rounded-2xl focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-bold text-xl text-[#0F172A]"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-muted pl-1">Narration (Optional)</label>
                        <input
                          type="text"
                          maxLength={150}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-4 py-4 bg-[#F8FAFC] border-none rounded-2xl focus:ring-2 focus:ring-[#2563EB]/20 transition-all text-sm font-semibold text-[#0F172A]"
                          placeholder="Zero Bank Web Transfer"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isTransferring || !amount}
                      className="w-full bg-[#0F172A] hover:bg-black text-white py-4 rounded-2xl font-bold transition-all hover:scale-[1.01] active:scale-[0.99] mt-4 flex justify-center items-center gap-2 shadow-xl shadow-slate-900/10"
                    >
                      {isTransferring ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Review & Authorize</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column (My Beneficiaries / Safety Tip / Side Card) */}
            <div className="lg:col-span-4 space-y-6">
              {/* My Beneficiaries List */}
              <section className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-5">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-muted pl-1">My Beneficiaries</h3>
                  
                  {/* Beneficiary Search */}
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search saved contacts..."
                      value={beneficiarySearch}
                      onChange={(e) => setBeneficiarySearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#2563EB]/15 outline-none transition-all text-[#0F172A]"
                    />
                  </div>
                </div>
                
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                  {filteredBeneficiaries.length === 0 ? (
                    <div className="py-8 text-center flex flex-col items-center">
                      <Users className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="text-xs font-bold text-slate-800">No beneficiaries found</p>
                      <p className="text-[10px] text-neutral-muted mt-1 leading-relaxed">No matching saved accounts.</p>
                    </div>
                  ) : (
                    filteredBeneficiaries.map((b) => (
                      <div 
                        key={b.account}
                        onClick={() => handleContactClick(b.account)}
                        className="py-3.5 flex items-center justify-between hover:bg-slate-50 rounded-xl px-1.5 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0 group-hover:bg-[#2563EB]/10 group-hover:text-primary transition-colors">
                            {b.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-primary transition-colors">{b.name}</h4>
                            <p className="text-[10px] text-neutral-muted font-bold tracking-tight mt-0.5">{b.bank} • {b.account}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-muted group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Safety Card Indicator */}
              <div className="bg-slate-50 rounded-[28px] p-6 border border-slate-100 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A]">Instant Dispatch Guarantee</h4>
                  <p className="text-xs text-neutral-muted font-semibold leading-relaxed mt-1.5">
                    Internal transfers on Zero Bank are zero-rated for billing fees, verified securely by public cryptographic hashes, and dispatched instantly.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-4" />
              
              <div className="p-6 pt-2 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#2563EB] rounded-lg flex items-center justify-center text-white font-black text-xs italic">Z</div>
                    <span className="text-sm font-bold text-[#0F172A]">Zero Pay Secure</span>
                  </div>
                  <button 
                    onClick={() => setIsConfirmationSheetOpen(false)}
                    className="text-xs font-semibold text-neutral-muted hover:text-neutral-text transition-colors bg-slate-100 py-1.5 px-3 rounded-full"
                  >
                    Cancel
                  </button>
                </div>

                <div className="text-center py-5 bg-[#F8FAFC] rounded-2xl border border-slate-100">
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
