import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Bell, CheckCircle2, Circle, AlertCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
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
    if (type === 'transaction') {
      if (title.toLowerCase().includes('received')) return <ArrowDownLeft className="w-5 h-5 text-status-success" />;
      if (title.toLowerCase().includes('sent')) return <ArrowUpRight className="w-5 h-5 text-status-error" />;
      return <Bell className="w-5 h-5 text-primary" />;
    }
    if (type === 'alert') return <AlertCircle className="w-5 h-5 text-orange-500" />;
    return <Bell className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="min-h-screen bg-neutral-bg pb-24 w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
      <header className="bg-white px-6 pt-12 pb-6 sticky top-0 z-10 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-neutral-bg rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-neutral-text" />
          </button>
          <h1 className="text-xl font-bold text-neutral-text">Notifications</h1>
        </div>
        {notifications.some(n => !n.read) && (
          <button 
            onClick={markAllAsRead}
            className="text-sm font-medium text-primary hover:text-primary-accent transition-colors"
          >
            Mark all read
          </button>
        )}
      </header>

      <main className="px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Bell className="w-8 h-8 text-neutral-muted" />
            </div>
            <h3 className="text-lg font-bold text-neutral-text mb-2">No notifications yet</h3>
            <p className="text-neutral-muted text-sm">
              When you get notifications, they'll show up here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white p-4 rounded-2xl shadow-sm border ${notification.read ? 'border-transparent' : 'border-primary/20'} cursor-pointer hover:shadow-md transition-all flex gap-4`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notification.read ? 'bg-neutral-bg' : 'bg-primary/10'}`}>
                  {getIcon(notification.type, notification.title)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-semibold text-sm ${notification.read ? 'text-neutral-text' : 'text-neutral-text'}`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0"></div>
                    )}
                  </div>
                  <p className={`text-sm mb-2 ${notification.read ? 'text-neutral-muted' : 'text-neutral-text/80'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-neutral-muted font-medium">
                    {format(new Date(notification.date), 'MMM d, h:mm a')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
