/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError } from '../../lib/firebase';
import { Feedback, OperationType } from '../../types';
import { MessageSquare, Trash2, Calendar, User, Mail, Phone, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFeedbacks(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Feedback)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'feedbacks'));
    return unsubscribe;
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await deleteDoc(doc(db, 'feedbacks', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `feedbacks/${id}`);
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => 
    f.message.toLowerCase().includes(filter.toLowerCase()) ||
    f.name?.toLowerCase().includes(filter.toLowerCase()) ||
    f.email?.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-zinc-900">User Feedbacks</h2>
          <p className="text-zinc-500 text-sm">Review and manage feedback submitted by users.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text"
            placeholder="Search feedback..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm outline-none focus:border-zinc-900 transition-all"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredFeedbacks.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900">{item.name || 'Anonymous User'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                        <Calendar className="w-3 h-3" />
                        {item.createdAt?.toDate().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-zinc-50 rounded-2xl p-4 text-zinc-700 text-sm leading-relaxed italic border border-zinc-100">
                  "{item.message}"
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-500">
                  <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 rounded-lg">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="truncate">{item.email || 'No Email'}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 rounded-lg">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="truncate">{item.phone || 'No Phone'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredFeedbacks.length === 0 && (
        <div className="bg-zinc-50 rounded-[2.5rem] border-2 border-dashed border-zinc-200 p-20 text-center">
          <div className="p-4 bg-white rounded-full w-fit mx-auto mb-4 shadow-sm">
            <MessageSquare className="w-10 h-10 text-zinc-200" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900">No feedpack found</h3>
          <p className="text-zinc-500">Try adjusting your search or check back later.</p>
        </div>
      )}
    </div>
  );
}
