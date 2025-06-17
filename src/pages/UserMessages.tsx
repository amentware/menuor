import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, collection, query, where, orderBy, addDoc, onSnapshot, Timestamp, deleteDoc, doc, getDocs } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RefreshCcw, Send, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  isAdmin: boolean;
  createdAt: Timestamp;
  restaurantId: string;
  read: boolean;
}

const UserMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(true);
  const { currentUser } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!currentUser) return;

    setLoadingMessages(true);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('restaurantId', '==', currentUser.uid),
      where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        newMessages.push({
          id: doc.id,
          content: data.content,
          senderId: data.senderId,
          senderName: data.senderName,
          isAdmin: data.isAdmin,
          createdAt: data.createdAt,
          restaurantId: data.restaurantId,
          read: data.read
        });
      });
      setMessages(newMessages);
      setLoadingMessages(false);
      if (newMessages.length > 0) {
        scrollToBottom();
      }
    }, (error) => {
      console.error('Error fetching messages:', error);
      setLoadingMessages(false);
      toast({
        title: 'Error',
        description: 'Failed to load messages. Please refresh the page.',
        variant: 'destructive',
      });
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newMessage.trim()) return;

    try {
      const messagesRef = collection(db, 'messages');
      const messageData = {
        content: newMessage.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Restaurant Owner',
        restaurantId: currentUser.uid,
        isAdmin: false,
        createdAt: Timestamp.now(),
        read: false
      };

      await addDoc(messagesRef, messageData);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="page-container">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold font-display text-black mb-8">Messages</h1>
        
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle>Chat with Menuor Support</CardTitle>
            <CardDescription>
              Send us a message and we'll get back to you as soon as possible. Messages are kept for 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Messages Container */}
              <div className="h-[400px] overflow-y-auto border rounded-lg p-4 space-y-4">
                {loadingMessages ? (
                  <div className="flex flex-col justify-center items-center h-full">
                    <RefreshCcw className="h-8 w-8 animate-spin text-gray-400 mb-2" />
                    <p className="text-gray-500">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-full text-center">
                    <Mail className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-600 font-medium mb-1">No messages yet</p>
                    <p className="text-gray-500 text-sm">
                      Start a conversation with our support team. We're here to help!
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === currentUser?.uid
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.senderId === currentUser?.uid
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">
                          {message.senderId === currentUser?.uid
                            ? 'You'
                            : message.isAdmin
                            ? 'Menuor Support'
                            : message.senderName}
                        </p>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.createdAt.toDate().toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={loadingMessages}
                />
                <Button type="submit" disabled={loadingMessages || !newMessage.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserMessages; 