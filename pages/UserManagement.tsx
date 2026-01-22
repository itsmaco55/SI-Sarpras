
import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Key, 
  Shield, 
  Search, 
  X, 
  Eye, 
  EyeOff, 
  Lock,
  UserPlus
} from 'lucide-react';
import { User, UserRole } from '../types';

interface UserManagementProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUser: User;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers, currentUser }) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState<Partial<User>>({
    fullName: '',
    username: '',
    password: '',
    role: UserRole.GURU
  });

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.fullName.toLowerCase().includes(search.toLowerCase()) || 
      u.username.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate uniqueness
    const isTaken = users.some(u => u.username === formData.username && u.id !== editingUser?.id);
    if (isTaken) {
      alert('Username sudah digunakan! Silakan gunakan username lain.');
      return;
    }

    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData } as User : u));
    } else {
      const newUser: User = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      } as User;
      setUsers(prev => [...prev, newUser]);
    }
    
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ fullName: '', username: '', password: '', role: UserRole.GURU });
  };

  const deleteUser = (id: string) => {
    if (id === currentUser.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri demi keamanan sistem.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini secara permanen?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const openModal = (user: User | null = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ ...user });
    } else {
      setEditingUser(null);
      setFormData({ fullName: '', username: '', password: '', role: UserRole.GURU });
    }
    setShowPassword(false);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
            <Users size={32} className="text-indigo-600" /> Pengaturan Pengguna
          </h2>
          <p className="text-slate-400 text-sm font-medium">Administrator dapat mengelola kredensial dan hak akses seluruh staff</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
        >
          <UserPlus size={18} /> Tambah Pengguna Baru
        </button>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari berdasarkan nama atau username..."
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-bold text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-50">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-8 py-5 font-black uppercase text-[10px] text-slate-400 tracking-wider">Identitas Pengguna</th>
                <th className="px-8 py-5 font-black uppercase text-[10px] text-slate-400 tracking-wider">Role / Hak Akses</th>
                <th className="px-8 py-5 font-black uppercase text-[10px] text-slate-400 tracking-wider">Kredensial</th>
                <th className="px-8 py-5 font-black uppercase text-[10px] text-slate-400 tracking-wider text-right">Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-100">
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-700 text-base">{u.fullName}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">ID: {u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                      u.role === UserRole.ADMIN ? 'bg-indigo-900 text-white border-indigo-900' :
                      u.role === UserRole.GURU ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      <Shield size={12} /> {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-slate-500 text-xs">Username: <span className="text-slate-800 font-mono">@{u.username}</span></p>
                    <div className="flex items-center gap-2 mt-1">
                      <Lock size={10} className="text-slate-300" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password Terenkripsi</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openModal(u)} 
                        className="p-3 bg-white text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm border border-slate-100 transition-all active:scale-90"
                        title="Edit User/Password"
                      >
                        <Key size={18} />
                      </button>
                      <button 
                        onClick={() => deleteUser(u.id)} 
                        disabled={u.id === currentUser.id}
                        className={`p-3 bg-white rounded-xl shadow-sm border border-slate-100 transition-all active:scale-90 ${u.id === currentUser.id ? 'text-slate-100 opacity-50 cursor-not-allowed' : 'text-slate-400 hover:text-rose-600'}`}
                        title="Hapus User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{editingUser ? 'Perbarui Kredensial' : 'Pendaftaran User'}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mt-1">Lengkapi detail akun di bawah ini</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X className="text-slate-300" size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Nama Lengkap Staff</label>
                <input 
                  type="text" required 
                  placeholder="Contoh: Budi Santoso, M.Pd"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-bold text-slate-700"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Username</label>
                  <input 
                    type="text" required 
                    placeholder="username"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-bold text-indigo-600 font-mono"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g, '')})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Level Akses</label>
                  <select 
                    required 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-black text-xs uppercase tracking-widest text-slate-600 cursor-pointer"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                  >
                    <option value={UserRole.ADMIN}>ADMINISTRATOR</option>
                    <option value={UserRole.GURU}>GURU / STAFF</option>
                    <option value={UserRole.SISWA}>SISWA / USER</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1 flex justify-between">
                  Tentukan Password
                  <span className="text-rose-500 font-black">Wajib Diisi</span>
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    placeholder="Min. 6 karakter"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-bold"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="mt-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <p className="text-[10px] text-indigo-700 font-bold leading-relaxed italic">
                    * {editingUser ? 'Biarkan atau ketik password baru untuk mereset kredensial user ini.' : 'Tentukan password awal yang kuat untuk keamanan data sekolah.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-colors">Batal</button>
                <button type="submit" className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all">Simpan & Perbarui</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
