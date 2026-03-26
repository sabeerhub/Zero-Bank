import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Shield, CheckCircle2, AlertCircle, Upload, FileText, CreditCard, User, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function UpgradeAccount() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  // Form states
  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');
  const [idFileName, setIdFileName] = useState<string | null>(null);
  const [utilityFileName, setUtilityFileName] = useState<string | null>(null);

  const idFileInputRef = useRef<HTMLInputElement>(null);
  const utilityFileInputRef = useRef<HTMLInputElement>(null);

  const currentTier = profile?.tier || 1;

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
      name: 'Tier 1',
      status: currentTier >= 1 ? 'active' : 'pending',
      limits: '₦50,000 Daily Limit',
      requirements: ['Basic Information', 'Email Verification']
    },
    {
      level: 2,
      name: 'Tier 2',
      status: currentTier >= 2 ? 'active' : 'pending',
      limits: '₦200,000 Daily Limit',
      requirements: ['Bank Verification Number (BVN)', 'National Identity Number (NIN)']
    },
    {
      level: 3,
      name: 'Tier 3',
      status: currentTier >= 3 ? 'active' : 'pending',
      limits: '₦5,000,000 Daily Limit',
      requirements: ['Valid Government ID', 'Utility Bill (Proof of Address)']
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-bg pb-24 w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
      <header className="bg-primary text-white p-6 rounded-b-[2rem] shadow-lg relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => selectedTier ? setSelectedTier(null) : navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">
            {selectedTier ? `Upgrade to Tier ${selectedTier}` : 'Upgrade Account'}
          </h1>
        </div>
        {!selectedTier && (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Current Status</p>
              <p className="text-xl font-bold">Tier {currentTier}</p>
            </div>
          </div>
        )}
      </header>

      <main className="px-6 py-8 space-y-6">
        <AnimatePresence mode="wait">
          {showComingSoon && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-start gap-3 mb-6"
            >
              <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-orange-800">Coming Soon</p>
                <p className="text-xs text-orange-600 mt-1">
                  Account upgrades are currently being rolled out. Please check back later to submit your documents.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedTier ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {tiers.map((tier) => (
              <motion.div
                key={tier.level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${
                  tier.level === currentTier ? 'border-primary' : 'border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      tier.status === 'active' ? 'bg-status-success text-white' : 'bg-gray-100 text-neutral-muted'
                    }`}>
                      {tier.status === 'active' ? <CheckCircle2 className="w-5 h-5" /> : tier.level}
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-text">{tier.name}</h3>
                      <p className="text-xs text-neutral-muted">{tier.limits}</p>
                    </div>
                  </div>
                  {tier.level === currentTier && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                      CURRENT
                    </span>
                  )}
                </div>

                <div className="pl-11 space-y-2">
                  {tier.requirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-neutral-muted">
                      <div className={`w-1.5 h-1.5 rounded-full ${tier.status === 'active' ? 'bg-status-success' : 'bg-gray-300'}`} />
                      {req}
                    </div>
                  ))}
                </div>

                {tier.level > currentTier && (
                  <div className="mt-5 pl-11">
                    <button
                      onClick={() => handleUpgradeClick(tier.level)}
                      disabled={tier.level > currentTier + 1}
                      className={`w-full py-2.5 font-bold rounded-xl text-sm transition-colors ${
                        tier.level === currentTier + 1
                          ? 'bg-primary/10 text-primary hover:bg-primary/20'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {tier.level === currentTier + 1 ? `Upgrade to ${tier.name}` : `Unlock Tier ${tier.level - 1} First`}
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.form 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleFormSubmit}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-neutral-text mb-2">
                {selectedTier === 2 ? 'Identity Verification' : 'Document Upload'}
              </h2>
              <p className="text-sm text-neutral-muted mb-6">
                {selectedTier === 2 
                  ? 'Please provide your BVN and NIN to upgrade your account to Tier 2.' 
                  : 'Please upload a valid government ID and a recent utility bill to upgrade to Tier 3.'}
              </p>

              {selectedTier === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-text mb-1.5">Bank Verification Number (BVN)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-neutral-muted" />
                      </div>
                      <input
                        type="text"
                        maxLength={11}
                        value={bvn}
                        onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-11 pr-4 py-3 bg-neutral-bg border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Enter 11-digit BVN"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-text mb-1.5">National Identity Number (NIN)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <CreditCard className="w-5 h-5 text-neutral-muted" />
                      </div>
                      <input
                        type="text"
                        maxLength={11}
                        value={nin}
                        onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-11 pr-4 py-3 bg-neutral-bg border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Enter 11-digit NIN"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedTier === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-text mb-1.5">Valid Government ID</label>
                    <p className="text-xs text-neutral-muted mb-3">Passport, Driver's License, or Voter's Card</p>
                    <div 
                      onClick={() => idFileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input 
                        type="file" 
                        ref={idFileInputRef} 
                        className="hidden" 
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, 'id')}
                      />
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-sm font-semibold text-neutral-text">
                        {idFileName ? idFileName : 'Tap to upload ID document'}
                      </p>
                      <p className="text-xs text-neutral-muted mt-1">JPG, PNG or PDF (Max 5MB)</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-text mb-1.5">Utility Bill</label>
                    <p className="text-xs text-neutral-muted mb-3">Proof of address (not older than 3 months)</p>
                    <div 
                      onClick={() => utilityFileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input 
                        type="file" 
                        ref={utilityFileInputRef} 
                        className="hidden" 
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, 'utility')}
                      />
                      <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-3">
                        <FileText className="w-6 h-6 text-orange-600" />
                      </div>
                      <p className="text-sm font-semibold text-neutral-text">
                        {utilityFileName ? utilityFileName : 'Tap to upload utility bill'}
                      </p>
                      <p className="text-xs text-neutral-muted mt-1">JPG, PNG or PDF (Max 5MB)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-accent text-white py-3.5 rounded-xl font-bold transition-colors shadow-md shadow-primary/20"
            >
              Submit Application
            </button>
          </motion.form>
        )}
      </main>
    </div>
  );
}
