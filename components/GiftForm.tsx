
import React, { useState } from 'react';
import { GiftEntry, InventoryItem } from '../types';
import { Save, Calendar, User, MapPin, Gift, Tag, Hash, FileText, Truck } from 'lucide-react';

interface GiftFormProps {
  onAdd: (gift: GiftEntry) => void;
  inventory: InventoryItem[];
}

const GiftForm: React.FC<GiftFormProps> = ({ onAdd, inventory }) => {
  const [formData, setFormData] = useState<Partial<GiftEntry>>({
    date: new Date().toISOString().split('T')[0],
    status: 'ממתין',
    district: '',
    branch: '',
    giftType: '',
    sentBy: 'רכז',
    deliveryMethod: 'איסוף עצמי',
    driveNum: '',
    recDriveNum: '',
    displayID: ''
  });

  const districts = ['ירושלים', 'מרכז', 'צפון', 'דרום', 'שרון'];
  const deliveryMethods = ['איסוף עצמי', 'שליח', 'דואר ישראל', 'רכז סניפי'];
  const giftOptions = inventory.map(i => i.product).sort();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.giftType) {
      alert('נא לבחור סוג מתנה');
      return;
    }

    const newGift: GiftEntry = {
      ...formData as GiftEntry,
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
    };
    onAdd(newGift);
    
    setFormData({
      ...formData,
      giftType: '',
      recName: '',
      recID: '',
      recDriveNum: '',
      comments: '',
      displayID: ''
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl flex items-center justify-between overflow-hidden relative">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h3 className="text-3xl font-black italic tracking-tight mb-2">NEW ENTRY</h3>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">מערכת הזנת תמריצים רשמית - אגף הלכה</p>
        </div>
        <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md relative z-10 border border-white/10">
          <Gift size={40} className="text-indigo-400" />
        </div>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[40px] border border-slate-100 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Section 1: Distribution Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-4 mb-6">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">1</div>
                <h4 className="font-black text-slate-800 uppercase tracking-wider text-sm">פרטי החלוקה</h4>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1">תאריך ביצוע</label>
                <input type="date" className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 bg-slate-50/50" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1">שם הרכז המבצע</label>
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="text" className="w-full pr-12 pl-4 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all" placeholder="שם מלא" value={formData.coordinatorName || ''} onChange={e => setFormData({...formData, coordinatorName: e.target.value})} required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1">מספר כונן (רכז)</label>
                <input type="text" className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all" placeholder="למשל: 550" value={formData.driveNum || ''} onChange={e => setFormData({...formData, driveNum: e.target.value})} />
              </div>
            </div>

            {/* Section 2: Recipient Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-4 mb-6">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">2</div>
                <h4 className="font-black text-slate-800 uppercase tracking-wider text-sm">פרטי המקבל</h4>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1">שם המקבל (הכונן)</label>
                <input type="text" className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold" placeholder="שם מלא של המקבל" value={formData.recName || ''} onChange={e => setFormData({...formData, recName: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1">ת.ז. מקבל</label>
                  <input type="text" className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all" value={formData.recID || ''} onChange={e => setFormData({...formData, recID: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1">מס' כונן מקבל</label>
                  <input type="text" className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all" value={formData.recDriveNum || ''} onChange={e => setFormData({...formData, recDriveNum: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1">מחוז</label>
                  <select className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all bg-white font-bold text-sm" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} required>
                    <option value="">בחר...</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1">סניף</label>
                  <input type="text" className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all" placeholder="שם סניף" value={formData.branch || ''} onChange={e => setFormData({...formData, branch: e.target.value})} required />
                </div>
              </div>
            </div>

            {/* Section 3: Gift & Logistics */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-4 mb-6">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-black">3</div>
                <h4 className="font-black text-slate-800 uppercase tracking-wider text-sm">מתנה ולוגיסטיקה</h4>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1">סוג התמריץ</label>
                <select className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all bg-indigo-50/50 font-black text-indigo-700" value={formData.giftType} onChange={e => setFormData({...formData, giftType: e.target.value})} required>
                  <option value="">בחר פריט מהמלאי...</option>
                  {giftOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1">שיטת משלוח</label>
                <select className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all bg-white font-bold text-sm" value={formData.deliveryMethod} onChange={e => setFormData({...formData, deliveryMethod: e.target.value})}>
                  {deliveryMethods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1">נשלח ע"י (גורם מאשר)</label>
                <input type="text" className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all" value={formData.sentBy || ''} onChange={e => setFormData({...formData, sentBy: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-6 border-t border-slate-50">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center gap-2">
              <FileText size={14} className="text-indigo-600" /> הערות (סיבת הזכאות וכו')
            </label>
            <textarea rows={4} className="w-full px-6 py-5 rounded-[32px] border border-slate-200 focus:border-indigo-500 outline-none transition-all bg-slate-50/30 text-sm leading-relaxed" placeholder="פרט כאן את הסיבה למתן התמריץ..." value={formData.comments} onChange={e => setFormData({...formData, comments: e.target.value})} />
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white font-black py-6 rounded-[32px] shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 transform active:scale-[0.98] group">
            <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-colors">
              <Save size={24} />
            </div>
            <span className="text-xl italic">SAVE & DEPLOY ENTRY</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default GiftForm;
