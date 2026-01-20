
import React, { useState, useEffect } from 'react';
import { GiftEntry, InventoryItem, IncentiveRequest, Goal, AuditLog, Announcement } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { 
  TrendingUp,
  Package,
  Truck,
  Clock,
  CheckCircle,
  Bell,
  ChevronLeft,
  Map,
  Activity,
  User as UserIcon,
  ShieldAlert,
  Zap,
  PlusCircle,
  ClipboardList,
  DollarSign,
  Megaphone,
  ArrowUpRight
} from 'lucide-react';

interface DashboardProps {
  gifts: GiftEntry[];
  inventory: InventoryItem[];
  incentives?: IncentiveRequest[];
  goals?: Goal[];
  auditLogs?: AuditLog[];
  onQuickAction: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ gifts, inventory, incentives = [], goals = [], auditLogs = [], onQuickAction }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const statusData = [
    { name: 'ממתין', value: gifts.filter(g => g.status === 'ממתין').length, color: '#f59e0b' },
    { name: 'בדרך', value: gifts.filter(g => g.status === 'בדרך').length, color: '#3b82f6' },
    { name: 'נמסר', value: gifts.filter(g => g.status === 'נמסר').length, color: '#10b981' },
    { name: 'בוטל', value: gifts.filter(g => g.status === 'בוטל').length, color: '#ef4444' },
  ];

  const districtPerformance = gifts.reduce((acc: any[], gift) => {
    const existing = acc.find(item => item.subject === gift.district);
    if (existing) {
      existing.A += 1;
      if (gift.status === 'נמסר') existing.B += 1;
    } else {
      acc.push({ subject: gift.district || 'אחר', A: 1, B: gift.status === 'נמסר' ? 1 : 0, fullMark: 10 });
    }
    return acc;
  }, []);

  const totalMarketValue = gifts
    .filter(g => g.status === 'נמסר')
    .reduce((sum, g) => {
      const item = inventory.find(i => i.product === g.giftType);
      const val = item ? parseInt(item.marketPrice.replace(/[^0-9]/g, '')) || 0 : 0;
      return sum + val;
    }, 0);

  const announcements: Announcement[] = [
    { id: '1', title: 'ריענון נהלים: חלוקת שוברים', content: 'יש לוודא חתימה דיגיטלית של המקבל בכל מסירה ידנית.', type: 'urgent', date: 'היום, 09:00', author: 'מטה האגף' },
    { id: '2', title: 'מלאי חדש הגיע!', content: 'כרטיסי "BUYME" הוטענו במערכת וזמינים לחלוקה.', type: 'success', date: 'אתמול, 16:30', author: 'מחסן' },
  ];

  const recentLogs = auditLogs.slice(0, 5);
  const lowStock = inventory.filter(i => i.stockQuantity <= 5);
  const pendingIncentives = incentives.filter(i => i.status === 'ממתין');
  const openGoals = goals.filter(g => g.status !== 'בוצע');

  const quickActions = [
    { label: 'הזנת חלוקה', icon: PlusCircle, tab: 'new-entry', color: 'bg-indigo-600' },
    { label: 'בקשת מלאי', icon: Package, tab: 'incentives', color: 'bg-emerald-600' },
    { label: 'משימה חדשה', icon: ClipboardList, tab: 'goals', color: 'bg-amber-600' },
    { label: 'לו"ז אגפי', icon: ClipboardList, tab: 'calendar', color: 'bg-violet-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Dynamic Header with Clock */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-slate-900 p-10 rounded-[56px] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-500 p-2 rounded-xl"><Zap size={18} /></div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Status: System Operational</span>
          </div>
          <h2 className="text-4xl font-black italic tracking-tighter">COMMAND CENTER</h2>
          <p className="text-indigo-300 font-bold text-sm">ברוך הבא למערכת הניהול המרכזית של אגף הלכה</p>
        </div>
        <div className="relative z-10 text-left md:text-right">
           <div className="text-5xl font-black italic tracking-tighter mb-1 font-mono">
              {time.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
           </div>
           <div className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
              {time.toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
           </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
        {quickActions.map((action, i) => (
          <button 
            key={i} 
            onClick={() => onQuickAction(action.tab)}
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-lg hover:shadow-indigo-50 border border-transparent hover:border-indigo-100 transition-all group"
          >
            <div className={`${action.color} p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform`}>
              <action.icon size={16} />
            </div>
            <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600">{action.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: News & Activity */}
        <div className="space-y-8">
          {/* Announcements Feed */}
          <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm">
             <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                <Megaphone size={20} className="text-indigo-600" />
                הודעות ועדכוני מטה
             </h3>
             <div className="space-y-4">
                {announcements.map(ann => (
                  <div key={ann.id} className={`p-5 rounded-3xl border transition-all hover:translate-x-1 ${
                    ann.type === 'urgent' ? 'bg-rose-50 border-rose-100 text-rose-900' :
                    ann.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' :
                    'bg-slate-50 border-slate-100 text-slate-900'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                       <span className="font-black text-sm">{ann.title}</span>
                       <span className="text-[9px] font-black opacity-40 uppercase">{ann.date}</span>
                    </div>
                    <p className="text-xs font-medium opacity-70 leading-relaxed">{ann.content}</p>
                    <div className="mt-3 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-current opacity-30" />
                       <span className="text-[9px] font-black uppercase tracking-widest opacity-50">{ann.author}</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Real-time Logistics Radar */}
          <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm h-[400px]">
             <h3 className="text-md font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tight">
                <Map size={18} className="text-indigo-600" />
                איזון פעילות מחוזי
             </h3>
             <ResponsiveContainer width="100%" height="80%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={districtPerformance}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} />
                  <Radar name="סה״כ חלוקות" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.4} />
                  <Radar name="מסירות בפועל" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} />
                </RadarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Key Metrics & Distribution */}
        <div className="lg:col-span-2 space-y-8">
           {/* Big Stats Row */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'שווי שוק שנמסר', value: `₪${totalMarketValue.toLocaleString()}`, trend: '+12%', icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'יעילות מסירה', value: `${Math.round((gifts.filter(g => g.status === 'נמסר').length / gifts.length) * 100 || 0)}%`, trend: '+5%', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'ממתינים לטיפול', value: gifts.filter(g => g.status === 'ממתין').length, trend: '-2', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
              ].map((m, i) => (
                <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
                   <div className="flex justify-between items-start mb-6">
                      <div className={`${m.bg} ${m.color} p-3 rounded-2xl group-hover:rotate-12 transition-transform`}>
                        <m.icon size={20} />
                      </div>
                      <div className="flex items-center gap-1 text-emerald-500 font-black text-[10px]">
                         <ArrowUpRight size={14} />
                         {m.trend}
                      </div>
                   </div>
                   <div className="text-3xl font-black text-slate-800 tracking-tighter">{m.value}</div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{m.label}</div>
                </div>
              ))}
           </div>

          {/* Regional Performance Vertical Bar */}
          <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Activity size={20} className="text-indigo-600" />
                  סטטיסטיקת חלוקה לפי מחוז
                </h3>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districtPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="A" name="סה״כ פקודות" fill="#4f46e5" radius={[10, 10, 0, 0]} barSize={40} />
                  <Bar dataKey="B" name="בוצע בהצלחה" fill="#10b981" radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-slate-800">פעולות אחרונות ביומן</h3>
                <button onClick={() => onQuickAction('audit')} className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline">View All</button>
             </div>
             <div className="space-y-4">
                {recentLogs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 border border-slate-100/50">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                           <UserIcon size={16} className="text-indigo-400" />
                        </div>
                        <div>
                           <div className="text-xs font-black text-slate-700">{log.details}</div>
                           <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{log.userName} • {log.timestamp}</div>
                        </div>
                     </div>
                     <span className="bg-white px-3 py-1 rounded-full text-[8px] font-black text-indigo-600 border border-indigo-50 shadow-sm uppercase">{log.type}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
