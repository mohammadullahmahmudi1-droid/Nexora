/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  limit,
  updateDoc,
  doc,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { User, Message, Chat, OperationType, Ad, AppSettings, ThemeSettings } from '../types';
import { generateMentorResponse } from '../services/ai';
import { Send, Copy, RotateCcw, User as UserIcon, LogOut, Check, Info, MessageSquare, PlusCircle, Headphones, Sparkles, Bot, History, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

interface ChatViewProps {
  user: User;
}

export default function ChatView({ user }: ChatViewProps) {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<'Creator' | 'Business' | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [devInfo, setDevInfo] = useState<string>('');
  
  const location = useLocation();
  const resumedChatId = location.state?.resumeChatId;

  // Handle resumed chat from History
  useEffect(() => {
    if (resumedChatId) {
      setChatId(resumedChatId);
      // Messages will be fetched by the existing chatId observer
    }
  }, [resumedChatId]);
  
  const [lastAdTime, setLastAdTime] = useState<number>(Date.now());
  
  // Fetch Settings & Dev Info
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsSnap, devSnap] = await Promise.all([
          getDoc(doc(db, 'settings', 'main')),
          getDoc(doc(db, 'developer', 'main'))
        ]);

        if (settingsSnap.exists()) {
          setSettings({ id: settingsSnap.id, ...settingsSnap.data() } as AppSettings);
        }
        if (devSnap.exists()) {
          setDevInfo(devSnap.data()?.bio || '');
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
  
  // Update mode based on messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user')?.text.toLowerCase() || '';
      if (lastUserMsg.includes('creator') || lastUserMsg.includes('content') || lastUserMsg.includes('video') || lastUserMsg.includes('hook') || lastUserMsg.includes('viral')) {
        setMode('Creator');
      } else if (lastUserMsg.includes('business') || lastUserMsg.includes('startup') || lastUserMsg.includes('money') || lastUserMsg.includes('earning') || lastUserMsg.includes('entrepreneur')) {
        setMode('Business');
      }
    }
  }, [messages]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize or fetch Chat
  useEffect(() => {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('userId', '==', user.uid), orderBy('updatedAt', 'desc'), limit(1));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setChatId(snapshot.docs[0].id);
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'chats'));

    return unsubscribe;
  }, [user.uid]);

  // Fetch Messages
  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      setMessages(msgs);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `chats/${chatId}/messages`));

    return unsubscribe;
  }, [chatId]);

  // Fetch Ads
  useEffect(() => {
    const adsRef = collection(db, 'ads');
    const q = query(
      adsRef, 
      where('active', '==', true), 
      where('allowedRoles', 'array-contains', user.role)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAds(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Ad)));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'ads'));
    return unsubscribe;
  }, [user.role]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    
    let currentChatId = chatId;
    if (!currentChatId) {
      const chatDoc = await addDoc(collection(db, 'chats'), {
        userId: user.uid,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        lastMessage: text
      });
      currentChatId = chatDoc.id;
      setChatId(currentChatId);
    }

    const messageData: Partial<Message> = {
      chatId: currentChatId,
      userId: user.uid,
      sender: 'user',
      text,
      timestamp: serverTimestamp(),
      type: 'chat'
    };

    setInputText('');
    await addDoc(collection(db, 'chats', currentChatId, 'messages'), messageData);
    await updateDoc(doc(db, 'chats', currentChatId), { 
      lastMessage: text,
      updatedAt: serverTimestamp() 
    });

    setIsTyping(true);
    
    // AI Response
    const history = messages.slice(-10).map(m => ({
      role: m.sender === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: m.text }]
    }));

    const aiResponseText = await generateMentorResponse(text, history, undefined, devInfo);
    
    const aiMessage: Partial<Message> = {
      chatId: currentChatId,
      userId: user.uid,
      sender: 'AI',
      text: aiResponseText,
      timestamp: serverTimestamp(),
      type: 'chat'
    };

    await addDoc(collection(db, 'chats', currentChatId!, 'messages'), aiMessage);

    // Ad logic: Every 2 minutes (120000 ms)
    const now = Date.now();
    if (ads.length > 0 && (now - lastAdTime >= 120000)) {
       const randomAd = ads[Math.floor(Math.random() * ads.length)];
       await addDoc(collection(db, 'chats', currentChatId!, 'messages'), {
         chatId: currentChatId,
         userId: user.uid,
         sender: 'admin',
         text: `**AD: ${randomAd.title}**`,
         timestamp: serverTimestamp(),
         type: 'ad',
         adRef: randomAd.id
       });
       setLastAdTime(now);
    }

    setIsTyping(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestions = [
    "Viral idea চাই",
    "Business plan চাই",
    "Caption লিখে দাও",
    "Startup budget গাইড"
  ];

  return (
    <div 
      className="h-screen flex flex-col font-sans tracking-tight relative overflow-hidden"
      style={{ backgroundColor: theme?.backgroundColor || '#f8fafc' }}
    >
      {/* Top Bar */}
      <header 
        className="flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 sticky top-0 z-20 shadow-sm border-b border-zinc-200/50"
        style={{ backgroundColor: theme?.headerColor || '#ffffff' }}
      >
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="https://i.postimg.cc/sfn3qKJd/20260510-180148.png" alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-100 p-1" referrerPolicy="no-referrer" />
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold leading-tight truncate" style={{ color: theme?.headerTextColor || '#18181b' }}>Nexora</h1>
            </div>
          </Link>
          {mode && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={mode}
              className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 ml-2 whitespace-nowrap"
            >
              {mode}
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          {user.role === 'admin' && (
            <Link to="/admin" className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500" title="Admin Panel">
              <Shield className="w-5 h-5" />
            </Link>
          )}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-0.5 rounded-full hover:bg-zinc-100 transition-colors"
            >
              {user.photo ? <img src={user.photo} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-zinc-200" referrerPolicy="no-referrer" /> : <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-100 flex items-center justify-center"><UserIcon className="w-5 h-5 text-zinc-400" /></div>}
            </button>
            
            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden z-40"
                  >
                    <div className="p-3 sm:p-4 border-b border-zinc-100 bg-zinc-50">
                      <p className="text-xs sm:text-sm font-bold truncate text-zinc-900">{user.name}</p>
                      <p className="text-[10px] sm:text-xs text-zinc-500 truncate">{user.email}</p>
                    </div>
                    <div className="p-1.5 sm:p-2 border-b border-zinc-100">
                      <button 
                        onClick={() => {
                          setChatId(null);
                          setMessages([]);
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2 sm:gap-3 p-3 sm:p-3.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl transition-all shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        New Conversation
                      </button>
                    </div>
                    <div className="p-1.5 sm:p-2 border-b border-zinc-100">
                      <Link 
                        to="/history"
                        className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-xs sm:text-sm font-medium text-zinc-700 hover:bg-zinc-50 rounded-xl transition-all"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <div className="p-1.5 sm:p-2 rounded-lg bg-zinc-100">
                          <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        Chat History
                      </Link>
                      <Link 
                        to="/feedback"
                        className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-xs sm:text-sm font-medium text-zinc-700 hover:bg-zinc-50 rounded-xl transition-all"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <div className="p-1.5 sm:p-2 rounded-lg bg-zinc-100">
                          <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        Send Feedback
                      </Link>
                      <Link 
                        to="/about"
                        className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-xs sm:text-sm font-medium text-zinc-700 hover:bg-zinc-50 rounded-xl transition-all"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <div className="p-1.5 sm:p-2 rounded-lg bg-zinc-100">
                          <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        About Nexora
                      </Link>
                      <Link 
                        to="/support"
                        className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-xs sm:text-sm font-medium text-zinc-700 hover:bg-zinc-50 rounded-xl transition-all"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <div className="p-1.5 sm:p-2 rounded-lg bg-zinc-100">
                          <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        <div className="flex-1 text-left">Support</div>
                        <PlusCircle className="w-3 h-3 text-zinc-300 -rotate-45" />
                      </Link>
                    </div>
                    <div className="p-1.5 sm:p-2">
                      <button 
                        onClick={() => signOut(auth)}
                        className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-xs sm:text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <div className="p-1.5 sm:p-2 rounded-lg bg-red-500/10">
                          <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-3 sm:space-y-4 custom-scrollbar relative z-10">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl mb-4">
               <img src="https://i.postimg.cc/sfn3qKJd/20260510-180148.png" className="w-12 h-12" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-zinc-800">Welcome to Nexora</h2>
              <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed px-4">
                {settings?.tagline || 'Your private AI Mentor for Business & Content Growth'}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-[280px]">
              {suggestions.map(s => (
                <button 
                  key={s} 
                  onClick={() => sendMessage(s)}
                  className="px-4 py-2 text-xs font-medium text-center bg-white border border-zinc-100 rounded-full shadow-sm hover:bg-zinc-50 transition-all text-[#075e54] flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3 h-3" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const isAI = msg.sender === 'AI';
            const isUser = msg.sender === 'user';
            const isAd = msg.type === 'ad';
            const adData = isAd ? ads.find(a => a.id === msg.adRef) : null;

            return (
              <motion.div 
                key={msg.id || idx}
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}
              >
                {isAd && adData ? (
                  <div className="max-w-[280px] sm:max-w-[320px] bg-white rounded-xl overflow-hidden shadow-md border border-zinc-200/50">
                    <img src={adData.image} className="w-full h-32 object-cover" referrerPolicy="no-referrer" />
                    <div className="p-3 space-y-2">
                       <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Sponsored</p>
                       <h3 className="text-xs font-bold text-zinc-900 leading-tight">{adData.title}</h3>
                       <a href={adData.link} target="_blank" className="block w-full py-1.5 bg-[#25d366]/10 text-[#075e54] text-center text-xs font-bold rounded-lg hover:bg-[#25d366]/20 transition-colors">
                         {adData.ctaText || 'View Offer'}
                       </a>
                    </div>
                  </div>
                ) : (
                  <div className={`relative max-w-[85%] sm:max-w-[70%] group`}>
                    <div 
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm relative`}
                      style={{ 
                        backgroundColor: isUser 
                          ? (theme?.userBubbleColor || '#8b5cf6') 
                          : (theme?.aiBubbleColor || '#f1f5f9'),
                        color: isUser ? '#ffffff' : (theme?.bubbleTextColor || '#1e293b'),
                      }}
                    >
                      <div className="prose prose-sm max-w-none text-inherit prose-p:my-0 leading-relaxed">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                      
                      <div className={`flex items-center justify-end gap-2 mt-1 opacity-60 text-[9px] uppercase font-bold tracking-tighter ${isUser ? 'text-white/80' : 'text-zinc-400'}`}>
                         {!isUser && (
                           <button 
                             onClick={() => copyToClipboard(msg.text, msg.id!)}
                             className="hover:text-zinc-900 transition-colors"
                             title="Copy message"
                           >
                             {copiedId === msg.id ? <Check className="w-2.5 h-2.5 text-green-600" /> : <Copy className="w-2.5 h-2.5" />}
                           </button>
                         )}
                         <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                         {isUser && <Check className="w-3 h-3 text-blue-500" />}
                      </div>
                    </div>
                    
                    {!isUser && (
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                        <button 
                          onClick={() => sendMessage("Re-explain this briefly")}
                          className="p-1 rounded-full hover:bg-zinc-200/50 text-zinc-400 hover:text-zinc-600 transition-all flex items-center gap-1"
                          title="Regenerate"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span className="text-[10px] font-bold">Regenerate</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white px-3 py-2 rounded-xl rounded-tl-none shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={scrollRef} />
      </main>

      {/* Input Area */}
      <footer 
        className="p-4 sm:p-6 border-t border-zinc-200"
        style={{ backgroundColor: theme?.footerColor || '#ffffff' }}
      >
        <div className="max-w-4xl mx-auto flex items-center gap-3 sm:gap-4">
          <div className="relative flex-1 group">
            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputText)}
              placeholder="Ask Nexora..."
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 pl-5 pr-14 py-3 sm:py-4 rounded-2xl outline-none focus:border-purple-500 hover:border-zinc-300 transition-all shadow-sm text-sm sm:text-base"
              id="chat-input"
            />
            <div className="absolute right-2 top-2 bottom-2 flex items-center">
              <button 
                onClick={() => sendMessage(inputText)}
                disabled={!inputText.trim() || isTyping}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all flex items-center justify-center ${
                  inputText.trim() && !isTyping 
                  ? 'text-white shadow-lg' 
                  : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                }`}
                style={{ 
                  backgroundColor: inputText.trim() && !isTyping 
                    ? (theme?.primaryColor || '#8b5cf6') 
                    : undefined 
                }}
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
