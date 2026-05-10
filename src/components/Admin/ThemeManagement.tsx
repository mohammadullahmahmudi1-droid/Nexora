/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError } from '../../lib/firebase';
import { OperationType, ThemeSettings } from '../../types';
import { Palette, Save, RotateCcw, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function ThemeManagement() {
  const [theme, setTheme] = useState<Partial<ThemeSettings>>({
    primaryColor: '#8b5cf6',
    secondaryColor: '#6d28d9',
    backgroundColor: '#f8fafc',
    headerColor: '#ffffff',
    headerTextColor: '#0f172a',
    footerColor: '#ffffff',
    userBubbleColor: '#8b5cf6',
    aiBubbleColor: '#f1f5f9',
    bubbleTextColor: '#1e293b'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'theme'));
        if (docSnap.exists()) {
          setTheme({ ...theme, ...docSnap.data() });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'settings/theme');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTheme();
  }, []);

  const saveTheme = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'theme'), {
        ...theme,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/theme');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefault = () => {
    setTheme({
      primaryColor: '#8b5cf6',
      secondaryColor: '#6d28d9',
      backgroundColor: '#f8fafc',
      headerColor: '#ffffff',
      headerTextColor: '#0f172a',
      footerColor: '#ffffff',
      userBubbleColor: '#8b5cf6',
      aiBubbleColor: '#f1f5f9',
      bubbleTextColor: '#1e293b'
    });
  };

  const ColorInput = ({ label, field, value }: { label: string, field: keyof ThemeSettings, value: string }) => (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</label>
      <div className="flex items-center gap-3">
        <input 
          type="color" 
          value={value}
          onChange={(e) => setTheme({ ...theme, [field]: e.target.value })}
          className="w-12 h-12 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none"
        />
        <input 
          type="text" 
          value={value}
          onChange={(e) => setTheme({ ...theme, [field]: e.target.value })}
          className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-4 text-sm font-mono text-zinc-800 outline-none focus:border-purple-500 transition-all"
        />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-3 italic">
            <Palette className="w-8 h-8 text-purple-600" />
            Visual Identity
          </h1>
          <p className="text-zinc-500">Customize the colors and theme of the Nexora platform.</p>
        </div>
        <button 
          onClick={resetToDefault}
          className="px-6 py-2.5 text-xs font-bold text-zinc-600 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors flex items-center gap-2 w-fit lg:shadow-md"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Nexora Style
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="p-8 space-y-10">
          <section className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 border-l-4 border-purple-500 pl-4">Core Branding</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ColorInput label="Primary Action Color (e.g. Send Button)" field="primaryColor" value={theme.primaryColor!} />
              <ColorInput label="Secondary Brand Color" field="secondaryColor" value={theme.secondaryColor!} />
              <ColorInput label="Overall Page Background" field="backgroundColor" value={theme.backgroundColor!} />
              <ColorInput label="Footer/Input Area Background" field="footerColor" value={theme.footerColor!} />
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 border-l-4 border-blue-500 pl-4">Header Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ColorInput label="Header Background" field="headerColor" value={theme.headerColor!} />
              <ColorInput label="Header Text Color" field="headerTextColor" value={theme.headerTextColor!} />
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 border-l-4 border-green-500 pl-4">Chat Bubbles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ColorInput label="User Message Bubble" field="userBubbleColor" value={theme.userBubbleColor!} />
              <ColorInput label="AI Message Bubble" field="aiBubbleColor" value={theme.aiBubbleColor!} />
              <ColorInput label="Message Text Color" field="bubbleTextColor" value={theme.bubbleTextColor!} />
            </div>
          </section>

          <div className="flex items-center gap-4 pt-4">
            <button 
              onClick={saveTheme}
              disabled={isSaving}
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-10 py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-xl shadow-purple-600/20 active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating Theme...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Apply Theme
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
      </div>

      {/* Preview Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-zinc-900 italic pl-2">Live Preview</h3>
        <div 
          className="border border-zinc-200 rounded-[2.5rem] overflow-hidden shadow-2xl h-[400px] flex flex-col relative"
          style={{ backgroundColor: theme.backgroundColor }}
        >
          <header 
            className="px-6 py-4 flex items-center justify-between border-b border-zinc-200/50"
            style={{ backgroundColor: theme.headerColor, color: theme.headerTextColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-200" />
              <span className="font-bold">Nexora Chat Preview</span>
            </div>
          </header>
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            <div className="flex justify-start">
              <div 
                className="px-4 py-2 rounded-2xl rounded-tl-none text-sm shadow-sm max-w-[80%]"
                style={{ backgroundColor: theme.aiBubbleColor, color: theme.bubbleTextColor }}
              >
                Hi, I'm Nexora. This is a preview of the AI response appearance.
              </div>
            </div>
            <div className="flex justify-end">
              <div 
                className="px-4 py-2 rounded-2xl rounded-tr-none text-sm shadow-sm max-w-[80%]"
                style={{ backgroundColor: theme.userBubbleColor, color: theme.bubbleTextColor }}
              >
                This is how user messages will look with your new theme!
              </div>
            </div>
          </div>
          <footer 
            className="p-4 flex gap-3"
            style={{ backgroundColor: theme.footerColor }}
          >
            <div className="flex-1 h-10 bg-white rounded-xl border border-zinc-200" />
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <Save className="w-5 h-5" />
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
