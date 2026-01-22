
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import { Room, User, UserRole } from '../types';

interface RoomsProps {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  user: User;
}

const Rooms: React.FC<RoomsProps> = ({ rooms, setRooms, user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<Partial<Room>>({
    name: '',
    description: '',
    capacity: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      setRooms(prev => prev.map(r => r.id === editingRoom.id ? { ...r, ...formData } as Room : r));
    } else {
      const newRoom: Room = {
        ...formData,
        id: 'r' + Math.random().toString(36).substr(2, 5)
      } as Room;
      setRooms(prev => [...prev, newRoom]);
    }
    setIsModalOpen(false);
    setEditingRoom(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">Daftar Ruangan Sekolah</h3>
        {user.role === UserRole.ADMIN && (
          <button 
            onClick={() => { setEditingRoom(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold"
          >
            <Plus size={20} /> Tambah Ruangan
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
          <div key={room.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                <Users size={24} />
              </div>
              {user.role === UserRole.ADMIN && (
                <div className="flex gap-2">
                  <button onClick={() => { setEditingRoom(room); setFormData(room); setIsModalOpen(true); }} className="p-1 hover:text-indigo-600 text-slate-400">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => setRooms(prev => prev.filter(r => r.id !== room.id))} className="p-1 hover:text-rose-600 text-slate-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
            <h4 className="text-lg font-bold text-slate-800">{room.name}</h4>
            <p className="text-slate-500 text-sm mt-1">{room.description}</p>
            <div className="mt-4 flex items-center justify-between">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kapasitas</span>
               <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">{room.capacity} Orang</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-800 mb-6">{editingRoom ? 'Edit' : 'Tambah'} Ruangan</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Ruangan</label>
                <input 
                  type="text" required
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi/Lokasi</label>
                <textarea 
                  required
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Kapasitas (Orang)</label>
                <input 
                  type="number" required
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  value={formData.capacity}
                  onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 rounded-xl font-bold">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
