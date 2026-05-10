/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError } from '../../lib/firebase';
import { AppSettings, OperationType } from '../../types';
import { Settings, Save, Loader2, CheckCircle2, Sparkles, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SettingsManagement() {
  const [formData, setFormData] = useState({
    tagline: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'main'));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            tagline: data.tagline || 'Your AI Mentor for Creator & Entrepreneurial Success'
          });
        } else {
          // Initialize defaults
          const defaultSettings = {
            tagline: 'Your AI Mentor for Creator & Entrepreneurial Success',
            updatedAt: serverTimestamp()
          };
          await setDoc(doc(db, 'settings', 'main'), defaultSettings);
          setFormData({ tagline: defaultSettings.tagline });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'main'), {
        ...formData,
        updatedAt: serverTimestamp()
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/main');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-zinc-900">App Settings</h2>
        <p className="text-zinc-500 text-sm">Manage global application appearance and configurations.</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 sm:p-12 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-zinc-100">
               <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Layout className="w-4 h-4 text-purple-600" />
               </div>
               <h3 className="font-bold text-zinc-900 text-lg">General Interface</h3>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2 px-1">
                <Sparkles className="w-4 h-4 text-amber-500" /> App Tagline (Slogan)
              </label>
              <textarea 
                rows={3}
                placeholder="Enter app slogan here..."
                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm outline-none focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/5 transition-all font-medium resize-none shadow-inner"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />
              <p className="text-[10px] text-zinc-400 px-1">This slogan appears in the header and landing sections. Keep it concise and inspiring.</p>
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
                  Settings saved successfully
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
                  Update Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-purple-50 border border-purple-100 rounded-[2rem] p-8 flex items-start gap-4">
        <Settings className="w-6 h-6 text-purple-500 mt-1" />
        <div className="space-y-1">
          <h4 className="font-bold text-purple-900">Advanced Customization</h4>
          <p className="text-purple-700 text-sm leading-relaxed">Nexora settings are reflected across all user interfaces instantly. Future updates will include theme selection and feature flags.</p>
        </div>
      </div>
    </div>
  );
}
