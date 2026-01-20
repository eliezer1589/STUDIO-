
import React from 'react';
import { User, AuditLog } from '../types';
import { ShieldAlert, ShieldCheck, Ban, UserCheck, AlertTriangle, History, Search, Lock } from 'lucide-react';

interface Props {
  coordinators: User[];
  auditLogs: AuditLog[];
  onUpdateUser: (user: User) => void;
}

const SecurityDashboard: React.FC<Props> = ({ coordinators, auditLogs, onUpdateUser }) => {
  const securityLogs = auditLogs.filter(l => l.type === 'אבטחה' || l.actionType.includes('חסימה') || l.actionType.includes('התחברות'));
  const blockedUsers = coordinators.filter(c => c.status === 'חסום');
  const atRiskUsers = coordinators.filter(c => (c.failedAttempts || 0) > 0 && c.status !== 'חסום');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 overflow-hidden relative">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl" />
        <div className="relative z-10 text-right">
          <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Lock className="text-rose-500" size={24} />
            מרכז ניטור ואבטחת מערכת
          </h3>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">System Security & Access Control Monitor</p>
        </div>
        <div className="flex gap-4 relative z-10">
           <div className="bg-rose-50 border border-rose-100 px-6 py-3 rounded-2xl text-center">
              <div className="text-2xl font-black text-rose-600">{blockedUsers.length}</div>
              <div className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Blocked Accounts</div>
           </div>
           <div className="bg-amber-50 border border-amber-100 px-6 py-3 rounded-2xl text-center">
              <div className="text-2xl font-black text-amber-600">{atRiskUsers.length}</div>
              <div className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Failed Attempts</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Blocked Users List */}
        <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm">
          <h4 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <Ban size={20} className="text-rose-500" />
            חשבונות חסומים / בסיכון
          </h4>
          <div className="space-y-4">
            {[...blockedUsers, ...atRiskUsers].length === 0 ? (
              <div className="py-12 text-center text-slate-300 italic font-bold">אין התראות אבטחה פעילות</div>
            ) : (
              [...blockedUsers, ...atRiskUsers].map((user, i) => (
                <div key={i} className={`p-6 rounded-[32px] border flex items-center justify-between group transition-all ${user.status === 'חסום' ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-100 hover:shadow-lg'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${user.status === 'חסום' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-600'}`}>
                      {user.status === 'חסום' ? <Ban size={20} /> : <AlertTriangle size={20} />}
                    </div>
                    <div>
                      <div className="font-black text-slate-800">{user.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">{user.email}</div>
                      {user.failedAttempts && (
                        <div className="mt-1 flex gap-1">
                          {[...Array(4)].map((_, idx) => (
                            <div key={idx} className={`h-1 w-4 rounded-full ${idx < (user.failedAttempts || 0) ? 'bg-rose-500' : 'bg-slate-200'}`} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => onUpdateUser({ ...user, status: 'פעיל', failedAttempts: 0 })}
                    className="bg-white text-slate-900 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-slate-900 hover:text-white transition-all border border-slate-100"
                  >
                    שחרור חסימה
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security Logs */}
        <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm flex flex-col h-full">
          <h4 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <History size={20} className="text-indigo-600" />
            יומן אירועי אבטחה
          </h4>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
            {securityLogs.length === 0 ? (
               <div className="text-center py-12 text-slate-300 font-bold italic">לא נרשמו אירועים חריגים</div>
            ) : (
              securityLogs.map((log, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-4">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm text-slate-400">
                      <ShieldAlert size={18} />
                   </div>
                   <div className="min-w-0">
                      <div className="text-xs font-black text-slate-700">{log.details}</div>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[10px] font-bold text-slate-400 uppercase">{log.userName}</span>
                         <span className="w-1 h-1 bg-slate-200 rounded-full" />
                         <span className="text-[10px] font-bold text-slate-300">{log.timestamp}</span>
                      </div>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
