
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Layers } from 'lucide-react';
import { Category, SubCategory, User, UserRole } from '../types';

interface SubCategoriesProps {
  subCategories: SubCategory[];
  setSubCategories: React.Dispatch<React.SetStateAction<SubCategory[]>>;
  categories: Category[];
  user: User;
}

const SubCategories: React.FC<SubCategoriesProps> = ({ subCategories, setSubCategories, categories, user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<SubCategory | null>(null);
  const [formData, setFormData] = useState<Partial<SubCategory>>({
    categoryId: '',
    name: '',
    code: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSub) {
      setSubCategories(prev => prev.map(s => s.id === editingSub.id ? { ...s, ...formData } as SubCategory : s));
    } else {
      const newSub: SubCategory = {
        id: 'sc' + Math.random().toString(36).substr(2, 5),
        categoryId: formData.categoryId || '',
        name: formData.name || '',
        code: formData.code || ''
      };
      setSubCategories(prev => [...prev, newSub]);
    }
    setIsModalOpen(false);
    setEditingSub(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">Master Sub Jenis Barang</h3>
        {user.role === UserRole.ADMIN && (
          <button 
            onClick={() => { 
              setEditingSub(null); 
              setFormData({ categoryId: categories[0]?.id || '', name: '', code: '' }); 
              setIsModalOpen(true); 
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold shadow-md shadow-indigo-100"
          >
            <Plus size={20} /> Tambah Sub Jenis
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Jenis Utama</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Kode Sub</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nama Sub Jenis</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {subCategories.map(sub => (
              <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-slate-400">
                    {categories.find(c => c.id === sub.categoryId)?.name || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono font-black text-indigo-600">{sub.code}</td>
                <td className="px-6 py-4 font-semibold text-slate-700">{sub.name}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    {user.role === UserRole.ADMIN && (
                      <>
                        <button onClick={() => { setEditingSub(sub); setFormData(sub); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => setSubCategories(prev => prev.filter(s => s.id !== sub.id))} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full">
            <h3 className="text-xl font-bold text-slate-800 mb-6">{editingSub ? 'Edit' : 'Tambah'} Sub Jenis</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Pilih Jenis Utama</label>
                <select 
                  required className="w-full p-2 border border-slate-200 rounded-lg"
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="">-- Pilih --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Kode Sub Prefix (2 Digit)</label>
                <input 
                  type="text" required maxLength={2} minLength={2}
                  placeholder="Contoh: 05"
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.replace(/\D/g, '') })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Sub Jenis</label>
                <input 
                  type="text" required
                  placeholder="Contoh: Komputer, Kursi Kayu..."
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-slate-100 rounded-xl font-bold">Batal</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategories;
