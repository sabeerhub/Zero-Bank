import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Smartphone, 
  Wifi, 
  Lightbulb, 
  Tv, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Receipt, 
  GraduationCap, 
  Car, 
  Gift, 
  CreditCard, 
  Landmark, 
  History, 
  PiggyBank, 
  Search,
  Coins,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';
import TransactionPinModal from '../components/TransactionPinModal';
import TransactionReceipt from '../components/TransactionReceipt';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

const PROVIDERS = {
  airtime: [
    { id: 'mtn', name: 'MTN', color: 'bg-[#FFCC00] text-black ring-amber-400' },
    { id: 'airtel', name: 'Airtel', color: 'bg-[#FF0000] text-white ring-red-400' },
    { id: 'glo', name: 'Glo', color: 'bg-[#009933] text-white ring-emerald-400' },
    { id: '9mobile', name: '9mobile', color: 'bg-[#006600] text-white ring-green-600' },
    { id: 'smile', name: 'Smile', color: 'bg-[#FFCC00] text-black ring-yellow-400' },
  ],
  data: [
    { id: 'mtn', name: 'MTN', color: 'bg-[#FFCC00] text-black ring-amber-400' },
    { id: 'airtel', name: 'Airtel', color: 'bg-[#FF0000] text-white ring-red-400' },
    { id: 'glo', name: 'Glo', color: 'bg-[#009933] text-white ring-emerald-400' },
    { id: '9mobile', name: '9mobile', color: 'bg-[#006600] text-white ring-green-600' },
    { id: 'smile', name: 'Smile', color: 'bg-[#FFCC00] text-black ring-yellow-400' },
    { id: 'spectranet', name: 'Spectranet', color: 'bg-[#E31837] text-white ring-red-600' },
  ],
  electricity: [
    { id: 'ikedc', name: 'Ikeja (IKEDC)', color: 'bg-blue-600 text-white ring-blue-400' },
    { id: 'ekedc', name: 'Eko (EKEDC)', color: 'bg-indigo-600 text-white ring-indigo-400' },
    { id: 'aedc', name: 'Abuja (AEDC)', color: 'bg-green-600 text-white ring-green-400' },
    { id: 'kedco', name: 'Kano (KEDCO)', color: 'bg-teal-600 text-white ring-teal-400' },
    { id: 'phed', name: 'Port Harcourt (PHED)', color: 'bg-blue-500 text-white ring-blue-300' },
    { id: 'ibedc', name: 'Ibadan (IBEDC)', color: 'bg-blue-700 text-white ring-blue-500' },
    { id: 'eedc', name: 'Enugu (EEDC)', color: 'bg-orange-500 text-white ring-orange-400' },
    { id: 'bedc', name: 'Benin (BEDC)', color: 'bg-yellow-600 text-white ring-yellow-500' },
    { id: 'jed', name: 'Jos (JED)', color: 'bg-sky-500 text-white ring-sky-300' },
    { id: 'kaedco', name: 'Kaduna (KAEDCO)', color: 'bg-emerald-600 text-white ring-emerald-500' },
    { id: 'yedc', name: 'Yola (YEDC)', color: 'bg-red-600 text-white ring-red-500' },
  ],
  bills: [
    { id: 'dstv', name: 'DSTV', color: 'bg-blue-500 text-white ring-blue-300' },
    { id: 'gotv', name: 'GOTV', color: 'bg-green-500 text-white ring-green-400' },
    { id: 'startimes', name: 'StarTimes', color: 'bg-orange-500 text-white ring-orange-400' },
    { id: 'showmax', name: 'Showmax', color: 'bg-pink-600 text-white ring-pink-400' },
  ],
  education: [
    { id: 'waec', name: 'WAEC Result Checker', color: 'bg-blue-800 text-white ring-blue-500', price: 3500 },
    { id: 'jamb', name: 'JAMB e-PIN', color: 'bg-green-700 text-white ring-green-500', price: 4700 },
    { id: 'neco', name: 'NECO Token', color: 'bg-teal-700 text-white ring-teal-500', price: 1200 },
  ],
  toll: [
    { id: 'lcc', name: 'LCC Toll', color: 'bg-orange-500 text-white ring-orange-300' },
    { id: 'etag', name: 'e-Tag', color: 'bg-gray-800 text-white ring-gray-600' },
    { id: 'cowry', name: 'Cowry Card', color: 'bg-yellow-500 text-black ring-yellow-400' },
  ],
  giftcards: [
    { id: 'amazon', name: 'Amazon US', color: 'bg-yellow-500 text-black ring-yellow-400' },
    { id: 'apple', name: 'Apple/iTunes', color: 'bg-gray-900 text-white ring-gray-700' },
    { id: 'google', name: 'Google Play', color: 'bg-green-500 text-white ring-green-400' },
    { id: 'steam', name: 'Steam', color: 'bg-blue-900 text-white ring-blue-600' },
    { id: 'playstation', name: 'PlayStation', color: 'bg-blue-600 text-white ring-blue-400' },
  ]
};

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

