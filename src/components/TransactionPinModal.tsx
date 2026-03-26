import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, AlertCircle, ShieldCheck } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'verify' | 'change';
}

export default function TransactionPinModal({ isOpen, onClose, onSuccess, mode = 'verify' }: Props) {
  const { profile } = useAuth();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Enter old/new, 2: Confirm new, 3: Enter new (if changing)
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setConfirmPin('');
      setError('');
      setStep(1);
      
      if (!profile?.pin) {
        setIsSettingPin(true);
      } else if (mode === 'change') {
        setIsSettingPin(false); // First verify old PIN
      } else {
        setIsSettingPin(false); // Just verify
      }
    }
  }, [isOpen, profile, mode]);

  const handlePinChange = (val: string) => {
    const numericVal = val.replace(/\D/g, '').slice(0, 4);
    if (step === 2 && isSettingPin) {
      setConfirmPin(numericVal);
    } else {
      setPin(numericVal);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'change' && !isSettingPin) {
      // Step 1 of changing PIN: Verify old PIN
      if (pin.length !== 4) {
        setError('PIN must be exactly 4 digits');
        return;
      }
      if (pin !== profile?.pin) {
        setError('Incorrect current PIN');
        setPin('');
        return;
      }
      // Old PIN verified, now set new PIN
      setIsSettingPin(true);
      setStep(1);
      setPin('');
      setConfirmPin('');
      return;
    }

    if (isSettingPin) {
      if (step === 1) {
        if (pin.length !== 4) {
          setError('PIN must be exactly 4 digits');
          return;
        }
        setStep(2);
      } else {
        if (confirmPin.length !== 4) {
          setError('Please confirm your 4-digit PIN');
          return;
        }
        if (confirmPin !== pin) {
          setError('PINs do not match. Try again.');
          setConfirmPin('');
          setStep(1);
          setPin('');
          return;
        }
        
        setIsProcessing(true);
        try {
          await updateDoc(doc(db, 'users', profile!.uid), { pin });
          onSuccess();
        } catch (err: any) {
          setError(err.message || 'Failed to set PIN');
        } finally {
          setIsProcessing(false);
        }
      }
    } else {
      if (pin.length !== 4) {
        setError('PIN must be exactly 4 digits');
        return;
      }
      if (pin !== profile?.pin) {
        setError('Incorrect PIN');
        setPin('');
        return;
      }
      onSuccess();
    }
  };

  if (!isOpen) return null;

  const getTitle = () => {
    if (mode === 'change' && !isSettingPin) return 'Enter Current PIN';
    if (isSettingPin) {
      return step === 1 ? 'Create New PIN' : 'Confirm New PIN';
    }
    return 'Enter Transaction PIN';
  };

  const getDescription = () => {
    if (mode === 'change' && !isSettingPin) return 'Please enter your current 4-digit PIN to continue.';
    if (isSettingPin) {
      return 'Set up a 4-digit PIN to secure your transactions.';
    }
    return 'Please enter your 4-digit PIN to authorize this payment.';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[24px] w-full max-w-sm overflow-hidden shadow-2xl"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                {isSettingPin ? (
                  <ShieldCheck className="w-6 h-6 text-primary" />
                ) : (
                  <Lock className="w-6 h-6 text-primary" />
                )}
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-neutral-muted" />
              </button>
            </div>

            <h3 className="text-xl font-bold text-neutral-text mb-2">
              {getTitle()}
            </h3>
            <p className="text-sm text-neutral-muted mb-6">
              {getDescription()}
            </p>

            {error && (
              <div className="bg-status-error/10 text-status-error p-3 rounded-xl mb-6 flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((index) => {
                  const currentVal = isSettingPin && step === 2 ? confirmPin : pin;
                  return (
                    <div
                      key={index}
                      className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                        currentVal.length > index 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-gray-200 bg-neutral-bg text-transparent'
                      }`}
                    >
                      {currentVal.length > index ? '•' : ''}
                    </div>
                  );
                })}
              </div>

              {/* Hidden input to capture keyboard events easily on mobile */}
              <input
                type="tel"
                autoFocus
                maxLength={4}
                value={isSettingPin && step === 2 ? confirmPin : pin}
                onChange={(e) => handlePinChange(e.target.value)}
                className="opacity-0 absolute -z-10"
              />

              <button
                type="submit"
                disabled={isProcessing || (isSettingPin && step === 2 ? confirmPin.length !== 4 : pin.length !== 4)}
                className="w-full bg-primary hover:bg-primary-accent text-white py-4 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center"
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  isSettingPin ? (step === 1 ? 'Continue' : 'Set PIN') : 'Continue'
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
