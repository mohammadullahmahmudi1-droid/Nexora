/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError } from '../../lib/firebase';
import { Ad, OperationType, Role } from '../../types';
import { Plus, Trash2, ExternalLink, Power, PowerOff, Image as ImageIcon, Megaphone } from 'lucide-react';

export default function AdManagement() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    link: '',
    ctaText: 'Learn More',
    allowedRoles: ['user'] as Role[]
  });

  useEffect(() => {
    const q = query(collection(db, 'ads'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const adsData = snapshot.docs.map(d => {
        const data = d.data();
        // Migration: Ensure allowedRoles exists
        if (!data.allowedRoles) {
          updateDoc(doc(db, 'ads', d.id), { allowedRoles: ['user', 'admin'] });
        }
        return { id: d.id, ...data } as Ad;
      });
      setAds(adsData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'ads'));
    return unsubscribe;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'ads'), {
      ...formData,
      active: true,
      createdAt: serverTimestamp()
    });
    setFormData({ title: '', image: '', link: '', ctaText: 'Learn More', allowedRoles: ['user'] });
    setShowForm(false);
  };

  const toggleAd = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'ads', id), { active: !current });
  };

  const deleteAd = async (id: string) => {
    if (confirm('Delete this ad?')) {
      await deleteDoc(doc(db, 'ads', id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-zinc-900">Ad Management</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-600/20 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Create New Ad
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 lg:p-8 bg-white border border-zinc-200 rounded-[2rem] space-y-6 animate-in fade-in slide-in-from-top-4 duration-300 shadow-xl transition-colors">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Ad Title</label>
                <input 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 outline-none focus:border-purple-500 text-zinc-900"
                  placeholder="e.g. Master the reels algorithm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">CTA Link</label>
                <input 
                  required
                  value={formData.link}
                  onChange={e => setFormData({...formData, link: e.target.value})}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 outline-none focus:border-purple-500 text-zinc-900"
                  placeholder="https://example.com/course"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">CTA Button Text</label>
                <input 
                  required
                  value={formData.ctaText}
                  onChange={e => setFormData({...formData, ctaText: e.target.value})}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 outline-none focus:border-purple-500 text-zinc-900"
                  placeholder="e.g. Join Now, Learn More"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Image URL</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input 
                    required
                    value={formData.image}
                    onChange={e => setFormData({...formData, image: e.target.value})}
                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 outline-none focus:border-purple-500 text-zinc-900"
                    placeholder="https://i.postimg.cc/..."
                  />
                  {formData.image && (
                    <div className="w-full sm:w-12 h-24 sm:h-12 rounded-xl border border-zinc-200 overflow-hidden shrink-0">
                      <img src={formData.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Visible To (Roles)</label>
                <div className="flex gap-4">
                  {['user', 'admin'].map(role => (
                    <label key={role} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={formData.allowedRoles.includes(role as any)}
                        onChange={e => {
                          const roles = e.target.checked 
                            ? [...formData.allowedRoles, role]
                            : formData.allowedRoles.filter(r => r !== role);
                          setFormData({...formData, allowedRoles: roles as any});
                        }}
                        className="w-4 h-4 rounded border-zinc-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-zinc-700 capitalize">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
           </div>
           <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors order-2 sm:order-1">Cancel</button>
              <button type="submit" className="px-8 py-2.5 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity order-1 sm:order-2">Save Advertisement</button>
           </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad) => (
          <div key={ad.id} className="group bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-xl hover:border-zinc-300 transition-all">
            <div className="relative h-40 group-hover:h-44 transition-all duration-500">
               <img src={ad.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-60" />
               <div className={`absolute top-4 right-4 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                 ad.active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
               }`}>
                 {ad.active ? 'Active' : 'Disabled'}
               </div>
            </div>
            <div className="p-6 space-y-4">
               <div className="flex justify-between items-start">
                 <div className="flex-1 min-w-0">
                   <h3 className="font-bold text-lg leading-tight truncate text-zinc-900">{ad.title}</h3>
                   <p className="text-xs text-zinc-500 mt-1 truncate">{ad.link}</p>
                 </div>
                 <div className="flex flex-wrap gap-1 ml-2">
                   {ad.allowedRoles?.map(role => (
                     <span key={role} className="px-1.5 py-0.5 bg-zinc-100 text-[9px] font-bold uppercase text-zinc-600 rounded">
                       {role}
                     </span>
                   ))}
                 </div>
               </div>
               <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleAd(ad.id, ad.active)}
                      className={`p-2 rounded-lg transition-colors ${
                        ad.active ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                      }`}
                      title={ad.active ? 'Deactivate' : 'Activate'}
                    >
                      {ad.active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => deleteAd(ad.id)}
                      className="p-2 rounded-lg bg-zinc-100 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Delete Ad"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <a href={ad.link} target="_blank" className="p-2 rounded-lg bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
               </div>
            </div>
          </div>
        ))}

        {ads.length === 0 && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 h-64 border-2 border-dashed border-zinc-200 rounded-[2rem] flex flex-col items-center justify-center text-zinc-400 gap-4 transition-colors">
             <Megaphone className="w-12 h-12" />
             <p className="font-bold text-center px-4">No advertisements found. Create your first ad campaign.</p>
          </div>
        )}
      </div>
    </div>
  );
}
