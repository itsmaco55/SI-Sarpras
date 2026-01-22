
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  DoorOpen, 
  ClipboardList, 
  AlertTriangle, 
  FileBarChart, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon,
  ChevronRight,
  School,
  Truck,
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  Trash2,
  Activity,
  Users as UsersIcon,
  Lock,
  Eye,
  EyeOff,
  ShoppingCart,
  Tags
} from 'lucide-react';
import { UserRole, Item, Room, User, BorrowRequest, DamageReport, Category, SubCategory, SchoolIdentity, Supplier, Merk, DisposalRecord, PurchaseRequest, PurchaseStatus } from './types';
import { INITIAL_USERS, INITIAL_ITEMS, INITIAL_ROOMS, INITIAL_CATEGORIES, INITIAL_SUBCATEGORIES, INITIAL_SCHOOL_IDENTITY, INITIAL_SUPPLIERS, INITIAL_MERKS } from './constants.tsx';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Rooms from './pages/Rooms';
import Categories from './pages/Categories';
import SubCategories from './pages/SubCategories';
import SuppliersAndMerks from './pages/SuppliersAndMerks';
import Borrowing from './pages/Borrowing';
import DamageReports from './pages/DamageReports';
import Reports from './pages/Reports';
import SchoolIdentityPage from './pages/SchoolIdentity';
import Disposal from './pages/Disposal';
import ItemAnalysis from './pages/ItemAnalysis';
import UserManagement from './pages/UserManagement';
import PurchaseRequests from './pages/PurchaseRequests';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem('items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(() => {
    const saved = localStorage.getItem('purchaseRequests');
    return saved ? JSON.parse(saved) : [];
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [subCategories, setSubCategories] = useState<SubCategory[]>(() => {
    const saved = localStorage.getItem('subCategories');
    return saved ? JSON.parse(saved) : INITIAL_SUBCATEGORIES;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [merks, setMerks] = useState<Merk[]>(() => {
    const saved = localStorage.getItem('merks');
    return saved ? JSON.parse(saved) : INITIAL_MERKS;
  });

  const [schoolIdentity, setSchoolIdentity] = useState<SchoolIdentity>(() => {
    const saved = localStorage.getItem('schoolIdentity');
    return saved ? JSON.parse(saved) : INITIAL_SCHOOL_IDENTITY;
  });

  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>(() => {
    const saved = localStorage.getItem('borrows');
    return saved ? JSON.parse(saved) : [];
  });

  const [damageReports, setDamageReports] = useState<DamageReport[]>(() => {
    const saved = localStorage.getItem('damages');
    return saved ? JSON.parse(saved) : [];
  });

  const [disposalRecords, setDisposalRecords] = useState<DisposalRecord[]>(() => {
    const saved = localStorage.getItem('disposals');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser) as User;
      return user.role === UserRole.ADMIN ? 'dashboard' : 'borrowing';
    }
    return 'dashboard';
  });
  
  const [borrowSubTab, setBorrowSubTab] = useState<'ITEM' | 'ROOM'>('ITEM');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR'>('IDLE');
  
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saveData = (key: string, data: any) => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.error(`Failed to save ${key}:`, e);
      }
    };

    saveData('users', users);
    saveData('items', items);
    saveData('purchaseRequests', purchaseRequests);
    saveData('rooms', rooms);
    saveData('categories', categories);
    saveData('subCategories', subCategories);
    saveData('suppliers', suppliers);
    saveData('merks', merks);
    saveData('schoolIdentity', schoolIdentity);
    saveData('borrows', borrowRequests);
    saveData('damages', damageReports);
    saveData('disposals', disposalRecords);

    if (schoolIdentity.syncConfig?.googleSheetsUrl && schoolIdentity.syncConfig?.autoSync) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      
      syncTimeoutRef.current = setTimeout(async () => {
        setSyncStatus('SYNCING');
        try {
          const payload = {
            school: schoolIdentity.name,
            timestamp: new Date().toISOString(),
            data: {
              items,
              purchaseRequests,
              rooms,
              categories,
              subCategories,
              suppliers,
              merks,
              borrows: borrowRequests,
              damages: damageReports,
              disposals: disposalRecords,
              identity: { ...schoolIdentity, logo: '' }
            }
          };

          await fetch(schoolIdentity.syncConfig!.googleSheetsUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          setSyncStatus('SUCCESS');
          setTimeout(() => setSyncStatus('IDLE'), 3000);
        } catch (error) {
          console.error("Sync to Sheets failed:", error);
          setSyncStatus('ERROR');
        }
      }, 2000);
    }
  }, [users, items, purchaseRequests, rooms, categories, subCategories, suppliers, merks, schoolIdentity, borrowRequests, damageReports, disposalRecords]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const user = users.find(u => u.username === loginUsername && u.password === loginPassword);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      setLoginUsername('');
      setLoginPassword('');
      setActiveTab(user.role === UserRole.ADMIN ? 'dashboard' : 'borrowing');
      setBorrowSubTab('ITEM');
    } else {
      setLoginError('Username atau Password salah!');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-center animate-in zoom-in duration-300">
          <div className="mb-8">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 mb-4">
              <School size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter">SI-SARPRAS</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Sistem Informasi Sarana Prasarana Sekolah</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl flex items-center gap-2 animate-bounce">
                <AlertTriangle size={14} /> {loginError}
              </div>
            )}
            
            <div className="text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  required 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-semibold"
                  placeholder="Masukkan username"
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-semibold"
                  placeholder="Masukkan password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-100 mt-4">
              Masuk Sekarang
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-50">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter italic">"Efisien, Transparan, Akurat"</p>
          </div>
        </div>
      </div>
    );
  }

  const sections = [
    {
      title: 'OVERVIEW',
      roles: [UserRole.ADMIN],
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN] },
      ]
    },
    {
      title: 'MASTER',
      roles: [UserRole.ADMIN],
      items: [
        { id: 'school', label: 'Identitas Sekolah', icon: School, roles: [UserRole.ADMIN] },
        { id: 'users', label: 'Manajemen User', icon: UsersIcon, roles: [UserRole.ADMIN] },
        { id: 'inventory', label: 'Inventaris Barang', icon: Package, roles: [UserRole.ADMIN] },
        { id: 'suppliers', label: 'Supplier dan Merk', icon: Truck, roles: [UserRole.ADMIN] },
        { id: 'categories', label: 'Jenis dan Sub Jenis Barang', icon: Tags, roles: [UserRole.ADMIN] },
        { id: 'rooms', label: 'Ruang', icon: DoorOpen, roles: [UserRole.ADMIN] },
      ]
    },
    {
      title: 'TRANSAKSI',
      roles: [UserRole.ADMIN, UserRole.GURU, UserRole.SISWA],
      items: [
        { id: 'purchase', label: 'Pengajuan Pembelian', icon: ShoppingCart, roles: [UserRole.ADMIN] },
        { id: 'borrow-item', label: 'Pinjam Barang', icon: ClipboardList, roles: [UserRole.ADMIN, UserRole.GURU, UserRole.SISWA] },
        { id: 'borrow-room', label: 'Pinjam Ruang', icon: DoorOpen, roles: [UserRole.ADMIN, UserRole.GURU, UserRole.SISWA] },
        { id: 'damage', label: 'Laporan Kerusakan', icon: AlertTriangle, roles: [UserRole.ADMIN, UserRole.GURU, UserRole.SISWA] },
        { id: 'disposal', label: 'Penghapusan Aset', icon: Trash2, roles: [UserRole.ADMIN] },
      ]
    },
    {
      title: 'REPORT',
      roles: [UserRole.ADMIN],
      items: [
        { id: 'analysis', label: 'Analisis Barang', icon: Activity, roles: [UserRole.ADMIN] },
        { id: 'report-inventory', label: 'Rekap Barang', icon: FileBarChart, roles: [UserRole.ADMIN] },
      ]
    }
  ];

  const handleNavClick = (id: string) => {
    if (id === 'borrow-item') {
      setActiveTab('borrowing');
      setBorrowSubTab('ITEM');
    } else if (id === 'borrow-room') {
      setActiveTab('borrowing');
      setBorrowSubTab('ROOM');
    } else if (id === 'report-inventory') {
      setActiveTab('reports');
    } else {
      setActiveTab(id);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col fixed h-full z-40 md:relative`}>
        <div className="p-6 flex items-center justify-between">
          <div className={`font-bold text-indigo-600 text-xl truncate ${!isSidebarOpen && 'hidden'}`}>SI-SARPRAS</div>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-6 mt-4 overflow-y-auto pb-8">
          {sections.filter(s => s.roles.includes(currentUser.role)).map((section, idx) => (
            <div key={idx} className="space-y-1">
              <p className={`text-[10px] font-black text-slate-400 px-3 tracking-widest uppercase mb-2 ${!isSidebarOpen && 'hidden'}`}>
                {section.title}
              </p>
              {section.items.filter(item => item.roles.includes(currentUser.role)).map((item) => {
                const isActive = (item.id === 'borrow-item' || item.id === 'borrow-room') 
                  ? (activeTab === 'borrowing' && borrowSubTab === (item.id === 'borrow-item' ? 'ITEM' : 'ROOM'))
                  : (activeTab === item.id || (activeTab === 'reports' && item.id === 'report-inventory'));

                return (
                  <button key={item.id} onClick={() => handleNavClick(item.id)} className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}>
                    <item.icon size={20} />
                    <span className={`font-medium text-sm text-left leading-tight ${!isSidebarOpen && 'hidden'}`}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all">
            <LogOut size={20} />
            <span className={`font-medium text-sm ${!isSidebarOpen && 'hidden'}`}>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
             <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">SI-SARPRAS</h2>
             {schoolIdentity.syncConfig?.googleSheetsUrl && currentUser.role === UserRole.ADMIN && (
               <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                 {syncStatus === 'SYNCING' && <RefreshCw size={14} className="text-indigo-500 animate-spin" />}
                 {syncStatus === 'SUCCESS' && <CheckCircle2 size={14} className="text-emerald-500" />}
                 {syncStatus === 'ERROR' && <CloudOff size={14} className="text-rose-500" />}
                 {syncStatus === 'IDLE' && <Cloud size={14} className="text-slate-300" />}
                 <span className="text-[10px] font-black text-slate-400 uppercase">
                   {syncStatus === 'SYNCING' ? 'Syncing...' : syncStatus === 'SUCCESS' ? 'Synced' : syncStatus === 'ERROR' ? 'Sync Error' : 'Cloud Active'}
                 </span>
               </div>
             )}
          </div>
          <div className="flex items-center gap-3">
             <span className="text-xs font-bold text-slate-500">{currentUser.fullName}</span>
             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
               {currentUser.fullName.charAt(0)}
             </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && currentUser.role === UserRole.ADMIN && <Dashboard items={items} rooms={rooms} borrows={borrowRequests} damages={damageReports} />}
          {activeTab === 'purchase' && currentUser.role === UserRole.ADMIN && <PurchaseRequests purchaseRequests={purchaseRequests} setPurchaseRequests={setPurchaseRequests} setActiveTab={setActiveTab} />}
          {activeTab === 'inventory' && currentUser.role === UserRole.ADMIN && <Inventory items={items} setItems={setItems} rooms={rooms} categories={categories} subCategories={subCategories} suppliers={suppliers} merks={merks} schoolIdentity={schoolIdentity} user={currentUser} purchaseRequests={purchaseRequests} setPurchaseRequests={setPurchaseRequests} />}
          {activeTab === 'school' && currentUser.role === UserRole.ADMIN && <SchoolIdentityPage schoolIdentity={schoolIdentity} setSchoolIdentity={setSchoolIdentity} user={currentUser} />}
          {activeTab === 'users' && currentUser.role === UserRole.ADMIN && <UserManagement users={users} setUsers={setUsers} currentUser={currentUser} />}
          {activeTab === 'suppliers' && currentUser.role === UserRole.ADMIN && <SuppliersAndMerks suppliers={suppliers} setSuppliers={setSuppliers} merks={merks} setMerks={setMerks} user={currentUser} />}
          {activeTab === 'categories' && currentUser.role === UserRole.ADMIN && (
            <div className="space-y-8">
              <Categories categories={categories} setCategories={setCategories} user={currentUser} />
              <SubCategories subCategories={subCategories} setSubCategories={setSubCategories} categories={categories} user={currentUser} />
            </div>
          )}
          {activeTab === 'rooms' && currentUser.role === UserRole.ADMIN && <Rooms rooms={rooms} setRooms={setRooms} user={currentUser} />}
          
          {activeTab === 'borrowing' && <Borrowing items={items} rooms={rooms} borrows={borrowRequests} setBorrows={setBorrowRequests} user={currentUser} defaultType={borrowSubTab} />}
          {activeTab === 'damage' && <DamageReports items={items} rooms={rooms} damages={damageReports} setDamages={setDamageReports} user={currentUser} />}
          
          {activeTab === 'disposal' && currentUser.role === UserRole.ADMIN && <Disposal items={items} setItems={setItems} disposals={disposalRecords} setDisposals={setDisposalRecords} schoolIdentity={schoolIdentity} user={currentUser} />}
          {activeTab === 'reports' && currentUser.role === UserRole.ADMIN && <Reports items={items} rooms={rooms} categories={categories} subCategories={subCategories} purchaseRequests={purchaseRequests} />}
          {activeTab === 'analysis' && currentUser.role === UserRole.ADMIN && <ItemAnalysis items={items} borrows={borrowRequests} categories={categories} />}
        </div>
      </main>
    </div>
  );
};

export default App;
