
import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Printer, 
  X, 
  Calendar, 
  Wallet, 
  Info, 
  FileUp, 
  Download, 
  Building2, 
  Tag, 
  CheckSquare, 
  Square, 
  AlertCircle, 
  ShoppingBag, 
  ArrowRight,
  FileSpreadsheet,
  QrCode,
  Package
} from 'lucide-react';
import { Item, Room, User, UserRole, ItemCondition, Category, SubCategory, SchoolIdentity, Supplier, Merk, PurchaseRequest, PurchaseStatus } from '../types';
import { FUND_SOURCES } from '../constants.tsx';
import * as XLSX from 'xlsx';

interface InventoryProps {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  rooms: Room[];
  categories: Category[];
  subCategories: SubCategory[];
  suppliers: Supplier[];
  merks: Merk[];
  schoolIdentity: SchoolIdentity;
  user: User;
  purchaseRequests: PurchaseRequest[];
  setPurchaseRequests: React.Dispatch<React.SetStateAction<PurchaseRequest[]>>;
}

const Inventory: React.FC<InventoryProps> = ({ items, setItems, rooms, categories, subCategories, suppliers, merks, schoolIdentity, user, purchaseRequests, setPurchaseRequests }) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Item>>({
    name: '',
    merk: '',
    supplier: '',
    type: '',
    subType: '',
    itemTypeCode: '',
    condition: ItemCondition.BAIK,
    roomId: rooms[0]?.id || '',
    sourceFund: FUND_SOURCES[0],
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  const [originPurchaseId, setOriginPurchaseId] = useState<string | null>(null);

  const recommendations = useMemo(() => {
    return purchaseRequests.filter(pr => pr.status === PurchaseStatus.SUDAH_BELI && !pr.isRegisteredToInventory);
  }, [purchaseRequests]);

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.merk.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(i => i.id));
    }
  };

  const availableSubCategories = useMemo(() => {
    return subCategories.filter(sc => sc.categoryId === formData.type);
  }, [subCategories, formData.type]);

  const generateCode = (data: Partial<Item>, currentItems: Item[]) => {
    const cat = categories.find(c => c.id === data.type);
    const sub = subCategories.find(s => s.id === data.subType);
    const room = rooms.find(r => r.id === data.roomId);
    
    if (!cat || !sub || !room || !data.itemTypeCode) return 'PENDING-CODE';
    
    const matchingItems = currentItems.filter(i => 
      i.type === data.type && 
      i.subType === data.subType && 
      i.itemTypeCode === data.itemTypeCode
    );
    const seq = (matchingItems.length + 1).toString().padStart(3, '0');
    
    return `${cat.code}.${sub.code}.${data.itemTypeCode.padStart(3, '0')}.${seq}/${room.name}/SMACO`;
  };

  const generatedCodePreview = useMemo(() => {
    if (!formData.type || !formData.subType || !formData.itemTypeCode || !formData.roomId) return 'XX.YY.ZZZ.NNN/ROOM/SMACO';
    return generateCode(formData, items);
  }, [formData, categories, subCategories, rooms, items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formData } as Item : i));
    } else {
      const finalCode = generatedCodePreview;
      const newItem: Item = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        code: finalCode,
      } as Item;
      setItems(prev => [...prev, newItem]);

      if (originPurchaseId) {
        setPurchaseRequests(prev => prev.map(pr => pr.id === originPurchaseId ? { ...pr, isRegisteredToInventory: true } : pr));
        setOriginPurchaseId(null);
      }
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const deleteItem = (id: string) => {
    if (confirm('Yakin ingin menghapus barang ini?')) {
      setItems(prev => prev.filter(i => i.id !== id));
      setSelectedIds(prev => prev.filter(sId => sId !== id));
    }
  };

  const startFromRecommendation = (pr: PurchaseRequest) => {
    setFormData({
      name: pr.itemName,
      merk: '',
      supplier: '',
      type: '',
      subType: '',
      itemTypeCode: '',
      condition: ItemCondition.BAIK,
      roomId: rooms[0]?.id || '',
      sourceFund: pr.sourceFund,
      purchaseDate: pr.realizationDate || pr.requestDate 
    });
    setOriginPurchaseId(pr.id);
    setIsModalOpen(true);
  };

  const downloadTemplate = () => {
    const headers = [
      ['Nama Barang', 'Merk', 'Supplier', 'Kode Jenis', 'Kode Sub Jenis', 'Kode Tipe (3 digit)', 'Kondisi (BAIK/RUSAK_RINGAN/RUSAK_BERAT)', 'Sumber Dana', 'Nama Ruangan', 'Tgl Beli (YYYY-MM-DD)']
    ];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Inventaris");
    XLSX.writeFile(wb, "Template_Import_Inventaris.xlsx");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      const newItems: Item[] = [];
      let tempItems = [...items];

      data.forEach((row: any) => {
        if (!row['Nama Barang']) return;

        const cat = categories.find(c => c.code === String(row['Kode Jenis'] || '').padStart(2, '0'));
        const sub = subCategories.find(s => s.code === String(row['Kode Sub Jenis'] || '').padStart(2, '0'));
        const room = rooms.find(r => r.name === row['Nama Ruangan']);

        if (cat && sub && room) {
          const itemData: Partial<Item> = {
            name: row['Nama Barang'],
            merk: row['Merk'] || 'Custom',
            supplier: row['Supplier'] || 'Umum',
            type: cat.id,
            subType: sub.id,
            itemTypeCode: String(row['Kode Tipe (3 digit)'] || '000').padStart(3, '0'),
            condition: (row['Kondisi (BAIK/RUSAK_RINGAN/RUSAK_BERAT)'] || 'BAIK') as ItemCondition,
            roomId: room.id,
            sourceFund: row['Sumber Dana'] || 'BOSNAS',
            purchaseDate: row['Tgl Beli (YYYY-MM-DD)'] || new Date().toISOString().split('T')[0]
          };

          const finalCode = generateCode(itemData, tempItems);
          const newItem: Item = {
            ...itemData,
            id: Math.random().toString(36).substr(2, 9).toUpperCase(),
            code: finalCode,
          } as Item;

          newItems.push(newItem);
          tempItems.push(newItem);
        }
      });

      if (newItems.length > 0) {
        setItems(prev => [...prev, ...newItems]);
        alert(`Berhasil mengimpor ${newItems.length} barang!`);
      } else {
        alert('Gagal Import. Pastikan Kode Jenis (2 digit), Kode Sub Jenis (2 digit), dan Nama Ruangan sudah sesuai dengan Master Data.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; 
  };

  const handlePrintAction = () => {
    // Memberi sedikit jeda agar DOM terupdate sepenuhnya sebelum memanggil print
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="space-y-8">
      {/* Recommendation Section */}
      {recommendations.length > 0 && (
        <div className="bg-indigo-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden animate-in fade-in duration-500">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingBag size={24} className="text-indigo-400" />
              <h4 className="font-black text-xs uppercase tracking-widest text-indigo-300">Konfirmasi Barang Masuk ({recommendations.length})</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map(pr => (
                <div key={pr.id} className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10 hover:bg-white/20 transition-all flex justify-between items-center group">
                  <div>
                    <p className="font-bold text-sm leading-tight">{pr.itemName}</p>
                    <p className="text-[10px] text-indigo-300 font-bold uppercase mt-1">REALISASI: {pr.realizationDate || pr.requestDate}</p>
                  </div>
                  <button 
                    onClick={() => startFromRecommendation(pr)}
                    className="p-2 bg-indigo-500 rounded-xl hover:bg-indigo-400 transition-all shadow-lg"
                    title="Daftarkan ke Inventaris"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-600 rounded-full blur-3xl opacity-20"></div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama, kode, merk, atau supplier..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedIds.length > 0 && (
            <button 
              onClick={() => setShowPrintPreview(true)}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200"
            >
              <Printer size={18} /> Cetak Label ({selectedIds.length})
            </button>
          )}
          {user.role === UserRole.ADMIN && (
            <>
              <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleImport} />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all"
              >
                <FileUp size={18} /> Import Excel
              </button>
              <button 
                onClick={downloadTemplate}
                className="flex items-center gap-2 bg-white text-slate-400 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100 hover:bg-slate-50 transition-all"
              >
                <FileSpreadsheet size={18} /> Template
              </button>
              <button 
                onClick={() => { 
                  setEditingItem(null); 
                  setOriginPurchaseId(null);
                  setFormData({ 
                    name: '', 
                    merk: '', 
                    supplier: '', 
                    type: '', 
                    subType: '', 
                    itemTypeCode: '', 
                    condition: ItemCondition.BAIK, 
                    roomId: rooms[0]?.id || '', 
                    sourceFund: FUND_SOURCES[0], 
                    purchaseDate: new Date().toISOString().split('T')[0] 
                  }); 
                  setIsModalOpen(true); 
                }}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus size={20} /> Tambah Manual
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-50 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1200px]">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-6 w-12">
                  <button onClick={toggleSelectAll} className="text-slate-300 hover:text-indigo-600 transition-colors">
                    {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? <CheckSquare size={22} /> : <Square size={22} />}
                  </button>
                </th>
                <th className="px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identitas Aset</th>
                <th className="px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Barang</th>
                <th className="px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ruangan</th>
                <th className="px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kondisi</th>
                <th className="px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dana & Tgl</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map(item => (
                <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors ${selectedIds.includes(item.id) ? 'bg-indigo-50/30' : ''}`}>
                  <td className="px-8 py-6">
                    <button onClick={() => toggleSelect(item.id)} className={`${selectedIds.includes(item.id) ? 'text-indigo-600' : 'text-slate-300'}`}>
                      {selectedIds.includes(item.id) ? <CheckSquare size={22} /> : <Square size={22} />}
                    </button>
                  </td>
                  <td className="px-4 py-6">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 inline-block">
                      <p className="font-mono text-[10px] text-indigo-600 font-black tracking-tighter">{item.code}</p>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <p className="font-black text-slate-700 text-base">{item.name}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.merk}</span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">•</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.supplier}</span>
                    </div>
                  </td>
                  <td className="px-4 py-6 font-bold text-slate-600">
                    {rooms.find(r => r.id === item.roomId)?.name || 'N/A'}
                  </td>
                  <td className="px-4 py-6">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      item.condition === ItemCondition.BAIK ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      item.condition === ItemCondition.RUSAK_RINGAN ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                      item.condition === ItemCondition.RUSAK_BERAT ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.condition.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-6">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{item.sourceFund}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{item.purchaseDate}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-3">
                      {user.role === UserRole.ADMIN && (
                        <>
                          <button onClick={() => { setEditingItem(item); setFormData(item); setIsModalOpen(true); }} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-100 transition-all">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => deleteItem(item.id)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-100 transition-all">
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                   <td colSpan={7} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center opacity-30">
                        <Package size={64} className="text-slate-300 mb-4" />
                        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Belum ada data barang</p>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Input Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-[3rem] p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{editingItem ? 'Edit' : 'Tambah'} Inventaris</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mt-1">Lengkapi spesifikasi barang</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X className="text-slate-300" size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <QrCode size={16} className="text-indigo-600" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Review Kode Label Aset</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-indigo-200 text-center">
                   <p className="font-mono text-sm font-black text-indigo-600 tracking-tighter">{generatedCodePreview}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Nama Barang</label>
                  <input type="text" required className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-bold text-slate-700" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Merk</label>
                    <select required className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-bold text-slate-700 cursor-pointer" value={formData.merk} onChange={e => setFormData({...formData, merk: e.target.value})}>
                      <option value="">-- Pilih Merk --</option>
                      {merks.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Supplier</label>
                    <select required className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-bold text-slate-700 cursor-pointer" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})}>
                      <option value="">-- Pilih Supplier --</option>
                      {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Jenis Utama</label>
                  <select required className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-bold text-slate-700 cursor-pointer" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value, subType: ''})}>
                    <option value="">-- Pilih Jenis --</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name} ({cat.code})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Sub Jenis</label>
                  <select required className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-bold text-slate-700 cursor-pointer disabled:opacity-50" disabled={!formData.type} value={formData.subType} onChange={e => setFormData({...formData, subType: e.target.value})}>
                    <option value="">-- Pilih Sub --</option>
                    {availableSubCategories.map(sc => <option key={sc.id} value={sc.id}>{sc.name} ({sc.code})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Kode Tipe (3 Digit)</label>
                  <input type="text" maxLength={3} placeholder="001" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-mono font-black text-indigo-600" value={formData.itemTypeCode} onChange={e => setFormData({...formData, itemTypeCode: e.target.value.replace(/\D/g, '')})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Ruangan</label>
                  <select required className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-bold text-slate-700 cursor-pointer" value={formData.roomId} onChange={e => setFormData({...formData, roomId: e.target.value})}>
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Kondisi Barang</label>
                  <select className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-xs" value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value as ItemCondition})}>
                    <option value={ItemCondition.BAIK}>BAIK</option>
                    <option value={ItemCondition.RUSAK_RINGAN}>RUSAK RINGAN</option>
                    <option value={ItemCondition.RUSAK_BERAT}>RUSAK BERAT</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Sumber Dana</label>
                  <select className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-xs" value={formData.sourceFund} onChange={e => setFormData({...formData, sourceFund: e.target.value})}>
                    {FUND_SOURCES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tgl Perolehan</label>
                  <input type="date" className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-xs" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-all">Batal</button>
                <button type="submit" className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Simpan Aset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Label Print Preview Overlay */}
      {showPrintPreview && (
        <div className="fixed inset-0 bg-slate-900/95 z-[200] overflow-y-auto no-print">
          <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="bg-white p-6 rounded-t-[2rem] border-b border-slate-100 flex justify-between items-center shadow-2xl">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tighter">Pratinjau Cetak Label (10 x 5 cm)</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{selectedIds.length} Label terpilih</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowPrintPreview(false)} className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest">Tutup</button>
                <button onClick={handlePrintAction} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-200 flex items-center gap-2">
                  <Printer size={16} /> Cetak Sekarang
                </button>
              </div>
            </div>

            <div className="bg-white p-10 shadow-2xl overflow-hidden rounded-b-[2rem]">
              <div className="label-grid">
                {selectedIds.map(id => {
                  const item = items.find(i => i.id === id);
                  if (!item) return null;
                  return (
                    <div key={item.id} className="asset-label mx-auto mb-4 border-2 border-black p-4 flex flex-col justify-between">
                      <div className="flex justify-between items-start border-b border-black pb-1 mb-1">
                         <div className="flex items-center gap-2">
                           {schoolIdentity.logo && <img src={schoolIdentity.logo} className="w-12 h-12 object-contain" />}
                           <div>
                              <p className="text-[9px] font-black leading-none uppercase">{schoolIdentity.name}</p>
                              <p className="text-[7px] font-bold mt-1 text-slate-500 uppercase">LABEL INVENTARIS NEGARA</p>
                           </div>
                         </div>
                         <QrCode size={40} />
                      </div>
                      
                      <div className="flex-1 py-1">
                        <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Nama Barang:</p>
                        <p className="text-base font-black leading-tight mb-1">{item.name}</p>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-[7px] font-black text-slate-400 uppercase">Merk / Tipe</p>
                            <p className="text-[9px] font-black uppercase truncate">{item.merk}</p>
                          </div>
                          <div>
                            <p className="text-[7px] font-black text-slate-400 uppercase">Lokasi</p>
                            <p className="text-[9px] font-black uppercase truncate">{rooms.find(r => r.id === item.roomId)?.name || '-'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 pt-1 border-t border-black text-center bg-black text-white p-1">
                        <p className="text-[9px] font-mono font-black tracking-widest">{item.code}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actual Hidden Component for Browser Printing */}
      <div className="hidden print-only">
         <div className="label-grid">
            {selectedIds.map(id => {
              const item = items.find(i => i.id === id);
              if (!item) return null;
              return (
                <div key={item.id} className="asset-label">
                  <div className="flex justify-between items-start border-b border-black pb-1 mb-1">
                      <div className="flex items-center gap-2">
                        {schoolIdentity.logo && <img src={schoolIdentity.logo} className="w-12 h-12 object-contain" />}
                        <div>
                          <p className="text-[9px] font-black leading-none uppercase">{schoolIdentity.name}</p>
                          <p className="text-[7px] font-bold mt-0.5 uppercase">LABEL INVENTARIS NEGARA</p>
                        </div>
                      </div>
                      <div className="border border-black p-1 text-[7px] font-black">QR</div>
                  </div>
                  
                  <div className="flex-1 py-1">
                    <p className="text-[7px] font-black uppercase text-slate-400">Nama Barang:</p>
                    <p className="text-base font-black leading-tight mb-1">{item.name}</p>
                    <div className="grid grid-cols-2 gap-1">
                      <div>
                        <p className="text-[7px] font-black text-slate-400 uppercase">Merk</p>
                        <p className="text-[9px] font-black uppercase truncate">{item.merk}</p>
                      </div>
                      <div>
                        <p className="text-[7px] font-black text-slate-400 uppercase">Ruang</p>
                        <p className="text-[9px] font-black uppercase truncate">{rooms.find(r => r.id === item.roomId)?.name || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 pt-1 border-t border-black text-center bg-black text-white p-1">
                    <p className="text-[9px] font-mono font-black tracking-widest">{item.code}</p>
                  </div>
                </div>
              );
            })}
         </div>
      </div>
    </div>
  );
};

export default Inventory;
