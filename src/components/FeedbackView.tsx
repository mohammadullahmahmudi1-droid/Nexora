/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, auth } from '../lib/firebase';
import { OperationType } from '../types';
import { ChevronLeft, MessageSquare, Send, CheckCircle2, User, Mail, Phone, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function FeedbackView() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedbacks'), {
        ...formData,
        userId: auth.currentUser?.uid || null,
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'feedbacks');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-[2.5rem] p-12 text-center space-y-6 shadow-2xl border border-zinc-100"
        >
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">ধন্যবাদ!</h2>
          <p className="text-zinc-500 leading-relaxed">আপনার ফিডব্যাক সফলভাবে গ্রহণ করা হয়েছে। আপনার মতামত আমাদের সেবাকে আরও উন্নত করতে সাহায্য করবে।</p>
          <Link 
            to="/" 
            className="block w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all"
          >
            ফিরে যান
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans tracking-tight pb-12">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-zinc-200 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link 
            to="/" 
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">Feedback</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-12">
        <div className="text-center space-y-4 mb-12">
          <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">আপনার মতামত জানান</h2>
          <p className="text-zinc-500">আপনার অভিজ্ঞতার কথা আমাদের বলুন। আমরা সব সময় আপনার ফিডব্যাক শোনার জন্য মুখিয়ে আছি।</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2 px-1">
                <User className="w-3 h-3" /> আপনার নাম (ঐচ্ছিক)
              </label>
              <input 
                type="text"
                placeholder="নাম লিখুন"
                className="w-full bg-white border border-zinc-200 rounded-2xl p-4 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/5 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2 px-1">
                <Mail className="w-3 h-3" /> ইমেইল (ঐচ্ছিক)
              </label>
              <input 
                type="email"
                placeholder="example@mail.com"
                className="w-full bg-white border border-zinc-200 rounded-2xl p-4 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/5 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2 px-1">
              <Phone className="w-3 h-3" /> মোবাইল নাম্বার (ঐচ্ছিক)
            </label>
            <input 
              type="tel"
              placeholder="০১৮XXXXXXXX"
              className="w-full bg-white border border-zinc-200 rounded-2xl p-4 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/5 transition-all"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2 px-1">
              বার্তা বা ফিডব্যাক *
            </label>
            <textarea 
              required
              placeholder="আপনার কথা এখানে বিস্তারিত লিখুন..."
              className="w-full h-40 bg-white border border-zinc-200 rounded-2xl p-5 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/5 transition-all resize-none"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full h-16 flex items-center justify-center gap-3 bg-zinc-900 text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                ফিডব্যাক পাঠান
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
