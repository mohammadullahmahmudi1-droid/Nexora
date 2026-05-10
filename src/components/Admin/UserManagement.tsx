/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError } from '../../lib/firebase';
import { User, OperationType } from '../../types';
import { Shield, Trash2, UserPlus, Search, ShieldAlert, CheckCircle } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));
  }, []);

  const toggleAdmin = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await updateDoc(doc(db, 'users', userId), { role: newRole });
  };

  const toggleBlock = async (userId: string, currentStatus?: string) => {
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    await updateDoc(doc(db, 'users', userId), { status: newStatus });
  };

  const deleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteDoc(doc(db, 'users', userId));
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-zinc-900">User Management</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <div className="relative w-full sm:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
             <input 
               placeholder="Search name or email..."
               className="bg-white border border-zinc-200 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-purple-500 w-full text-zinc-900 transition-colors"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-[2rem] overflow-hidden shadow-xl transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Joined</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredUsers.map((u) => (
                <tr key={u.id || u.uid} className="group hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {u.photo ? (
                        <img src={u.photo} className="w-10 h-10 rounded-full border border-zinc-200" referrerPolicy="no-referrer" />
                      ) : (
                         <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-500 uppercase">{u.name?.charAt(0)}</div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-zinc-900 truncate flex items-center gap-2">
                          {u.name}
                          {u.status === 'blocked' && <span className="bg-red-500/10 text-red-600 text-[8px] px-1.5 py-0.5 rounded-full border border-red-500/20">Blocked</span>}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                       u.role === 'admin' ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' : 'bg-zinc-100 text-zinc-600'
                     }`}>
                       {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                       {u.role}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">
                    {u.createdAt ? new Date((u.createdAt as any).seconds * 1000).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toggleBlock(u.id || u.uid, u.status)}
                        className={`p-2 rounded-lg transition-all ${
                          u.status === 'blocked' 
                          ? 'bg-green-500/10 text-green-600 hover:bg-green-200' 
                          : 'bg-red-500/10 text-red-600 hover:bg-red-200'
                        }`}
                        title={u.status === 'blocked' ? 'Unblock User' : 'Block User'}
                      >
                        {u.status === 'blocked' ? <CheckCircle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => toggleAdmin(u.id || u.uid, u.role)}
                        className="p-2 rounded-lg hover:bg-zinc-200 text-zinc-400 hover:text-purple-500"
                        title={u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteUser(u.id || u.uid)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-500"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
