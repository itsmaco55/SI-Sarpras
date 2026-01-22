
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Truck, Tag } from 'lucide-react';
import { Supplier, Merk, User, UserRole } from '../types';

interface SuppliersAndMerksProps {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  merks: Merk[];
  setMerks: React.Dispatch<React.SetStateAction<Merk[]>>;
  user: User;
}

const SuppliersAndMerks: React.FC<SuppliersAndMerksProps> = ({ suppliers, setSuppliers, merks, setMerks, user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'SUPPLIER' | 'MERK'>('SUPPLIER');
  const [editingItem, setEditingItem] = useState<Supplier | Merk | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalType === 'SUPPLIER') {
      if (editingItem) {
        setSuppliers(prev => prev.map(s => s.id === editingItem.id ? { ...s, name: formData.name } : s));
      } else {
        const newItem: Supplier = { id: 's' + Math.random().toString(36).substr(2, 5), name: formData.name };
        setSuppliers(prev => [...prev, newItem]);
      }
    } else {
      if (editingItem) {
        setMerks(prev => prev.map(m => m.id === editingItem.id ? { ...m, name: formData.name } : m));
      } else {
        const newItem: Merk = { id: 'm' + Math.random().toString(36).substr(2, 5), name: formData.name };
        setMerks(prev => [...prev, newItem]);
      }
    }
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({ name: '' });
  };

  const deleteItem = (type: 'SUPPLIER' | 'MERK', id: string) => {
    if (confirm(`Yakin ingin menghapus ${type.toLowerCase()} ini?`)) {
      if (type === 'SUPPLIER') {
        setSuppliers(prev => prev.filter(s => s.id !== id));
      } else {
        setMerks(prev => prev.filter(m => m.id !== id));
      }
    }
  };

  const openModal = (type: 'SUPPLIER' | 'MERK', item: Supplier | Merk | null = null) => {
    setModalType(type);
    setEditingItem(item);
    setFormData({ name: item ? item.name : '' });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-12">
      {/* Supplier Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Truck size={24} /></div>
            <h3 className="text-xl font-bold text-slate-800">Master Supplier</h3>
          </div>
          {user.role === UserRole.ADMIN && (
            <button onClick={() => openModal('SUPPLIER')} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold shadow-md shadow-indigo-100">
              <Plus size={20} /> Tambah Supplier
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {suppliers.map(s => (
            <div key={s.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group">
              <span className="font-semibold text-slate-700">{s.name}</span>
              {user.role === UserRole.ADMIN && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal('SUPPLIER', s)} className="p-1 hover:text-indigo-600 text-slate-400"><Edit2 size={16} /></button>
                  <button onClick={() => deleteItem('SUPPLIER', s.id)} className="p-1 hover:text-rose-600 text-slate-400"><Trash2 size={16} /></button>
                </div>
              )}
            </div>
          ))}
          {suppliers.length === 0 && <p className="text-slate-400 italic text-sm">Belum ada data supplier.</p>}
        </div>
      </section>

      {/* Merk Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Tag size={24} /></div>
            <h3 className="text-xl font-bold text-slate-800">Master Merk</h3>
          </div>
          {user.role === UserRole.ADMIN && (
            <button onClick={() => openModal('MERK')} className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl font-bold shadow-md shadow-amber-100">
              <Plus size={20} /> Tambah Merk
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {merks.map(m => (
            <div key={m.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group">
              <span className="font-semibold text-slate-700">{m.name}</span>
              {user.role === UserRole.ADMIN && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal('MERK', m)} className="p-1 hover:text-amber-600 text-slate-400"><Edit2 size={16} /></button>
                  <button onClick={() => deleteItem('MERK', m.id)} className="p-1 hover:text-rose-600 text-slate-400"><Trash2 size={16} /></button>
                </div>
              )}
            </div>
          ))}
          {merks.length === 0 && <p className="text-slate-400 italic text-sm">Belum ada data merk.</p>}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full">
            <h3 className="text-xl font-bold text-slate-800 mb-6">{editingItem ? 'Edit' : 'Tambah'} {modalType === 'SUPPLIER' ? 'Supplier' : 'Merk'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama {modalType === 'SUPPLIER' ? 'Supplier' : 'Merk'}</label>
                <input 
                  type="text" required
                  placeholder="Masukkan nama..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({ name: e.target.value })}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-slate-100 rounded-xl font-bold text-slate-600">Batal</button>
                <button type="submit" className={`flex-1 py-2 rounded-xl font-bold text-white ${modalType === 'SUPPLIER' ? 'bg-indigo-600' : 'bg-amber-600'}`}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersAndMerks;
