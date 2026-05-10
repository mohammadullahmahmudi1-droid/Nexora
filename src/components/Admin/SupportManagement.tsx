/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError } from '../../lib/firebase';
import { SupportConfig, OperationType } from '../../types';
import { MessageCircle, Mail, Facebook, Save, Loader2, CheckCircle2, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SupportManagement() {
  const [formData, setFormData] = useState({
    whatsapp: '',
    email: '',
    facebook: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'support', 'main'));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            whatsapp: data.whatsapp || '',
            email: data.email || '',
            facebook: data.facebook || ''
          });
        }
      } catch (error) {
        console.error("Error fetching support config:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'support', 'main'), {
        ...formData,
        updatedAt: serverTimestamp()
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'support/main');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-zinc-900">Support Management</h2>
        <p className="text-zinc-500 text-sm">Configure contact links and support information for users.</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 sm:p-12 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2 px-1">
                <MessageCircle className="w-4 h-4 text-green-500" /> WhatsApp Number
              </label>
              <input 
                type="text"
                placeholder="e.g. 88018XXXXXXXX"
                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm outline-none focus:bg-white focus:border-zinc-900 transition-all font-medium"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              />
              <p className="text-[10px] text-zinc-400 px-1">Country code সহ নাম্বার দিন (যেমন: 88017...)</p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2 px-1">
                <Mail className="w-4 h-4 text-blue-500" /> Email Address
              </label>
              <input 
                type="email"
                placeholder="support@nexora.com"
                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm outline-none focus:bg-white focus:border-zinc-900 transition-all font-medium"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2 px-1">
                <Facebook className="w-4 h-4 text-indigo-600" /> Facebook Page Link
              </label>
              <input 
                type="url"
                placeholder="https://facebook.com/nexora"
                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm outline-none focus:bg-white focus:border-zinc-900 transition-all font-medium"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
            <AnimatePresence>
              {showSuccess && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-green-600 font-bold text-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  সফলভাবে সেভ করা হয়েছে
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-8 flex items-start gap-4">
        <Headphones className="w-6 h-6 text-blue-500 mt-1" />
        <div className="space-y-1">
          <h4 className="font-bold text-blue-900">সাপোর্ট পেজ প্রিভিউ</h4>
          <p className="text-blue-700 text-sm">এই সেটিংসগুলো পরিবর্তন করলে ইউজারের সাপোর্ট পেজে (Support Center) তা সাথে সাথে আপডেট হয়ে যাবে।</p>
        </div>
      </div>
    </div>
  );
}
