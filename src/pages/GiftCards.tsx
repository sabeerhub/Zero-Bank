import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Search, Gamepad, Film, ShoppingBag, Utensils, 
  ChevronRight, ArrowUpRight, AlertCircle, Sparkles, LogIn, Mail 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import TransactionPinModal from '../components/TransactionPinModal';
import TransactionReceipt from '../components/TransactionReceipt';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

interface GiftCardBrand {
  id: string;
  name: string;
  image: string;
  color: string;
  grad: string;
  presets: number[];
}

const POPULAR_CARDS: GiftCardBrand[] = [
  { id: 'amazon', name: 'Amazon US', image: 'Amazon', color: 'bg-[#FF9900]', grad: 'from-[#111111] to-[#333333]', presets: [10000, 25000, 50000, 100000] },
  { id: 'apple', name: 'Apple Card', image: 'Apple', color: 'bg-black', grad: 'from-[#000000] to-[#1A1A1A]', presets: [5000, 10000, 20000, 50000] },
  { id: 'google', name: 'Google Play', image: 'Google', color: 'bg-[#34A853]', grad: 'from-[#1A1A1A] to-[#2E2E2E]', presets: [5000, 10000, 15000, 30000] },
  { id: 'netflix', name: 'Netflix', image: 'Netflix', color: 'bg-[#E50914]', grad: 'from-[#000000] to-[#E50914]/20', presets: [6000, 12000, 24000, 36000] },
];

const CATEGORIES = [
  { id: 'gaming', label: 'Gaming', icon: Gamepad, color: 'bg-[#38BDF8]/10 text-[#38BDF8]' },
  { id: 'entertainment', label: 'Entertainment', icon: Film, color: 'bg-[#C084FC]/10 text-[#C084FC]' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: 'bg-[#FB7185]/10 text-[#FB7185]' },
  { id: 'food', label: 'Food', icon: Utensils, color: 'bg-[#34D399]/10 text-[#34D399]' },
];

const FEATURED_CARDS = [
  { id: 'playstation', name: 'PlayStation Store', price: '₦6,000', label: 'From ₦6,000', grad: 'from-[#003087] to-[#0070D1]', presets: [6000, 12000, 18000, 30000] },
  { id: 'steam', name: 'Steam Wallet', price: '₦5,000', label: 'From ₦5,000', grad: 'from-[#171a21] to-[#2a475e]', presets: [5000, 10000, 20000, 50000] },
];

