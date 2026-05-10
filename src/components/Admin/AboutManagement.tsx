/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError } from '../../lib/firebase';
import { About, OperationType } from '../../types';
import { Save, Loader2, Target, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function AboutManagement() {
  const [formData, setFormData] = useState({
    mission: '',
    features: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const docRef = doc(db, 'about', 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as About;
          setFormData({
            mission: data.mission || '',
            features: data.features || ''
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'about/main');
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await setDoc(doc(db, 'about', 'main'), {
        ...formData,
        updatedAt: serverTimestamp()
      });
      setMessage({ type: 'success', text: 'About page content updated successfully!' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'about/main');
      setMessage({ type: 'error', text: 'Failed to update content.' });
    } finally {
      setSaving(false);
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
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center px-2">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-zinc-900">About Page Content</h2>
          <p className="text-zinc-500 text-sm">Manage the mission and features text displayed on the About page.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mission Section */}
          <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3 text-purple-600">
              <Target className="w-6 h-6" />
              <h3 className="text-xl font-bold">Mission Statement</h3>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Content (Supports Markdown)</label>
              <textarea 
                required
                className="w-full h-64 bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-sm outline-none focus:border-purple-500 focus:bg-white transition-all resize-none"
                placeholder="Nexora-র উদ্দেশ্য এখানে লিখুন..."
                value={formData.mission}
                onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
              />
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3 text-blue-600">
              <Sparkles className="w-6 h-6" />
              <h3 className="text-xl font-bold">Platform Features</h3>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Content (Supports Markdown)</label>
              <textarea 
                required
                className="w-full h-64 bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                placeholder="Nexora-র প্রধান ফিচারগুলো এখানে লিখুন..."
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-6 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-zinc-200 shadow-2xl">
          <div className="flex items-center gap-2">
            {message && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${
                  message.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                }`}
              >
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {message.text}
              </motion.div>
            )}
          </div>
          <button 
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-zinc-900 text-white rounded-2xl font-bold shadow-xl hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
