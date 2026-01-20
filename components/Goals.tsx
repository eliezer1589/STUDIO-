
import React, { useState } from 'react';
import { Goal, User } from '../types';
import { CheckCircle, Clock, AlertCircle, Plus, X, Save, Edit, Trash2, ChevronDown, Search, History, MessageSquare, User as UserIcon } from 'lucide-react';

interface Props {
  goals: Goal[];
  currentUser: User;
  coordinators: User[]; // Added to allow assignment from list
  onAdd: (goal: Partial<Goal>) => void;
  onUpdate: (id: string, goal: Partial<Goal>) => void;
  onDelete: (id: string) => void;
  onOpenHistory: (id: string, name: string) => void;
  onAddComment: (id: string, comment: string) => void;
}

const Goals: React.FC<Props> = ({ goals, currentUser, coordinators, onAdd, onUpdate, onDelete, onOpenHistory, onAddComment }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [commentTarget, setCommentTarget] = useState<Goal | null>(null);
  const [commentText, setCommentText] = useState('');
  const [formData, setFormData] = useState<Partial<Goal>>({
    status: 'פתוח',
    district: currentUser.type !== 'ארצי' ? currentUser.district : '',
    branch: currentUser.type === 'סניפי' ? currentUser.branch : '',
    meetingDate: new Date().toISOString().split('T')[0]
  });

  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const canManage = currentUser.type === 'ארצי' || currentUser.type === 'מחוזי';
  const districts = ['ירושלים', 'מרכז', 'צפון', 'דרום', 'שרון'];

  const filteredGoals = goals.filter(g => {
    const matchesStatus = !statusFilter || g.status === statusFilter;
    const matchesSearch = !search || g.task.toLowerCase().includes(search.toLowerCase()) || g.assignedTo.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoal) onUpdate(editingGoal.id, formData);
    else onAdd(formData);
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentTarget && commentText.trim()) {
      onAddComment(commentTarget.id, commentText);
      setCommentText('');
      setCommentTarget(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'פתוח': return <AlertCircle className="text-rose-500" size={18} />;
      case 'בטיפול': return <Clock className="text-amber-500" size={18} />;
      case 'בוצע': return <CheckCircle className="text-emerald-500" size={18} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h3 className="text-2xl font-black text-slate-800">יעדי שטח ומשימות פגישה</h3>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">ניהול מעקב אחר התקדמות אגפית ותפעולית</p>
        </div>
        {canManage && (
          <button 
            onClick={() => { setEditingGoal(null); setFormData({ status: 'פתוח', district: currentUser.district, branch: currentUser.branch, meetingDate: new Date().toISOString().split('T')[0] }); setIsModalOpen(true); }}
            className="bg-slate-900 text-white px-8 py-4 rounded-[24px] font-black italic flex items-center gap-3 shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 z-10"
          >
            <Plus size={20} />
            <span>DEFINE NEW GOAL</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 relative group">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text"
            className="w-full pr-14 pl-6 py-4.5 rounded-[24px] border border-slate-200 outline-none focus:border-indigo-500 bg-white font-bold text-slate-700 transition-all shadow-sm"
            placeholder="חפש לפי שם משימה או גורם מטפל..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <select 
            className="w-full appearance-none px-6 py-4.5 rounded-[24px] border border-slate-200 bg-white font-black text-xs text-slate-600 outline-none cursor-pointer"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">כל המשימות</option>
            <option value="פתוח">🔴 פתוח</option>
            <option value="בטיפול">🟡 בטיפול</option>
            <option value="בוצע">🟢 בוצע</option>
          </select>
          <ChevronDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredGoals.map(goal => (
          <div key={goal.id} className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-50/50 transition-all relative group flex flex-col h-full transform hover:scale-[1.01]">
            <div className="absolute left-8 top-8 flex gap-2 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
              <button onClick={() => setCommentTarget(goal)} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm" title="הוסף הערת מעקב"><MessageSquare size={16} /></button>
              {canManage && (
                <>
                  <button onClick={() => onOpenHistory(goal.id, goal.task)} className="p-2.5 bg-violet-50 text-violet-600 rounded-xl hover:bg-violet-600 hover:text-white transition-all shadow-sm"><History size={16} /></button>
                  <button onClick={() => { setEditingGoal(goal); setFormData(goal); setIsModalOpen(true); }} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"><Edit size={16} /></button>
                  <button onClick={() => onDelete(goal.id)} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"><Trash2 size={16} /></button>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 border ${
                goal.status === 'פתוח' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                goal.status === 'בטיפול' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                'bg-emerald-50 text-emerald-700 border-emerald-100'
              }`}>
                {getStatusIcon(goal.status)}
                <span className="text-[10px] font-black uppercase tracking-widest">{goal.status}</span>
              </div>
              <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-3 py-1.5 rounded-full uppercase tracking-widest">{goal.district}</span>
            </div>

            <h4 className="text-xl font-black text-slate-800 mb-6 leading-relaxed pr-12">{goal.task}</h4>
            
            <div className="grid grid-cols-2 gap-4 text-xs mb-8">
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <span className="text-[9px] font-black text-slate-400 block mb-2 uppercase tracking-widest">באחריות ביצוע</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px]">👤</div>
                  <span className="font-bold text-slate-800">{goal.assignedTo}</span>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <span className="text-[9px] font-black text-slate-400 block mb-2 uppercase tracking-widest">מועד פגישה</span>
                <span className="font-black text-slate-800 italic">{goal.meetingDate}</span>
              </div>
            </div>

            {goal.comments && (
              <div className="mb-8 p-6 bg-indigo-50/30 rounded-[32px] text-[11px] text-slate-600 border border-indigo-50/50 whitespace-pre-wrap leading-relaxed relative">
                <MessageSquare size={14} className="absolute -top-2.5 right-4 text-indigo-200 fill-indigo-50" />
                <div className="font-black text-indigo-400 mb-2 uppercase tracking-widest text-[9px]">יומן עדכונים:</div>
                {goal.comments}
              </div>
            )}

            <div className="mt-auto flex gap-2">
              {['פתוח', 'בטיפול', 'בוצע'].map(s => (
                <button 
                  key={s}
                  onClick={() => onUpdate(goal.id, { status: s as any })}
                  className={`flex-1 py-3 text-[10px] font-black rounded-2xl transition-all border-2 ${
                    goal.status === s 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xl' 
                    : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-500 hover:text-indigo-600'
                  }`}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Comment Modal */}
      {commentTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-indigo-600 p-8 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
              <h3 className="text-2xl font-black relative z-10">הוספת עדכון</h3>
              <button onClick={() => setCommentTarget(null)} className="hover:bg-white/20 p-2.5 rounded-full transition-colors relative z-10"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddComment} className="p-10 space-y-8">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">עבור: {commentTarget.task.substring(0, 40)}...</p>
                <textarea 
                  required autoFocus
                  className="w-full px-6 py-5 rounded-[32px] border border-slate-200 focus:border-indigo-500 focus:ring-8 focus:ring-indigo-50 outline-none transition-all text-sm leading-relaxed"
                  rows={5}
                  placeholder="כתוב כאן מה התקדם בביצוע המשימה..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-[24px] shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                <Save size={20} />
                שמור עדכון משימה
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[56px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-900 p-10 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h3 className="text-2xl font-black italic tracking-tighter uppercase">{editingGoal ? 'UPDATE GOAL' : 'DEFINE STRATEGIC GOAL'}</h3>
                <p className="text-slate-400 text-[10px] font-bold tracking-widest mt-1">מערכת תכנון ויעדים - אגף הלכה</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-3 rounded-full transition-colors relative z-10"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[75vh] overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 mr-1">תיאור המשימה / היעד *</label>
                  <textarea required className="w-full px-6 py-5 rounded-[32px] border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 bg-slate-50/50" rows={3} value={formData.task || ''} onChange={e => setFormData({...formData, task: e.target.value})} placeholder="מה המטרה שצריכה להתבצע?" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 mr-1">תאריך פגישה / דיון</label>
                    <input type="date" className="w-full px-6 py-4.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-slate-700" value={formData.meetingDate || ''} onChange={e => setFormData({...formData, meetingDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 mr-1">מוקצה לטיפול (רכז) *</label>
                    <div className="relative group">
                      <select required className="w-full appearance-none px-6 py-4.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-indigo-600 bg-white cursor-pointer" value={formData.assignedTo || ''} onChange={e => setFormData({...formData, assignedTo: e.target.value})}>
                        <option value="">בחר רכז מבוקש...</option>
                        {coordinators.map(c => <option key={c.email} value={c.name}>{c.name} ({c.branch})</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 mr-1">מחוז משויך</label>
                    <select className="w-full px-6 py-4.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-slate-700 bg-white" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} disabled={currentUser.type !== 'ארצי'}>
                      <option value="">בחר מחוז...</option>
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 mr-1">סטטוס התחלתי</label>
                    <select className="w-full px-6 py-4.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-black text-indigo-600 bg-white" value={formData.status || 'פתוח'} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                      <option value="פתוח">🔴 פתוח</option>
                      <option value="בטיפול">🟡 בטיפול</option>
                      <option value="בוצע">🟢 בוצע</option>
                    </select>
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95">
                <Save size={22} />
                <span className="italic uppercase tracking-tight">COMMIT STRATEGIC GOAL</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
