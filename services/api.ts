
/**
 * שירות ה-API המקשר בין ה-Frontend ל-Google Apps Script
 * ה-URL מוגדר לפי ה-Deployment שבוצע ב-Google Script Editor
 */

const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxgzcObfLIcLuEag9cmQ2I1IYkEkx21qrcyc0E9S3laVdiQps23JeugNF8kB4K4sQX5YA/exec';

export const callGAS = async (action: string, args: any[] = []) => {
  console.log(`[CLOUD CALL] Action: ${action}`, args);
  
  // במקרה שאין URL תקין (סביבת פיתוח ללא Deployment), נבצע סימולציה
  if (GAS_WEB_APP_URL.includes('YOUR_GAS')) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true, message: "Server Simulation Mode" }), 400);
    });
  }

  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors', // שים לב: ב-GAS לעיתים נדרש no-cors או טיפול ב-CORS דרך ContentService
      body: JSON.stringify({ action, arguments: args }),
    });
    
    // בגלל מגבלות CORS ב-fetch מול GAS, לעיתים לא ניתן לקרוא את ה-JSON ישירות
    // אם השרת מוגדר נכון עם JSON MimeType, ננסה לקרוא:
    try {
      return await response.json();
    } catch (e) {
      return { success: true, note: "Request sent (Response parsing skipped due to CORS)" };
    }
  } catch (error) {
    console.error("Cloud API Error:", error);
    return { error: true, message: error.toString() };
  }
};

export const api = {
  // התחברות והרשאות
  login: (email: string, pass: string) => callGAS('login', [email, pass]),
  getUserPermissions: (email: string) => callGAS('getUserPermissions', [email]),
  
  // נתונים וחלוקות
  getData: (userEmail: string) => callGAS('getData', [userEmail]),
  processForm: (data: any, userEmail: string) => callGAS('processForm', [data, userEmail]),
  updateStatus: (id: string, status: string, userEmail: string) => callGAS('updateStatus', [id, status, userEmail]),
  updateRow: (id: string, data: any, userEmail: string) => callGAS('updateRowByID', [id, data, userEmail]),
  deleteRow: (id: string, userEmail: string) => callGAS('deleteRowByID', [id, userEmail]),
  
  // מלאי ופריטים
  getInventory: (userEmail: string) => callGAS('getGiftItems', [userEmail]),
  addGiftItem: (data: any, userEmail: string) => callGAS('addGiftItem', [data, userEmail]),
  updateGiftItem: (index: number, data: any, userEmail: string) => callGAS('updateGiftItem', [index, data, userEmail]),
  addStock: (index: number, amount: number, name: string, userEmail: string) => callGAS('addStock', [index, amount, name, userEmail]),
  
  // יעדים ומשימות
  getGoals: (userEmail: string) => callGAS('getGoals', [userEmail]),
  addGoal: (data: any, userEmail: string) => callGAS('addGoal', [data, userEmail]),
  updateGoalStatus: (id: string, status: string, comm: string, userEmail: string) => callGAS('updateGoalStatus', [id, status, comm, userEmail]),
  
  // ניהול צוות
  getCoordinators: (userEmail: string) => callGAS('getCoordinatorsForManagement', [userEmail]),
  addCoordinator: (data: any, userEmail: string) => callGAS('addCoordinator', [data, userEmail]),
  updateCoordinator: (index: number, data: any, userEmail: string) => callGAS('updateCoordinator', [index, data, userEmail]),
  
  // תמריצים
  // Method to add a new incentive request to the cloud database
  addIncentive: (data: any, userEmail: string) => callGAS('addIncentive', [data, userEmail]),

  // היסטוריה
  getAuditLog: (userEmail: string) => callGAS('getAuditLog', [userEmail]),
  getHistoryForItem: (id: string, userEmail: string) => callGAS('getHistoryForItem', [id, userEmail])
};
