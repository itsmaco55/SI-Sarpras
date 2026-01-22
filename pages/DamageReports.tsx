
import React, { useState } from 'react';
import { AlertTriangle, Plus, MapPin, User as UserIcon, Calendar, Settings2, X, Wrench, Clock } from 'lucide-react';
import { Item, User, DamageReport, UserRole, Room, DamageStatus, RepairType } from '../types';

interface DamageReportsProps {
  items: Item[];
  rooms: Room[];
  damages: DamageReport[];
  setDamages: React.Dispatch<React.SetStateAction<DamageReport[]>>;
  user: User;
}

const DamageReports: React.FC<DamageReportsProps> = ({ items, rooms, damages, setDamages, user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminManageOpen, setIsAdminManageOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(null);
  
  const [formData, setFormData] = useState({ itemId: '', description: '' });
  const [manageData, setManageData] = useState({ status: DamageStatus.SEDANG_PROSES, repairType: undefined as RepairType | undefined });

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport: DamageReport = {
      id: 'D-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      itemId: formData.itemId,
      reporterId: user.id,
      reporterName: user.fullName,
      description: formData.description,
      reportedAt: new Date().toISOString(),
      status: DamageStatus.SEDANG_PROSES 
    };
    setDamages(prev => [newReport, ...prev]);
    setIsModalOpen(false);
    setFormData({ itemId: '', description: '' });
  };

  const handleAdminUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    setDamages(prev => prev.map(d => {
      if (d.id === selectedReport.id) {
        const isNowFixed = manageData.status === DamageStatus.FIXED;
        return { 
          ...d, 
          status: manageData.status, 
          repairType: manageData.repairType,
          fixedAt: isNowFixed ? new Date().toISOString() : d.fixedAt
        };
      }
      return d;
    }));
    
    setIsAdminManageOpen(false);
    setSelectedReport(null);
  };

  const openAdminManage = (report: DamageReport) => {
    setSelectedReport(report);
    setManageData({ status: report.status, repairType: report.repairType });
    setIsAdminManageOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><AlertTriangle size={24} /></div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Laporan Kerusakan</h3>
            <p className="text-xs text-slate-400">Monitoring kondisi sarana prasarana sekolah</p>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-rose-100 hover:scale-105 transition-all">
          <Plus size={20} /> Lapor Kerusakan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {damages.map(d => {
          const item = items.find(i => i.id === d.itemId);
          const room = rooms.find(r => r.id === item?.roomId);
          const duration = d.fixedAt ? calculateDuration(d.reportedAt, d.fixedAt) : null;
          
          return (
            <div key={d.id} className={`group relative p-6 rounded-3xl border transition-all duration-300 ${
              d.status === DamageStatus.FIXED ? 'bg-emerald-50 border-emerald-100' : 
              d.status === DamageStatus.PENGAJUAN_DANA ? 'bg-amber-50 border-amber-100' : 'bg-white border-slate-100 shadow-sm'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl text-white shadow-lg ${
                  d.status === DamageStatus.FIXED ? 'bg-emerald-500' : 
                  d.status === DamageStatus.PENGAJUAN_DANA ? 'bg-amber-500' : 'bg-rose-500'
                }`}><AlertTriangle size={18} /></div>
                
                {user.role === UserRole.ADMIN && (
                  <button onClick={() => openAdminManage(d)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-colors"><Settings2 size={18} /></button>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 leading-tight">{item?.name || 'Barang Terhapus'}</h4>
                
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar size={12} className="text-slate-400" />
                    <span>Lapor: <b>{new Date(d.reportedAt).toLocaleDateString('id-ID')}</b></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <UserIcon size={12} className="text-slate-400" />
                    <span>Pelapor: <b>{d.reporterName}</b></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin size={12} className="text-indigo-400" />
                    <span>Lokasi: <b>{room?.name || 'N/A'}</b></span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                   <p className="text-xs text-slate-600 italic">"{d.description}"</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {d.repairType && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg">
                      <Wrench size={10} className="text-indigo-600" />
                      <span className="text-[9px] font-black text-indigo-600 uppercase">{d.repairType.replace(/_/g, ' ')}</span>
                    </div>
                  )}
                  {d.status === DamageStatus.FIXED && duration !== null && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500 text-white rounded-lg shadow-sm">
                      <Clock size={10} />
                      <span className="text-[9px] font-black uppercase tracking-wider">Selesai dalam {duration} Hari</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                 <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border ${
                   d.status === DamageStatus.FIXED ? 'text-emerald-700 bg-emerald-100 border-emerald-200' : 
                   d.status === DamageStatus.PENGAJUAN_DANA ? 'text-amber-700 bg-amber-100 border-amber-200' : 'text-rose-700 bg-rose-100 border-rose-200'
                 }`}>
                   {d.status.replace(/_/g, ' ')}
                 </span>
                 {d.fixedAt && (
                   <span className="text-[9px] font-bold text-slate-400">Tgl Fix: {new Date(d.fixedAt).toLocaleDateString('id-ID')}</span>
                 )}
              </div>
            </div>
          )
        })}
        {damages.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <p className="text-slate-400 font-medium">Belum ada laporan kerusakan.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Lapor Kerusakan</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Pilih Barang</label>
                <select required className="w-full p-3 bg-slate-50 rounded-2xl text-sm outline-none border-2 border-transparent focus:border-indigo-500 transition-all" value={formData.itemId} onChange={e => setFormData({...formData, itemId: e.target.value})}>
                  <option value="">-- Pilih Barang --</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.code})</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Deskripsi Kerusakan</label>
                <textarea required rows={4} className="w-full p-3 bg-slate-50 rounded-2xl text-sm outline-none border-2 border-transparent focus:border-indigo-500 transition-all" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Jelaskan detail kerusakan..."></textarea>
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500">Batal</button>
                <button type="submit" className="flex-[2] py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-xl">Kirim Laporan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAdminManageOpen && selectedReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in slide-in-from-bottom">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Kelola Laporan (Admin Only)</h3>
            <form onSubmit={handleAdminUpdate} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Update Status</label>
                <div className="grid grid-cols-1 gap-2">
                  {[DamageStatus.SEDANG_PROSES, DamageStatus.PENGAJUAN_DANA, DamageStatus.FIXED].map((status) => (
                    <button key={status} type="button" onClick={() => setManageData({...manageData, status})} className={`p-3 rounded-2xl text-sm font-bold border-2 transition-all text-left ${manageData.status === status ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 bg-slate-50 text-slate-500'}`}>
                      {status.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
                {manageData.status === DamageStatus.FIXED && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-2 animate-pulse">
                    * Menandai status ini akan otomatis menghitung durasi pengerjaan.
                  </p>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Jenis Perbaikan</label>
                <select className="w-full p-3 bg-slate-50 rounded-2xl text-sm outline-none border-2 border-transparent focus:border-indigo-500 transition-all" value={manageData.repairType || ''} onChange={e => setManageData({...manageData, repairType: e.target.value as RepairType})}>
                  <option value="">-- Pilih Jenis Perbaikan --</option>
                  <option value={RepairType.GANTI_SPARE_PART}>Ganti Spare Part</option>
                  <option value={RepairType.TEKNISI_LUAR}>Teknisi Luar</option>
                  <option value={RepairType.TEKNISI_INTERNAL}>Teknisi Internal</option>
                </select>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsAdminManageOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500">Batal</button>
                <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl">Update Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DamageReports;
