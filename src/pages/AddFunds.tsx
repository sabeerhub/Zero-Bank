import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Copy, Info, Share2, Download, Building2, 
  CreditCard, QrCode, ClipboardCheck, AlertCircle, X, CheckSquare, Coins, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AddFunds() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'bank' | 'card' | 'qr'>('bank');
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Simulated skeletal mount loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const rawAccount = profile?.accountNumber || '0123456789';
  const displayAccount = rawAccount.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');

  const copyAccountNum = () => {
    navigator.clipboard.writeText(rawAccount);
    setCopied(true);
    setToastMessage('Account number copied!');
    setTimeout(() => {
      setCopied(false);
      setToastMessage('');
    }, 2500);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-[#0F172A] w-full max-w-7xl mx-auto px-4 md:px-8">
      {/* Toast message overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-6 left-1/2 z-50 px-5 py-3.5 bg-[#0F172A] text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="pt-8 pb-6 flex items-center justify-between border-b border-slate-100/80 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="w-11 h-11 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all shadow-sm group"
          >
            <ArrowLeft className="w-5 h-5 text-[#0F172A] group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">Add Funds</h1>
            <p className="text-[11px] text-neutral-muted font-bold tracking-wide uppercase mt-0.5">Top up your Zero wallet balance</p>
          </div>
        </div>

        {profile && (
          <div className="hidden sm:flex items-center gap-3 bg-white border border-slate-100 p-2.5 px-4 rounded-2xl shadow-sm">
            <Coins className="w-5 h-5 text-primary" />
            <div>
              <p className="text-[10px] text-neutral-muted font-bold tracking-wider uppercase">Zero Wallet</p>
              <p className="text-sm font-extrabold text-[#0F172A]">₦••••••</p>
            </div>
          </div>
        )}
      </header>

      {/* Responsive layout container */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div key="skele" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-slate-100 h-80 animate-pulse"></div>
            <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-100 h-96 animate-pulse"></div>
          </div>
        ) : (
          <motion.div 
            key="addfunds-grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Column (Premium Bank details display card) */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[10px] font-black uppercase text-neutral-muted tracking-wider pl-1">Your Virtual Bank Card</span>
              
              <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-[32px] p-6.5 pt-8 shadow-xl relative overflow-hidden flex flex-col justify-between h-72">
                <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-full blur-2xl"></div>
                
                {/* Branding top */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white text-blue-700 rounded-xl flex items-center justify-center font-black italic">
                      Z
                    </div>
                    <span className="text-sm font-extrabold tracking-tight">Zero Bank</span>
                  </div>
                  <span className="text-[9px] uppercase font-mono font-black tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">Primary account</span>
                </div>

                {/* Account info */}
                <div>
                  <span className="text-[10px] text-white/70 font-bold uppercase tracking-wider block">Wema Bank (Partner Account)</span>
                  <p className="text-2xl font-bold font-mono tracking-widest mt-1.5">{rawAccount}</p>
                  <p className="text-xs text-white/85 font-semibold tracking-wide uppercase mt-1">Beneficiary: {profile?.name}</p>
                </div>

                {/* Action quick links */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                  <button 
                    onClick={copyAccountNum}
                    className="py-2.5 bg-white/10 hover:bg-white/15 active:scale-95 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-white/5"
                  >
                    <Copy className="w-3.5 h-3.5 text-white/90" />
                    <span>Copy</span>
                  </button>
                  <button 
                    onClick={() => setShowShareModal(true)}
                    className="py-2.5 bg-white/10 hover:bg-white/15 active:scale-95 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-white/5"
                  >
                    <Share2 className="w-3.5 h-3.5 opacity-90" />
                    <span>Share details</span>
                  </button>
                </div>
              </div>

              {/* Informative notification box */}
              <div className="bg-slate-50 border border-slate-100 rounded-[28px] p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-[#0F172A] tracking-wider">Add funds guidelines</h4>
                  <p className="text-[11px] text-neutral-muted font-semibold leading-relaxed mt-1.5">
                    Funding wire transfers processed through local bank apps reflect instantly. Our settlement ledger provides multi-path clearing networks to ensure high success rates.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column (Interactive Funding Tab panels) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-[32px] border border-slate-100 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-6">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-neutral-muted tracking-wider">Choose funding method</span>
                </div>

                {/* Vertical action list */}
                <div className="space-y-4">
                  {/* Bank Transfer Category */}
                  <div 
                    onClick={() => {
                      setActiveTab('bank');
                      showToast('Showing Wire Transfer instructions');
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      activeTab === 'bank' ? 'border-primary/20 bg-slate-50/50 shadow-sm' : 'border-slate-100/80 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                        <Building2 className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#0F172A]">Local Bank Transfer</h4>
                        <p className="text-xs text-neutral-muted mt-0.5">Wire money directly from other local banking applications</p>
                      </div>
                    </div>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      activeTab === 'bank' ? 'border-primary bg-primary' : 'border-slate-200'
                    }`}>
                      {activeTab === 'bank' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </span>
                  </div>

                  {/* Card Payment Category */}
                  <div 
                    onClick={() => {
                      setActiveTab('card');
                      showToast('Showing Debit Card gateway');
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      activeTab === 'card' ? 'border-primary/20 bg-slate-50/50 shadow-sm' : 'border-slate-100/80 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                        <CreditCard className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#0F172A]">Debit Card Gateway</h4>
                        <p className="text-xs text-neutral-muted mt-0.5">Charge external MasterCard, Visa, or Verve cards instantly</p>
                      </div>
                    </div>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      activeTab === 'card' ? 'border-primary bg-primary' : 'border-slate-200'
                    }`}>
                      {activeTab === 'card' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </span>
                  </div>

                  {/* QR Code Scan Category */}
                  <div 
                    onClick={() => {
                      setActiveTab('qr');
                      setShowQrModal(true);
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      activeTab === 'qr' ? 'border-primary/20 bg-slate-50/50 shadow-sm' : 'border-slate-100/80 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                        <QrCode className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#0F172A]">Zero QR Deposit Code</h4>
                        <p className="text-xs text-neutral-muted mt-0.5">Let other Zero Bank App users scan your barcode to send funds</p>
                      </div>
                    </div>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      activeTab === 'qr' ? 'border-primary bg-primary' : 'border-slate-200'
                    }`}>
                      {activeTab === 'qr' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </span>
                  </div>
                </div>

                {/* Tab content area */}
                <div className="pt-4 border-t border-slate-100">
                  <AnimatePresence mode="wait">
                    {activeTab === 'bank' && (
                      <motion.div 
                        key="tab-bank"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3 text-xs"
                      >
                        <h5 className="font-extrabold text-[#0F172A] uppercase tracking-wider text-[10px] text-slate-400">Direct Wire Guidelines</h5>
                        <ul className="space-y-2.5 text-neutral-muted font-semibold leading-relaxed">
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                            <span>Log in to your external bank app (e.g. GTBank, Zenith, Access).</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                            <span>Select WEMA Bank as the destination partner bank.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                            <span>Enter your unique account number: <strong>{rawAccount}</strong>.</span>
                          </li>
                        </ul>
                      </motion.div>
                    )}

                    {activeTab === 'card' && (
                      <motion.div 
                        key="tab-card"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4"
                      >
                        <h5 className="font-extrabold text-[#0F172A] uppercase tracking-wider text-[10px] text-slate-400">Secure Debit Card Gateway</h5>
                        <p className="text-xs text-neutral-muted font-semibold leading-relaxed">
                          To load funds with cards securely, click below to launch the Paystack/Flutterwave gateway portal. All processed values will update your ledger balance instantly.
                        </p>
                        <button 
                          onClick={() => alert("Launching Paystack checkout integration simulation. Funds will reflect in your balance upon approval.")}
                          className="w-full py-3.5 bg-[#0F172A] hover:bg-black text-white font-bold rounded-xl text-xs transition-colors"
                        >
                          Launch Checkout Gateway
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share account details modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm p-6 relative z-10 border border-slate-100 shadow-2xl space-y-5 text-center"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm font-black text-[#0F172A] tracking-tight">Share Account Details</span>
                <button onClick={() => setShowShareModal(false)} className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-left">
                <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Formatted Account metadata</p>
                <p className="text-xs font-mono text-[#0F172A] font-semibold leading-relaxed select-all">
                  Zero Bank Details:<br/>
                  Partner Bank: Wema Bank<br/>
                  Account Number: {rawAccount}<br/>
                  Beneficiary Name: {profile?.name}
                </p>
              </div>

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`Zero Bank Details - Wema Bank - Account: ${rawAccount} - Beneficiary Name: ${profile?.name}`);
                  showToast("Account details copied to clipboard!");
                  setShowShareModal(false);
                }}
                className="w-full bg-[#0F172A] hover:bg-black text-white py-3.5 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95"
              >
                Copy formatted text
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Modal Overlay */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 p-6 relative text-center space-y-5"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm font-black text-[#0F172A] tracking-tight">Zero QR Code</span>
                <button onClick={() => setShowQrModal(false)} className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 inline-block mx-auto shadow-inner">
                {/* Simulated geometric QR pattern */}
                <div className="w-36 h-36 border-4 border-[#0F172A] rounded-xl flex flex-col justify-between p-1.5 bg-white relative shadow-sm">
                  <div className="flex justify-between">
                    <div className="w-7 h-7 bg-[#0F172A] rounded-sm"></div>
                    <div className="w-7 h-7 bg-[#0F172A] rounded-sm"></div>
                  </div>
                  
                  {/* Central brand mark */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-white font-black text-[10px] italic shadow-md">
                    Z
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="w-7 h-7 bg-[#0F172A] rounded-sm"></div>
                    <div className="w-7 h-7 grid grid-cols-2 gap-0.5">
                      <div className="bg-[#0F172A]"></div>
                      <div className="bg-transparent"></div>
                      <div className="bg-transparent"></div>
                      <div className="bg-[#0F172A]"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-black text-[#0F172A]">Scan unique QR code</p>
                <p className="text-[11px] text-neutral-muted leading-relaxed font-semibold max-w-xs mx-auto">
                  Let other Zero Bank users scan this code from their mobile cameras to transfer credits to your account instantly.
                </p>
              </div>

              <button 
                onClick={() => setShowQrModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-[#0F172A] py-3.5 rounded-xl font-bold text-xs"
              >
                Close QR display
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
