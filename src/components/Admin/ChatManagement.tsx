/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { collection, query, onSnapshot, orderBy, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError } from '../../lib/firebase';
import { Chat, Message, User, OperationType } from '../../types';
import { Search, ChevronRight, MessageSquare, Clock, User as UserIcon, ArrowLeft, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

export default function ChatManagement() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatSearch, setChatSearch] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const logScrollRef = useRef<HTMLDivElement>(null);

  const filteredChats = chats.filter(chat => {
    const u = users[chat.userId];
    const searchLow = chatSearch.toLowerCase();
    return u?.name?.toLowerCase().includes(searchLow) || 
           u?.email?.toLowerCase().includes(searchLow) || 
           chat.id.toLowerCase().includes(searchLow);
  });

  const sendReply = async () => {
    if (!replyText.trim() || !selectedChatId || isSending) return;
    setIsSending(true);
    try {
      const chat = chats.find(c => c.id === selectedChatId);
      if (!chat) return;

      const messageData: Partial<Message> = {
        chatId: selectedChatId,
        userId: chat.userId,
        sender: 'admin',
        text: replyText,
        timestamp: serverTimestamp(),
        type: 'chat'
      };

      await addDoc(collection(db, 'chats', selectedChatId, 'messages'), messageData);
      await updateDoc(doc(db, 'chats', selectedChatId), {
        lastMessage: replyText,
        updatedAt: serverTimestamp()
      });
      setReplyText('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `chats/${selectedChatId}/messages`);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      logScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const q = query(collection(db, 'chats'), orderBy('updatedAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Chat)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'chats'));
  }, []);

  useEffect(() => {
    // Fetch users for names
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'));
        const snapshot = await getDocs(q);
        const userMap: Record<string, User> = {};
        snapshot.docs.forEach(d => {
          userMap[d.id] = { id: d.id, ...d.data() } as User;
        });
        setUsers(userMap);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'users');
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedChatId) return;
    const q = query(collection(db, 'chats', selectedChatId, 'messages'), orderBy('timestamp', 'asc'));
    return onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `chats/${selectedChatId}/messages`));
  }, [selectedChatId]);

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 lg:gap-8 text-zinc-900 overflow-hidden">
      {/* Sessions List */}
      <div className={`w-full lg:w-80 flex flex-col gap-4 lg:gap-6 ${selectedChatId ? 'hidden lg:flex' : 'flex'}`}>
        <h2 className="text-2xl font-bold text-zinc-900">Chat Sessions</h2>
        <div className="flex-1 bg-white border border-zinc-200 rounded-[2rem] overflow-hidden flex flex-col transition-colors min-h-0">
          <div className="p-4 border-b border-zinc-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                placeholder="Search sessions..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 pl-10 pr-4 text-xs outline-none text-zinc-900"
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {filteredChats.map((chat) => {
              const u = users[chat.userId];
              const active = selectedChatId === chat.id;
              return (
                <button 
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`w-full p-4 flex items-start gap-3 border-b border-zinc-100 text-left transition-all ${
                    active ? 'bg-purple-600/10 border-l-4 border-l-purple-500' : 'hover:bg-zinc-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200 overflow-hidden shrink-0">
                    {u?.photo ? <img src={u.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <UserIcon className="w-5 h-5 text-zinc-400" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-bold truncate text-zinc-900 flex items-center gap-2">
                        {u?.name || 'Loading...'}
                        {chat.isSupport && <span className="bg-blue-500/10 text-blue-600 text-[8px] px-1.5 py-0.5 rounded-full border border-blue-500/20">Support</span>}
                      </p>
                      <Clock className="w-3 h-3 text-zinc-400" />
                    </div>
                    <p className="text-xs text-zinc-500 truncate">{chat.lastMessage}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Message Viewer */}
      <div className={`flex-1 flex flex-col gap-4 lg:gap-6 ${!selectedChatId ? 'hidden lg:flex' : 'flex'}`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedChatId(null)}
            className="lg:hidden p-2 bg-white border border-zinc-200 rounded-xl text-zinc-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-zinc-900">Conversation Log</h2>
        </div>
        
        <div className="flex-1 bg-white border border-zinc-200 rounded-[2rem] overflow-hidden flex flex-col shadow-xl transition-colors min-h-0">
          {selectedChatId ? (
            <>
              <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
                 <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-purple-500" />
                    <h3 className="font-bold text-sm text-zinc-900">Session ID: {selectedChatId.slice(0, 8)}...</h3>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 custom-scrollbar">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-1 px-2`}>
                      {msg.sender === 'user' ? (users[msg.userId]?.name || 'User') : msg.sender}
                    </div>
                    <div className={`max-w-[90%] lg:max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user' ? 'bg-purple-600 text-white' : 'bg-zinc-100 text-zinc-800'
                    }`}>
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                ))}
                <div ref={logScrollRef} />
              </div>
              
              {/* Admin Reply Area */}
              <div className="p-4 border-t border-zinc-200 bg-white">
                <div className="flex gap-2">
                  <input 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                    placeholder="Type your response..."
                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-purple-500 transition-colors"
                  />
                  <button 
                    onClick={sendReply}
                    disabled={!replyText.trim() || isSending}
                    className={`p-2 rounded-xl transition-all ${
                      replyText.trim() && !isSending 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                      : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 lg:p-12 space-y-4">
              <div className="p-6 rounded-full bg-zinc-50">
                <MessageSquare className="w-12 h-12 text-zinc-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Select a conversation</h3>
                <p className="text-zinc-500 text-sm">Pick a user session from the list on the left to monitor the chat history.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
