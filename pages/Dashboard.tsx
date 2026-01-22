
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Package, DoorOpen, ClipboardList, AlertTriangle } from 'lucide-react';
import { Item, Room, BorrowRequest, DamageReport, DamageStatus } from '../types';

interface DashboardProps {
  items: Item[];
  rooms: Room[];
  borrows: BorrowRequest[];
  damages: DamageReport[];
}

const Dashboard: React.FC<DashboardProps> = ({ items, rooms, borrows, damages }) => {
  const stats = [
    { label: 'Total Barang', value: items.length, icon: Package, color: 'bg-blue-500' },
    { label: 'Total Ruangan', value: rooms.length, icon: DoorOpen, color: 'bg-purple-500' },
    { label: 'Peminjaman Aktif', value: borrows.filter(b => b.status === 'APPROVED').length, icon: ClipboardList, color: 'bg-emerald-500' },
    { label: 'Laporan Kerusakan', value: damages.filter(d => d.status !== DamageStatus.FIXED).length, icon: AlertTriangle, color: 'bg-rose-500' },
  ];

  const conditionData = useMemo(() => {
    const counts = items.reduce((acc, item) => {
      acc[item.condition] = (acc[item.condition] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value]) => ({ 
      name: name.replace('_', ' '), 
      value 
    }));
  }, [items]);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  const roomUsageData = useMemo(() => {
    return rooms.map(room => ({
      name: room.name,
      items: items.filter(i => i.roomId === room.id).length
    }));
  }, [rooms, items]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Kondisi Barang</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={conditionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {conditionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Distribusi Barang per Ruang</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomUsageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="items" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
