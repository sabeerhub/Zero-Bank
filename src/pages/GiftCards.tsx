import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Search, Gamepad, Film, ShoppingBag, Utensils, 
  ChevronRight, ArrowUpRight, AlertCircle, Sparkles, LogIn, Mail, Coins, CheckCircle2, ShieldAlert, Gift
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
  const [isLoading, setIsLoading] = useState(true);

  // Simulated mount loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

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
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Gift Cards Store</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold tracking-wider uppercase mt-0.5">International e-vouchers & giftcards</p>
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

      {/* Main Grid split */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div key="skel" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white dark:bg-[#0B121F]/80 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800 h-96 animate-pulse"></div>
            <div className="lg:col-span-4 bg-white dark:bg-[#0B121F]/80 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800 h-80 animate-pulse"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (Brand Catalog grid) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-[#0B121F]/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all text-slate-900 dark:text-white shadow-xs"
                  placeholder="Search gift cards e.g. Amazon, Netflix..."
                />
              </div>

              {/* Popular section */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider pl-1">Popular Brands</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {filteredPopular.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => handleCardClick(brand)}
                      className={`bg-white dark:bg-[#0B121F]/80 border border-slate-200 dark:border-slate-800 p-5 rounded-[26px] flex flex-col items-center text-center gap-4 hover:border-blue-500/20 dark:hover:border-blue-500/30 hover:shadow-md transition-all active:scale-95 group cursor-pointer ${
                        selectedBrand?.id === brand.id ? 'ring-2 ring-blue-600 dark:ring-blue-500 bg-slate-50/50 dark:bg-slate-800/40' : ''
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center text-white font-extrabold text-xl shadow-inner group-hover:scale-105 transition-transform ${brand.id === 'apple' ? 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500' : ''}`}>
                        {brand.image === 'Amazon' && <span className="text-yellow-500 font-mono italic">a</span>}
                        {brand.image === 'Apple' && <span className="font-sans"></span>}
                        {brand.image === 'Google' && <span className="text-emerald-400">G</span>}
                        {brand.image === 'Netflix' && <span className="text-rose-600">N</span>}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">{brand.name}</span>
                        <span className="text-[9px] uppercase tracking-wider font-black px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full mt-2 inline-block">Vouchers</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider pl-1">Featured e-Voucher Deals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredFeatured.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(card)}
                      className={`bg-gradient-to-r ${card.grad} p-6 rounded-[28px] text-white flex justify-between items-center text-left hover:shadow-lg transition-all active:scale-[0.99] group cursor-pointer`}
                    >
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase font-bold tracking-widest bg-white/15 px-2.5 py-0.5 rounded-full border border-white/10">Instant Delivery</span>
                        <h4 className="text-base font-extrabold tracking-tight pt-1">{card.name}</h4>
                        <p className="text-xs text-white/70 font-semibold">{card.label}</p>
                      </div>
                      <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all shrink-0">
                        <ArrowUpRight className="w-4.5 h-4.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (Instant configuration and Checkout form panel) */}
            <div className="lg:col-span-4">
              <AnimatePresence mode="wait">
                {selectedBrand ? (
                  <motion.div 
                    key="config-form"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white dark:bg-[#0B121F]/80 rounded-[32px] p-6 border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.01)] space-y-6"
                  >
                    <div className="border-b border-slate-200/60 dark:border-slate-800 pb-3">
                      <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Checkout Configuration</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-slate-900 dark:bg-[#0E1626] border border-slate-850 text-white flex items-center justify-center font-black">
                        {selectedBrand.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-slate-900 dark:text-white">{selectedBrand.name}</h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wider uppercase mt-0.5">e-voucher code delivery</p>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 text-[11px] rounded-xl flex items-center gap-2 font-semibold animate-shake">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}

                    <form onSubmit={handlePurchaseSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">Pick Amount</label>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedBrand.presets.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setAmount(preset)}
                              className={`p-3 text-[10px] font-bold border rounded-xl transition-all cursor-pointer ${
                                amount === preset 
                                  ? 'border-blue-600 dark:border-blue-500 bg-blue-50/20 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-xs' 
                                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/30 text-slate-900 dark:text-white'
                              }`}
                            >
                              ₦{preset.toLocaleString()}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">Delivery Email</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/40 border-none rounded-xl text-xs font-bold outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/10 text-slate-900 dark:text-white placeholder-slate-400"
                            placeholder="your-email@example.com"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-xs transition-all shadow-md active:scale-95 mt-2 cursor-pointer"
                      >
                        <span>Authorize with PIN</span>
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="config-placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-[28px] p-6 space-y-4 text-center py-10"
                  >
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0 mx-auto shadow-inner">
                      <Gift className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">Configure voucher</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed mt-2 max-w-xs mx-auto">
                        Pick any international e-voucher brand card from the catalog list to configure delivery channels and checkout secure pins.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
