'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { Database } from '@/lib/database.types';
import { Button } from './ui/button';

// Definisi tipe yang lebih spesifik untuk konten notifikasi
interface CommentNotificationContent {
    post_id: string;
    comment_id: string;
    commenter_name: string;
    comment_content: string;
}
  
interface NewPostNotificationContent {
    post_id: string;
    post_title: string;
    author_name: string;
}

// Extend tipe notification untuk mendukung konten yang lebih spesifik
type Notification = Database['public']['Tables']['notifications']['Row'] & {
    content: CommentNotificationContent | NewPostNotificationContent | any;
};

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Fungsi untuk mendapatkan session
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
    };

    getSession();

    // Listener untuk perubahan session
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (currentSession) => {
        setSession(currentSession);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Hanya jalankan jika session ada
    if (!session?.user) return;

    // Fungsi ambil notifikasi
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (data) setNotifications(data);
      if (error) console.error('Error fetching notifications:', error);
    };

    // Real-time listener untuk notifikasi baru
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          // Pastikan payload.new sesuai dengan tipe Notification
          const newNotification = payload.new as Notification;

          // Tampilkan toast untuk notifikasi baru
          toast.success(`Notifikasi Baru: ${JSON.stringify(newNotification.content)}`);
          
          // Update state notifications dengan tipe yang benar
          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .subscribe();

    // Ambil notifikasi saat komponen dimuat
    fetchNotifications();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  // Tandai notifikasi sebagai terbaca
  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return;
    }

    // Hapus notifikasi dari state
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  // Jika tidak ada session, kembalikan null
  if (!session) return null;

  return (
    <div className="notification-container">
      <h2 className="text-lg font-bold">
        Notifikasi ({notifications.length})
      </h2>
      {notifications.map(notification => (
        <div 
          key={notification.id}
          className="notification-item p-2 border-b hover:bg-gray-100 cursor-pointer"
          onClick={() => markAsRead(notification.id)}
        >
          {/* Render konten notifikasi sesuai tipe */}
          {notification.type === 'comment' && (
            <p>
              Komentar baru di postingan Anda dari {notification.content?.commenter_name}
            </p>
          )}
          {notification.type === 'new_post' && (
            <p>
              Post baru dari {notification.content?.author_name}: {notification.content?.post_title}
            </p>
          )}
          <small className="text-gray-500">
            {new Date(notification.created_at).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
  );
}