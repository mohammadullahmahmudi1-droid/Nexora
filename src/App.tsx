/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, loginWithGoogle } from './lib/firebase';
import { User, Role } from './types';
import ChatView from './components/ChatView';
import AdminDashboard from './components/Admin/AdminDashboard';
import AboutView from './components/AboutView';
import FeedbackView from './components/FeedbackView';
import SupportView from './components/SupportView';
import ChatHistory from './components/ChatHistory';
import { LogIn, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        let userData: User;
        
        if (!userDoc.exists()) {
          // Initialize user
          const newUser: User = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Anonymous',
            email: firebaseUser.email || '',
            photo: firebaseUser.photoURL || '',
            role: firebaseUser.email === 'mohammadullahmahmudi1@gmail.com' ? 'admin' : 'user',
            createdAt: new Date(),
          };
          
          await setDoc(userDocRef, {
            name: newUser.name,
            email: newUser.email,
            photo: newUser.photo,
            role: newUser.role,
            createdAt: serverTimestamp(),
          });
          userData = newUser;
        } else {
          const data = userDoc.data() as User;
          userData = {
            ...data,
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            role: firebaseUser.email === 'mohammadullahmahmudi1@gmail.com' ? 'admin' : data.role,
          };
        }
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  return (
    <ThemeProvider>
      <div className="h-screen bg-white text-zinc-900 transition-colors duration-300 italic-none">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : !user ? (
          <LoginScreen />
        ) : (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<ChatView user={user} />} />
              <Route path="/about" element={<AboutView />} />
              <Route path="/feedback" element={<FeedbackView />} />
              <Route path="/support" element={<SupportView />} />
              <Route path="/history" element={user ? <ChatHistory user={user} /> : <Navigate to="/" />} />
              <Route 
                path="/admin/*" 
                element={user.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/" />} 
              />
            </Routes>
          </BrowserRouter>
        )}
      </div>
    </ThemeProvider>
  );
}

function LoginScreen() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-4 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <img src="https://i.postimg.cc/sfn3qKJd/20260510-180148.png" alt="Nexora" className="w-32 mx-auto" referrerPolicy="no-referrer" />
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to Nexora</h1>
          <p className="text-zinc-600">Your AI Mentor for Creator & Entrepreneurial Success.</p>
        </div>
        <button 
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-zinc-900 text-white py-4 px-6 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-zinc-900/10"
          id="login-btn"
        >
          <LogIn className="w-5 h-5" />
          Sign in with Google
        </button>
      </motion.div>
    </div>
  );
}
