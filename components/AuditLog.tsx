
import React, { useState } from 'react';
import { AuditLog } from '../types';
import { User as UserIcon, Calendar, Search, ChevronDown, ChevronUp, Database, ArrowRight, Filter } from 'lucide-react';

interface Props {
  logs: AuditLog[];
}

const AuditLogView: React.FC<Props> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const filtered = logs.filter(l => {
    const matchesSearch = !search || 
      l.userName.toLowerCase().includes(search.toLowerCase()) || 
      l.actionType.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || l.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const toggleRow = (idx: number) => {
    setExpandedRow(expandedRow === idx ? null : idx);
  };

  const renderDiff = (before: any, after: any) => {
    if (!before || !after || typeof before !== 'object') return null;
    const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
    
    return (
      <div className="grid grid-cols-1 gap-2">
        {keys.map(key => {
          if (String(before[key]) === String(after[key])) return null;
          return (
            <div key={key} className="flex items-center gap-3 text-[11px] bg-white p-2 rounded-lg border border-slate-100">
              <span className="font-bold text-slate-400 w-24 truncate">{key}:</span>
              <span className="text-rose-500 bg-rose-50 px-2 py-0.5 rounded line-through decoration-rose-300/50">{String(before[key] || 'ריק')}</span>
              <ArrowRight size={12} className="text-slate-300 shrink-0" />
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-black">{String(after[key] || 'ריק')}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-slate-800">יומן ביקורת כללי</h3>
            <p className="text-slate-400 text-sm font-medium">מעקב אחר כלל הפעולות שבוצעו במערכת</p>
          </div>
          <div className="bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-inner shadow-indigo-100/50">
            {logs.length} רשומות
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              className="w-full pr-14 pl-6 py-4.5 rounded-[24px] border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all bg-slate-50/50 font-medium"
              placeholder="חיפוש חופשי..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="relative min-w-[200px]">
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              className="w-full appearance-none pr-10 pl-10 py-4.5 rounded-[24px] border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50 font-bold text-sm text-slate-600 cursor-pointer"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="">כל סוגי הפעולות</option>
              <option value="יצירה">🆕 יצירה</option>
              <option value="עדכון">🔄 עדכון</option>
              <option value="מחיקה">🗑️ מחיקה</option>
            </select>
            <ChevronDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-6">תאריך ושעה</th>
                <th className="px-8 py-6">משתמש</th>
                <th className="px-8 py-6">פעולה</th>
                <th className="px-8 py-6">פרטים</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((log, idx) => (
                <React.Fragment key={idx}>
                  <tr 
                    onClick={() => toggleRow(idx)}
                    className={`hover:bg-indigo-50/30 transition-all cursor-pointer group ${expandedRow === idx ? 'bg-indigo-50/50' : ''}`}
                  >
                    <td className="px-8 py-6 text-xs font-bold text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-300" />
                        {log.timestamp}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm border border-indigo-100">
                          <UserIcon size={16} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-black text-slate-700 truncate">{log.userName}</span>
                          <span className="text-[10px] text-slate-400 font-bold truncate tracking-tight">{log.userEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        log.type === 'יצירה' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        log.type === 'מחיקה' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                        'bg-indigo-50 text-indigo-700 border-indigo-100'
                      }`}>
                        {log.actionType}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-500 font-medium max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="px-8 py-6 text-slate-300">
                      {expandedRow === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </td>
                  </tr>
                  {expandedRow === idx && (
                    <tr className="bg-indigo-50/30">
                      <td colSpan={5} className="px-10 py-10 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-6">
                            <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Database size={14} className="text-indigo-400" /> מזהה ונתונים טכניים
                            </h5>
                            <div className="bg-white p-5 rounded-3xl border border-slate-100 font-mono text-[10px] text-slate-400 break-all shadow-sm">
                              <span className="font-bold text-slate-800">UUID:</span> {log.itemUUID}
                            </div>
                            {(log as any).dataBefore && (log as any).dataAfter && (
                              <div className="space-y-4">
                                <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">שינויים שבוצעו:</span>
                                {renderDiff((log as any).dataBefore, (log as any).dataAfter)}
                              </div>
                            )}
                          </div>
                          <div className="space-y-6">
                            <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              📝 פירוט פעולה מלא
                            </h5>
                            <div className="bg-white p-6 rounded-[32px] border border-slate-100 text-sm text-slate-600 leading-relaxed shadow-sm font-medium">
                              {log.details}
                            </div>
                            <div className="flex gap-2">
                               <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 text-center">
                                  <div className="text-[9px] font-black text-slate-400 uppercase mb-1">סוג רשומה</div>
                                  <div className="text-xs font-bold text-slate-700">הזנת חלוקה</div>
                               </div>
                               <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 text-center">
                                  <div className="text-[9px] font-black text-slate-400 uppercase mb-1">פלטפורמה</div>
                                  <div className="text-xs font-bold text-slate-700">Web Portal</div>
                               </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogView;
