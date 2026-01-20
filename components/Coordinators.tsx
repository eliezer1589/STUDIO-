
import React, { useState } from 'react';
import { User } from '../types';
import { Mail, Shield, MapPin, Edit, Trash2, Plus, X, Save, Lock, Search, ChevronDown, Ban, UserCheck } from 'lucide-react';

interface CoordinatorsProps {
  currentUser: User;
  coordinators: User[];
  onUpdate: (user: User) => void;
  onAdd: (user: User) => void;
  onDelete: (email: string) => void;
}

const Coordinators: React.FC<CoordinatorsProps> = ({ currentUser, coordinators, onUpdate, onAdd, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoord, setEditingCoord] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const uniqueDistricts = [...new Set(coordinators.map(c => c.district))].filter(Boolean).sort();

  const filtered = coordinators.filter(c => {
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchesDistrict = !districtFilter || c.district === districtFilter;
    const matchesRole = !roleFilter || c.type === roleFilter;
    return matchesSearch && matchesDistrict && matchesRole;
  });

  const openModal = (coord?: User) => {
    if (coord) {
      setEditingCoord(coord);
      setFormData(coord);
    } else {
      setEditingCoord(null);
      setFormData({ type: 'סניפי', status: 'פעיל' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCoord) {
      onUpdate(formData as User);
    } else {
      onAdd(formData as User);
    }
    setIsModalOpen(false);
  };

  const toggleBlock = (coord: User) => {
    const newStatus = coord.status === 'חסום' ? 'פעיל' : 'חסום';
    onUpdate({ ...coord, status: newStatus });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h3 className="text-2xl font-black text-slate-800">ניהול צוות רכזים</h3>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">שליטה בהרשאות וגישה למערכת - אגף הלכה</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-slate-900 text-white px-10 py-4 rounded-[28px] font-black italic flex items-center gap-3 shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 z-10"
        >
          <Plus size={22} />
          <span>ADD MEMBER</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text"
            className="w-full pr-14 pl-6 py-4.5 rounded-[24px] border border-slate-200 outline-none focus:border-indigo-500 bg-white font-bold text-slate-700 transition-all shadow-sm"
            placeholder="חיפוש לפי שם או אימייל..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <select className="w-full appearance-none px-6 py-4.5 rounded-[24px] border border-slate-200 bg-white font-black text-xs text-slate-600 outline-none cursor-pointer" value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}>
            <option value="">כל המחוזות</option>
            {uniqueDistricts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        <div className="relative">
          <select className="w-full appearance-none px-6 py-4.5 rounded-[24px] border border-slate-200 bg-white font-black text-xs text-slate-600 outline-none cursor-pointer" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">כל התפקידים</option>
            <option value="ארצי">ארצי</option>
            <option value="מחוזי">מחוזי</option>
            <option value="סניפי">סניפי</option>
          </select>
          <ChevronDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((c, idx) => (
          <div key={idx} className={`bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm relative group hover:shadow-2xl hover:shadow-indigo-50/50 transition-all duration-300 flex flex-col ${c.status === 'חסום' ? 'opacity-60 grayscale' : ''}`}>
            
            {/* Top Badge */}
            <div className="absolute right-8 -top-3">
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md ${
                c.type === 'ארצי' ? 'bg-indigo-600 text-white' :
                c.type === 'מחוזי' ? 'bg-amber-500 text-white' :
                'bg-slate-100 text-slate-600'
              }`}>
                {c.type}
              </span>
            </div>

            <div className="absolute left-8 top-8 flex gap-2">
              <button onClick={() => toggleBlock(c)} className={`p-2.5 rounded-xl transition-all shadow-sm ${c.status === 'חסום' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'}`} title={c.status === 'חסום' ? 'שחרור חסימה' : 'חסימת חשבון'}>
                {c.status === 'חסום' ? <UserCheck size={18} /> : <Ban size={18} />}
              </button>
              <button onClick={() => openModal(c)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"><Edit size={18} /></button>
            </div>

            <div className="flex flex-col items-center text-center mt-4 mb-8">
              <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-3xl mb-6 shadow-inner border border-slate-100">👤</div>
              <h4 className="text-2xl font-black text-slate-800">{c.name}</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{c.branch} BRANCH</p>
            </div>

            <div className="space-y-4 pt-8 border-t border-slate-50 mt-auto">
              <div className="flex items-center gap-4 text-sm font-bold text-slate-500 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                <Mail size={18} className="text-indigo-400" />
                <span className="truncate">{c.email}</span>
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-slate-500 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                <MapPin size={18} className="text-indigo-400" />
                <span>מחוז {c.district}</span>
              </div>
              {currentUser.type === 'ארצי' && c.password && (
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400 px-4">
                  <Lock size={14} />
                  <span>{c.password}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[56px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-900 p-10 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h3 className="text-2xl font-black italic tracking-tighter uppercase">{editingCoord ? 'UPDATE MEMBER' : 'ADD NEW MEMBER'}</h3>
                <p className="text-slate-400 text-[10px] font-bold tracking-widest mt-1">מערכת ניהול הרשאות אגף הלכה</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-3 rounded-full transition-colors relative z-10"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-10 space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mr-1">שם מלא</label>
                  <input type="text" required className="w-full px-6 py-4.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 bg-slate-50/30" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mr-1">אימייל (כניסה למערכת)</label>
                  <input type="email" required className="w-full px-6 py-4.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} disabled={!!editingCoord} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mr-1">מחוז</label>
                    <input type="text" className="w-full px-6 py-4.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold" value={formData.district || ''} onChange={e => setFormData({...formData, district: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mr-1">סניף</label>
                    <input type="text" className="w-full px-6 py-4.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold" value={formData.branch || ''} onChange={e => setFormData({...formData, branch: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mr-1">תפקיד מערכת</label>
                    <select className="w-full px-6 py-4.5 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 font-black text-indigo-600 bg-white" value={formData.type || 'סניפי'} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                      <option value="סניפי">סניפי</option>
                      <option value="מחוזי">מחוזי</option>
                      <option value="ארצי">ארצי</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mr-1">סיסמה זמנית</label>
                    <input type="text" className="w-full px-6 py-4.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all font-mono" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95">
                <Save size={22} />
                <span className="italic uppercase tracking-tight">SAVE MEMBER CHANGES</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coordinators;
