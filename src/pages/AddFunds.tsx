import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Copy, QrCode, AlertCircle, Building2, User, Hash } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AddFunds() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyAccount = () => {
    if (profile?.accountNumber) {
      navigator.clipboard.writeText(profile.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg pb-24 w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
      <header className="bg-primary text-white p-6 rounded-b-[2rem] shadow-lg relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Add Funds</h1>
        </div>
        <p className="text-white/80 text-sm">
          Fund your account via bank transfer or QR code.
        </p>
      </header>

      <main className="px-6 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-bold text-neutral-text mb-4">Bank Transfer</h2>
          <p className="text-sm text-neutral-muted mb-6">
            Transfer funds to the account details below to fund your wallet.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-bg rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-neutral-muted">Bank Name</p>
                  <p className="font-semibold text-neutral-text">Zero-bank</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-bg rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-neutral-muted">Account Name</p>
                  <p className="font-semibold text-neutral-text">{profile?.name}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-bg rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-neutral-muted">Account Number</p>
                  <p className="font-semibold text-neutral-text tracking-wider">{profile?.accountNumber}</p>
                </div>
              </div>
              <button 
                onClick={copyAccount}
                className="p-2 hover:bg-white rounded-lg transition-colors text-primary"
              >
                {copied ? <span className="text-xs font-medium">Copied!</span> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <QrCode className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-neutral-text">QR Payment</h2>
          </div>
          
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-800">Coming Soon</p>
              <p className="text-xs text-orange-600 mt-1">
                QR code payments are currently unavailable. Please use bank transfer to fund your account.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
