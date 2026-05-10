/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  MessagesSquare, 
  LayoutGrid, 
  Megaphone, 
  LineChart, 
  Settings, 
  LogOut, 
  Search,
  MoreVertical,
  Activity,
  Menu,
  X,
  Globe,
  MessageSquare,
  Headphones,
  User,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Palette
} from 'lucide-react';
import { User as UserType } from '../../types';
import UserManagement from './UserManagement';
import ChatManagement from './ChatManagement';
import AiManagement from './AiManagement';
import AdManagement from './AdManagement';
import AnalyticsView from './AnalyticsView';
import AboutManagement from './AboutManagement';
import FeedbackManagement from './FeedbackManagement';
import SupportManagement from './SupportManagement';
import SettingsManagement from './SettingsManagement';
import DeveloperManagement from './DeveloperManagement';
import ThemeManagement from './ThemeManagement';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  user: UserType;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [currentPath]);

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutGrid },
    { name: 'Users', path: '/admin/users', icon: Shield },
    { name: 'AI Controller', path: '/admin/ai', icon: Sparkles },
    { name: 'Chats', path: '/admin/chats', icon: MessagesSquare },
    { name: 'Ads', path: '/admin/ads', icon: Megaphone },
    { name: 'Analytics', path: '/admin/analytics', icon: LineChart },
    { name: 'Visual Identity', path: '/admin/theme', icon: Palette },
    { name: 'Feedbacks', path: '/admin/feedbacks', icon: MessageSquare },
    { name: 'Support', path: '/admin/support', icon: Headphones },
    { name: 'Developer', path: '/admin/developer', icon: User },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'About Page', path: '/admin/about', icon: Globe },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="https://i.postimg.cc/sfn3qKJd/20260510-180148.png" className="w-8 h-8" referrerPolicy="no-referrer" />
          <h2 className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-500 bg-clip-text text-transparent">Nexora Admin</h2>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 py-4">
        {menuItems.map((item) => {
           const Icon = item.icon;
           const active = currentPath === item.path;
           return (
             <Link 
               key={item.path} 
               to={item.path}
               className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                 active ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900'
               }`}
             >
               <Icon className="w-5 h-5" />
               {item.name}
             </Link>
           );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-200 space-y-3">
         <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-zinc-200">
           {user.photo ? <img src={user.photo} className="w-10 h-10 rounded-full border border-zinc-200" referrerPolicy="no-referrer" /> : <div className="w-10 h-10 rounded-full bg-zinc-200" />}
           <div className="flex-1 min-w-0">
             <p className="text-sm font-bold truncate text-zinc-900">{user.name}</p>
             <p className="text-xs text-zinc-500 truncate">Super Admin</p>
           </div>
         </div>
         <button 
           onClick={() => signOut(auth)}
           className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
         >
           <LogOut className="w-4 h-4" />
           Sign Out
         </button>
      </div>
    </>
  );

  return (
    <div className="h-screen flex bg-white text-zinc-900 overflow-hidden font-sans relative">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-zinc-200 bg-zinc-50 flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-72 bg-zinc-50 z-50 flex flex-col shadow-2xl lg:hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 text-zinc-900 relative">
        <header className="h-20 border-b border-zinc-200 px-4 lg:px-8 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-10 w-full">
           <div className="flex items-center gap-4 flex-1">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="relative max-w-sm lg:max-w-md w-full hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  placeholder="Global search..." 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-purple-500 transition-all text-zinc-900"
                />
              </div>
           </div>
           
           <div className="flex items-center gap-3 lg:gap-4">
              <Link to="/" className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 transition-colors">User App</Link>
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-200 flex-shrink-0">
                <Settings className="w-5 h-5 text-zinc-400" />
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-zinc-50 custom-scrollbar">
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/ai" element={<AiManagement />} />
            <Route path="/chats" element={<ChatManagement />} />
            <Route path="/ads" element={<AdManagement />} />
            <Route path="/analytics" element={<AnalyticsView />} />
            <Route path="/theme" element={<ThemeManagement />} />
            <Route path="/about" element={<AboutManagement />} />
            <Route path="/feedbacks" element={<FeedbackManagement />} />
            <Route path="/support" element={<SupportManagement />} />
            <Route path="/developer" element={<DeveloperManagement />} />
            <Route path="/settings" element={<SettingsManagement />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function AdminHome() {
  const [stats, setStats] = useState({
    users: 0,
    chats: 0,
    messages: 0,
    active: 'Online'
  });

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => setStats(p => ({ ...p, users: snap.size })));
    const unsubChats = onSnapshot(collection(db, 'chats'), (snap) => setStats(p => ({ ...p, chats: snap.size })));
    
    return () => {
      unsubUsers();
      unsubChats();
    };
  }, []);

  const statCards = [
    { name: 'Platform Users', value: stats.users, trend: '+Real-time', icon: Shield, color: 'text-blue-500' },
    { name: 'Active Sessions', value: stats.chats, trend: 'Active', icon: Activity, color: 'text-green-500' },
    { name: 'System Status', value: stats.active, trend: 'Stable', icon: MessagesSquare, color: 'text-purple-500' },
    { name: 'Global Uptime', value: '99.9%', trend: 'Verified', icon: Megaphone, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 italic">Command Center Overview</h1>
          <p className="text-zinc-500">Nexora Ecosystem monitoring and control unit.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="p-5 lg:p-6 bg-white border border-zinc-200 rounded-3xl space-y-4 shadow-xl transition-all hover:border-purple-500/20">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl bg-zinc-50 border border-zinc-100 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full uppercase tracking-widest">{stat.trend}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">{stat.name}</p>
                <h3 className="text-2xl lg:text-3xl font-bold tracking-tighter text-zinc-900">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 p-8 bg-zinc-900 rounded-[3rem] h-[300px] lg:h-[400px] flex flex-col justify-end relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-purple-600/20 to-transparent pointer-events-none" />
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-[0.2em]">Live Performance</div>
              <h3 className="text-3xl font-bold text-white tracking-tight">Ecosystem Health is Optimal</h3>
              <p className="text-zinc-400 text-sm max-w-md">The Nexora engine and database nodes are synchronized. Gemini 2.0 Pro model is active for high-fidelity mentoring.</p>
            </div>
            <div className="absolute top-12 right-12 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-48 h-48 text-white" />
            </div>
         </div>
         
         <div className="p-8 bg-white border border-zinc-200 rounded-[3rem] space-y-8 shadow-xl">
            <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-purple-600" />
              Security Node
            </h3>
            <div className="space-y-6">
               <div className="space-y-2">
                 <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-400">
                   <span>Rule Enforcement</span>
                   <span className="text-green-600">Active</span>
                 </div>
                 <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                   <div className="h-full bg-green-500 w-[100%]" />
                 </div>
               </div>
               <div className="space-y-2">
                 <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-400">
                   <span>Auth Sync</span>
                   <span className="text-blue-600">Secure</span>
                 </div>
                 <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500 w-[100%]" />
                 </div>
               </div>
               <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                 <p className="text-[10px] text-zinc-500 font-medium leading-relaxed italic">"Security protocols are managing user status and blocking logic in real-time."</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
