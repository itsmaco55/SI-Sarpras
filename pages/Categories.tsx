
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tags } from 'lucide-react';
import { Category, User, UserRole } from '../types';

interface CategoriesProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  user: User;
}

const Categories: React.FC<CategoriesProps> = ({ categories, setCategories, user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    code: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...formData } as Category : c));
    } else {
      const newCategory: Category = {
        id: 'c' + Math.random().toString(36).substr(2, 5),
        name: formData.name || '',
        code: formData.code || ''
      };
      setCategories(prev => [...prev, newCategory]);
    }
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const deleteCategory = (id: string) => {
    if (confirm('Menghapus jenis barang ini mungkin mempengaruhi data inventory. Lanjutkan?')) {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">Master Jenis Barang</h3>
        {user.role === UserRole.ADMIN && (
          <button 
            onClick={() => { setEditingCategory(null); setFormData({ name: '', code: '' }); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold shadow-md shadow-indigo-100"
          >
            <Plus size={20} /> Tambah Jenis
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <span className="text-xs font-black">{cat.code}</span>
              </div>
              <span className="font-semibold text-slate-700">{cat.name}</span>
            </div>
            {user.role === UserRole.ADMIN && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingCategory(cat); setFormData(cat); setIsModalOpen(true); }} className="p-1 hover:text-indigo-600 text-slate-400">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => deleteCategory(cat.id)} className="p-1 hover:text-rose-600 text-slate-400">
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full">
            <h3 className="text-xl font-bold text-slate-800 mb-6">{editingCategory ? 'Edit' : 'Tambah'} Jenis Barang</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Kode Prefix (2 Digit)</label>
                <input 
                  type="text" required maxLength={2} minLength={2}
                  placeholder="Contoh: 01"
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.replace(/\D/g, '') })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Jenis Barang</label>
                <input 
                  type="text" required
                  placeholder="Contoh: Elektronik, Mebel..."
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

export default Categories;
