import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Smartphone, Wifi, Zap, Tv, CheckCircle2, AlertCircle, ChevronRight, Receipt, GraduationCap, Car, Gift, CreditCard, Landmark, History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';
import TransactionPinModal from '../components/TransactionPinModal';
import TransactionReceipt from '../components/TransactionReceipt';

const PROVIDERS = {
  airtime: [
    { id: 'mtn', name: 'MTN', color: 'bg-[#FFCC00] text-black' },
    { id: 'airtel', name: 'Airtel', color: 'bg-[#FF0000] text-white' },
    { id: 'glo', name: 'Glo', color: 'bg-[#009933] text-white' },
    { id: '9mobile', name: '9mobile', color: 'bg-[#006600] text-white' },
    { id: 'smile', name: 'Smile', color: 'bg-[#FFCC00] text-black' },
  ],
  data: [
    { id: 'mtn', name: 'MTN', color: 'bg-[#FFCC00] text-black' },
    { id: 'airtel', name: 'Airtel', color: 'bg-[#FF0000] text-white' },
    { id: 'glo', name: 'Glo', color: 'bg-[#009933] text-white' },
    { id: '9mobile', name: '9mobile', color: 'bg-[#006600] text-white' },
    { id: 'smile', name: 'Smile', color: 'bg-[#FFCC00] text-black' },
    { id: 'spectranet', name: 'Spectranet', color: 'bg-[#E31837] text-white' },
  ],
  electricity: [
    { id: 'ikedc', name: 'Ikeja (IKEDC)', color: 'bg-blue-600 text-white' },
    { id: 'ekedc', name: 'Eko (EKEDC)', color: 'bg-indigo-600 text-white' },
    { id: 'aedc', name: 'Abuja (AEDC)', color: 'bg-green-600 text-white' },
    { id: 'kedco', name: 'Kano (KEDCO)', color: 'bg-teal-600 text-white' },
    { id: 'phed', name: 'Port Harcourt (PHED)', color: 'bg-blue-500 text-white' },
    { id: 'ibedc', name: 'Ibadan (IBEDC)', color: 'bg-blue-700 text-white' },
    { id: 'eedc', name: 'Enugu (EEDC)', color: 'bg-orange-500 text-white' },
    { id: 'bedc', name: 'Benin (BEDC)', color: 'bg-yellow-600 text-white' },
    { id: 'jed', name: 'Jos (JED)', color: 'bg-sky-500 text-white' },
    { id: 'kaedco', name: 'Kaduna (KAEDCO)', color: 'bg-emerald-600 text-white' },
    { id: 'yedc', name: 'Yola (YEDC)', color: 'bg-red-600 text-white' },
  ],
  bills: [
    { id: 'dstv', name: 'DSTV', color: 'bg-blue-500 text-white' },
    { id: 'gotv', name: 'GOTV', color: 'bg-green-500 text-white' },
    { id: 'startimes', name: 'StarTimes', color: 'bg-orange-500 text-white' },
    { id: 'showmax', name: 'Showmax', color: 'bg-pink-600 text-white' },
  ],
  education: [
    { id: 'waec', name: 'WAEC Result Checker', color: 'bg-blue-800 text-white', price: 3500 },
    { id: 'jamb', name: 'JAMB e-PIN', color: 'bg-green-700 text-white', price: 4700 },
    { id: 'neco', name: 'NECO Token', color: 'bg-teal-700 text-white', price: 1200 },
  ],
  toll: [
    { id: 'lcc', name: 'LCC Toll', color: 'bg-orange-500 text-white' },
    { id: 'etag', name: 'e-Tag', color: 'bg-gray-800 text-white' },
    { id: 'cowry', name: 'Cowry Card', color: 'bg-yellow-500 text-black' },
  ],
  giftcards: [
    { id: 'amazon', name: 'Amazon US', color: 'bg-yellow-500 text-black' },
    { id: 'apple', name: 'Apple/iTunes', color: 'bg-gray-900 text-white' },
    { id: 'google', name: 'Google Play', color: 'bg-green-500 text-white' },
    { id: 'steam', name: 'Steam', color: 'bg-blue-900 text-white' },
    { id: 'playstation', name: 'PlayStation', color: 'bg-blue-600 text-white' },
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

import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

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

  useEffect(() => {
    if (location.state?.service) {
      setActiveService(location.state.service as ServiceType);
      setStep(1);
    }
  }, [location.state]);

  const services = [
    { id: 'airtime', icon: Smartphone, label: 'Airtime', color: 'bg-green-100 text-green-600' },
    { id: 'data', icon: Wifi, label: 'Data', color: 'bg-purple-100 text-purple-600' },
    { id: 'electricity', icon: Zap, label: 'Electricity', color: 'bg-yellow-100 text-yellow-600' },
    { id: 'bills', icon: Tv, label: 'TV Bills', color: 'bg-blue-100 text-blue-600' },
    { id: 'education', icon: GraduationCap, label: 'Education', color: 'bg-indigo-100 text-indigo-600' },
    { id: 'toll', icon: Car, label: 'Toll & Transport', color: 'bg-orange-100 text-orange-600' },
    { id: 'giftcards', icon: Gift, label: 'Gift Cards', color: 'bg-pink-100 text-pink-600' },
    { id: 'card', icon: CreditCard, label: 'My Card', color: 'bg-rose-100 text-rose-600' },
    { id: 'loan', icon: Landmark, label: 'Loan', color: 'bg-emerald-100 text-emerald-600' },
    { id: 'history', icon: History, label: 'Transaction History', color: 'bg-slate-100 text-slate-600' },
  ];

  const handleServiceChange = (id: string) => {
    if (id === 'history') {
      navigate('/transactions');
      return;
    }
    if (id === 'card') {
      navigate('/card');
      return;
    }
    if (id === 'loan') {
      navigate('/loan');
      return;
    }
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
      setError('Insufficient funds');
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
      } else if (activeService === 'education') {
        desc = `${providerName} - ${accountIdentifier}`;
      } else if (activeService === 'toll') {
        desc = `${providerName} Toll - ${accountIdentifier}`;
      } else if (activeService === 'giftcards') {
        desc = `${providerName} Gift Card - ${accountIdentifier}`;
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
        title: 'Service Payment',
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
    <div className="min-h-screen bg-neutral-bg flex flex-col w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
      <header className="px-6 py-6 bg-white flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <button 
          onClick={handleBack} 
          className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-neutral-text" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-neutral-text">
            {step === 0 ? 'Services' : step === 2 ? 'Review Transaction' : services.find(s => s.id === activeService)?.label}
          </h1>
          {step === 0 && <p className="text-xs text-neutral-muted mt-0.5 font-medium">Select a service to continue</p>}
        </div>
      </header>

      <main className="flex-1 p-6">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceChange(service.id as ServiceType)}
                  className="group bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-4 hover:shadow-md hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 active:scale-95"
                >
                  <div className={`w-14 h-14 rounded-2xl ${service.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className="w-7 h-7" strokeWidth={2} />
                  </div>
                  <span className="font-semibold text-sm text-neutral-text group-hover:text-primary transition-colors">{service.label}</span>
                </button>
              ))}
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {error && (
                <div className="bg-status-error/10 text-status-error p-4 rounded-xl flex items-center gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleContinue} className="space-y-6">
                {/* Provider Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-neutral-text">Select {activeService === 'electricity' ? 'Disco' : activeService === 'bills' ? 'Biller' : 'Network'}</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[280px] overflow-y-auto p-1 scrollbar-hide">
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
                        className={`p-4 rounded-2xl border-2 text-sm font-semibold transition-all flex items-center justify-center text-center h-16 ${
                          provider === p.id 
                            ? `border-transparent shadow-md ${p.color} ring-2 ring-offset-2 ring-opacity-50` 
                            : 'border-gray-100 bg-white text-neutral-text hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Data Specific Fields */}
                {activeService === 'data' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-neutral-text">Data Plan</label>
                      <select
                        value={dataPlan}
                        onChange={(e) => {
                          setDataPlan(e.target.value);
                          setDataBundle('');
                          setAmount('');
                        }}
                        className="w-full px-4 py-4 bg-white border-gray-200 border rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg outline-none"
                        required
                      >
                        <option value="">Select Plan</option>
                        {DATA_PLANS.map(plan => (
                          <option key={plan} value={plan}>{plan}</option>
                        ))}
                      </select>
                    </div>
                    
                    {dataPlan && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-text">Data Bundle</label>
                        <select
                          value={dataBundle}
                          onChange={(e) => {
                            setDataBundle(e.target.value);
                            const selectedBundle = DATA_BUNDLES[dataPlan].find(b => b.label === e.target.value);
                            if (selectedBundle) {
                              setAmount(selectedBundle.price.toString());
                            }
                          }}
                          className="w-full px-4 py-4 bg-white border-gray-200 border rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg outline-none"
                          required
                        >
                          <option value="">Select Bundle</option>
                          {DATA_BUNDLES[dataPlan].map(bundle => (
                            <option key={bundle.label} value={bundle.label}>{bundle.label} - ₦{bundle.price}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}

                {/* Electricity Specific Fields */}
                {activeService === 'electricity' && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-text">Meter Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setMeterType('prepaid')}
                        className={`p-4 rounded-2xl border-2 text-sm font-semibold transition-all ${
                          meterType === 'prepaid' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-gray-100 bg-white text-neutral-text hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Prepaid
                      </button>
                      <button
                        type="button"
                        onClick={() => setMeterType('postpaid')}
                        className={`p-4 rounded-2xl border-2 text-sm font-semibold transition-all ${
                          meterType === 'postpaid' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-gray-100 bg-white text-neutral-text hover:border-gray-300 hover:bg-gray-50'
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
                    <label className="text-sm font-semibold text-neutral-text">TV Package</label>
                    <select
                      value={tvPackage}
                      onChange={(e) => {
                        setTvPackage(e.target.value);
                        const selectedPkg = TV_PACKAGES[provider].find(p => p.label === e.target.value);
                        if (selectedPkg) {
                          setAmount(selectedPkg.price.toString());
                        }
                      }}
                      className="w-full px-4 py-4 bg-white border-gray-200 border rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg outline-none"
                      required
                    >
                      <option value="">Select Package</option>
                      {TV_PACKAGES[provider].map(pkg => (
                        <option key={pkg.label} value={pkg.label}>{pkg.label} - ₦{pkg.price}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Account/Phone Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-text">{renderInputLabel()}</label>
                  <div className="relative">
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
                      className="w-full px-4 py-4 bg-white border-gray-200 border rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-lg tracking-wider outline-none"
                      placeholder={`Enter ${renderInputLabel().toLowerCase()}`}
                    />
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-neutral-text">Amount (₦)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-muted font-bold text-xl">₦</span>
                    <input
                      type="number"
                      required
                      min="50"
                      step="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      readOnly={(activeService === 'data' && !!dataBundle) || (activeService === 'bills' && !!tvPackage) || activeService === 'education'}
                      className={`w-full pl-10 pr-4 py-4 bg-white border-gray-200 border rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-2xl text-primary outline-none ${((activeService === 'data' && !!dataBundle) || (activeService === 'bills' && !!tvPackage) || activeService === 'education') ? 'opacity-70 cursor-not-allowed bg-gray-50' : ''}`}
                      placeholder="0.00"
                    />
                  </div>
                  
                  {/* Quick Amounts */}
                  {activeService !== 'data' && activeService !== 'bills' && activeService !== 'education' && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {QUICK_AMOUNTS.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAmount(amt.toString())}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-neutral-muted hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
                        >
                          ₦{amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 pb-8">
                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-accent text-white py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2 shadow-lg shadow-primary/30"
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Receipt className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-neutral-text">Transaction Summary</h3>
                    <p className="text-sm text-neutral-muted font-medium">Please review details below</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-muted">Service</span>
                    <span className="font-medium text-neutral-text capitalize">{activeService}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-muted">Provider</span>
                    <span className="font-medium text-neutral-text">{PROVIDERS[activeService].find(p => p.id === provider)?.name}</span>
                  </div>
                  
                  {activeService === 'data' && dataBundle && (
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-muted">Data Bundle</span>
                      <span className="font-medium text-neutral-text">{dataBundle}</span>
                    </div>
                  )}
                  
                  {activeService === 'electricity' && meterType && (
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-muted">Meter Type</span>
                      <span className="font-medium text-neutral-text capitalize">{meterType}</span>
                    </div>
                  )}
                  
                  {activeService === 'bills' && tvPackage && (
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-muted">Package</span>
                      <span className="font-medium text-neutral-text">{tvPackage}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-neutral-muted">{renderInputLabel()}</span>
                    <span className="font-mono font-medium text-neutral-text">{accountIdentifier}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-neutral-muted">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">₦{parseFloat(amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm flex gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>Please confirm that the details provided are correct. Transactions are final and cannot be reversed.</p>
              </div>

              <button
                onClick={handlePurchaseClick}
                disabled={isProcessing}
                className="w-full bg-primary hover:bg-primary-accent text-white py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center shadow-lg shadow-primary/30"
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Confirm & Pay'
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <TransactionPinModal 
        isOpen={isPinModalOpen} 
        onClose={() => setIsPinModalOpen(false)} 
        onSuccess={executePurchase} 
      />
    </div>
  );
}
