/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { collection, doc, getDoc, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { SupportConfig, Message, OperationType, User } from '../types';
import { ChevronLeft, MessageCircle, Mail, Facebook, Headphones, ExternalLink, Loader2, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';
import ReactMarkdown from 'react-markdown';

export default function SupportView() {
  const [config, setConfig] = useState<SupportConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return auth.onAuthStateChanged(async (u) => {
      if (u) {
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        if (userDoc.exists()) {
          setUser({ id: u.uid, uid: u.uid, ...userDoc.data() } as User);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!user || !isChatOpen) return;

    // We use a special support chat or just the last one
    const q = query(collection(db, 'chats'), where('userId', '==', user.uid), orderBy('updatedAt', 'desc'), where('isSupport', '==', true));
    
    return onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setChatId(snap.docs[0].id);
      }
    });
  }, [user, isChatOpen]);

  useEffect(() => {
    if (!chatId) return;
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
    return onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
    });
  }, [chatId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || !user) return;
    
    let currentId = chatId;
    if (!currentId) {
      const docRef = await addDoc(collection(db, 'chats'), {
        userId: user.uid,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        lastMessage: inputText,
        isSupport: true
      });
      currentId = docRef.id;
      setChatId(currentId);
    }

    await addDoc(collection(db, 'chats', currentId, 'messages'), {
      chatId: currentId,
      userId: user.uid,
      sender: 'user',
      text: inputText,
      timestamp: serverTimestamp(),
      type: 'chat'
    });

    await updateDoc(doc(db, 'chats', currentId), {
      lastMessage: inputText,
      updatedAt: serverTimestamp()
    });

    setInputText('');
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'support', 'main'));
        if (docSnap.exists()) {
          setConfig({ id: docSnap.id, ...docSnap.data() } as SupportConfig);
        }
      } catch (error) {
        console.error("Error fetching support config:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const supportOptions = [
    {
      name: 'WhatsApp Support',
      description: 'সরাসরি চ্যাট করতে ক্লিক করুন',
      icon: MessageCircle,
      link: `https://wa.me/${config?.whatsapp}`,
      color: 'bg-green-500',
      value: config?.whatsapp
    },
    {
      name: 'Email Support',
      description: 'আমাদের ইমেইল করুন',
      icon: Mail,
      link: `mailto:${config?.email}`,
      color: 'bg-blue-500',
      value: config?.email
    },
    {
      name: 'Facebook Page',
      description: 'আমাদের ফেসবুক পেজ ভিজিট করুন',
      icon: Facebook,
      link: config?.facebook,
      color: 'bg-indigo-600',
      value: 'Nexora Official'
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans tracking-tight pb-12">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-zinc-200 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link 
            to="/" 
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">Support Center</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-12">
        <div className="text-center space-y-4 mb-12">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <Headphones className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">কিভাবে আমরা আপনাকে সাহায্য করতে পারি?</h2>
          <p className="text-zinc-500">আমাদের সাপোর্ট টিম আপনার যেকোনো সমস্যার সমাধান দিতে প্রস্তুত। নিচের যেকোনো মাধ্যম ব্যবহার করুন।</p>
        </div>

        <div className="space-y-4">
          {supportOptions.map((option, idx) => (
            <motion.a
              key={idx}
              href={option.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-4 p-5 bg-white border border-zinc-200 rounded-3xl hover:shadow-xl hover:border-zinc-300 transition-all group"
            >
              <div className={`w-14 h-14 ${option.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-current/20`}>
                <option.icon className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg">{option.name}</h3>
                <p className="text-zinc-500 text-sm truncate">{option.value || 'Not configured'}</p>
              </div>
              <ExternalLink className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 transition-colors mr-2" />
            </motion.a>
          ))}
        </div>

        <div className="mt-12 p-8 bg-zinc-900 text-white rounded-[2.5rem] text-center space-y-4">
          <h3 className="text-xl font-bold">Nexora এর সাথে কথা বলতে চান?</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">যেকোনো প্রশ্ন বা তথ্যের জন্য হোমপেজে গিয়ে চ্যাট শুরু করুন।</p>
          <Link 
            to="/" 
            className="inline-block mt-4 px-8 py-3 bg-white text-zinc-900 rounded-2xl font-bold hover:bg-zinc-100 transition-colors"
          >
            Chat Now
          </Link>
        </div>
      </main>

      {/* Floating Live Chat Button */}
      {!isChatOpen && (
        <button 
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-40 group"
        >
          <MessageCircle className="w-8 h-8" />
          <span className="absolute right-full mr-4 bg-zinc-900 text-white px-3 py-1 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Chat with Support</span>
        </button>
      )}

      {/* Live Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-[90vw] sm:w-[400px] h-[500px] bg-white border border-zinc-200 rounded-[2.5rem] shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            <div className="p-6 bg-purple-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Headphones className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">Support Chat</h3>
                  <p className="text-[10px] uppercase tracking-widest opacity-70">Always Active</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6 rotate-180" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-zinc-50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2">
                  <p className="text-zinc-400 text-sm font-medium">No messages yet. Start a conversation!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div key={msg.id || idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        isUser ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-none'
                      }`}>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={scrollRef} />
            </div>

            <div className="p-4 border-t border-zinc-200 bg-white">
              <div className="flex gap-2">
                <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask a question..."
                  className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-purple-500 transition-colors"
                />
                <button 
                  onClick={sendMessage}
                  disabled={!inputText.trim()}
                  className={`p-2 rounded-xl transition-all ${
                    inputText.trim() 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                    : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
