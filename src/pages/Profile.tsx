import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, User, Mail, Hash, LogOut, Edit2, CheckCircle2, AlertCircle, 
  HelpCircle, Lock, Shield, Bell, Moon, ChevronRight, Copy, Key, Smartphone, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import TransactionPinModal from '../components/TransactionPinModal';
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function Profile() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username || profile?.name?.split(' ')[0].toLowerCase() || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile?.notificationsEnabled ?? true);
  const [showDeviceModal, setShowDeviceModal] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || profile.name?.split(' ')[0].toLowerCase() || '');
      setNotificationsEnabled(profile.notificationsEnabled ?? true);
    }
  }, [profile]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSave = async () => {
    if (!profile || !username.trim()) return;
    
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        username: username.trim().toLowerCase()
      });
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Username updated successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage({ type: 'error', text: 'Failed to update username' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = () => {
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSuccess = () => {
    setIsPasswordModalOpen(false);
    setMessage({ type: 'success', text: 'Password updated successfully' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const toggleNotifications = async () => {
    if (!profile) return;
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        notificationsEnabled: newValue
      });
    } catch (error) {
      console.error("Error updating notifications:", error);
      setNotificationsEnabled(!newValue); // revert on error
    }
  };

  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    setMessage({ type: 'success', text: 'Transaction PIN updated successfully' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col pb-24 w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
      <header className="px-6 py-6 bg-white flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-neutral-text" />
          </button>
          <h1 className="text-xl font-bold text-neutral-text">Profile</h1>
        </div>
        <button onClick={handleLogout} className="p-2 text-status-error hover:bg-red-50 rounded-full transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 p-6">
        {/* Profile Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] p-6 shadow-sm mb-8 relative overflow-hidden"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center mt-4">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-white p-1 shadow-md mb-4">
                <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-4xl">
                  {profile?.name?.charAt(0) || 'U'}
                </div>
              </div>
              <div className="absolute bottom-4 right-0 bg-status-success text-white text-[10px] font-bold px-2 py-1 rounded-full border-2 border-white shadow-sm">
                TIER {profile?.tier || 1}
              </div>
            </div>
            
            {isEditing ? (
              <div className="w-full max-w-xs space-y-3 mt-2">
                <p className="text-sm text-neutral-muted font-medium mb-1">Edit Username</p>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-bg border-none rounded-xl text-center font-bold text-lg focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Username"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setIsEditing(false); setUsername(profile?.username || profile?.name?.split(' ')[0].toLowerCase() || ''); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-neutral-muted hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !username.trim()}
                    className="flex-1 bg-primary hover:bg-primary-accent text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 shadow-md shadow-primary/20"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <h2 className="text-2xl font-bold text-neutral-text flex items-center justify-center gap-2">
                  {profile?.name}
                </h2>
                <p className="text-sm text-neutral-muted mt-1 font-medium flex items-center justify-center gap-2">
                  @{profile?.username || profile?.name?.split(' ')[0].toLowerCase() || 'user'}
                  <button onClick={() => setIsEditing(true)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-neutral-muted hover:text-primary">
                    <Edit2 className="w-3 h-3" />
                  </button>
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl mb-8 flex items-center gap-3 text-sm font-medium ${
              message.type === 'success' ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <p>{message.text}</p>
          </motion.div>
        )}

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Account Details Section */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="text-sm font-bold text-neutral-muted uppercase tracking-wider">Account Details</h3>
              <Link to="/upgrade" className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20 transition-colors">
                Upgrade Account
              </Link>
            </div>
            <div className="bg-white rounded-[24px] shadow-sm overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Hash className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-muted font-medium mb-0.5">Account Number</p>
                    <p className="text-sm font-mono font-bold text-neutral-text tracking-wider">{profile?.accountNumber}</p>
                  </div>
                </div>
                <button 
                  onClick={() => copyToClipboard(profile?.accountNumber || '')}
                  className="p-2 hover:bg-gray-50 rounded-full transition-colors text-neutral-muted hover:text-primary"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5 text-status-success" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              
              <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-neutral-muted font-medium mb-0.5">Email Address</p>
                  <p className="text-sm font-semibold text-neutral-text truncate">{profile?.email}</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Security Section */}
          <motion.section variants={itemVariants}>
            <h3 className="text-sm font-bold text-neutral-muted uppercase tracking-wider mb-3 px-2">Security</h3>
            <div className="bg-white rounded-[24px] shadow-sm overflow-hidden">
              <button 
                onClick={() => setIsPinModalOpen(true)}
                className="w-full p-4 flex items-center justify-between border-b border-gray-50 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-text">Transaction PIN</p>
                    <p className="text-xs text-neutral-muted mt-0.5">Change or set up your PIN</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>

              <button 
                onClick={handlePasswordReset}
                className="w-full p-4 flex items-center justify-between border-b border-gray-50 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                    <Key className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-text">Change Password</p>
                    <p className="text-xs text-neutral-muted mt-0.5">Send password reset email</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>

              <button 
                onClick={() => setShowDeviceModal(true)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-text">Device Management</p>
                    <p className="text-xs text-neutral-muted mt-0.5">Manage connected devices</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </motion.section>

          {/* Preferences & Support */}
          <motion.section variants={itemVariants}>
            <h3 className="text-sm font-bold text-neutral-muted uppercase tracking-wider mb-3 px-2">More</h3>
            <div className="bg-white rounded-[24px] shadow-sm overflow-hidden">
              <button 
                onClick={toggleNotifications}
                className="w-full p-4 flex items-center justify-between border-b border-gray-50 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-yellow-600" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-text">Notifications</p>
                </div>
                <div className={`w-11 h-6 rounded-full relative transition-colors ${notificationsEnabled ? 'bg-primary' : 'bg-gray-200'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${notificationsEnabled ? 'left-[22px]' : 'left-0.5'}`}></div>
                </div>
              </button>

              <Link to="/support" className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-5 h-5 text-rose-600" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-text">Help & Support</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </Link>
            </div>
          </motion.section>
          
          <motion.div variants={itemVariants} className="pt-4 pb-8 text-center">
            <p className="text-xs text-neutral-muted font-medium">Zero Bank App v1.0.0</p>
          </motion.div>
        </motion.div>
      </main>

      <TransactionPinModal 
        isOpen={isPinModalOpen} 
        onClose={() => setIsPinModalOpen(false)} 
        onSuccess={handlePinSuccess}
        mode="change"
      />

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        onSuccess={handlePasswordSuccess}
      />

      {/* Device Management Modal */}
      <AnimatePresence>
        {showDeviceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-neutral-text">Active Devices</h2>
                  <button onClick={() => setShowDeviceModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-neutral-muted" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 border border-primary/20 bg-primary/5 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-primary">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-neutral-text">Current Device</p>
                      <p className="text-xs text-neutral-muted">{navigator.userAgent.split(') ')[0] + ')'}</p>
                      <p className="text-[10px] text-status-success font-medium mt-1">Active Now</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowDeviceModal(false)}
                  className="w-full mt-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-neutral-text font-bold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
