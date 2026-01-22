
import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, CheckCircle2, XCircle, Clock, Undo2, Trash2, Calendar, User as UserIcon, Timer, Package, DoorOpen, MapPin } from 'lucide-react';
import { Item, Room, User, UserRole, BorrowRequest, RequestStatus, BorrowedItem } from '../types';

interface BorrowingProps {
  items: Item[];
  rooms: Room[];
  borrows: BorrowRequest[];
  setBorrows: React.Dispatch<React.SetStateAction<BorrowRequest[]>>;
  user: User;
  defaultType?: 'ITEM' | 'ROOM';
}

const Borrowing: React.FC<BorrowingProps> = ({ items, rooms, borrows, setBorrows, user, defaultType = 'ITEM' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [borrowType, setBorrowType] = useState<'ITEM' | 'ROOM'>(defaultType);
  
  useEffect(() => {
    setBorrowType(defaultType);
  }, [defaultType]);

  const [selectedBorrowedItems, setSelectedBorrowedItems] = useState<BorrowedItem[]>([]);
  const [formData, setFormData] = useState({
    borrowerName: user.fullName,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    startTime: '07:00',
    event: '',
    notes: '',
    roomId: '' 
  });

  const resetForm = () => {
    setFormData({
      borrowerName: user.fullName,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      startTime: '07:00',
      event: '',
      notes: '',
      roomId: ''
    });
    setSelectedBorrowedItems([]);
  };

  const addItemRow = () => {
    setSelectedBorrowedItems([...selectedBorrowedItems, { itemId: '', quantity: 1 }]);
  };

  const removeItemRow = (index: number) => {
    setSelectedBorrowedItems(selectedBorrowedItems.filter((_, i) => i !== index));
  };

  const updateItemRow = (index: number, field: keyof BorrowedItem, value: any) => {
    const updated = [...selectedBorrowedItems];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedBorrowedItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (borrowType === 'ITEM' && selectedBorrowedItems.length === 0) {
      alert('Pilih minimal satu barang!');
      return;
    }

    if (!formData.roomId) {
      alert(borrowType === 'ITEM' ? 'Tentukan Ruang Pengambilan!' : 'Pilih Ruangan!');
      return;
    }

    const newBorrow: BorrowRequest = {
      id: 'B-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      userId: user.id,
      borrowerName: formData.borrowerName,
      type: borrowType,
      requestDate: new Date().toISOString().split('T')[0],
      startDate: formData.startDate,
      endDate: formData.endDate,
      startTime: formData.startTime,
      event: formData.event,
      notes: formData.notes,
      items: borrowType === 'ITEM' ? selectedBorrowedItems : [],
      roomId: formData.roomId,
      status: RequestStatus.PENDING,
      requestedAt: new Date().toISOString(),
    };
    
    setBorrows(prev => [newBorrow, ...prev]);
    setIsModalOpen(false);
    resetForm();
  };

  const updateStatus = (id: string, status: RequestStatus) => {
    setBorrows(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${borrowType === 'ITEM' ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'}`}>
            {borrowType === 'ITEM' ? <Package size={24} /> : <DoorOpen size={24} />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Daftar Peminjaman {borrowType === 'ITEM' ? 'Barang' : 'Ruangan'}</h3>
            <p className="text-xs text-slate-400">Kelola reservasi sarana prasarana sekolah</p>
          </div>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:scale-105 transition-all"
        >
          <Plus size={20} /> Pinjam Baru
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5">Acara & Peminjam</th>
                <th className="px-6 py-5">Target Pinjaman</th>
                <th className="px-6 py-5">Lokasi {borrowType === 'ITEM' ? 'Ambil' : 'Pakai'}</th>
                <th className="px-6 py-5">Waktu Reservasi</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {borrows.filter(b => b.type === borrowType).map(b => {
                const locRoom = rooms.find(r => r.id === b.roomId);
                return (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{b.event || 'Tanpa Nama Acara'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{b.id}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1"><UserIcon size={12}/> {b.borrowerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {b.type === 'ITEM' ? (
                        <div className="space-y-1">
                          {b.items.map((bi, idx) => {
                            const item = items.find(i => i.id === bi.itemId);
                            return (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="w-5 h-5 flex items-center justify-center bg-slate-100 rounded text-[10px] font-bold text-slate-600">{bi.quantity}</span>
                                <span className="text-xs text-slate-700 font-medium">{item?.name || 'Item dihapus'}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <DoorOpen size={14} className="text-purple-500" />
                          <span className="text-xs font-bold text-slate-700">{locRoom?.name || 'N/A'}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin size={14} className="text-indigo-400" />
                        <span className="text-xs font-semibold">{locRoom?.name || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Calendar size={12} /> {b.startDate} {b.startDate !== b.endDate && `s/d ${b.endDate}`}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Timer size={12} /> Jam {b.startTime}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider ${
                        b.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        b.status === RequestStatus.APPROVED ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        b.status === RequestStatus.REJECTED ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {user.role === UserRole.ADMIN && b.status === 'PENDING' && (
                          <>
                            <button onClick={() => updateStatus(b.id, RequestStatus.APPROVED)} className="p-2 bg-emerald-500 text-white rounded-xl shadow-md hover:bg-emerald-600 transition-colors">
                              <CheckCircle2 size={16} />
                            </button>
                            <button onClick={() => updateStatus(b.id, RequestStatus.REJECTED)} className="p-2 bg-rose-500 text-white rounded-xl shadow-md hover:bg-rose-600 transition-colors">
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        {b.status === 'APPROVED' && (
                          <button onClick={() => updateStatus(b.id, RequestStatus.RETURNED)} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-900 transition-all">
                            <Undo2 size={14} /> Kembalikan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-slate-800">Form Pinjam {borrowType === 'ITEM' ? 'Barang' : 'Ruang'}</h3>
              <button onClick={() => setIsModalOpen(false)}><XCircle className="text-slate-300 hover:text-rose-500" size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Tgl Isi</label>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 font-bold text-sm">
                    {new Date().toISOString().split('T')[0]}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nama Peminjam</label>
                  <input type="text" required className="w-full p-3 bg-slate-50 rounded-2xl text-sm outline-none border-2 border-transparent focus:border-indigo-500" value={formData.borrowerName} onChange={e => setFormData({...formData, borrowerName: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Jam</label>
                  <input type="time" required className="w-full p-3 bg-slate-50 rounded-2xl text-sm outline-none border-2 border-transparent focus:border-indigo-500" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nama Acara / Keperluan</label>
                <input type="text" required placeholder="Contoh: Rapat OSIS..." className="w-full p-3 bg-slate-50 rounded-2xl text-sm outline-none border-2 border-transparent focus:border-indigo-500" value={formData.event} onChange={e => setFormData({...formData, event: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Tgl Pinjam</label>
                  <input type="date" required className="w-full p-3 bg-slate-50 rounded-2xl text-sm outline-none border-2 border-transparent focus:border-indigo-500" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Tgl Kembali</label>
                  <input type="date" required className="w-full p-3 bg-slate-50 rounded-2xl text-sm outline-none border-2 border-transparent focus:border-indigo-500" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                    {borrowType === 'ITEM' ? 'Ruang Pengambilan (Lokasi Persiapan)' : 'Pilih Ruangan'}
                  </label>
                  <select required className="w-full p-3 bg-emerald-50 border-2 border-emerald-100 rounded-2xl text-sm outline-none" value={formData.roomId} onChange={e => setFormData({...formData, roomId: e.target.value})}>
                    <option value="">-- Pilih Ruangan --</option>
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>

                {borrowType === 'ITEM' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daftar Barang</label>
                       <button type="button" onClick={addItemRow} className="text-xs font-bold text-indigo-600 hover:underline">+ Tambah Barang</button>
                    </div>
                    {selectedBorrowedItems.map((bi, index) => (
                      <div key={index} className="flex gap-4">
                        <select required className="flex-1 p-3 bg-slate-50 rounded-2xl text-sm outline-none" value={bi.itemId} onChange={e => updateItemRow(index, 'itemId', e.target.value)}>
                          <option value="">-- Pilih Barang --</option>
                          {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.code})</option>)}
                        </select>
                        <input type="number" min={1} required className="w-20 p-3 bg-slate-50 rounded-2xl text-sm outline-none" value={bi.quantity} onChange={e => updateItemRow(index, 'quantity', parseInt(e.target.value))} />
                        <button type="button" onClick={() => removeItemRow(index)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl"><Trash2 size={20}/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold">Batal</button>
                <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Kirim Permohonan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Borrowing;
