
export enum UserRole {
  ADMIN = 'ADMIN',
  GURU = 'GURU',
  SISWA = 'SISWA'
}

export enum ItemCondition {
  BAIK = 'BAIK',
  RUSAK_RINGAN = 'RUSAK_RINGAN',
  RUSAK_BERAT = 'RUSAK_BERAT',
  DIHAPUS = 'DIHAPUS'
}

export enum PurchaseStatus {
  BELUM_BELI = 'BELUM_BELI',
  SUDAH_BELI = 'SUDAH_BELI',
  BATAL_BELI = 'BATAL_BELI'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RETURNED = 'RETURNED'
}

export enum DamageStatus {
  SEDANG_PROSES = 'SEDANG_PROSES',
  PENGAJUAN_DANA = 'PENGAJUAN_DANA',
  FIXED = 'FIXED'
}

export enum RepairType {
  GANTI_SPARE_PART = 'GANTI_SPARE_PART',
  TEKNISI_LUAR = 'TEKNISI_LUAR',
  TEKNISI_INTERNAL = 'TEKNISI_INTERNAL'
}

export enum DisposalType {
  DIJUAL_ROMBENG = 'DIJUAL_ROMBENG',
  DIHIBAHKAN = 'DIHIBAHKAN',
  DIMUSNAHKAN = 'DIMUSNAHKAN'
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  fullName: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
}

export interface Category {
  id: string;
  name: string;
  code: string;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  code: string;
}

export interface Supplier {
  id: string;
  name: string;
}

export interface Merk {
  id: string;
  name: string;
}

export interface SchoolIdentity {
  name: string;
  address: string;
  logo: string;
  npsn: string;
  principal: string;
  phone: string;
  technicianName: string;
  technicianPhone: string;
  syncConfig?: {
    googleSheetsUrl: string;
    autoSync: boolean;
    lastSyncedAt?: string;
  };
}

export interface PurchaseRequest {
  id: string;
  requestDate: string;
  realizationDate?: string;
  itemName: string;
  quantity: number;
  unit: string;
  price: number;
  purpose: string;
  sourceFund: string;
  status: PurchaseStatus;
  cancellationReason?: string;
  isRegisteredToInventory: boolean;
}

export interface Item {
  id: string;
  code: string;
  name: string;
  merk: string;
  supplier: string;
  type: string;
  subType: string;
  itemTypeCode: string;
  condition: ItemCondition;
  roomId: string;
  purchaseDate: string;
  sourceFund: string;
}

export interface BorrowedItem {
  itemId: string;
  quantity: number;
}

export interface BorrowRequest {
  id: string;
  userId: string; 
  borrowerName: string; 
  type: 'ITEM' | 'ROOM';
  requestDate: string; 
  startDate: string; 
  endDate: string; 
  startTime: string; 
  event: string; 
  notes: string; 
  items: BorrowedItem[]; 
  roomId: string;
  status: RequestStatus;
  requestedAt: string; 
}

export interface DamageReport {
  id: string;
  itemId: string;
  reporterId: string;
  reporterName: string;
  description: string;
  reportedAt: string;
  status: DamageStatus;
  repairType?: RepairType;
  fixedAt?: string;
}

export interface DisposalRecord {
  id: string;
  itemId: string;
  disposalType: DisposalType;
  disposalDate: string;
  destination: string;
  officerName: string;
  documentNumber: string;
  notes: string;
}
