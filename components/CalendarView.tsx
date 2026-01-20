
import React, { useState, useMemo } from 'react';
import { Goal } from '../types';
import { 
  ChevronRight, 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  Target, 
  Plus, 
  CheckCircle, 
  LayoutGrid, 
  ListOrdered, 
  TrendingUp, 
  AlertCircle, 
  Zap,
  MapPin,
  User,
  ArrowUpRight
} from 'lucide-react';

interface Props {
  goals: Goal[];
  onAddGoal: () => void;
}

const CalendarView: React.FC<Props> = ({ goals, onAddGoal }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'roadmap'>('calendar');
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const monthNames = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
  const dayLabels = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];

  const monthGoals = useMemo(() => {
    return goals.filter(g => {
      const gDate = new Date(g.meetingDate);
      return gDate.getMonth() === currentMonth.getMonth() && gDate.getFullYear() === currentMonth.getFullYear();
    });
  }, [goals, currentMonth]);

  const stats = useMemo(() => {
    const total = monthGoals.length;
    const completed = monthGoals.filter(g => g.status === 'בוצע').length;
    const pending = monthGoals.filter(g => g.status === 'פתוח').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, rate };
  }, [monthGoals]);

  const getGoalsForDay = (day: number) => {
    return monthGoals.filter(g => new Date(g.meetingDate).getDate() === day);
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth(currentMonth); i++) days.push(null);
  for (let i = 1; i <= daysInMonth(currentMonth); i++) days.push(i);

  const roadmapGoals = [...monthGoals].sort((a, b) => new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime());

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* Header & Strategic Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-indigo-500 p-4 rounded-3xl shadow-xl rotate-3 group-hover:rotate-0 transition-transform">
                <CalendarIcon size={32} />
              </div>
              <div>
                <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">STRATEGIC TIMELINE</h3>
                <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Agaf Halacha Operations</p>
              </div>
            </div>
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-[24px] border border-white/10 backdrop-blur-sm">
               <div className="flex items-center gap-4">
                  <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-xl transition-all"><ChevronRight size={24} /></button>
                  <span className="font-black text-xl italic min-w-[140px] text-center">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                  <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-xl transition-all"><ChevronLeft size={24} /></button>
               </div>
               <div className="flex bg-slate-800 p-1.5 rounded-2xl">
                  <button onClick={() => setViewMode('calendar')} className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                    <LayoutGrid size={14} /> Grid
                  </button>
                  <button onClick={() => setViewMode('roadmap')} className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'roadmap' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                    <ListOrdered size={14} /> Roadmap
                  </button>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm relative group overflow-hidden">
           <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-full -translate-y-12 translate-x-12 opacity-50 group-hover:scale-150 transition-transform" />
           <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                 <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl"><TrendingUp size={20} /></div>
                 <div className="flex items-center gap-1 text-emerald-500 font-black text-[10px]">
                    <ArrowUpRight size={14} /> +8%
                 </div>
              </div>
              <div className="text-4xl font-black text-slate-800 italic">{stats.rate}%</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Completion Efficiency</div>
              <div className="mt-6 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                 <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${stats.rate}%` }} />
              </div>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm relative group overflow-hidden">
           <div className="absolute right-0 top-0 w-24 h-24 bg-rose-50 rounded-full -translate-y-12 translate-x-12 opacity-50 group-hover:scale-150 transition-transform" />
           <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                 <div className="bg-rose-50 text-rose-600 p-3 rounded-2xl"><Zap size={20} /></div>
              </div>
              <div className="text-4xl font-black text-slate-800 italic">{stats.pending}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Pending Strategic Goals</div>
              <div className="mt-6 flex items-center gap-2">
                 <button onClick={onAddGoal} className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter flex items-center gap-2 hover:translate-x-1 transition-transform">
                    <Plus size={14} /> Deploy New Task
                 </button>
              </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <div className="flex-1">
          {viewMode === 'calendar' ? (
            <div className="bg-white rounded-[56px] border border-slate-100 shadow-xl shadow-indigo-100/20 overflow-hidden p-10 animate-in zoom-in-95 duration-500">
              <div className="grid grid-cols-7 gap-6 mb-8">
                {dayLabels.map(d => (
                  <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-4 md:gap-6">
                {days.map((day, idx) => {
                  const dayGoals = day ? getGoalsForDay(day) : [];
                  const isToday = day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth();
                  const isSelected = selectedDay === day;
                  
                  return (
                    <div 
                      key={idx} 
                      onClick={() => day && setSelectedDay(day)}
                      className={`min-h-[120px] md:min-h-[140px] rounded-[32px] p-4 transition-all border cursor-pointer group/day ${
                        day 
                        ? (isSelected ? 'bg-indigo-600 border-indigo-600 shadow-2xl shadow-indigo-200 -translate-y-1' : 
                           isToday ? 'bg-indigo-50 border-indigo-200 shadow-inner' : 
                           'bg-slate-50/50 border-slate-100 hover:bg-white hover:shadow-xl hover:border-indigo-100') 
                        : 'opacity-0 pointer-events-none'
                      }`}
                    >
                      {day && (
                        <>
                          <div className="flex justify-between items-center mb-3">
                            <span className={`text-sm font-black italic ${isSelected ? 'text-white' : isToday ? 'text-indigo-600' : 'text-slate-400'}`}>{day}</span>
                            {dayGoals.length > 0 && !isSelected && (
                              <div className={`w-2 h-2 rounded-full animate-pulse ${
                                dayGoals.some(g => g.status === 'פתוח') ? 'bg-rose-500' : 'bg-emerald-500'
                              }`} />
                            )}
                            {isSelected && <CheckCircle size={14} className="text-white opacity-60" />}
                          </div>
                          <div className="space-y-1.5">
                            {dayGoals.slice(0, 2).map((g, gi) => (
                              <div key={gi} className={`text-[8px] p-1.5 rounded-lg font-black border truncate transition-all ${
                                isSelected ? 'bg-white/20 border-white/10 text-white' :
                                g.status === 'בוצע' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                g.status === 'בטיפול' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                'bg-rose-50 text-rose-700 border-rose-100'
                              }`}>
                                {g.task}
                              </div>
                            ))}
                            {dayGoals.length > 2 && (
                              <div className={`text-[8px] font-black text-center pt-1 ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>
                                +{dayGoals.length - 2} MORE
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
               {roadmapGoals.length === 0 ? (
                 <div className="bg-white rounded-[48px] p-20 text-center border-2 border-dashed border-slate-100">
                    <CalendarIcon size={48} className="mx-auto text-slate-200 mb-4" />
                    <h4 className="text-xl font-black text-slate-400 italic">No operational data for this period</h4>
                 </div>
               ) : (
                 roadmapGoals.map((goal, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-8 group hover:shadow-xl hover:border-indigo-100 transition-all">
                       <div className="flex flex-col items-center justify-center min-w-[80px] h-20 bg-slate-50 rounded-3xl border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <span className="text-xs font-black uppercase opacity-60 group-hover:opacity-100">{new Date(goal.meetingDate).toLocaleDateString('he-IL', { weekday: 'short' })}</span>
                          <span className="text-2xl font-black italic">{new Date(goal.meetingDate).getDate()}</span>
                       </div>
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                             <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                goal.status === 'בוצע' ? 'bg-emerald-50 text-emerald-700' :
                                goal.status === 'בטיפול' ? 'bg-amber-50 text-amber-700' :
                                'bg-rose-50 text-rose-700'
                             }`}>
                                {goal.status}
                             </span>
                             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                                <MapPin size={10} /> {goal.district}
                             </span>
                          </div>
                          <h4 className="text-lg font-black text-slate-800 leading-tight">{goal.task}</h4>
                       </div>
                       <div className="hidden md:flex flex-col items-end gap-2 pr-4">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm"><User size={14} /></div>
                             <span className="text-xs font-bold text-slate-700">{goal.assignedTo}</span>
                          </div>
                       </div>
                       <ChevronLeft size={20} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                 ))
               )}
            </div>
          )}
        </div>

        {/* Selected Day Details Panel */}
        <div className="lg:w-96 space-y-6">
           <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm sticky top-8">
              <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
                 <div>
                    <h4 className="text-xl font-black text-slate-800">
                      {selectedDay ? `${selectedDay} ב${monthNames[currentMonth.getMonth()]}` : 'בחר יום'}
                    </h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Briefing & Logs</p>
                 </div>
                 <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl shadow-inner"><Target size={20} /></div>
              </div>

              <div className="space-y-4">
                 {selectedDay && getGoalsForDay(selectedDay).length > 0 ? (
                    getGoalsForDay(selectedDay).map((g, i) => (
                      <div key={i} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:translate-x-1 transition-transform group">
                         <div className="flex justify-between items-start mb-3">
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                               g.status === 'בוצע' ? 'bg-emerald-50 text-emerald-600' :
                               g.status === 'בטיפול' ? 'bg-amber-50 text-amber-600' :
                               'bg-rose-50 text-rose-600'
                            }`}>{g.status}</span>
                            <CheckCircle size={14} className={`transition-colors ${g.status === 'בוצע' ? 'text-emerald-500' : 'text-slate-200'}`} />
                         </div>
                         <p className="text-xs font-bold text-slate-700 mb-3 leading-relaxed">{g.task}</p>
                         <div className="flex items-center justify-between pt-3 border-t border-slate-200/50">
                            <div className="flex items-center gap-1.5">
                               <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-black text-indigo-600">
                                  {g.assignedTo.charAt(0)}
                               </div>
                               <span className="text-[9px] font-bold text-slate-500">{g.assignedTo}</span>
                            </div>
                            <span className="text-[9px] font-black text-slate-300 uppercase italic">OPERATIONAL</span>
                         </div>
                      </div>
                    ))
                 ) : (
                    <div className="py-12 text-center space-y-4">
                       <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100 text-slate-200">
                          <Clock size={24} />
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-300 italic">אין משימות מתוזמנות</p>
                          <p className="text-[10px] text-slate-400 font-medium">המערכת נקייה מפעילות מבצעית ביום זה</p>
                       </div>
                    </div>
                 )}
              </div>

              {selectedDay && (
                <button 
                  onClick={onAddGoal}
                  className="w-full mt-8 bg-slate-900 text-white font-black py-4 rounded-[24px] shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 group active:scale-95"
                >
                  <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                  <span className="text-xs italic uppercase tracking-widest">SCHEDULE EVENT</span>
                </button>
              )}
           </div>

           <div className="bg-indigo-600 p-8 rounded-[48px] text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4"><TrendingUp size={120} /></div>
              <div className="relative z-10">
                 <h5 className="text-sm font-black italic mb-2 uppercase tracking-tighter">Strategic Insights</h5>
                 <p className="text-xs font-medium text-indigo-100 leading-relaxed mb-6">
                    זיהינו עומס משימות מוגבר במחוז { roadmapGoals.reduce((acc: any, curr) => { acc[curr.district] = (acc[curr.district] || 0) + 1; return acc; }, {})['ירושלים'] > 2 ? 'ירושלים' : 'המרכז' }. מומלץ לתעדף משימות קריטיות.
                 </p>
                 <div className="flex items-center gap-2 text-[10px] font-black text-indigo-200 uppercase tracking-widest">
                    <AlertCircle size={14} /> Action Required
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