const DATA_PLANS = ['Daily', 'Weekly', 'Monthly'];
const DATA_BUNDLES: Record<string, { label: string, price: number }[]> = {
  'Daily': [
    { label: '100MB', price: 100 },
    { label: '200MB', price: 200 },
    { label: '1GB', price: 300 },
  ],
  'Weekly': [
    { label: '1GB', price: 500 },
    { label: '2GB', price: 1000 },
    { label: '5GB', price: 1500 },
  ],
  'Monthly': [
    { label: '1.5GB', price: 1000 },
    { label: '3GB', price: 1500 },
    { label: '10GB', price: 3000 },
    { label: '20GB', price: 5000 },
  ]
};

const TV_PACKAGES: Record<string, { label: string, price: number }[]> = {
  'dstv': [
    { label: 'DStv Padi', price: 2500 },
    { label: 'DStv Yanga', price: 3500 },
    { label: 'DStv Confam', price: 6200 },
    { label: 'DStv Compact', price: 10500 },
    { label: 'DStv Premium', price: 24500 },
  ],
  'gotv': [
    { label: 'GOtv Smallie', price: 1100 },
    { label: 'GOtv Jinja', price: 2250 },
    { label: 'GOtv Jolli', price: 3300 },
    { label: 'GOtv Max', price: 4850 },
    { label: 'GOtv Supa', price: 6400 },
  ],
  'startimes': [
    { label: 'Nova', price: 1200 },
    { label: 'Basic', price: 2100 },
    { label: 'Smart', price: 2800 },
    { label: 'Classic', price: 3100 },
    { label: 'Super', price: 5300 },
  ],
  'showmax': [
    { label: 'Showmax Mobile', price: 1200 },
    { label: 'Showmax Pro Mobile', price: 3200 },
    { label: 'Showmax Standard', price: 2900 },
    { label: 'Showmax Pro', price: 6300 },
  ]
};

type ServiceType = 'airtime' | 'data' | 'electricity' | 'bills' | 'education' | 'toll' | 'giftcards';

