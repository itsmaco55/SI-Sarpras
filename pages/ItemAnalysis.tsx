
import React, { useState, useMemo } from 'react';
import { TrendingUp, AlertCircle, Sparkles, Loader2, Info, Activity, ShieldCheck, BarChart3 } from 'lucide-react';
import { Item, BorrowRequest, Category } from '../types';
import { GoogleGenAI } from "@google/genai";

interface ItemAnalysisProps {
  items: Item[];
  borrows: BorrowRequest[];
  categories: Category[];
}

const ItemAnalysis: React.FC<ItemAnalysisProps> = ({ items, borrows, categories }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Frequency Logic
  const usageRanking = useMemo(() => {
    const counts = borrows.reduce((acc, b) => {
      if (b.type === 'ITEM') {
        b.items.forEach(bi => {
          acc[bi.itemId] = (acc[bi.itemId] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    return items
      .map(item => ({
        ...item,
        usageCount: counts[item.id] || 0,
        categoryName: categories.find(c => c.id === item.type)?.name || 'N/A'
      }))
      .sort((a, b) => b.usageCount - a.usageCount);
  }, [borrows, items, categories]);

  const getAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const topItems = usageRanking.slice(0, 5).filter(i => i.usageCount > 0);
      if (topItems.length === 0) {
        setAiAnalysis("Belum ada data peminjaman yang cukup untuk dianalisis oleh AI.");
        setIsAnalyzing(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analisis resiko kerusakan sarana sekolah:
      Berikut adalah daftar barang yang paling sering dipinjam di sekolah kami:
      ${topItems.map(i => `- ${i.name} (${i.categoryName}): dipinjam ${i.usageCount} kali`).join('\n')}
      
      Sebagai ahli sarana prasarana, berikan analisis (maks 250 kata):
      1. Komponen apa yang paling beresiko rusak pada masing-masing barang tersebut karena penggunaan tinggi ini.
      2. Berikan saran langkah perawatan preventif yang cerdas dan hemat biaya.
      3. Prediksi kapan kira-kira barang tersebut perlu diservis secara menyeluruh.
      Gunakan bahasa Indonesia yang profesional dan sangat edukatif.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      setAiAnalysis(response.text || 'Gagal menghasilkan analisis.');
    } catch (error) {
      console.error("AI Analysis failed:", error);
      setAiAnalysis("Maaf, terjadi gangguan saat menghubungi Asisten AI Gemini.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Analisis Barang</h2>
        <p className="text-slate-400 text-sm">Identifikasi beban penggunaan aset dan mitigasi resiko kerusakan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Peringkat Intensitas Penggunaan</h3>
                <p className="text-xs text-slate-400 font-medium tracking-tight">Menampilkan 10 barang dengan frekuensi pinjam tertinggi</p>
              </div>
            </div>

            <div className="space-y-4">
              {usageRanking.slice(0, 10).map((item, idx) => {
                const maxUsage = usageRanking[0]?.usageCount || 1;
                const percentage = (item.usageCount / maxUsage) * 100;
                
                return (
                  <div key={item.id} className="group relative bg-slate-50/50 p-4 rounded-3xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all">
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-3">
                          <span className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-xl text-xs font-black">{idx + 1}</span>
                          <div>
                             <p className="font-bold text-slate-700 leading-none">{item.name}</p>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.categoryName} • {item.code}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-xl font-black text-slate-800 leading-none">{item.usageCount}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pinjam</p>
                       </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                    </div>
                    {item.usageCount > 10 && (
                      <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg shadow-lg">HIGH WEAR RISK</div>
                    )}
                  </div>
                )
              })}
              {usageRanking.length === 0 && <p className="text-center py-20 text-slate-300 italic">Belum ada data peminjaman terekam.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl flex flex-col min-h-[450px]">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles size={24} className="text-indigo-400" />
              <h4 className="font-black text-xs uppercase tracking-widest text-indigo-200">AI Maintenance Advisor</h4>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {aiAnalysis ? (
                <div className="prose prose-invert prose-sm">
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {aiAnalysis}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                  <Activity size={48} className="text-indigo-500" />
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">Biarkan AI menganalisis data penggunaan Anda</p>
                </div>
              )}
            </div>

            <button 
              onClick={getAiAnalysis}
              disabled={isAnalyzing}
              className="mt-8 w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-indigo-500/30"
            >
              {isAnalyzing ? <><Loader2 size={16} className="animate-spin" /> Menganalisis...</> : <><Sparkles size={16} /> Analisis Cerdas Sekarang</>}
            </button>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <ShieldCheck size={24} className="text-emerald-500" />
                <h4 className="font-black text-xs uppercase tracking-widest text-slate-400">Tips Perawatan Umum</h4>
             </div>
             <ul className="space-y-4">
                {[
                  'Cek kondisi fisik barang setiap 5x peminjaman.',
                  'Wajibkan user mengisi form kondisi sebelum/setelah pakai.',
                  'Bersihkan debu & kotoran pada komponen bergerak.',
                  'Update firmware/software pada aset elektronik.'
                ].map((tip, i) => (
                  <li key={i} className="flex gap-3 text-xs font-semibold text-slate-600">
                    <span className="w-5 h-5 flex-shrink-0 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-[10px] font-black">{i+1}</span>
                    {tip}
                  </li>
                ))}
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemAnalysis;
