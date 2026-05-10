/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError } from '../../lib/firebase';
import { DeveloperInfo, OperationType } from '../../types';
import { User, Save, Loader2, CheckCircle2, FileText, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DeveloperManagement() {
  const [formData, setFormData] = useState({
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchDevInfo = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'developer', 'main'));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            bio: data.bio || ''
          });
        }
      } catch (error) {
        console.error("Error fetching developer info:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDevInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'developer', 'main'), {
        ...formData,
        updatedAt: serverTimestamp()
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'developer/main');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-zinc-900 text-left">Developer Identity</h2>
        <p className="text-zinc-500 text-sm text-left">Provide information about yourself so the AI can introduce you to users.</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 sm:p-12 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-zinc-100">
               <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-600" />
               </div>
               <h3 className="font-bold text-zinc-900 text-lg">Who are you? (Bio)</h3>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2 px-1">
                <FileText className="w-4 h-4 text-zinc-500" /> Developer Introduction
              </label>
              <textarea 
                rows={12}
                placeholder="Share your name, skills, and the story behind Nexora..."
                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all font-medium resize-none shadow-inner"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
              <p className="text-[10px] text-zinc-400 px-1 leading-relaxed">Nexora এই তথ্য ব্যবহার করে ব্যবহারকারীদের কাছে আপনার পরিচয় দিবে। এটি খুব বিস্তারিত এবং আকর্ষণীয় ভাবে লিখুন।</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
            <AnimatePresence>
              {showSuccess && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-green-600 font-bold text-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Developer info updated!
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
                  Save Identity
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-8 flex items-start gap-4">
        <Code className="w-6 h-6 text-indigo-500 mt-1" />
        <div className="space-y-1">
          <h4 className="font-bold text-indigo-900">How it works?</h4>
          <p className="text-indigo-700 text-sm leading-relaxed text-left">When a user asks: "Who created you?" or "Who is the developer?", the AI will reference the text you provided above to give a personal and accurate response.</p>
        </div>
      </div>
    </div>
  );
}
