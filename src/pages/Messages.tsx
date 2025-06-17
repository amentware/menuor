import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mail, Check, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'read' | 'unread';
}

const Messages = () => {
  const { isAdmin } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData: Message[] = [];
      snapshot.forEach((doc) => {
        messageData.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(messageData);
      setLoading(false);

      // Mark all unread messages as read when they are viewed
      const batch = writeBatch(db);
      let hasUnread = false;

      messageData.forEach((message) => {
        if (message.status === 'unread') {
          hasUnread = true;
          const messageRef = doc(db, 'contact_messages', message.id);
          batch.update(messageRef, { status: 'read' });
        }
      });

      if (hasUnread) {
        batch.commit().catch((error) => {
          console.error('Error marking messages as read:', error);
        });
      }
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const markAsRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, 'contact_messages', messageId), {
        status: 'read'
      });
      toast.success('Message marked as read');
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Failed to update message status');
    }
  };

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="page-container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Mail className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Contact Messages</h1>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600">No messages yet</h2>
            <p className="text-gray-500 mt-2">When customers send messages, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`bg-white rounded-lg p-6 shadow-sm ${
                  message.status === 'unread' ? 'border-l-4 border-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{message.subject}</h3>
                      {message.status === 'unread' && (
                        <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{message.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>From: {message.name}</span>
                      <span>Email: {message.email}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {message.status === 'unread' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => markAsRead(message.id)}
                    >
                      <Check className="h-4 w-4" />
                      Mark as Read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages; 