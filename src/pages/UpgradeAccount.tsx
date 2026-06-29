import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Shield, CheckCircle2, AlertCircle, Upload, FileText, CreditCard, User, X, Info, Coins } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function UpgradeAccount() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');
  const [idFileName, setIdFileName] = useState<string | null>(null);
  const [utilityFileName, setUtilityFileName] = useState<string | null>(null);

  const idFileInputRef = useRef<HTMLInputElement>(null);
  const utilityFileInputRef = useRef<HTMLInputElement>(null);

  const currentTier = profile?.tier || 2; // Default to Tier 2 based on previous silver profiles

  // Simulated skeletal mount loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const handleUpgradeClick = (tierLevel: number) => {
    setSelectedTier(tierLevel);
    setShowComingSoon(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'utility') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'id') setIdFileName(file.name);
      if (type === 'utility') setUtilityFileName(file.name);
    }
  };

  const tiers = [
    {
      level: 1,
      name: 'Tier 1 (Starter)',
      status: currentTier >= 1 ? 'active' : 'pending',
      limits: '₦50,000 Daily Limit',
      requirements: ['Basic Information', 'Email Verification']
    },
    {
      level: 2,
      name: 'Tier 2 (Standard)',
      status: currentTier >= 2 ? 'active' : 'pending',
      limits: '₦2,500,000 Daily Limit',
      requirements: ['Bank Verification Number (BVN)', 'National Identity Number (NIN)']
    },
    {
      level: 3,
      name: 'Tier 3 (Executive VIP)',
      status: currentTier >= 3 ? 'active' : 'pending',
      limits: '₦50,000,000 Daily Limit',
      requirements: ['Valid Government Passport / ID', 'Utility Address Bill (Proof)']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="pb-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => selectedTier ? setSelectedTier(null) : navigate(-1)} 
            className="w-10 h-10 rounded-xl bg-white dark:bg-[#0B121F]/80 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all shadow-xs group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-900 dark:text-slate-100 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {selectedTier ? `Upgrade to Tier ${selectedTier}` : 'KYC Verification Levels'}
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold tracking-wider uppercase mt-0.5">Expand your wallet transaction caps</p>
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

      {/* Main Grid content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div key="skel" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white dark:bg-[#0B121F]/80 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800 h-80 animate-pulse"></div>
            <div className="lg:col-span-7 bg-white dark:bg-[#0B121F]/80 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800 h-96 animate-pulse"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (Achievement Levels overview) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Active Tier Summary Badge Card */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white rounded-[32px] p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-white">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-white/70 block">Current KYC standing</span>
                    <strong className="text-xl font-bold tracking-tight text-white">Tier {currentTier} (Verified)</strong>
                  </div>
                </div>
              </div>

              {/* Informative advice box */}
              <div className="bg-white dark:bg-[#0B121F]/80 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.01)] space-y-4">
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block">Security & Compliance</span>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">
                  Zero Bank strictly adheres to Central Bank of Nigeria (CBN) and AML regulations. Verifying your identity secures your wallet balances from unauthorized freeze triggers.
                </p>
              </div>
            </div>

            {/* Right Column (Document submissions or Multi-Step form) */}
            <div className="lg:col-span-7 space-y-6">
              {showComingSoon && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-950/30 p-4 rounded-2xl flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider">Application Under Review</p>
                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 leading-relaxed font-semibold">
                      Your identity documents have been submitted securely to the Zero verification engine. Review cycles usually settle within 24 business hours.
                    </p>
                  </div>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {!selectedTier ? (
                  <motion.div 
                    key="tiers-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {tiers.map((tier) => (
                      <div
                        key={tier.level}
                        className={`bg-white dark:bg-[#0B121F]/80 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] border transition-all ${
                          tier.level === currentTier 
                            ? 'border-blue-500/25 dark:border-blue-500/30 bg-slate-50/50 dark:bg-slate-800/10' 
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              tier.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                            }`}>
                              {tier.status === 'active' ? <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" /> : tier.level}
                            </div>
                            <div>
                              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{tier.name}</h3>
                              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold tracking-wide mt-0.5">{tier.limits}</p>
                            </div>
                          </div>

                          {tier.level === currentTier && (
                            <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                              Active
                            </span>
                          )}
                        </div>

                        <div className="pl-12 space-y-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
                          {tier.requirements.map((req, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${tier.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                              <span>{req}</span>
                            </div>
                          ))}
                        </div>

                        {tier.level > currentTier && (
                          <div className="mt-5 pl-12">
                            <button
                              onClick={() => handleUpgradeClick(tier.level)}
                              disabled={tier.level > currentTier + 1}
                              className={`w-full py-3 font-extrabold rounded-2xl text-xs transition-colors cursor-pointer ${
                                tier.level === currentTier + 1
                                  ? 'bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                              }`}
                            >
                              {tier.level === currentTier + 1 ? `Submit ${tier.name} details` : `Unlock Tier ${tier.level - 1} first`}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.form 
                    key="tier-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleFormSubmit}
                    className="bg-white dark:bg-[#0B121F]/80 rounded-[32px] p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.01)] space-y-6"
                  >
                    <div>
                      <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        {selectedTier === 2 ? 'Identity verification' : 'Upload proof documents'}
                      </h2>
                      <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed mt-1 font-semibold">
                        {selectedTier === 2 
                          ? 'Provide valid BVN and National Identity digits to upgrade immediately.' 
                          : 'Provide government issued passport scan & proof of residential utilities address.'}
                      </p>
                    </div>

                    {selectedTier === 2 && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">Bank Verification Number (BVN)</label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
                            <input
                              type="text"
                              maxLength={11}
                              value={bvn}
                              onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/10 text-slate-900 dark:text-white placeholder-slate-400"
                              placeholder="Enter 11-digit BVN"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">National Identity Number (NIN)</label>
                          <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
                            <input
                              type="text"
                              maxLength={11}
                              value={nin}
                              onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
                              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/10 text-slate-900 dark:text-white placeholder-slate-400"
                              placeholder="Enter 11-digit NIN"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedTier === 3 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* ID Document upload picker */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">Valid government ID</label>
                          <div 
                            onClick={() => idFileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                          >
                            <input 
                              type="file" 
                              ref={idFileInputRef} 
                              className="hidden" 
                              accept="image/*,.pdf"
                              onChange={(e) => handleFileChange(e, 'id')}
                            />
                            <CreditCard className="w-6 h-6 text-slate-400 dark:text-slate-500 mb-2" />
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {idFileName ? idFileName : 'Upload ID passport'}
                            </p>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">JPG, PNG or PDF (Max 5MB)</p>
                          </div>
                        </div>

                        {/* Utility Document upload picker */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">Utility Bill Address Proof</label>
                          <div 
                            onClick={() => utilityFileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                          >
                            <input 
                              type="file" 
                              ref={utilityFileInputRef} 
                              className="hidden" 
                              accept="image/*,.pdf"
                              onChange={(e) => handleFileChange(e, 'utility')}
                            />
                            <FileText className="w-6 h-6 text-slate-400 dark:text-slate-500 mb-2" />
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {utilityFileName ? utilityFileName : 'Upload bill receipt'}
                            </p>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">JPG, PNG or PDF (Max 5MB)</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedTier(null)}
                        className="w-1/3 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-extrabold rounded-2xl text-xs transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white py-3.5 rounded-2xl font-bold transition-all shadow-md text-xs cursor-pointer"
                      >
                        Submit Application
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
