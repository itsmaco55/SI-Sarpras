
import React, { useState, useMemo } from 'react';
import { Trash2, Plus, Printer, X, Calendar, FileText, User as UserIcon, Building2, MapPin, Search } from 'lucide-react';
import { Item, User, UserRole, DisposalRecord, DisposalType, SchoolIdentity, ItemCondition } from '../types';

interface DisposalProps {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  disposals: DisposalRecord[];
  setDisposals: React.Dispatch<React.SetStateAction<DisposalRecord[]>>;
  schoolIdentity: SchoolIdentity;
  user: User;
}

const Disposal: React.FC<DisposalProps> = ({ items, setItems, disposals, setDisposals, schoolIdentity, user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDisposal, setSelectedDisposal] = useState<DisposalRecord | null>(null);
  const [showPrintBA, setShowPrintBA] = useState(false);

  const [formData, setFormData] = useState<Partial<DisposalRecord>>({
    itemId: '',
    disposalType: DisposalType.DIMUSNAHKAN,
    disposalDate: new Date().toISOString().split('T')[0],
    destination: '',
    notes: '',
    documentNumber: `BA-HPS/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
  });

  const availableItems = useMemo(() => {
    return items.filter(i => i.condition === ItemCondition.RUSAK_BERAT);
  }, [items]);

  const filteredDisposals = useMemo(() => {
    return disposals.filter(d => {
      const item = items.find(i => i.id === d.itemId);
      return item?.name.toLowerCase().includes(search.toLowerCase()) || 
             d.documentNumber.toLowerCase().includes(search.toLowerCase());
    });
  }, [disposals, items, search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: DisposalRecord = {
      ...formData,
      id: 'DISP-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      officerName: user.fullName
    } as DisposalRecord;

    setDisposals(prev => [newRecord, ...prev]);
    
    // Update item status in inventory to DIHAPUS
    setItems(prev => prev.map(i => i.id === formData.itemId ? { ...i, condition: ItemCondition.DIHAPUS } : i));
    
    setIsModalOpen(false);
    setFormData({
      itemId: '',
      disposalType: DisposalType.DIMUSNAHKAN,
      disposalDate: new Date().toISOString().split('T')[0],
      destination: '',
      notes: '',
      documentNumber: `BA-HPS/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    });
  };

  const handlePrint = (record: DisposalRecord) => {
    setSelectedDisposal(record);
    setShowPrintBA(true);
  };

  const printDocument = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <Trash2 size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Penghapusan Aset</h3>
            <p className="text-xs text-slate-400">Pemusnahan atau hibah aset rusak berat</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari BA / Barang..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-rose-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-rose-100 hover:scale-105 transition-all"
          >
            <Plus size={18} /> Hapus Aset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredDisposals.map(d => {
          const item = items.find(i => i.id === d.itemId);
          return (
            <div key={d.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.documentNumber}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      d.disposalType === DisposalType.DIHIBAHKAN ? 'bg-indigo-50 text-indigo-600' :
                      d.disposalType === DisposalType.DIJUAL_ROMBENG ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {d.disposalType.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg">{item?.name || 'Aset Terhapus'}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar size={12} />
                      {new Date(d.disposalDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin size={12} />
                      Tujuan: <span className="font-bold text-slate-700">{d.destination}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handlePrint(d)}
                className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-slate-900 transition-all active:scale-95"
              >
                <Printer size={16} /> Berita Acara
              </button>
            </div>
          );
        })}
        {filteredDisposals.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Trash2 size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">Belum ada riwayat penghapusan aset.</p>
          </div>
        )}
      </div>

      {/* Disposal Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Form Penghapusan Aset</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-rose-500"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Pilih Aset (Kondisi Rusak Berat)</label>
                <select required className="w-full p-3 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl text-sm outline-none transition-all" value={formData.itemId} onChange={e => setFormData({...formData, itemId: e.target.value})}>
                  <option value="">-- Cari Barang Rusak Berat --</option>
                  {availableItems.map(i => <option key={i.id} value={i.id}>{i.name} ({i.code})</option>)}
                </select>
                {availableItems.length === 0 && <p className="text-[10px] text-rose-500 font-bold mt-1">* Tidak ada barang dengan kondisi Rusak Berat yang bisa dihapus.</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Metode</label>
                  <select required className="w-full p-3 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl text-sm outline-none transition-all" value={formData.disposalType} onChange={e => setFormData({...formData, disposalType: e.target.value as DisposalType})}>
                    <option value={DisposalType.DIMUSNAHKAN}>Dimusnahkan</option>
                    <option value={DisposalType.DIHIBAHKAN}>Hibah / Sumbangan</option>
                    <option value={DisposalType.DIJUAL_ROMBENG}>Dijual Rombeng</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Tgl Penghapusan</label>
                  <input type="date" required className="w-full p-3 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl text-sm outline-none transition-all" value={formData.disposalDate} onChange={e => setFormData({...formData, disposalDate: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Penerima / Tujuan / Lokasi Akhir</label>
                <input type="text" required placeholder="Contoh: CV. Pengepul Jaya / Panti Asuhan Kasih..." className="w-full p-3 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl text-sm outline-none transition-all" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Alasan / Keterangan Tambahan</label>
                <textarea rows={3} className="w-full p-3 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl text-sm outline-none transition-all" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Catatan teknis pemusnahan..."></textarea>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500">Batal</button>
                <button type="submit" disabled={!formData.itemId} className="flex-[2] py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-xl shadow-rose-100 hover:bg-rose-700 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100">Proses Penghapusan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Berita Acara Print Preview */}
      {showPrintBA && selectedDisposal && (
        <div className="fixed inset-0 bg-slate-900/90 z-[100] overflow-y-auto no-print">
          <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="bg-white p-6 rounded-t-3xl flex justify-between items-center border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Preview Berita Acara</h3>
              <div className="flex gap-4">
                <button onClick={() => setShowPrintBA(false)} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold">Tutup</button>
                <button onClick={printDocument} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 flex items-center gap-2">
                  <Printer size={18} /> Cetak Sekarang
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="bg-white p-[2cm] shadow-2xl print-area" id="ba-document">
              <style>{`
                @media print {
                  body * { visibility: hidden; }
                  .print-area, .print-area * { visibility: visible; }
                  .print-area { 
                    position: absolute; 
                    left: 0; 
                    top: 0; 
                    width: 100%; 
                    padding: 0;
                    box-shadow: none;
                  }
                  .no-print { display: none !important; }
                }
                .ba-content { font-family: 'Times New Roman', serif; line-height: 1.6; color: black; }
                .ba-header { text-align: center; border-bottom: 3px double black; padding-bottom: 15px; margin-bottom: 30px; }
                .ba-title { font-size: 18px; font-weight: bold; text-decoration: underline; text-transform: uppercase; margin-bottom: 5px; }
                .ba-info-table { width: 100%; margin: 20px 0; border-collapse: collapse; }
                .ba-info-table td { padding: 5px; vertical-align: top; }
                .ba-footer { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-top: 60px; text-align: center; }
                .ba-sign-space { height: 100px; }
              `}</style>
              
              <div className="ba-content">
                <div className="ba-header flex items-center gap-6 justify-center">
                  <img src={schoolIdentity.logo} className="w-24 h-24 object-contain" />
                  <div className="text-center">
                    <h2 className="text-xl font-bold uppercase">{schoolIdentity.name}</h2>
                    <p className="text-sm font-bold uppercase">{schoolIdentity.address}</p>
                    <p className="text-xs">Telp: {schoolIdentity.phone} | NPSN: {schoolIdentity.npsn}</p>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h3 className="ba-title">BERITA ACARA PENGHAPUSAN SARANA PRASARANA</h3>
                  <p className="font-bold">Nomor: {selectedDisposal.documentNumber}</p>
                </div>

                <p className="mb-4">Pada hari ini <strong>{new Date(selectedDisposal.disposalDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>, kami yang bertanda tangan di bawah ini telah melaksanakan proses <strong>{selectedDisposal.disposalType.replace('_', ' ')}</strong> terhadap aset sarana prasarana sekolah dengan rincian sebagai berikut:</p>

                <table className="ba-info-table">
                  <tbody>
                    <tr><td width="30%">Nama Barang</td><td>: <strong>{(items.find(i => i.id === selectedDisposal.itemId))?.name}</strong></td></tr>
                    <tr><td>Kode Label</td><td>: {(items.find(i => i.id === selectedDisposal.itemId))?.code}</td></tr>
                    <tr><td>Merk / Tipe</td><td>: {(items.find(i => i.id === selectedDisposal.itemId))?.merk}</td></tr>
                    <tr><td>Sumber Dana</td><td>: {(items.find(i => i.id === selectedDisposal.itemId))?.sourceFund}</td></tr>
                    <tr><td>Metode Penghapusan</td><td>: {selectedDisposal.disposalType.replace('_', ' ')}</td></tr>
                    <tr><td>Tujuan / Penerima</td><td>: {selectedDisposal.destination}</td></tr>
                    <tr><td>Keterangan</td><td>: {selectedDisposal.notes || '-'}</td></tr>
                  </tbody>
                </table>

                <p className="mt-8">Barang tersebut di atas dinyatakan telah keluar dari daftar inventaris sekolah karena kondisi <strong>RUSAK BERAT</strong> dan tidak dapat dipergunakan kembali sesuai fungsinya. Demikian berita acara ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.</p>

                <div className="ba-footer">
                  <div>
                    <p>Mengetahui,</p>
                    <p className="font-bold">Kepala Sekolah</p>
                    <div className="ba-sign-space"></div>
                    <p className="font-bold underline">{schoolIdentity.principal}</p>
                  </div>
                  <div>
                    <p>{schoolIdentity.address.split(',')[0]}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="font-bold">Petugas Sarpras</p>
                    <div className="ba-sign-space"></div>
                    <p className="font-bold underline">{selectedDisposal.officerName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Disposal;