export default function GiftCards() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<GiftCardBrand | null>(null);
  const [amount, setAmount] = useState<number | ''>('');
  const [email, setEmail] = useState('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [receiptData, setReceiptData] = useState<any>(null);

  const handleCardClick = (brand: any) => {
    setError('');
    setSelectedBrand(brand);
    setAmount(brand.presets[0]);
    setEmail(profile?.email || '');
  };

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedBrand) return;
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please select/enter an amount');
      return;
    }

    if (profile && Number(amount) > profile.balance) {
      setError('Insufficient balance in your Zero Bank account');
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Please enter a valid delivery email address');
      return;
    }

    setIsPinModalOpen(true);
  };

  const executePurchase = async () => {
    if (!profile || !selectedBrand) return;
    
    setIsPinModalOpen(false);
    setIsProcessing(true);
    const purchaseAmount = Number(amount);

    try {
      const batch = writeBatch(db);
      const date = new Date().toISOString();
      const reference = 'GC-' + Math.random().toString(36).substring(2, 10).toUpperCase();

      // Deduct balance
      const userRef = doc(db, 'users', profile.uid);
      batch.update(userRef, { balance: profile.balance - purchaseAmount });

      // Create transaction
      const txRef = doc(collection(db, 'transactions'));
      const desc = `${selectedBrand.name} Gift Card (Delivery to: ${email})`;
      
      batch.set(txRef, {
        userId: profile.uid,
        type: 'debit',
        amount: purchaseAmount,
        category: 'giftcards',
        description: desc,
        date,
        status: 'success',
        reference,
        recipientName: selectedBrand.name,
        recipientAccount: email
      });

      // Send Notification
      const notifRef = doc(collection(db, 'notifications'));
      batch.set(notifRef, {
        userId: profile.uid,
        title: 'Gift Card Purchased',
        message: `Your ${selectedBrand.name} digital gift card has been sent to ${email}.`,
        type: 'transaction',
        read: false,
        date,
        link: '/transactions'
      });

      await batch.commit();

      setReceiptData({
        amount: purchaseAmount,
        recipientName: selectedBrand.name,
        recipientAccount: email,
        senderName: profile.name,
        senderAccount: profile.accountNumber,
        reference,
        date,
        description: desc
      });
    } catch (err: any) {
      setError(err.message || 'Transaction failed. Please try again.');
      handleFirestoreError(err, OperationType.WRITE, 'transactions');
    } finally {
      setIsProcessing(false);
    }
  };

  if (receiptData) {
    return (
      <TransactionReceipt
        {...receiptData}
        onBack={() => navigate('/')}
      />
    );
  }

  // Filter based on search
  const filteredPopular = POPULAR_CARDS.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredFeatured = FEATURED_CARDS.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-sm font-bold text-[#0F172A] tracking-tight">Gift Cards</h1>
          <p className="text-[10px] text-neutral-muted font-bold tracking-wide uppercase mt-0.5">International e-Vouchers</p>
        </div>
      </header>

      <main className="space-y-8">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-[#E2E8F0] rounded-2xl focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/40 outline-none transition-all text-sm font-medium"
            placeholder="Search gift cards..."
          />
        </div>

        {/* Popular Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-muted">Popular Brands</h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {filteredPopular.map((brand) => (
              <button
                key={brand.id}
                onClick={() => handleCardClick(brand)}
                className="bg-white border border-[#E2E8F0] p-5 rounded-[24px] flex flex-col items-center text-center gap-3 hover:border-slate-300 hover:shadow-md transition-all active:scale-95 group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-slate-900 border border-white/15 flex items-center justify-center text-white font-extrabold text-lg shadow-inner group-hover:scale-105 transition-transform ${brand.id === 'apple' ? 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500' : ''}`}>
                  {brand.image === 'Amazon' && <span className="text-yellow-500 font-mono italic">a</span>}
                  {brand.image === 'Apple' && <span className="font-sans"></span>}
                  {brand.image === 'Google' && <span className="text-emerald-400">G</span>}
                  {brand.image === 'Netflix' && <span className="text-rose-600">N</span>}
                </div>
                <span className="text-sm font-bold text-[#0F172A]">{brand.name}</span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-slate-100 text-neutral-muted rounded-full">vouchers</span>
              </button>
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-muted">Categories</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <div 
                key={cat.id}
                className="bg-white border border-[#E2E8F0] p-4 rounded-[20px] flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center shrink-0`}>
                  <cat.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#0F172A] tracking-tight">{cat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Section */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-muted">Featured Deals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredFeatured.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card)}
                className={`bg-gradient-to-r ${card.grad} p-6 rounded-[24px] text-white flex justify-between items-center text-left hover:shadow-lg hover:shadow-slate-200 transition-all active:scale-[0.99] group`}
              >
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-white/10 px-2 py-1 rounded-full border border-white/10">Instant Delivery</span>
                  <h4 className="text-lg font-extrabold tracking-tight pt-1">{card.name}</h4>
                  <p className="text-xs text-white/70 font-semibold">{card.label}</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all shrink-0">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Slide-up Purchase Drawer */}
      <AnimatePresence>
        {selectedBrand && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-sm bg-white rounded-t-[32px] border-t border-[#E2E8F0] pb-safe shadow-2xl relative"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-4" />
              
              <div className="p-6 pt-0 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#0F172A]">Configure Voucher</span>
                  </div>
                  <button 
                    onClick={() => setSelectedBrand(null)}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-neutral-muted py-1.5 px-3 rounded-full transition-colors"
                  >
                    Close
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
                    {selectedBrand.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0F172A]">{selectedBrand.name}</h3>
                    <p className="text-xs text-neutral-muted font-medium">Digital Gift Card</p>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-status-error text-xs rounded-xl flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handlePurchaseSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-muted">Pick Amount</label>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedBrand.presets.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setAmount(preset)}
                          className={`p-3 text-xs font-bold border-2 rounded-xl transition-all ${
                            amount === preset 
                              ? 'border-primary bg-primary/5 text-primary' 
                              : 'border-slate-100 bg-white hover:border-slate-300'
                          }`}
                        >
                          ₦{preset.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-muted">Deliver to email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-muted absolute left-4.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/10 select-all"
                        placeholder="your-email@example.com"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-[#0F172A] hover:bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all shadow-md active:scale-95"
                    >
                      <span>Authorize with passcode</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TransactionPinModal 
        isOpen={isPinModalOpen} 
        onClose={() => setIsPinModalOpen(false)} 
        onSuccess={executePurchase} 
      />
    </div>
  );
}
