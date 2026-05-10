/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { User, Chat, OperationType } from '../types';
import { ChevronLeft, MessageCircle, Calendar, ArrowRight, Loader2, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

interface ChatHistoryProps {
  user: User;
}

export default function ChatHistory({ user }: ChatHistoryProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, 'chats'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'chats'));

    return unsubscribe;
  }, [user.uid]);

  const filteredChats = chats.filter(c => 
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 font-sans tracking-tight">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-zinc-200 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-bold text-zinc-900">Chat History</h1>
          </div>
          <div className="bg-zinc-900 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            {chats.length} Sessions
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input 
            type="text"
            placeholder="Search conversations..."
            className="w-full bg-white border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <p className="text-zinc-500 text-sm font-medium">Retrieving your messages...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-24 bg-white border border-zinc-200 rounded-[2.5rem] space-y-4">
            <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto">
              <MessageCircle className="w-8 h-8 text-zinc-300" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">No chats found</h3>
            <p className="text-zinc-500 max-w-xs mx-auto">You haven't started any conversations with Nexora yet, or no matches found.</p>
            <Link 
              to="/"
              className="inline-block px-8 py-3 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20"
            >
              Start New Chat
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredChats.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate('/', { state: { resumeChatId: chat.id } })}
                className="group p-5 bg-white border border-zinc-200 rounded-3xl hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/5 transition-all cursor-pointer flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-zinc-900 font-bold truncate group-hover:text-purple-600 transition-colors">
                    {chat.lastMessage}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                      <Calendar className="w-3 h-3" />
                      {chat.updatedAt?.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-300 group-hover:text-purple-500 transition-all group-hover:translate-x-1" />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
