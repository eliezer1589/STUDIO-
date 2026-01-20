
export type UserType = 'ארצי' | 'מחוזי' | 'סניפי';

export interface User {
  email: string;
  name: string;
  district: string;
  branch: string;
  type: UserType;
  password?: string;
  status?: 'פעיל' | 'חסום';
  failedAttempts?: number;
  lastLogin?: string;
  // rowIndex is required for spreadsheet-based updates in the backend
  rowIndex?: number;
}

export interface GiftEntry {
  id: string; // Internal UUID
  date: string;
  displayID: string; // The "ID" from column B
  coordinatorName: string;
  driveNum: string; // Column D
  recID: string; // Column E
  recName: string; // Column F
  recDriveNum: string; // Column G
  branch: string;
  giftType: string;
  deliveryMethod: string; // Column J
  sentBy: string;
  comments: string;
  status: 'ממתין' | 'בדרך' | 'נמסר' | 'בוטל';
  district: string;
  signature?: string; // Base64 signature image
  signedBy?: string;  // Name of person who signed
  deliveredAt?: string;
}

export interface InventoryItem {
  id?: string;
  rowIndex?: number;
  date: string;
  product: string;
  priceWithVAT: string; // Internal cost
  marketPrice: string; // External value
  stockQuantity: number;
  orderedQuantity: number;
  purchaseCost: string;
  itemLocation: string;
  itemCondition: string;
  notes: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'urgent' | 'info' | 'success';
  date: string;
  author: string;
}

export interface IncentiveRequest {
  id: string;
  date: string;
  coordName: string;
  coordEmail: string;
  description: string;
  details: string;
  status: 'ממתין' | 'אושר' | 'נדחה';
  adminNotes?: string;
  approvalDate?: string;
}

export interface Goal {
  id: string;
  meetingDate: string;
  district: string;
  branch: string;
  task: string;
  assignedTo: string;
  status: 'פתוח' | 'בוצע' | 'בטיפול';
  comments: string;
  createdAt: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface AuditLog {
  timestamp: string;
  userName: string;
  userEmail: string;
  actionType: string;
  itemUUID: string;
  details: string;
  type: 'יצירה' | 'עדכון' | 'מחיקה' | 'אבטחה';
  dataBefore?: any;
  dataAfter?: any;
}

export interface ReportSummary {
  totalValue: number;
  totalCost: number;
  savings: number;
  topCoordinator: string;
  topBranch: string;
  distributionCount: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
