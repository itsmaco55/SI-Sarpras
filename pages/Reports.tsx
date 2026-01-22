
import React, { useState, useMemo } from 'react';
import { Download, FileText, Filter, RotateCcw, PieChart as PieChartIcon, Info, ShoppingCart, TrendingUp, Wallet } from 'lucide-react';
import { Item, Room, ItemCondition, Category, SubCategory, PurchaseRequest, PurchaseStatus } from '../types';

interface ReportsProps {
  items: Item[];
  rooms: Room[];
  categories: Category[];
  subCategories: SubCategory[];
  purchaseRequests: PurchaseRequest[];
}

const Reports: React.FC<ReportsProps> = ({ items, rooms, categories, subCategories, purchaseRequests }) => {
  const [filter, setFilter] = useState({
    roomId: 'all',
    categoryId: 'all',
    subCategoryId: 'all',
    condition: 'all'
  });

  const [activeReport, setActiveReport] = useState<'INVENTORY' | 'PURCHASE'>('INVENTORY');

  const handleCategoryChange = (catId: string) => {
    setFilter(prev => ({ ...prev, categoryId: catId, subCategoryId: 'all' }));
  };

  const filteredSubCategories = useMemo(() => {
    if (filter.categoryId === 'all') return [];
    return subCategories.filter(sc => sc.categoryId === filter.categoryId);
  }, [subCategories, filter.categoryId]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filter.condition === 'all' && item.condition === ItemCondition.DIHAPUS) return false;
      const roomMatch = filter.roomId === 'all' || item.roomId === filter.roomId;
      const categoryMatch = filter.categoryId === 'all' || item.type === filter.categoryId;
      const subCategoryMatch = filter.subCategoryId === 'all' || item.subType === filter.subCategoryId;
      const conditionMatch = filter.condition === 'all' || item.condition === filter.condition;
      return roomMatch && categoryMatch && subCategoryMatch && conditionMatch;
    });
  }, [items, filter]);

  const stats = useMemo(() => {
    const total = filteredItems.length;
    const baik = filteredItems.filter(i => i.condition === ItemCondition.BAIK).length;
    const ringan = filteredItems.filter(i => i.condition === ItemCondition.RUSAK_RINGAN).length;
    const berat = filteredItems.filter(i => i.condition === ItemCondition.RUSAK_BERAT).length;
    return { total, baik, ringan, berat };
  }, [filteredItems]);

  const purchaseStats = useMemo(() => {
    const total = purchaseRequests.length;
    const bought = purchaseRequests.filter(r => r.status === PurchaseStatus.SUDAH_BELI).length;
    const pending = purchaseRequests.filter(r => r.status === PurchaseStatus.BELUM_BELI).length;
    const canceled = purchaseRequests.filter(r => r.status === PurchaseStatus.BATAL_BELI).length;
    const totalSpent = purchaseRequests
      .filter(r => r.status === PurchaseStatus.SUDAH_BELI)
      .reduce((sum, r) => sum + (r.price * r.quantity), 0);
    return { total, bought, pending, canceled, totalSpent };
  }, [purchaseRequests]);

  const handleDownload = (format: 'PDF' | 'EXCEL') => {
    alert(`Mengekspor data rekap ke format ${format}...`);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Rekap & Laporan</h2>
          <p className="text-slate-400 text-sm">Audit data inventaris dan pengadaan barang sekolah</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveReport('INVENTORY')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeReport === 'INVENTORY' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            Inventaris
          </button>
          <button 
            onClick={() => setActiveReport('PURCHASE')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeReport === 'PURCHASE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            Pengadaan
          </button>
        </div>
      </div>

      {activeReport === 'INVENTORY' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-indigo-600" />
                  <h3 className="font-bold text-slate-800">Filter Inventaris</h3>
                </div>
                <button onClick={() => setFilter({ roomId: 'all', categoryId: 'all', subCategoryId: 'all', condition: 'all' })} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 flex items-center gap-2">
                  <RotateCcw size={14} /> Reset
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <select className="p-3 bg-slate-50 rounded-2xl text-xs font-bold outline-none" value={filter.roomId} onChange={e => setFilter({...filter, roomId: e.target.value})}>
                  <option value="all">Semua Ruangan</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <select className="p-3 bg-slate-50 rounded-2xl text-xs font-bold outline-none" value={filter.categoryId} onChange={e => handleCategoryChange(e.target.value)}>
                  <option value="all">Semua Jenis Utama</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select className="p-3 bg-slate-50 rounded-2xl text-xs font-bold outline-none disabled:opacity-50" disabled={filter.categoryId === 'all'} value={filter.subCategoryId} onChange={e => setFilter({...filter, subCategoryId: e.target.value})}>
                  <option value="all">Semua Sub Jenis</option>
                  {filteredSubCategories.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                </select>
                <select className="p-3 bg-slate-50 rounded-2xl text-xs font-bold outline-none" value={filter.condition} onChange={e => setFilter({...filter, condition: e.target.value})}>
                  <option value="all">Semua Kondisi</option>
                  <option value={ItemCondition.BAIK}>BAIK</option>
                  <option value={ItemCondition.RUSAK_RINGAN}>RUSAK RINGAN</option>
                  <option value={ItemCondition.RUSAK_BERAT}>RUSAK BERAT</option>
                </select>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div>
                  <h4 className="font-black text-xs uppercase tracking-widest text-slate-400">Pratinjau Data Inventaris</h4>
                  <p className="text-xl font-black text-slate-800">{filteredItems.length} <span className="text-xs font-bold text-slate-400 uppercase">Barang Ditemukan</span></p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDownload('PDF')} className="p-3 bg-white border border-slate-100 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all"><FileText size={18}/></button>
                  <button onClick={() => handleDownload('EXCEL')} className="p-3 bg-white border border-slate-100 rounded-2xl text-emerald-500 hover:bg-emerald-50 transition-all"><Download size={18}/></button>
                </div>
              </div>
              <div className="overflow-x-auto h-[500px]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5 font-black uppercase text-[10px] text-slate-400 tracking-wider">Aset & Kode</th>
                      <th className="px-8 py-5 font-black uppercase text-[10px] text-slate-400 tracking-wider">Lokasi</th>
                      <th className="px-8 py-5 font-black uppercase text-[10px] text-slate-400 tracking-wider text-center">Kondisi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredItems.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-4">
                          <p className="font-bold text-slate-700">{item.name}</p>
                          <p className="text-[10px] font-mono text-indigo-500 font-bold uppercase">{item.code}</p>
                        </td>
                        <td className="px-8 py-4">
                          <p className="text-xs font-bold text-slate-600">{rooms.find(r => r.id === item.roomId)?.name || 'N/A'}</p>
                        </td>
                        <td className="px-8 py-4 text-center">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                            item.condition === ItemCondition.BAIK ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            item.condition === ItemCondition.RUSAK_RINGAN ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {item.condition.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-indigo-900 p-8 rounded-[3rem] text-white shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <PieChartIcon size={24} className="text-indigo-400" />
                <h4 className="font-black text-xs uppercase tracking-widest">Summary Status</h4>
              </div>
              <div className="space-y-6">
                {[
                  { label: 'Baik', val: stats.baik, color: 'bg-emerald-400' },
                  { label: 'Rusak Ringan', val: stats.ringan, color: 'bg-amber-400' },
                  { label: 'Rusak Berat', val: stats.berat, color: 'bg-rose-400' }
                ].map(s => {
                  const perc = stats.total > 0 ? (s.val / stats.total) * 100 : 0;
                  return (
                    <div key={s.label}>
                      <div className="flex justify-between items-end mb-1">
                         <p className="text-[10px] font-black uppercase text-indigo-300">{s.label}</p>
                         <p className="text-lg font-black">{s.val}</p>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                         <div className={`h-full ${s.color}`} style={{ width: `${perc}%` }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div>
                  <h4 className="font-black text-xs uppercase tracking-widest text-slate-400">Rekap Pengadaan Barang</h4>
                  <p className="text-xl font-black text-slate-800">{purchaseRequests.length} <span className="text-xs font-bold text-slate-400 uppercase">Pengajuan</span></p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDownload('EXCEL')} className="p-3 bg-white border border-slate-100 rounded-2xl text-emerald-500 hover:bg-emerald-50 transition-all"><Download size={18}/></button>
                </div>
              </div>
              <div className="overflow-x-auto h-[600px]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5 font-black uppercase text-[10px] text-slate-400 tracking-wider">Nama Barang & Tgl</th>
                      <th className="px-8 py-5 font-black uppercase text-[10px] text-slate-400 tracking-wider">Total Biaya</th>
                      <th className="px-8 py-5 font-black uppercase text-[10px] text-slate-400 tracking-wider">Sumber Dana</th>
                      <th className="px-8 py-5 font-black uppercase text-[10px] text-slate-400 tracking-wider text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {purchaseRequests.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-4">
                          <p className="font-bold text-slate-700">{r.itemName}</p>
                          <div className="flex flex-col gap-0.5 mt-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">PENGAJUAN: {r.requestDate}</p>
                            {r.realizationDate && (
                              <p className="text-[10px] text-emerald-500 font-bold uppercase">REALISASI: {r.realizationDate}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <p className="font-black text-slate-800">Rp {new Intl.NumberFormat('id-ID').format(r.price * r.quantity)}</p>
                          <p className="text-[9px] text-slate-400 font-bold">{r.quantity} {r.unit}</p>
                        </td>
                        <td className="px-8 py-4 text-xs font-black text-indigo-400 uppercase">{r.sourceFund}</td>
                        <td className="px-8 py-4 text-center">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                            r.status === PurchaseStatus.SUDAH_BELI ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            r.status === PurchaseStatus.BATAL_BELI ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {r.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl border border-slate-800">
              <div className="flex items-center gap-3 mb-8">
                <TrendingUp size={24} className="text-emerald-400" />
                <h4 className="font-black text-xs uppercase tracking-widest text-slate-400">Analisis Pengadaan</h4>
              </div>
              <div className="space-y-8">
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Dana Terserap</p>
                   <p className="text-2xl font-black text-emerald-400">Rp {new Intl.NumberFormat('id-ID').format(purchaseStats.totalSpent)}</p>
                </div>
                <div className="space-y-4">
                   {[
                     { label: 'Selesai Dibeli', val: purchaseStats.bought, color: 'bg-emerald-400' },
                     { label: 'Masih Draft/Belum', val: purchaseStats.pending, color: 'bg-amber-400' },
                     { label: 'Batal/Gagal', val: purchaseStats.canceled, color: 'bg-rose-400' }
                   ].map(s => (
                     <div key={s.label}>
                        <div className="flex justify-between items-end mb-1">
                           <p className="text-[10px] font-black uppercase text-slate-500">{s.label}</p>
                           <p className="text-sm font-black">{s.val}</p>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                           <div className={`h-full ${s.color}`} style={{ width: `${purchaseStats.total > 0 ? (s.val/purchaseStats.total)*100 : 0}%` }}></div>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
