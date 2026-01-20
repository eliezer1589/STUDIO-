
import React, { useState } from 'react';
import { User, AuditLog } from '../types';
import { User as UserIcon, Lock, Key, Save, History, MapPin, Building2, ShieldCheck, Clock } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface ProfileProps {
  user: User;
  auditLogs: AuditLog[];
  onUpdate: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, auditLogs, onUpdate }) => {
  const { showToast } = useToast();
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState(user.password || '');

  const personalLogs = auditLogs.filter(l => l.userEmail === user.email).slice(0, 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      showToast('הסיסמה חייבת להכיל לפחות 6 תווים', 'error');
      return;
    }
    onUpdate({ ...user, name, password });
  };

  const generateRandomPassword = () => {
    const pass = Math.random().toString(36).substr(2, 10).toUpperCase();
    setPassword(pass);
    showToast('סיסמה אקראית הופקה', 'info');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Account Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
            <div className="flex flex-col md:flex-row items-center gap-8 mb-12 relative z-10">
              <div className="bg-indigo-600 text-white p-8 rounded-[40px] shadow-2xl shadow-indigo-100 transform -rotate-3">
                <UserIcon size={56} />
              </div>
              <div className="text-center md:text-right space-y-2">
                <h3 className="text-3xl font-black text-slate-800">פרופיל אישי</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Account Management System - AGAF HALACHA</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                   <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">{user.type} Rank</span>
                   <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">Status: Active</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">שם מלא</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-6 py-4.5 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-8 focus:ring-indigo-50 transition-all font-bold text-slate-700 bg-slate-50/30" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">כתובת אימייל</label>
                  <input type="email" value={user.email} readOnly className="w-full px-6 py-4.5 rounded-2xl border border-slate-100 bg-slate-100 text-slate-400 outline-none cursor-not-allowed font-bold" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">מחוז משויך</label>
                  <div className="w-full px-6 py-4.5 rounded-2xl border border-slate-100 bg-slate-100 text-slate-500 font-bold flex items-center gap-3">
                     <MapPin size={18} className="text-slate-400" />
                     {user.district}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">סניף פעילות</label>
                  <div className="w-full px-6 py-4.5 rounded-2xl border border-slate-100 bg-slate-100 text-slate-500 font-bold flex items-center gap-3">
                     <Building2 size={18} className="text-slate-400" />
                     {user.branch}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-900 rounded-[32px] text-white space-y-6 shadow-2xl">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                   <Key size={20} className="text-indigo-400" />
                   <h4 className="text-sm font-black uppercase tracking-widest italic">Secure Access Key</h4>
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mr-1">NEW PASSWORD</label>
                  <div className="relative group">
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-white/5 focus:bg-white/10 outline-none transition-all font-mono text-white pr-14" placeholder="••••••••" />
                    <Lock className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400" size={18} />
                    <button type="button" onClick={generateRandomPassword} className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-400 bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10">ROLL DICE</button>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 rounded-[32px] shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center gap-4 transform active:scale-95 group">
                <div className="bg-white/10 p-2 rounded-xl group-hover:scale-110 transition-transform">
                  <Save size={24} />
                </div>
                <span className="text-xl italic">UPDATE OPERATOR RECORD</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Personal Activity */}
        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm flex flex-col h-full">
              <h4 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-3">
                 <History size={22} className="text-indigo-600" />
                 פעולות אחרונות שלי
              </h4>
              <div className="space-y-6 relative">
                 <div className="absolute right-4.5 top-0 bottom-0 w-px bg-slate-100" />
                 {personalLogs.length === 0 ? (
                    <div className="text-center py-12 text-slate-300 font-bold italic">טרם נרשמו פעולות</div>
                 ) : (
                    personalLogs.map((log, i) => (
                      <div key={i} className="flex gap-4 relative z-10">
                         <div className="w-9 h-9 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center justify-center shrink-0">
                            <Clock size={16} className="text-slate-400" />
                         </div>
                         <div className="min-w-0 pt-1">
                            <div className="text-xs font-bold text-slate-700 leading-tight">{log.details}</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase mt-1 italic">{log.timestamp.split(' ')[1]}</div>
                         </div>
                      </div>
                    ))
                 )}
              </div>
              <div className="mt-auto pt-10">
                 <div className="bg-indigo-50/50 p-6 rounded-[32px] border border-indigo-50 space-y-4">
                    <div className="flex items-center gap-3 text-indigo-900">
                       <ShieldCheck size={20} />
                       <span className="text-xs font-black uppercase tracking-widest">Compliance Badge</span>
                    </div>
                    <p className="text-[10px] font-medium text-indigo-600 leading-relaxed">
                       חשבונך מאובטח ועומד בתקני אבטחת המידע של המערכת. כל פעולה שאתה מבצע נרשמת ביומן הביקורת הארצי.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
