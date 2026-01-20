
import React, { useState } from 'react';
import { IncentiveRequest, User } from '../types';
import { Check, X, Plus, Save, Send, MessageSquare, Clock, Calendar } from 'lucide-react';

interface Props {
  requests: IncentiveRequest[];
  currentUser: User;
  onAction: (id: string, status: IncentiveRequest['status'], adminNotes: string) => void;
  onAdd: (req: Partial<IncentiveRequest>) => void;
}

const IncentiveRequests: React.FC<Props> = ({ requests, currentUser, onAction, onAdd }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ description: '', details: '' });
  
  const [actionTarget, setActionTarget] = useState<{ id: string, status: IncentiveRequest['status'] } | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      coordName: currentUser.name,
      coordEmail: currentUser.email,
    });
    setFormData({ description: '', details: '' });
    setIsFormOpen(false);
  };

  const handleActionConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (actionTarget) {
      onAction(actionTarget.id, actionTarget.status, adminNotes);
      setActionTarget(null);
      setAdminNotes('');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {currentUser.type !== 'ארצי' && (
        <div className="space-y-4">
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="w-full bg-white p-8 rounded-[32px] border-2 border-dashed border-indigo-200 text-indigo-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all font-bold flex items-center justify-center gap-3"
          >
            <Plus size={24} />
            <span>הגשת בקשה חדשה לתמריץ</span>
          </button>

          {isFormOpen && (
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[40px] border border-indigo-100 shadow-xl space-y-6 animate-in slide-in-from-top-4 duration-300">
              <h4 className="text-xl font-black text-indigo-900 border-b border-indigo-50 pb-4">בקשה חדשה לתמריץ</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">תיאור התמריץ המבוקש *</label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                    placeholder="למשל: שובר ארוחה, כרטיס מתנה..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">פירוט (למי נועד, סיבה, כמות) *</label>
                  <textarea 
                    required
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                    rows={4}
                    placeholder="פרט כאן את סיבת הבקשה..."
                    value={formData.details}
                    onChange={e => setFormData({...formData, details: e.target.value})}
                  ></textarea>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <Send size={20} />
                שלח בקשה לאישור
              </button>
            </form>
          )}
        </div>
      )}

      <div className="space-y-4">
        {requests.map(req => (
          <div key={req.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-start hover:shadow-md transition-all relative overflow-hidden">
            {req.status === 'אושר' && <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500" />}
            {req.status === 'נדחה' && <div className="absolute top-0 right-0 w-2 h-full bg-red-500" />}
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-black text-slate-800">{req.description}</h4>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  req.status === 'ממתין' ? 'bg-amber-100 text-amber-700' :
                  req.status === 'אושר' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {req.status}
                </span>
              </div>
              
              <div className="text-slate-500 text-sm leading-relaxed bg-slate-50 p-6 rounded-[24px]">
                {req.details}
              </div>

              {req.adminNotes && (
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 text-sm italic text-indigo-700">
                  <span className="font-bold block not-italic mb-1">הערות מנהל:</span>
                  {req.adminNotes}
                  {req.approvalDate && <span className="block text-[10px] mt-2 opacity-50">תאריך טיפול: {req.approvalDate}</span>}
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-bold">
                <span className="flex items-center gap-1"><Clock size={12} /> {req.date}</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> {req.coordName}</span>
              </div>
            </div>

            {currentUser.type === 'ארצי' && req.status === 'ממתין' && (
              <div className="flex md:flex-col gap-3 w-full md:w-auto">
                <button 
                  onClick={() => setActionTarget({ id: req.id, status: 'אושר' })}
                  className="flex-1 md:w-32 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  אישור
                </button>
                <button 
                  onClick={() => setActionTarget({ id: req.id, status: 'נדחה' })}
                  className="flex-1 md:w-32 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  דחייה
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Admin Action Modal */}
      {actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className={`${actionTarget.status === 'אושר' ? 'bg-emerald-600' : 'bg-red-600'} p-6 text-white flex justify-between items-center`}>
              <h3 className="text-xl font-black">{actionTarget.status === 'אושר' ? 'אישור בקשה' : 'דחיית בקשה'}</h3>
              <button onClick={() => setActionTarget(null)} className="hover:bg-white/20 p-2 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleActionConfirm} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">הערות לביצוע (אופציונלי)</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all"
                  rows={3}
                  placeholder="הוסף הערה לרכז..."
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                />
              </div>
              <button type="submit" className={`w-full ${actionTarget.status === 'אושר' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'} text-white font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2`}>
                <Save size={20} />
                סיום ועדכון
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncentiveRequests;
