import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Bell, CheckCircle2, Circle, AlertCircle, ArrowDownLeft, ArrowUpRight, Check, Trash2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'transaction' | 'system' | 'alert';
  read: boolean;
  date: string;
  link?: string;
}

export default function Notifications() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', profile.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      setNotifications(notifs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const markAsRead = async (notificationId: string) => {
    try {
      const batch = writeBatch(db);
      const notifRef = doc(db, 'notifications', notificationId);
      batch.update(notifRef, { read: true });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/${notificationId}`);
    }
  };

  const markAllAsRead = async () => {
    if (!notifications.some(n => !n.read)) return;
    
    try {
      const batch = writeBatch(db);
      notifications.filter(n => !n.read).forEach(n => {
        const notifRef = doc(db, 'notifications', n.id);
        batch.update(notifRef, { read: true });
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'notifications');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getIcon = (type: string, title: string) => {
    const text = title.toLowerCase();
    if (type === 'transaction') {
      if (text.includes('received') || text.includes('credit') || text.includes('approved')) {
        return <ArrowDownLeft className="w-5 h-5 text-emerald-600" />;
      }
      if (text.includes('sent') || text.includes('debit') || text.includes('paid')) {
        return <ArrowUpRight className="w-5 h-5 text-rose-600" />;
      }
      return <Bell className="w-5 h-5 text-primary" />;
    }
    if (type === 'alert') return <ShieldAlert className="w-5 h-5 text-amber-500" />;
    return <Bell className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-[#0F172A] w-full max-w-4xl mx-auto px-4 md:px-8">
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
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">Inbox Notifications</h1>
            <p className="text-[11px] text-neutral-muted font-bold tracking-wide uppercase mt-0.5">Real-time alerts & activities</p>
          </div>
        </div>

        {notifications.some(n => !n.read) && (
          <button 
            onClick={markAllAsRead}
            className="text-xs font-extrabold text-primary bg-[#2563EB]/10 hover:bg-[#2563EB]/15 px-4.5 py-2.5 rounded-2xl transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" strokeWidth={3} />
            <span>Mark all read</span>
          </button>
        )}
      </header>

      {/* Main Alert List */}
      <main className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {loading ? (
            <div key="shimmer" className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 h-24 animate-pulse flex gap-4">
                  <div className="w-11 h-11 rounded-full bg-slate-100 shrink-0"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3.5 bg-slate-100 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-[28px] p-12 text-center border border-slate-100 flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.01)]"
            >
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                <Bell className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-sm font-black text-[#0F172A]">Inbox is all quiet</h3>
              <p className="text-xs text-neutral-muted mt-1.5 leading-relaxed max-w-sm">
                When you initiate transfers, pay utility bills, or receive deposit credits, they will appear immediately inside this activity log.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-white p-5 rounded-[24px] border transition-all flex gap-4.5 cursor-pointer relative group ${
                    notification.read 
                      ? 'border-slate-100 shadow-sm hover:shadow-md' 
                      : 'border-primary/20 shadow-indigo-100/50 shadow-md hover:shadow-lg'
                  }`}
                >
                  {/* Read indicator light dot */}
                  {!notification.read && (
                    <span className="absolute top-5 right-5 w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}

                  {/* Icon badge representation */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-inner ${
                    notification.read ? 'bg-slate-50 text-slate-500' : 'bg-[#2563EB]/10'
                  }`}>
                    {getIcon(notification.type, notification.title)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-sm text-[#0F172A] leading-snug truncate pr-6 group-hover:text-primary transition-colors">
                      {notification.title}
                    </h3>
                    <p className={`text-xs mt-1 leading-relaxed font-semibold ${
                      notification.read ? 'text-neutral-muted' : 'text-slate-800'
                    }`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2.5 text-[10px] font-bold text-slate-400">
                      <span>{format(new Date(notification.date), 'MMM d, yyyy')}</span>
                      <span>•</span>
                      <span>{format(new Date(notification.date), 'h:mm a')}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
