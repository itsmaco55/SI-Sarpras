
import React, { useState, useEffect } from 'react';
import { Save, Upload, User, MapPin, Hash, Phone, Wrench, Shield, School, CheckCircle, Loader2, Cloud, Terminal, ExternalLink, ToggleLeft, ToggleRight } from 'lucide-react';
import { SchoolIdentity, UserRole, User as AuthUser } from '../types';
import { GoogleGenAI } from "@google/genai";

interface SchoolIdentityProps {
  schoolIdentity: SchoolIdentity;
  setSchoolIdentity: (identity: SchoolIdentity) => void;
  user: AuthUser;
}

const SchoolIdentityPage: React.FC<SchoolIdentityProps> = ({ schoolIdentity, setSchoolIdentity, user }) => {
  const [formData, setFormData] = useState<SchoolIdentity>(() => ({ 
    ...schoolIdentity,
    syncConfig: schoolIdentity.syncConfig || { googleSheetsUrl: '', autoSync: false }
  }));
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'IDENTITY' | 'CLOUD'>('IDENTITY');
  const [aiCode, setAiCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!isSaving && !isSaved) {
      setFormData({ 
        ...schoolIdentity,
        syncConfig: schoolIdentity.syncConfig || { googleSheetsUrl: '', autoSync: false }
      });
    }
  }, [schoolIdentity]);

  const generateAppsScript = async () => {
    setIsGenerating(true);
    try {
      // Initialize with apiKey from process.env.API_KEY
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        // Coding tasks are complex, so use gemini-3-pro-preview as per guidelines
        model: 'gemini-3-pro-preview',
        contents: `Buatkan Google Apps Script (doPost function) untuk menyimpan data JSON ke Google Sheets. 
        Data yang dikirim memiliki struktur: { school, timestamp, data: { items: [], rooms: [], categories: [], subCategories: [], borrows: [], damages: [] } }.
        Script harus: 
        1. Membuat sheet baru jika belum ada.
        2. Menulis seluruh data ke baris yang sesuai atau mengganti isi sheet dengan data terbaru (Full Sync).
        Berikan kode lengkap yang siap di-deploy sebagai Web App.`
      });
      // Correct way to extract text from GenerateContentResponse
      setAiCode(response.text || '');
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("Gagal membuat kode AI. Silakan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('File logo terlalu besar! Maksimal 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, logo: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      setSchoolIdentity(formData);
      localStorage.setItem('schoolIdentity', JSON.stringify(formData));
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      setIsSaving(false);
      alert("Gagal menyimpan ke penyimpanan lokal.");
    }
  };

  if (user.role !== UserRole.ADMIN) {
    return <div className="p-8 text-center bg-white rounded-3xl border border-slate-100"><Shield size={48} className="mx-auto text-slate-300 mb-4"/><p className="text-slate-500">Hanya Admin yang dapat mengubah identitas.</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Tab Navigation */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
        <button onClick={() => setActiveTab('IDENTITY')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'IDENTITY' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Identitas Sekolah</button>
        <button onClick={() => setActiveTab('CLOUD')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'CLOUD' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Integrasi Cloud</button>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
        {isSaved && (
          <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white py-2 px-4 flex items-center justify-center gap-2 z-10">
            <CheckCircle size={18} /> <span className="text-sm font-bold">Pengaturan Berhasil Disimpan!</span>
          </div>
        )}

        {activeTab === 'IDENTITY' ? (
          <form onSubmit={handleSave} className="space-y-8 pt-4">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-1/3 space-y-4">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Logo Sekolah</p>
                <div className="relative group aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl overflow-hidden flex items-center justify-center p-4">
                  {formData.logo ? <img src={formData.logo} className="max-w-full max-h-full object-contain" /> : <School className="text-slate-200" size={64} />}
                  <label className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 bg-indigo-600/10 transition-all rounded-3xl">
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    <div className="bg-indigo-600 text-white p-3 rounded-full shadow-lg"><Upload size={24} /></div>
                  </label>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Profil Dasar</p>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-1">Nama Sekolah</label>
                    <input type="text" required className="w-full p-3 bg-slate-50 rounded-2xl outline-none focus:bg-white border-2 border-transparent focus:border-indigo-500 transition-all" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-1">Alamat</label>
                    <textarea required className="w-full p-3 bg-slate-50 rounded-2xl outline-none focus:bg-white border-2 border-transparent focus:border-indigo-500 transition-all" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} rows={3} />
                  </div>
                </div>
              </div>
            </div>
            <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-indigo-100">
              {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />} Simpan Identitas
            </button>
          </form>
        ) : (
          <div className="space-y-8 pt-4">
            <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <div className="p-3 bg-indigo-600 text-white rounded-xl"><Cloud size={24} /></div>
              <div>
                <h4 className="font-bold text-indigo-900">Google Sheets Sync</h4>
                <p className="text-sm text-indigo-600">Sinkronkan data Inventaris langsung ke Google Spreadsheet Anda secara real-time.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-700">Status Auto-Sync</p>
                <button 
                  onClick={() => setFormData(prev => ({ ...prev, syncConfig: { ...prev.syncConfig!, autoSync: !prev.syncConfig?.autoSync }}))}
                  className="flex items-center gap-2 p-1 bg-slate-100 rounded-full transition-all"
                >
                  {formData.syncConfig?.autoSync ? <ToggleRight className="text-indigo-600" size={40} /> : <ToggleLeft className="text-slate-400" size={40} />}
                </button>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2 flex items-center gap-2">
                  Google Apps Script Web App URL <ExternalLink size={14} className="text-slate-400" />
                </label>
                <input 
                  type="url" 
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full p-3 bg-slate-50 rounded-2xl outline-none focus:bg-white border-2 border-transparent focus:border-indigo-500 transition-all font-mono text-xs" 
                  value={formData.syncConfig?.googleSheetsUrl || ''}
                  onChange={e => setFormData(prev => ({ ...prev, syncConfig: { ...prev.syncConfig!, googleSheetsUrl: e.target.value }}))}
                />
              </div>

              <div className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold text-slate-800">Panduan Setup (AI)</h5>
                  <button 
                    onClick={generateAppsScript}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                  >
                    {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Terminal size={14} />} Generate Google Script
                  </button>
                </div>
                
                {aiCode && (
                  <div className="space-y-4 animate-in slide-in-from-bottom duration-500">
                    <div className="bg-slate-900 text-slate-300 p-4 rounded-2xl text-[10px] font-mono overflow-x-auto max-h-64 border border-slate-700">
                      <pre>{aiCode}</pre>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                      <p className="text-xs text-amber-800 font-medium">
                        <strong>Cara Pakai:</strong> Copy kode di atas, buka <a href="https://script.google.com" target="_blank" className="underline font-bold">Google Apps Script</a>, paste kodenya, klik <strong>Deploy</strong> &gt; <strong>New Deployment</strong> &gt; <strong>Web App</strong>. Atur akses ke <strong>Anyone</strong>, lalu copy URL hasil deploy ke input di atas.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <button onClick={handleSave} disabled={isSaving} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
              <Save size={20} /> Simpan Konfigurasi Cloud
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolIdentityPage;
