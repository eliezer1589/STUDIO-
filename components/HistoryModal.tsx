
import React from 'react';
import { X, Clock, User, Info } from 'lucide-react';
import { AuditLog } from '../types';

interface HistoryModalProps {
  itemId: string;
  itemName: string;
  logs: AuditLog[];
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ itemId, itemName, logs, onClose }) => {
  const filteredLogs = logs.filter(log => log.itemUUID === itemId).reverse();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black">היסטוריית שינויים</h3>
              <p className="text-indigo-100 text-xs font-medium">{itemName}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Info className="mx-auto mb-4 opacity-20" size={48} />
              <p className="font-bold">לא נמצאה היסטוריה עבור רשומה זו</p>
            </div>
          ) : (
            <div className="relative border-r-2 border-slate-100 mr-4 pr-8 space-y-8">
              {filteredLogs.map((log, index) => (
                <div key={index} className="relative">
                  {/* Dot */}
                  <div className={`absolute -right-[41px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm ${
                    log.type === 'יצירה' ? 'bg-emerald-500' :
                    log.type === 'מחיקה' ? 'bg-red-500' : 'bg-indigo-500'
                  }`} />
                  
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          log.type === 'יצירה' ? 'bg-emerald-100 text-emerald-700' :
                          log.type === 'מחיקה' ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {log.actionType}
                        </span>
                        <h4 className="text-sm font-bold text-slate-700 mt-2">{log.details}</h4>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{log.timestamp}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-3 border-t border-slate-200/50">
                      <User size={12} className="text-slate-400" />
                      <span className="font-semibold">{log.userName}</span>
                      <span className="opacity-50">•</span>
                      <span className="font-mono text-[10px]">{log.userEmail}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center shrink-0">
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors text-sm"
          >
            סגירה
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
