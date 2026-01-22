
import { UserRole, ItemCondition, Item, Room, User, Category, SubCategory, SchoolIdentity, Supplier, Merk } from './types';

export const INITIAL_USERS: User[] = [
  { id: '1', username: 'admin', password: 'Smaco123', role: UserRole.ADMIN, fullName: 'Administrator Sarpras' },
  { id: '2', username: 'guru1', password: 'password123', role: UserRole.GURU, fullName: 'Bpk. Ahmad Suherman' },
  { id: '3', username: 'siswa1', password: 'password123', role: UserRole.SISWA, fullName: 'Budi Santoso' },
];

export const INITIAL_ROOMS: Room[] = [
  { id: 'r1', name: 'LAB-KOMP1', description: 'Gedung A Lantai 2', capacity: 40 },
  { id: 'r2', name: 'LAB-IPA', description: 'Gedung B Lantai 1', capacity: 32 },
  { id: 'r3', name: 'AULA', description: 'Gedung Utama', capacity: 200 },
  { id: 'r4', name: 'PERPUS', description: 'Gedung C Lantai 1', capacity: 60 },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Elektronik', code: '01' },
  { id: 'c2', name: 'Mebel', code: '02' },
  { id: 'c3', name: 'Alat Peraga', code: '03' },
  { id: 'c4', name: 'Olahraga', code: '04' },
];

export const INITIAL_SUBCATEGORIES: SubCategory[] = [
  { id: 'sc1', categoryId: 'c1', name: 'Komputer', code: '05' },
  { id: 'sc2', categoryId: 'c1', name: 'Proyektor', code: '06' },
  { id: 'sc3', categoryId: 'c2', name: 'Meja', code: '01' },
  { id: 'sc4', categoryId: 'c2', name: 'Kursi', code: '02' },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'PT. Komputerindo Jaya' },
  { id: 's2', name: 'CV. Mebel Sejahtera' },
  { id: 's3', name: 'Toko Alat Peraga Mandiri' },
];

export const INITIAL_MERKS: Merk[] = [
  { id: 'm1', name: 'Dell' },
  { id: 'm2', name: 'HP' },
  { id: 'm3', name: 'Lenovo' },
  { id: 'm4', name: 'Brother' },
  { id: 'm5', name: 'Custom' },
];

export const FUND_SOURCES = ['BOSNAS', 'BOSKIN', 'BPOPP', 'YAYASAN', 'DONASI'];

export const INITIAL_ITEMS: Item[] = [
  { id: 'i1', code: '01.05.001.001/LAB-KOMP1/SMACO', name: 'PC Dell Optiplex', merk: 'Dell', supplier: 'PT. Komputerindo Jaya', type: 'c1', subType: 'sc1', itemTypeCode: '001', condition: ItemCondition.BAIK, roomId: 'r1', purchaseDate: '2023-01-15', sourceFund: 'BOSNAS' },
  { id: 'i2', code: '01.05.001.002/LAB-KOMP1/SMACO', name: 'PC Dell Optiplex', merk: 'Dell', supplier: 'PT. Komputerindo Jaya', type: 'c1', subType: 'sc1', itemTypeCode: '001', condition: ItemCondition.BAIK, roomId: 'r1', purchaseDate: '2023-01-15', sourceFund: 'BOSNAS' },
];

export const INITIAL_SCHOOL_IDENTITY: SchoolIdentity = {
  name: 'SMK NEGERI 1 INFORMATIKA',
  address: 'Jakarta Selatan',
  logo: 'https://picsum.photos/seed/school/200',
  npsn: '20123456',
  principal: 'Dr. H. Ahmad Santosa, M.Pd',
  phone: '021-1234567',
  technicianName: 'Bambang Irawan',
  technicianPhone: '0812-9876-5432',
  syncConfig: {
    googleSheetsUrl: '',
    autoSync: false
  }
};
