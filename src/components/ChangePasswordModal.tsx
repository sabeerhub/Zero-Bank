import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { auth } from '../firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose, onSuccess }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      setError('User not found. Please log in again.');
      return;
    }

    setIsLoading(true);

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      
      // Reset form and close
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onSuccess();
    } catch (err: any) {
      console.error('Error changing password:', err);
      if (err.code === 'auth/invalid-credential') {
        setError('Incorrect current password');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError('Failed to change password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold text-neutral-text">Change Password</h2>
                </div>
                <button 
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-muted" />
                </button>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-status-error/10 border border-status-error/20 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-status-error shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-status-error">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-text mb-1.5">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-3 bg-neutral-bg border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-muted hover:text-primary transition-colors"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-text mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-3 bg-neutral-bg border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="Enter new password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-muted hover:text-primary transition-colors"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-text mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-3 bg-neutral-bg border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-muted hover:text-primary transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full mt-6 py-3.5 bg-primary hover:bg-primary-accent text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-md shadow-primary/20"
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