export default function Services() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  
  const [activeService, setActiveService] = useState<ServiceType>(
    (location.state?.service as ServiceType) || 'airtime'
  );
  const [step, setStep] = useState<0 | 1 | 2 | 3>(
    location.state?.service ? 1 : 0
  ); // 0: Grid, 1: Form, 2: Review, 3: Success
  
  const [provider, setProvider] = useState('');
  const [accountIdentifier, setAccountIdentifier] = useState(''); // Phone, Meter, or Smartcard
  const [amount, setAmount] = useState('');
  
  const [dataPlan, setDataPlan] = useState('');
  const [dataBundle, setDataBundle] = useState('');
  const [meterType, setMeterType] = useState('prepaid');
  const [tvPackage, setTvPackage] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (location.state?.service) {
      setActiveService(location.state.service as ServiceType);
      setStep(1);
    }
  }, [location.state]);

  const services = [
    { id: 'airtime', icon: Smartphone, label: 'Airtime', color: 'bg-[#FFF5EB] text-[#FF8A00]', desc: 'Top up airtime instantly' },
    { id: 'data', icon: Wifi, label: 'Data Bundle', color: 'bg-[#EBF5FF] text-[#2563EB]', desc: 'Buy internet data bundles' },
    { id: 'electricity', icon: Lightbulb, label: 'Electricity', color: 'bg-[#FFFBEB] text-[#D97706]', desc: 'Pay prepaid & postpaid power' },
    { id: 'bills', icon: Tv, label: 'TV Bills', color: 'bg-[#EDF2FE] text-[#2563EB]', desc: 'DSTV, GOtv, and StarTimes' },
    { id: 'education', icon: GraduationCap, label: 'Education', color: 'bg-[#FDF2F8] text-[#DB2777]', desc: 'WAEC, NECO, JAMB Pin portal' },
    { id: 'toll', icon: Car, label: 'Toll & Transport', color: 'bg-[#F0FDF4] text-[#16A34A]', desc: 'LCC Toll, Cowry Transport' },
    { id: 'giftcards', icon: Gift, label: 'Gift Cards', color: 'bg-[#F5F3FF] text-[#7C3AED]', desc: 'International Amazon & iTunes' },
  ];

  const handleServiceChange = (id: string) => {
    setActiveService(id as ServiceType);
    setProvider('');
    setAccountIdentifier('');
    setAmount('');
    setError('');
    setDataPlan('');
    setDataBundle('');
    setMeterType('prepaid');
    setTvPackage('');
    setStep(1);
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!provider) {
      setError('Please select a provider');
      return;
    }

    if (activeService === 'data') {
      if (!dataPlan || !dataBundle) {
        setError('Please select a data plan and bundle');
        return;
      }
    }

    if (activeService === 'bills') {
      if (!tvPackage) {
        setError('Please select a TV package');
        return;
      }
    }

    const purchaseAmount = parseFloat(amount);
    if (isNaN(purchaseAmount) || purchaseAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (profile && purchaseAmount > profile.balance) {
      setError('Insufficient funds in your Zero Bank account');
      return;
    }

    if (activeService === 'giftcards') {
      if (!accountIdentifier.includes('@') || accountIdentifier.length < 5) {
        setError('Please enter a valid email address');
        return;
      }
    } else if (accountIdentifier.length < 5) {
      setError('Please enter a valid account/phone number');
      return;
    }

    setStep(2); // Move to review
  };

  const handlePurchaseClick = () => {
    setIsPinModalOpen(true);
  };

  const executePurchase = async () => {
    if (!profile) return;
    
    setIsPinModalOpen(false);
    const purchaseAmount = parseFloat(amount);
    setIsProcessing(true);
    setError('');

    try {
      const batch = writeBatch(db);
      const date = new Date().toISOString();
      const reference = activeService.toUpperCase() + '-' + Math.random().toString(36).substring(2, 10).toUpperCase();

      // Deduct from user
      const userRef = doc(db, 'users', profile.uid);
      batch.update(userRef, { balance: profile.balance - purchaseAmount });

      // Create transaction
      const txRef = doc(collection(db, 'transactions'));
      const providerName = PROVIDERS[activeService].find(p => p.id === provider)?.name || provider;
      let desc = `${providerName} ${services.find(s => s.id === activeService)?.label} - ${accountIdentifier}`;

      if (activeService === 'data') {
        desc = `${providerName} Data (${dataBundle}) - ${accountIdentifier}`;
      } else if (activeService === 'electricity') {
        desc = `${providerName} Electricity (${meterType}) - ${accountIdentifier}`;
      } else if (activeService === 'bills') {
        desc = `${providerName} TV (${tvPackage}) - ${accountIdentifier}`;
      }

      batch.set(txRef, {
        userId: profile.uid,
        type: 'debit',
        amount: purchaseAmount,
        category: activeService,
        description: desc,
        date,
        status: 'success',
        reference,
        recipientName: providerName,
        recipientAccount: accountIdentifier
      });

      const notifRef = doc(collection(db, 'notifications'));
      batch.set(notifRef, {
        userId: profile.uid,
        title: 'Service Payment Approved',
        message: `You successfully paid NGN ${purchaseAmount.toLocaleString()} for ${desc}.`,
        type: 'transaction',
        read: false,
        date,
        link: '/transactions'
      });

      await batch.commit();
      
      setReceiptData({
        amount: purchaseAmount,
        recipientName: providerName,
        recipientAccount: accountIdentifier,
        senderName: profile.name,
        senderAccount: profile.accountNumber,
        reference,
        date,
        description: desc
      });
      setStep(3); // Move to success
      
    } catch (err: any) {
      console.error("Purchase error:", err);
      setError(err.message || "Transaction failed. Please try again.");
      handleFirestoreError(err, OperationType.WRITE, 'transactions/users');
      setStep(1); // Go back to form on error
    } finally {
      setIsProcessing(false);
    }
  };

  const renderInputLabel = () => {
    switch (activeService) {
      case 'airtime':
      case 'data': return 'Phone Number';
      case 'electricity': return 'Meter Number';
      case 'bills': return 'Smart Card Number';
      case 'education': return 'Candidate / Profile Code';
      case 'toll': return 'Toll Account / Plate Number';
      case 'giftcards': return 'Delivery Email Address';
      default: return 'Account Number';
    }
  };

  const handleBack = () => {
    if (step === 3) navigate('/');
    else if (step === 2) setStep(1);
    else if (step === 1) {
      if (location.state?.service) {
        navigate(-1);
      } else {
        setStep(0);
      }
    }
    else navigate(-1);
  };

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
      {/* Header */}
      <header className="pt-8 pb-6 flex items-center justify-between border-b border-slate-100/80 dark:border-slate-800/50 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack} 
            className="w-11 h-11 rounded-2xl bg-white dark:bg-[#0E1626] border border-[#E2E8F0] dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all shadow-sm group cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-[#0F172A] dark:text-slate-200 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              {step === 0 ? 'Utility Services' : step === 2 ? 'Confirm Payment' : services.find(s => s.id === activeService)?.label}
            </h1>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold tracking-wide uppercase mt-0.5">
              {step === 0 ? 'Popular utility payments & bills' : 'Fill in payment instructions'}
            </p>
          </div>
        </div>

        {profile && (
          <div className="hidden sm:flex items-center gap-3 bg-white dark:bg-[#0E1626] border border-slate-100 dark:border-slate-800/80 p-2.5 px-4 rounded-2xl shadow-sm">
            <Coins className="w-5 h-5 text-blue-600 dark:text-blue-500" />
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wider uppercase">Zero Wallet</p>
              <p className="text-sm font-extrabold text-[#0F172A] dark:text-white">₦••••••</p>
            </div>
          </div>
        )}
      </header>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (Forms and Service Grids) */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div key="skel-serv" className="space-y-6">
                <div className="bg-white dark:bg-[#0E1626] rounded-3xl p-8 border border-slate-100 dark:border-slate-800/80 h-64 animate-pulse"></div>
              </div>
            ) : step === 0 ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Search services input */}
                <div className="relative">
                  <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search e.g. DSTV, MTN, Airtime..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#0E1626] border border-slate-150/40 dark:border-slate-800 rounded-2xl text-sm font-bold font-sans text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>

                {/* Popular Services Grid */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">Select Service Category</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {services.filter(s => 
                      s.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      s.desc.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleServiceChange(service.id)}
                        className="bg-white dark:bg-[#0E1626] border border-slate-100/85 dark:border-slate-800/80 p-5 rounded-[26px] flex flex-col items-start gap-4 hover:border-blue-500/30 dark:hover:border-blue-500/40 hover:shadow-md active:scale-[0.98] transition-all text-left group cursor-pointer"
                      >
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${service.color}`}>
                          <service.icon className="w-5 h-5 shadow-inner" strokeWidth={2.5} />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-[#0F172A] dark:text-white block">{service.label}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-normal font-semibold block">{service.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : step === 1 ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleContinue} className="bg-white dark:bg-[#0E1626] rounded-[28px] p-6 md:p-8 border border-slate-100 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-6">
                  {/* Provider Selection */}
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">
                      Select {activeService === 'electricity' ? 'Disco Provider' : activeService === 'bills' ? 'TV Biller' : 'Network Provider'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[280px] overflow-y-auto p-1 scrollbar-hide">
                      {PROVIDERS[activeService].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setProvider(p.id);
                            if (activeService === 'bills') {
                              setTvPackage('');
                              setAmount('');
                            }
                            if (activeService === 'education' && 'price' in p) {
                              setAmount(p.price.toString());
                            }
                          }}
                          className={`p-4.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center text-center h-16 cursor-pointer ${
                            provider === p.id 
                              ? `border-transparent shadow-md ${p.color} ring-2 ring-offset-2 ring-blue-500/25` 
                              : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#080E1A]/60 text-[#0F172A] dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Data Specific Fields */}
                  {activeService === 'data' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">Data Validity Plan</label>
                        <select
                          value={dataPlan}
                          onChange={(e) => {
                            setDataPlan(e.target.value);
                            setDataBundle('');
                            setAmount('');
                          }}
                          className="w-full px-4 py-3.5 bg-[#F8FAFC] dark:bg-[#080E1A] border-none rounded-2xl text-xs font-bold text-[#0F172A] dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                          required
                        >
                          <option value="" className="dark:bg-[#0E1626]">Choose Plan...</option>
                          {DATA_PLANS.map(plan => (
                            <option key={plan} value={plan} className="dark:bg-[#0E1626]">{plan}</option>
                          ))}
                        </select>
                      </div>
                      
                      {dataPlan && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">Data Bundle Option</label>
                          <select
                            value={dataBundle}
                            onChange={(e) => {
                              setDataBundle(e.target.value);
                              const selectedBundle = DATA_BUNDLES[dataPlan].find(b => b.label === e.target.value);
                              if (selectedBundle) {
                                setAmount(selectedBundle.price.toString());
                              }
                            }}
                            className="w-full px-4 py-3.5 bg-[#F8FAFC] dark:bg-[#080E1A] border-none rounded-2xl text-xs font-bold text-[#0F172A] dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                            required
                          >
                            <option value="" className="dark:bg-[#0E1626]">Choose Bundle...</option>
                            {DATA_BUNDLES[dataPlan].map(bundle => (
                              <option key={bundle.label} value={bundle.label} className="dark:bg-[#0E1626]">{bundle.label} - ₦{bundle.price}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Electricity Specific Fields */}
                  {activeService === 'electricity' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">Meter Type</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setMeterType('prepaid')}
                          className={`p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                            meterType === 'prepaid' ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm' : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#080E1A]/60 text-[#0F172A] dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          Prepaid
                        </button>
                        <button
                          type="button"
                          onClick={() => setMeterType('postpaid')}
                          className={`p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                            meterType === 'postpaid' ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm' : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#080E1A]/60 text-[#0F172A] dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          Postpaid
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bills Specific Fields */}
                  {activeService === 'bills' && provider && TV_PACKAGES[provider] && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">TV Package Plan</label>
                      <select
                        value={tvPackage}
                        onChange={(e) => {
                          setTvPackage(e.target.value);
                          const selectedPkg = TV_PACKAGES[provider].find(p => p.label === e.target.value);
                          if (selectedPkg) {
                            setAmount(selectedPkg.price.toString());
                          }
                        }}
                        className="w-full px-4 py-3.5 bg-[#F8FAFC] dark:bg-[#080E1A] border-none rounded-2xl text-xs font-bold text-[#0F172A] dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                        required
                      >
                        <option value="" className="dark:bg-[#0E1626]">Choose Package...</option>
                        {TV_PACKAGES[provider].map(pkg => (
                          <option key={pkg.label} value={pkg.label} className="dark:bg-[#0E1626]">{pkg.label} - ₦{pkg.price}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Account/Phone Input */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">{renderInputLabel()}</label>
                      <input
                        type={activeService === 'giftcards' ? 'email' : (activeService === 'airtime' || activeService === 'data' ? 'tel' : 'text')}
                        maxLength={activeService === 'airtime' || activeService === 'data' ? 11 : undefined}
                        required
                        value={accountIdentifier}
                        onChange={(e) => {
                          if (activeService === 'giftcards') {
                            setAccountIdentifier(e.target.value);
                          } else if (activeService === 'airtime' || activeService === 'data') {
                            setAccountIdentifier(e.target.value.replace(/\D/g, ''));
                          } else {
                            setAccountIdentifier(e.target.value);
                          }
                        }}
                        className="w-full px-4.5 py-4 bg-[#F8FAFC] dark:bg-[#080E1A]/80 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-[#0F172A] dark:text-white"
                        placeholder={`Enter ${renderInputLabel().toLowerCase()}`}
                      />
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">Amount (₦)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">₦</span>
                        <input
                          type="number"
                          required
                          min="50"
                          step="1"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          readOnly={(activeService === 'data' && !!dataBundle) || (activeService === 'bills' && !!tvPackage) || activeService === 'education'}
                          className={`w-full pl-9 pr-4 py-4 bg-[#F8FAFC] dark:bg-[#080E1A]/80 border-none rounded-2xl font-extrabold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-[#0F172A] dark:text-white ${((activeService === 'data' && !!dataBundle) || (activeService === 'bills' && !!tvPackage) || activeService === 'education') ? 'opacity-70 cursor-not-allowed bg-slate-100 dark:bg-slate-900' : ''}`}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Amounts */}
                  {activeService !== 'data' && activeService !== 'bills' && activeService !== 'education' && (
                    <div className="flex flex-wrap gap-2 pt-1 pl-1">
                      {QUICK_AMOUNTS.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAmount(amt.toString())}
                          className="px-4 py-2 bg-[#F8FAFC] dark:bg-[#080E1A] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-150/20 dark:border-slate-800/60 rounded-full text-xs font-extrabold text-[#0F172A] dark:text-slate-300 transition-all cursor-pointer"
                        >
                          ₦{amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-[#0F172A] hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-4 rounded-2xl font-black transition-all active:scale-[0.98] flex justify-center items-center gap-2 shadow-xl shadow-slate-900/10 dark:shadow-none text-xs uppercase tracking-widest cursor-pointer"
                    >
                      <span>Continue to review</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="review"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white dark:bg-[#0E1626] rounded-[28px] p-6 md:p-8 border border-slate-100 dark:border-slate-800/85 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Confirm Utility Checkout</h3>
                </div>

                <div className="border border-slate-100 dark:border-slate-800 rounded-3xl p-6 bg-slate-50/50 dark:bg-[#080E1A]/40 space-y-5">
                  <div className="text-center pb-5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total bill</span>
                    <h2 className="text-3xl font-black text-[#0F172A] dark:text-white tracking-tight mt-1.5">₦{parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase tracking-wider">Provider / Biller</span>
                      <strong className="text-[#0F172A] dark:text-white font-extrabold mt-1 block">
                        {PROVIDERS[activeService].find(p => p.id === provider)?.name || provider}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase tracking-wider">Service Type</span>
                      <strong className="text-[#0F172A] dark:text-white font-extrabold mt-1 block uppercase">
                        {services.find(s => s.id === activeService)?.label}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase tracking-wider">{renderInputLabel()}</span>
                      <strong className="text-[#0F172A] dark:text-white font-extrabold mt-1 block font-mono">{accountIdentifier}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase tracking-wider">Fee</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold mt-1 block">₦0.00 (Free)</strong>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-100 font-black rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Edit Instructions
                  </button>
                  <button
                    type="button"
                    onClick={handlePurchaseClick}
                    disabled={isProcessing}
                    className="w-full bg-[#0F172A] hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Pay Securely</span>
                        <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 dark:text-emerald-400" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column (Balance Monitors and FAQ Tips) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Balance indicator */}
          {profile && (
            <div className="bg-white dark:bg-[#0E1626] rounded-[28px] p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Wallet Balance</span>
              <div className="flex items-center gap-3">
                <Coins className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                <strong className="text-xl font-black text-[#0F172A] dark:text-white">₦••••••</strong>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed">
                Your Zero Bank wallet is linked directly. Bill settlements are debited instantly and posted immediately to utility vendor nodes.
              </p>
            </div>
          )}

          {/* Safety instructions */}
          <div className="bg-slate-50 dark:bg-[#080E1A]/60 border border-slate-100 dark:border-slate-800/80 rounded-[28px] p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-[#0F172A] dark:text-white tracking-wider">Transaction Safeguards</h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed mt-1.5">
                Always double-check meter numbers, phone digits, or candidate codes before initiating payments. Real-time token pins will be issued immediately upon authentication.
              </p>
            </div>
          </div>
        </div>
      </div>

      <TransactionPinModal 
        isOpen={isPinModalOpen} 
        onClose={() => setIsPinModalOpen(false)} 
        onSuccess={executePurchase} 
      />
    </div>
  );
}
