/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError } from '../../lib/firebase';
import { OperationType } from '../../types';
import { Sparkles, Save, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function AiManagement() {
  const [instruction, setInstruction] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchAiSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'ai_instructions'));
        if (docSnap.exists()) {
          setInstruction(docSnap.data().prompt || '');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'settings/ai_instructions');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAiSettings();
  }, []);

  const saveInstructions = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'ai_instructions'), {
        prompt: instruction,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/ai_instructions');
    } finally {
      setIsSaving(false);
    }
  };

  const defaultPrompt = `You are Nexora, a smart AI mentor for Creators and Entrepreneurs. 
Your goal is to help users grow their personal brand or business.

MODES:
1. Creator Mode: Focus on content creation, social media growth, viral hooks, scriptwriting, and community building.
2. Entrepreneur Mode: Focus on business models, low-budget startups, market strategy, branding, and monetization.

RESPONSE STRUCTURE (MANDATORY):
1. 📘 Simple Explanation: Define the concept clearly.
2. 🗺️ Step-by-Step Plan: A logical sequence of actions.
3. 💡 Real Example: A concrete scenario or case study.
4. ✅ Action List: Immediate tasks the user can do today.

Be encouraging, professional, and practical. Keep formatting clean using Markdown.`;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-600" />
          AI Brain Controller
        </h1>
        <p className="text-zinc-500">Fine-tune the behavior and instructions of the Nexora engine.</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900">System Instructions</h3>
            <button 
              onClick={() => setInstruction(defaultPrompt)}
              className="px-4 py-2 text-xs font-bold text-purple-600 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Default
            </button>
          </div>

          <div className="relative">
            <textarea 
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Enter system prompt for AI..."
              className="w-full h-[400px] bg-zinc-50 border border-zinc-200 rounded-3xl p-6 text-sm font-mono text-zinc-800 outline-none focus:border-purple-500 transition-all resize-none shadow-inner"
            />
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-zinc-900/5 backdrop-blur-sm rounded-lg text-[10px] font-bold text-zinc-500 uppercase tracking-widest border border-zinc-200/50">
              <ShieldCheck className="w-3 h-3" />
              Gemini 2.0 Pro Context
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={saveInstructions}
              disabled={isSaving}
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving Configuration...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Apply Changes
                </>
              )}
            </button>
            {saveSuccess && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-xl border border-green-100 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Updated successfully
              </motion.div>
            )}
          </div>
        </div>

        <div className="p-6 bg-zinc-900 border-t border-zinc-800">
          <div className="flex items-start gap-4 text-zinc-400">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-1" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">Security & Safety Warning</p>
              <p className="text-xs leading-relaxed opacity-70">
                Instructions provided here will directly affect AI behavior. Avoid including sensitive API keys, 
                personal data, or instructions that violate safety policies. Nexora will always prioritize 
                Gemini's core safety filters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
