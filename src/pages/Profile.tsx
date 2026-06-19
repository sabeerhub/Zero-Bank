import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  User, 
  ShieldCheck, 
  Landmark, 
  Bell, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  CheckCircle2, 
  X,
  Lock,
  Compass
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import TransactionPinModal from '../components/TransactionPinModal';

export default function Profile() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.name || 'Sabeer');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (profile?.name) {
      setNameInput(profile.name);
    }
  }, [profile]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateProfileName = async () => {
    if (!profile || !nameInput.trim()) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        name: nameInput.trim()
      });
      setIsEditing(false);
      setToastMessage('Name updated successfully!');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (error) {
      console.error("Update profile name error:", error);
      setToastMessage('Error updating name.');
      setTimeout(() => setToastMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans w-full max-w-md mx-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3.5 bg-[#0F172A] text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner Block - exactly like design */}
      <div className="bg-[#2563EB] text-white pt-8 pb-10 px-6 rounded-b-[40px] shadow-[0_12px_40px_rgba(37,99,235,0.12)] relative">
        <header className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate('/')} 
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center border border-white/5 text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <span className="text-sm font-bold tracking-tight text-white/90">Profile</span>
          <div className="w-10" /> {/* Spacer */}
        </header>

        {/* User Identity Section */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#1D4ED8] to-[#3B82F6] flex items-center justify-center text-white text-3xl font-black tracking-tighter">
                {(profile?.name || 'Sabeer').charAt(0).toUpperCase()}
              </div>
            </div>
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full text-[#2563EB] shadow-md hover:scale-110 active:scale-90 transition-all border border-slate-100"
            >
              <User className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-white leading-tight">
              {profile?.name || 'Sabeer'}
            </h2>
            <p className="text-xs text-white/70 font-medium">
              {profile?.email || 'sabeer@example.com'}
            </p>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 border border-white/10 text-white font-bold text-[10px] rounded-full uppercase tracking-wider mt-2">
              <span>Silver Member</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Options List - exactly like design */}
      <main className="px-6 mt-6">
        <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm divide-y divide-[#F1F5F9] overflow-hidden">
          
          {/* Edit Name / Personal Info */}
          <button 
            onClick={() => setIsEditing(true)}
            className="w-full p-4.5 flex items-center justify-between hover:bg-[#F8FAFC] transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                <User className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0F172A] group-hover:text-primary transition-colors">Personal Information</p>
                <p className="text-[10px] leading-relaxed text-neutral-muted font-bold tracking-wide uppercase mt-0.5">Click to change name</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* KYC Verification - Green Verified badge as per design */}
          <div className="p-4.5 flex items-center justify-between hover:bg-[#F8FAFC] transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0F172A]">KYC Verification</p>
                <p className="text-[10px] leading-relaxed text-neutral-muted font-bold tracking-wide uppercase mt-0.5">Identity status check</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#16A34A] flex items-center gap-1">
                Verified <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
              </span>
              <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
            </div>
          </div>

          {/* Bank Settings (Transaction Pin Setup) */}
          <button 
            onClick={() => setIsPinModalOpen(true)}
            className="w-full p-4.5 flex items-center justify-between hover:bg-[#F8FAFC] transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0">
                <Landmark className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0F172A] group-hover:text-primary transition-colors">Bank Settings</p>
                <p className="text-[10px] leading-relaxed text-neutral-muted font-bold tracking-wide uppercase mt-0.5">Change card pin & limits</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Notification Settings */}
          <button 
            onClick={() => showNotification('Notifications updated successfully')}
            className="w-full p-4.5 flex items-center justify-between hover:bg-[#F8FAFC] transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#EDF2FE] text-[#2563EB] flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0F172A] group-hover:text-primary transition-colors">Notification Settings</p>
                <p className="text-[10px] leading-relaxed text-neutral-muted font-bold tracking-wide uppercase mt-0.5">Preferences & alerts</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Help Center */}
          <button 
            onClick={() => navigate('/support')}
            className="w-full p-4.5 flex items-center justify-between hover:bg-[#F8FAFC] transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 text-[#64748B] flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0F172A] group-hover:text-primary transition-colors">Help Center</p>
                <p className="text-[10px] leading-relaxed text-neutral-muted font-bold tracking-wide uppercase mt-0.5">Get support 24/7</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Logout */}
          <button 
            onClick={handleLogout}
            className="w-full p-4.5 flex items-center justify-between hover:bg-[#FEF2F2] transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#EF4444]">Logout</p>
                <p className="text-[10px] leading-relaxed text-rose-400 font-bold tracking-wide uppercase mt-0.5">Leave account safely</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#EF4444]" />
          </button>
        </div>

        {/* Footer info branding block */}
        <div className="pt-8 text-center">
          <p className="text-[10px] text-neutral-muted font-bold tracking-widest uppercase">Zero Bank • All Rights Reserved</p>
        </div>
      </main>

      {/* Profile Edit Name Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
              onClick={() => setIsEditing(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-sm p-6 relative z-10 border border-[#E2E8F0] shadow-xl space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">Edit Name</h3>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-[#64748B]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-muted">Full Name</label>
                <input 
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-[#2563EB] transition-all"
                  placeholder="Enter full name"
                />
              </div>

              <button 
                onClick={updateProfileName}
                disabled={isSaving || !nameInput.trim()}
                className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TransactionPinModal 
        isOpen={isPinModalOpen} 
        onClose={() => setIsPinModalOpen(false)} 
        onSuccess={() => {
          setIsPinModalOpen(false);
          showNotification('Transaction PIN updated successfully!');
        }}
        mode="change"
      />
    </div>
  );
}
