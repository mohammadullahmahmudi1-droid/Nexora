/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { About, OperationType } from '../types';
import { ChevronLeft, Info, Target, Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';

export default function AboutView() {
  const [content, setContent] = useState<About | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const docRef = doc(db, 'about', 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent({ id: docSnap.id, ...docSnap.data() } as About);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'about/main');
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
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
          <h1 className="text-xl font-bold">About Nexora</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 space-y-12">
        {/* Intro */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <img src="https://i.postimg.cc/sfn3qKJd/20260510-180148.png" className="w-12 h-12" alt="Nexora Logo" referrerPolicy="no-referrer" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight">Nexora: Your AI Mentor</h2>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
            Empowering the next generation of content creators and entrepreneurs with intelligent, localized AI guidance.
          </p>
        </motion.div>

        {/* Content Sections */}
        {content ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-xl space-y-6"
            >
              <div className="flex items-center gap-3 text-purple-600">
                <Target className="w-6 h-6" />
                <h3 className="text-xl font-bold">Our Mission</h3>
              </div>
              <div className="prose prose-zinc leading-relaxed text-zinc-600">
                <ReactMarkdown>{content.mission}</ReactMarkdown>
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-xl space-y-6"
            >
              <div className="flex items-center gap-3 text-blue-600">
                <Sparkles className="w-6 h-6" />
                <h3 className="text-xl font-bold">Key Features</h3>
              </div>
              <div className="prose prose-zinc leading-relaxed text-zinc-600">
                <ReactMarkdown>{content.features}</ReactMarkdown>
              </div>
            </motion.section>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-[2rem] border border-zinc-200 shadow-xl text-center space-y-4">
             <div className="p-4 bg-zinc-50 rounded-full w-fit mx-auto">
                <Info className="w-8 h-8 text-zinc-300" />
             </div>
             <p className="text-zinc-500">Content summary is coming soon. Stay tuned!</p>
          </div>
        )}

        {/* Footer info */}
        <div className="text-center pt-8 border-t border-zinc-200">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">© 2026 Nexora Platform</p>
        </div>
      </main>
    </div>
  );
}
