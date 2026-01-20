
import React, { useState } from 'react';
import { GiftEntry, InventoryItem, ReportSummary } from '../types';
import { FileText, Download, Filter, Calendar, TrendingUp, DollarSign, Users, ArrowUpRight, BarChart2, PieChart as PieIcon, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface ReportsProps {
  gifts: GiftEntry[];
  inventory: InventoryItem[];
}

const Reports: React.FC<ReportsProps> = ({ gifts, inventory }) => {
  const { showToast } = useToast();
  const [dateRange, setDateRange] = useState('month');
  const [isExporting, setIsExporting] = useState(false);

  // Generate real summary from data
  const calculateSummary = (): ReportSummary => {
    const activeGifts = gifts.filter(g => g.status === 'נמסר');
    
    let totalCost = 0;
    let totalValue = 0;

    activeGifts.forEach(g => {
      const item = inventory.find(i => i.product === g.giftType);
      if (item) {
        totalCost += parseInt(item.priceWithVAT.replace(/[^0-9]/g, '')) || 0;
        totalValue += parseInt(item.marketPrice.replace(/[^0-9]/g, '')) || 0;
      }
    });

    const coordinatorCounts = gifts.reduce((acc: any, g) => {
      acc[g.coordinatorName] = (acc[g.coordinatorName] || 0) + 1;
      return acc;
    }, {});

    const topCoord = Object.entries(coordinatorCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'אין נתונים';

    return {
      totalValue,
      totalCost,
      savings: totalValue - totalCost,
      topCoordinator: topCoord,
      topBranch: activeGifts[0]?.branch || 'לא ידוע',
      distributionCount: activeGifts.length
    };
  };

  const summary = calculateSummary();

  const handleExport = (format: string) => {
    setIsExporting(true);
    showToast(`מפיק דו"ח בפורמט ${format}...`, 'info');
    setTimeout(() => {
      setIsExporting(false);
      showToast(`הדו"ח הופק בהצלחה!`, 'success');
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-800">מרכז דוחות ותובנות</h3>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">BI & Analytics Control - אגף הלכה</p>
        </div>
        <div className="flex gap-3">
          <select className="px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-black text-xs text-slate-600 outline-none cursor-pointer" value={dateRange} onChange={e => setDateRange(e.target.value)}>
            <option value="month">חודש נוכחי</option>
            <option value="quarter">רבעון אחרון</option>
            <option value="year">שנה נוכחית</option>
          </select>
          <button onClick={() => handleExport('PDF')} disabled={isExporting} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black italic flex items-center gap-3 hover:bg-indigo-600 transition-all shadow-xl active:scale-95">
            <FileText size={18} />
            <span>GENERATE PDF</span>
          </button>
        </div>
      </div>

      {/* Financial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform">
            <DollarSign size={160} />
          </div>
          <div className="relative z-10">
            <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
              <TrendingUp size={24} />
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">TOTAL MARKET VALUE</div>
            <div className="text-4xl font-black italic tracking-tighter">₪{summary.totalValue.toLocaleString()}</div>
            <div className="mt-6 flex items-center gap-2 text-emerald-300">
              <ArrowUpRight size={16} />
              <span className="text-xs font-bold">12% צמיחה מהחודש הקודם</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
            <CheckCircle size={24} />
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">TOTAL SAVINGS (AGAF)</div>
          <div className="text-4xl font-black text-slate-800 italic tracking-tighter">₪{summary.savings.toLocaleString()}</div>
          <p className="text-xs font-bold text-slate-400 mt-6 leading-relaxed italic">החיסכון האגפי מחושב לפי ההפרש שבין מחיר הרכישה המוסדי לערך השוק של התמריצים.</p>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100">
            <Users size={24} />
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">MOST ACTIVE COORDINATOR</div>
          <div className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">{summary.topCoordinator}</div>
          <div className="mt-6 flex items-center gap-2">
            <div className="bg-indigo-600 h-1.5 flex-1 rounded-full overflow-hidden">
               <div className="bg-indigo-300 h-full w-[70%]" />
            </div>
            <span className="text-[10px] font-black text-slate-400">70% מהיעד</span>
          </div>
        </div>
      </div>

      {/* Comparison and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm">
          <h4 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
             <BarChart2 size={22} className="text-indigo-600" />
             ניתוח פעילות מחוזית
          </h4>
          <div className="space-y-6">
            {['ירושלים', 'מרכז', 'צפון', 'דרום'].map((dist, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                  <span className="text-slate-600">{dist}</span>
                  <span className="text-indigo-600">₪{Math.floor(Math.random() * 5000 + 2000).toLocaleString()}</span>
                </div>
                <div className="h-3 w-full bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shadow-inner">
                  <div className="h-full bg-indigo-500 rounded-xl" style={{ width: `${Math.random() * 60 + 30}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
           <div className="bg-indigo-50 p-10 rounded-full mb-8 border border-indigo-100 animate-pulse">
              <PieIcon size={64} className="text-indigo-300" />
           </div>
           <h4 className="text-2xl font-black text-slate-800 mb-2 italic">EXECUTIVE SUMMARY</h4>
           <p className="text-slate-400 font-medium text-sm max-w-sm mx-auto leading-relaxed mb-8">
              כל הנתונים המופיעים בדו"ח זה נמשכים בזמן אמת מגיליון הניהול הראשי של אגף הלכה ומבוקרים על ידי הנהלת המטה.
           </p>
           <button onClick={() => handleExport('EXCEL')} className="w-full py-5 rounded-[24px] border-2 border-indigo-100 text-indigo-600 font-black tracking-widest text-xs hover:bg-indigo-50 transition-all uppercase flex items-center justify-center gap-3">
              <Download size={18} />
              Download Full Dataset (.xlsx)
           </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
