
import { GiftEntry, InventoryItem, IncentiveRequest, AuditLog, Goal } from '../types';

export const MOCK_GIFTS: GiftEntry[] = [
  {
    id: 'G1',
    date: '15/05/2024',
    displayID: '1001',
    coordinatorName: 'ישראל ישראלי',
    driveNum: '550',
    recID: '12345',
    recName: 'יוסי כהן',
    recDriveNum: '12345',
    branch: 'מרכז העיר',
    giftType: 'שובר ארוחה',
    deliveryMethod: 'איסוף עצמי',
    sentBy: 'מזכירות',
    comments: 'הצטיינות בפעילות שבת',
    status: 'ממתין',
    district: 'ירושלים'
  },
  {
    id: 'G2',
    date: '14/05/2024',
    displayID: '1002',
    coordinatorName: 'אברהם לוי',
    driveNum: '551',
    recID: '54321',
    recName: 'משה לוי',
    recDriveNum: '54321',
    branch: 'בני ברק',
    giftType: 'כרטיס מתנה',
    deliveryMethod: 'איסוף עצמי',
    sentBy: 'רכז',
    comments: '',
    status: 'נמסר',
    district: 'מרכז'
  }
];

export const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: 'INV-1',
    rowIndex: 2,
    date: '01/05/2024',
    product: 'שובר ארוחה',
    priceWithVAT: '₪150',
    marketPrice: '₪200',
    stockQuantity: 45,
    orderedQuantity: 100,
    purchaseCost: '₪12000',
    itemLocation: 'מחסן ראשי',
    itemCondition: 'חדש',
    notes: ''
  },
  {
    id: 'INV-2',
    rowIndex: 3,
    date: '02/05/2024',
    product: 'כרטיס מתנה',
    priceWithVAT: '₪100',
    marketPrice: '₪100',
    stockQuantity: 3,
    orderedQuantity: 50,
    purchaseCost: '₪5000',
    itemLocation: 'מחסן ראשי',
    itemCondition: 'חדש',
    notes: 'מלאי נמוך!'
  }
];

export const MOCK_INCENTIVES: IncentiveRequest[] = [
  {
    id: 'INC-1',
    date: '10/05/2024 10:00',
    coordName: 'ישראל ישראלי',
    coordEmail: 'coord@hatzalah.org.il',
    description: 'שוברים נוספים לסניף',
    details: 'חסר לנו שוברים למתנדבים שעשו משמרת כפולה',
    status: 'ממתין'
  }
];

export const MOCK_GOALS: Goal[] = [
  {
    id: 'GOAL-1',
    meetingDate: '2024-05-15',
    district: 'ירושלים',
    branch: 'מרכז העיר',
    task: 'גיוס 5 תורנים חדשים לסבב שבת',
    assignedTo: 'ישראל ישראלי',
    status: 'בטיפול',
    comments: 'בתהליך פרסום',
    createdAt: '01/05/2024 09:00',
    priority: 'high'
  },
  {
    id: 'GOAL-2',
    meetingDate: '2024-05-20',
    district: 'מרכז',
    branch: 'בני ברק',
    task: 'הסדרת נוהל כיבוד קל בתחנה',
    assignedTo: 'אברהם לוי',
    status: 'פתוח',
    comments: '',
    createdAt: '02/05/2024 11:00',
    priority: 'medium'
  }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { 
    timestamp: '15/05/2024 14:30', 
    userName: 'ישראל ישראלי', 
    userEmail: 'coord@hatzalah.org.il',
    actionType: 'יצירה', 
    itemUUID: 'G1',
    details: 'נוספה רשומה חדשה עבור יוסי כהן', 
    type: 'יצירה' 
  },
  { 
    timestamp: '15/05/2024 14:45', 
    userName: 'מנהל מערכת', 
    userEmail: 'admin@hatzalah.org.il',
    actionType: 'אבטחה', 
    itemUUID: 'SYS',
    details: 'זוהו 2 ניסיונות התחברות כושלים למשתמש: user@test.com', 
    type: 'אבטחה' 
  }
];
