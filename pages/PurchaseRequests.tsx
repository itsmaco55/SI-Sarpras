
import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  X, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Wallet, 
  Info,
  ChevronRight,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check
} from 'lucide-react';
import { PurchaseRequest, PurchaseStatus, UserRole } from '../types';
import { FUND_SOURCES } from '../constants.tsx';

interface PurchaseRequestsProps {
  purchaseRequests: PurchaseRequest[];
  setPurchaseRequests: React.Dispatch<React.SetStateAction<PurchaseRequest[]>>;
  setActiveTab: (tab: string) => void;
}

const PurchaseRequests: React.FC<PurchaseRequestsProps> = ({ purchaseRequests, setPurchaseRequests, setActiveTab }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmDate, setConfirmDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [editingRequest, setEditingRequest] = useState<PurchaseRequest | null>(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState<Partial<PurchaseRequest>>({
    itemName: '',
    quantity: 1,
    unit: 'Pcs',
    price: 0,
    purpose: '',
    sourceFund: FUND_SOURCES[0],
    status: PurchaseStatus.BELUM_BELI,
    requestDate: new Date().toISOString().split('T')[0],
    realizationDate: '',
    cancellationReason: ''
  });

  const filteredRequests = useMemo(() => {
    return purchaseRequests.filter(r => 
      r.itemName.toLowerCase().includes(search.toLowerCase()) ||
      r.purpose.toLowerCase().includes(search.toLowerCase())
    );
  }, [purchaseRequests, search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRequest) {
      setPurchaseRequests(prev => prev.map(r => r.id === editingRequest.id ? { ...r, ...formData } as PurchaseRequest : r));
    } else {
      const newRequest: PurchaseRequest = {
        ...formData,
        id: 'PR-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        isRegisteredToInventory: false
      } as PurchaseRequest;
      setPurchaseRequests(prev => [newRequest, ...prev]);
    }
    setIsModalOpen(false);
    setEditingRequest(null);
    setFormData({ itemName: '', quantity: 1, unit: 'Pcs', price: 0, purpose: '', sourceFund: FUND_SOURCES[0], status: PurchaseStatus.BELUM_BELI, requestDate: new Date().toISOString().split('T')[0], realizationDate: '', cancellationReason: '' });
  };

  const deleteRequest = (id: string) => {
    if (confirm('Yakin ingin menghapus pengajuan ini?')) {
      setPurchaseRequests(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleConfirmPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmId) return;

    setPurchaseRequests(prev => prev.map(r => 
      r.id === confirmId ? { ...r, status: PurchaseStatus.SUDAH_BELI, realizationDate: confirmDate } : r
    ));
    setIsConfirmModalOpen(false);
    setConfirmId(null);
  };

  const updateStatus = (id: string, status: PurchaseStatus) => {
    if (status === PurchaseStatus.BATAL_BELI) {
      const reason = prompt('Masukkan alasan pembatalan:');
      if (reason === null) return;
      setPurchaseRequests(prev => prev.map(r => r.id === id ? { ...r, status, cancellationReason: reason } : r));
    } else if (status === PurchaseStatus.SUDAH_BELI) {
      setConfirmId(id);
      setConfirmDate(new Date().toISOString().split('T')[0]);
      setIsConfirmModalOpen(true);
    } else {
      setPurchaseRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
            <ShoppingCart size={32} className="text-indigo-600" /> Pengajuan Pembelian
          </h2>
          <p className="text-slate-400 text-sm font-medium">Manajemen rencana pengadaan aset sekolah</p>
        </div>
        <button 
          onClick={() => { setEditingRequest(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
        >
          <Plus size={18} /> Buat Pengajuan Baru
        </button>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari barang atau tujuan..."
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-bold text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-50">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-8 py-5 font-black uppercase text-[10px] text-slate-400 tracking-wider">Barang & Tgl</th>
                <th className="px-8 py-5 font-black uppercase text-[10px] text-slate-400 tracking-wider">Qty & Satuan</th>
                <th className="px-8 py-5 font-black uppercase text-[10px] text-slate-400 tracking-wider">Estimasi Harga</th>
                <th className="px-8 py-5 font-black uppercase text-[10px] text-slate-400 tracking-wider">Dana & Tujuan</th>
                <th className="px-8 py-5 font-black uppercase text-[10px] text-slate-400 tracking-wider">Status</th>
                <th className="px-8 py-5 font-black uppercase text-[10px] text-slate-400 tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRequests.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-700 text-base">{r.itemName}</p>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                        <Calendar size={10} /> PENGAJUAN: {r.requestDate}
                      </p>
                      {r.realizationDate && (
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter flex items-center gap-1">
                          <CheckCircle2 size={10} /> REALISASI: {r.realizationDate}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-bold text-slate-600">{r.quantity} {r.unit}</span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-indigo-600">Rp {new Intl.NumberFormat('id-ID').format(r.price)}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Total: Rp {new Intl.NumberFormat('id-ID').format(r.price * r.quantity)}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-indigo-400 uppercase">{r.sourceFund}</p>
                    <p className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">{r.purpose}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        r.status === PurchaseStatus.SUDAH_BELI ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        r.status === PurchaseStatus.BATAL_BELI ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {r.status.replace('_', ' ')}
                      </span>
                      {r.status === PurchaseStatus.BATAL_BELI && r.cancellationReason && (
                        <p className="text-[9px] text-rose-400 italic font-medium">Alasan: {r.cancellationReason}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2">
                      {r.status === PurchaseStatus.BELUM_BELI && (
                        <>
                          <button 
                            onClick={() => updateStatus(r.id, PurchaseStatus.SUDAH_BELI)}
                            className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg hover:bg-emerald-600 transition-all active:scale-90"
                            title="Konfirmasi Realisasi Pembelian"
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            onClick={() => updateStatus(r.id, PurchaseStatus.BATAL_BELI)}
                            className="p-2 bg-rose-500 text-white rounded-xl shadow-lg hover:bg-rose-600 transition-all active:scale-90"
                            title="Tandai Batal Beli"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {r.status === PurchaseStatus.SUDAH_BELI && !r.isRegisteredToInventory && (
                        <button 
                          onClick={() => setActiveTab('inventory')}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all animate-pulse"
                        >
                          Daftarkan <ArrowRight size={14} />
                        </button>
                      )}
                      <button onClick={() => { setEditingRequest(r); setFormData(r); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => deleteRequest(r.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
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

      {/* Main Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{editingRequest ? 'Edit' : 'Buat'} Pengajuan</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mt-1">Lengkapi rincian pengadaan barang</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X className="text-slate-300" size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Nama Barang</label>
                  <input 
                    type="text" required 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-bold text-slate-700"
                    value={formData.itemName}
                    onChange={e => setFormData({...formData, itemName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Tgl Pengajuan</label>
                  <input 
                    type="date" required 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-bold text-slate-700"
                    value={formData.requestDate}
                    onChange={e => setFormData({...formData, requestDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Jumlah</label>
                  <input 
                    type="number" required min={1}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-bold text-slate-700"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Satuan</label>
                  <input 
                    type="text" required 
                    placeholder="Pcs, Unit, Box..."
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-bold text-slate-700"
                    value={formData.unit}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Harga Satuan</label>
                  <input 
                    type="number" required min={0}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-bold text-indigo-600"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Sumber Dana</label>
                  <select 
                    required 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-black text-xs uppercase tracking-widest text-slate-600 cursor-pointer"
                    value={formData.sourceFund}
                    onChange={e => setFormData({...formData, sourceFund: e.target.value})}
                  >
                    {FUND_SOURCES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Status Pengadaan</label>
                  <select 
                    required 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-black text-xs uppercase tracking-widest text-slate-600 cursor-pointer"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as PurchaseStatus})}
                  >
                    <option value={PurchaseStatus.BELUM_BELI}>BELUM BELI</option>
                    <option value={PurchaseStatus.SUDAH_BELI}>SUDAH BELI</option>
                    <option value={PurchaseStatus.BATAL_BELI}>BATAL BELI</option>
                  </select>
                </div>
              </div>

              {formData.status === PurchaseStatus.SUDAH_BELI && (
                <div className="animate-in slide-in-from-top duration-300">
                  <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 block ml-1">Tanggal Realisasi Pembelian</label>
                  <input 
                    type="date" required 
                    className="w-full px-6 py-4 bg-emerald-50 border-2 border-emerald-100 focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-emerald-700"
                    value={formData.realizationDate}
                    onChange={e => setFormData({...formData, realizationDate: e.target.value})}
                  />
                </div>
              )}

              {formData.status === PurchaseStatus.BATAL_BELI && (
                <div className="animate-in slide-in-from-top duration-300">
                  <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2 block ml-1">Alasan Pembatalan (Wajib)</label>
                  <input 
                    type="text" required 
                    className="w-full px-6 py-4 bg-rose-50 border-2 border-rose-100 focus:border-rose-500 rounded-2xl outline-none transition-all font-bold text-rose-700"
                    value={formData.cancellationReason}
                    onChange={e => setFormData({...formData, cancellationReason: e.target.value})}
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Tujuan Pembelian</label>
                <textarea 
                  required rows={3}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-bold text-slate-700"
                  value={formData.purpose}
                  onChange={e => setFormData({...formData, purpose: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500">Batal</button>
                <button type="submit" className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all">Simpan Pengajuan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Realization Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-emerald-50">
                <ShoppingCart size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Konfirmasi Pembelian</h3>
              <p className="text-xs text-slate-400 font-bold uppercase mt-2">Masukkan tanggal realisasi barang diterima</p>
            </div>

            <form onSubmit={handleConfirmPurchase} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Tanggal Realisasi Pembelian</label>
                <div className="relative">
                  <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                  <input 
                    type="date" required 
                    className="w-full pl-14 pr-6 py-5 bg-emerald-50 border-2 border-emerald-100 focus:border-emerald-500 rounded-2xl outline-none transition-all font-black text-emerald-700"
                    value={confirmDate}
                    onChange={e => setConfirmDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-100 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all">
                  Konfirmasi Sudah Beli
                </button>
                <button type="button" onClick={() => { setIsConfirmModalOpen(false); setConfirmId(null); }} className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseRequests;
