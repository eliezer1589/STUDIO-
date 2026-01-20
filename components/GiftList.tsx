
import React, { useState, useRef } from 'react';
import { GiftEntry, User } from '../types';
import { Search, Filter, MapPin, Gift, Clock, Edit, Trash2, History, ChevronDown, X, Save, MessageSquare, Download, Loader2, ArrowUpDown, User as UserIcon, Truck, PenTool, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface GiftListProps {
  gifts: GiftEntry[];
  currentUser: User;
  onUpdateStatus: (id: string, status: GiftEntry['status'], extra?: Partial<GiftEntry>) => void;
  onUpdateGift: (id: string, data: Partial<GiftEntry>) => void;
  onDeleteGift: (id: string) => void;
  onOpenHistory: (id: string, name: string) => void;
  onAddComment: (id: string, comment: string) => void;
}

const GiftList: React.FC<GiftListProps> = ({ gifts, currentUser, onUpdateStatus, onUpdateGift, onDeleteGift, onOpenHistory, onAddComment }) => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type'>('date');
  const [isExporting, setIsExporting] = useState(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<GiftEntry | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<GiftEntry>>({});
  
  const [commentTarget, setCommentTarget] = useState<GiftEntry | null>(null);
  const [commentText, setCommentText] = useState('');

  // Signature related state
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signatureTarget, setSignatureTarget] = useState<GiftEntry | null>(null);
  const [signerName, setSignerName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const districts = [...new Set(gifts.map(g => g.district))].filter(Boolean).sort();

  const filtered = gifts.filter(g => {
    const matchesSearch = !search || JSON.stringify(g).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || g.status === statusFilter;
    const matchesDistrict = !districtFilter || g.district === districtFilter;
    return matchesSearch && matchesStatus && matchesDistrict;
  }).sort((a, b) => {
    if (sortBy === 'date') return b.date.localeCompare(a.date);
    if (sortBy === 'name') return a.recName.localeCompare(b.recName);
    if (sortBy === 'type') return a.giftType.localeCompare(b.giftType);
    return 0;
  });

  const exportToCSV = () => {
    setIsExporting(true);
    showToast('מייצא נתונים לקובץ CSV...', 'info');
    
    setTimeout(() => {
      try {
        const headers = ["ID", "Date", "Recipient", "Drive #", "Gift", "District", "Branch", "Status", "Comments"];
        const rows = filtered.map(g => [
          g.displayID, g.date, g.recName, g.recDriveNum, g.giftType, g.district, g.branch, g.status, g.comments.replace(/\n/g, ' ')
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
          + "\uFEFF" // Add BOM for Hebrew support in Excel
          + headers.join(",") + "\n" 
          + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Halacha_Gifts_${new Date().toLocaleDateString('he-IL')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('הקובץ הורד בהצלחה', 'success');
      } catch (err) {
        showToast('שגיאה בייצוא הקובץ', 'error');
      } finally {
        setIsExporting(false);
      }
    }, 1000);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ממתין': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'בדרך': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'נמסר': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'בוטל': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const handleStatusChange = (id: string, newStatus: GiftEntry['status']) => {
    if (newStatus === 'נמסר') {
      const gift = gifts.find(g => g.id === id);
      if (gift) {
        setSignatureTarget(gift);
        setSignerName(gift.recName);
        setIsSignatureModalOpen(true);
      }
    } else {
      onUpdateStatus(id, newStatus);
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !signatureTarget) return;
    const sigData = canvas.toDataURL();
    onUpdateStatus(signatureTarget.id, 'נמסר', {
      signature: sigData,
      signedBy: signerName,
      deliveredAt: new Date().toLocaleString('he-IL')
    });
    setIsSignatureModalOpen(false);
    showToast('המסירה אושרה בחתימה דיגיטלית', 'success');
  };

  const openEditModal = (gift: GiftEntry) => {
    setEditingGift(gift);
    setEditFormData(gift);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGift) {
      onUpdateGift(editingGift.id, editFormData);
      setIsEditModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Dynamic Header */}
      <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative flex-1 group">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={22} />
            <input 
              type="text"
              className="w-full pr-16 pl-8 py-5 rounded-[28px] border border-slate-200 focus:border-indigo-500 focus:ring-8 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-700 bg-slate-50/30"
              placeholder="חפש לפי שם, כונן, מחוז או הערה..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={exportToCSV}
            disabled={isExporting}
            className="bg-slate-900 text-white px-10 py-5 rounded-[28px] font-black italic flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-2xl disabled:opacity-50 active:scale-95"
          >
            {isExporting ? <Loader2 size={22} className="animate-spin" /> : <Download size={22} />}
            <span>CSV EXPORT</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative group">
            <select className="w-full appearance-none px-6 py-4 rounded-2xl border border-slate-200 bg-white font-black text-xs text-slate-600 outline-none focus:ring-4 focus:ring-indigo-50 transition-all uppercase tracking-widest cursor-pointer" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">כל הסטטוסים</option>
              <option value="ממתין">⏳ ממתין</option>
              <option value="בדרך">🚚 בדרך</option>
              <option value="נמסר">✅ נמסר</option>
              <option value="בוטל">🚫 בוטל</option>
            </select>
            <ChevronDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500" />
          </div>
          <div className="relative group">
            <select className="w-full appearance-none px-6 py-4 rounded-2xl border border-slate-200 bg-white font-black text-xs text-slate-600 outline-none focus:ring-4 focus:ring-indigo-50 transition-all uppercase tracking-widest cursor-pointer" value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}>
              <option value="">כל המחוזות</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative group">
            <select className="w-full appearance-none px-6 py-4 rounded-2xl border border-slate-200 bg-white font-black text-xs text-slate-600 outline-none focus:ring-4 focus:ring-indigo-50 transition-all uppercase tracking-widest cursor-pointer" value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
              <option value="date">📅 לפי תאריך</option>
              <option value="name">👤 לפי שם</option>
              <option value="type">🎁 לפי מתנה</option>
            </select>
            <ChevronDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <button onClick={() => { setSearch(''); setStatusFilter(''); setDistrictFilter(''); }} className="py-4 rounded-2xl border border-rose-100 text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-50 transition-all">Reset Filters</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-[48px] border border-slate-100 p-24 text-center space-y-6">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
            <Search size={40} className="text-slate-200" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800">לא נמצאו רשומות</h3>
            <p className="text-slate-400 font-medium mt-1">נסה לשנות את מילות החיפוש או לאפס את המסננים</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map(gift => (
            <div key={gift.id} className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-50/50 transition-all relative group flex flex-col h-full transform hover:scale-[1.02] duration-300">
              
              <div className="absolute left-8 top-8 flex gap-2 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                <button onClick={() => setCommentTarget(gift)} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm" title="הערה"><MessageSquare size={16} /></button>
                {currentUser.type === 'ארצי' && (
                  <>
                    <button onClick={() => onOpenHistory(gift.id, gift.recName)} className="p-2.5 bg-violet-50 text-violet-600 rounded-xl hover:bg-violet-600 hover:text-white transition-all shadow-sm" title="היסטוריה"><History size={16} /></button>
                    <button onClick={() => openEditModal(gift)} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm" title="עריכה"><Edit size={16} /></button>
                    <button onClick={() => onDeleteGift(gift.id)} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm" title="מחיקה"><Trash2 size={16} /></button>
                  </>
                )}
              </div>
              
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black italic shadow-lg">
                    {gift.recName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-800 leading-tight pr-10">{gift.recName}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                      <UserIcon size={12} className="text-indigo-400" />
                      כונן: {gift.recDriveNum || 'לא צוין'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[9px] font-black bg-indigo-600 text-white px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md shadow-indigo-100">{gift.giftType}</span>
                  <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full uppercase tracking-widest">{gift.branch}</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-6 border-y border-slate-50 mb-6 bg-slate-50/30 -mx-8 px-8">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">סטטוס נוכחי</span>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest inline-block ${getStatusStyle(gift.status)}`}>
                    {gift.status}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                   {gift.signature && (
                      <div className="text-emerald-500 flex flex-col items-center group/sig cursor-pointer relative">
                         <PenTool size={16} />
                         <span className="text-[8px] font-black uppercase mt-0.5">SIGNED</span>
                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 group-hover/sig:opacity-100 transition-opacity w-32">
                            <img src={gift.signature} alt="signature" className="w-full h-auto" />
                            <p className="text-[8px] font-bold text-center mt-1 text-slate-400">{gift.signedBy}</p>
                         </div>
                      </div>
                   )}
                </div>
              </div>

              <div className="space-y-4 mb-8 flex-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">תאריך חלוקה</span>
                  <span className="text-slate-800 font-black italic">{gift.date}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">רכז מבצע</span>
                  <div className="text-right">
                    <span className="text-slate-800 font-bold block">{gift.coordinatorName}</span>
                    <span className="text-[9px] text-slate-400 block font-bold uppercase">Drive #{gift.driveNum}</span>
                  </div>
                </div>

                {gift.comments && (
                  <div className="mt-6 p-5 bg-indigo-50/30 rounded-[28px] text-[11px] text-slate-600 border border-indigo-50/50 whitespace-pre-wrap leading-relaxed italic relative">
                    <MessageSquare size={14} className="absolute -top-2.5 right-4 text-indigo-200 fill-indigo-50" />
                    "{gift.comments}"
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-auto pt-6 border-t border-slate-50">
                {['ממתין', 'בדרך', 'נמסר'].map(s => (
                  <button 
                    key={s} 
                    onClick={() => handleStatusChange(gift.id, s as any)} 
                    className={`flex-1 py-3 text-[10px] font-black rounded-2xl transition-all border-2 ${
                      gift.status === s 
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
      )}

      {/* Signature Modal */}
      {isSignatureModalOpen && signatureTarget && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md rounded-[56px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black italic">DELIVERY SIGN-OFF</h3>
                    <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">אישור מסירת תמריץ בחתימה דיגיטלית</p>
                 </div>
                 <button onClick={() => setIsSignatureModalOpen(false)} className="hover:bg-white/20 p-2.5 rounded-full transition-colors"><X size={24} /></button>
              </div>
              <div className="p-10 space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">שם החותם (המקבל)</label>
                    <input 
                      type="text" 
                      className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 font-bold" 
                      value={signerName} 
                      onChange={e => setSignerName(e.target.value)} 
                    />
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center mr-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">חתימה על המסך</label>
                       <button onClick={clearCanvas} className="text-[9px] font-black text-indigo-500 hover:underline">נקה הכל</button>
                    </div>
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] p-2">
                       <canvas 
                         ref={canvasRef}
                         width={320}
                         height={180}
                         className="w-full bg-white rounded-[24px] cursor-crosshair touch-none"
                         onMouseDown={startDrawing}
                         onMouseMove={draw}
                         onMouseUp={stopDrawing}
                         onMouseLeave={stopDrawing}
                         onTouchStart={startDrawing}
                         onTouchMove={draw}
                         onTouchEnd={stopDrawing}
                       />
                    </div>
                 </div>
                 <button 
                   onClick={saveSignature}
                   className="w-full bg-slate-900 text-white font-black py-6 rounded-[32px] shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 group active:scale-95"
                 >
                    <CheckCircle size={22} className="group-hover:scale-125 transition-transform" />
                    <span>CONFIRM DELIVERY</span>
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Edit Modal mirroring GAS updateRowByID */}
      {isEditModalOpen && editingGift && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black italic">UPDATE RECORD</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">עריכת רשומה מנהלית - {editingGift.recName}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="hover:bg-white/20 p-2.5 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-10 space-y-8 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">שם מקבל</label>
                  <input type="text" className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 font-bold bg-slate-50/50" value={editFormData.recName || ''} onChange={e => setEditFormData({...editFormData, recName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">מספר כונן מקבל</label>
                  <input type="text" className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 font-bold" value={editFormData.recDriveNum || ''} onChange={e => setEditFormData({...editFormData, recDriveNum: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">שיטת משלוח</label>
                  <select className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 font-bold" value={editFormData.deliveryMethod} onChange={e => setEditFormData({...editFormData, deliveryMethod: e.target.value})}>
                    <option value="איסוף עצמי">איסוף עצמי</option>
                    <option value="שליח">שליח</option>
                    <option value="דואר ישראל">דואר ישראל</option>
                    <option value="רכז סניפי">רכז סניפי</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">סטטוס</label>
                  <select className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 font-black text-indigo-600" value={editFormData.status} onChange={e => setEditFormData({...editFormData, status: e.target.value as any})}>
                    <option value="ממתין">ממתין</option>
                    <option value="בדרך">בדרך</option>
                    <option value="נמסר">נמסר</option>
                    <option value="בוטל">בוטל</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">הערות מעודכנות</label>
                <textarea className="w-full px-6 py-5 rounded-[32px] border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50/50" rows={4} value={editFormData.comments || ''} onChange={e => setEditFormData({...editFormData, comments: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-5 rounded-2xl font-black text-slate-400 uppercase tracking-widest bg-slate-50 hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" className="flex-[2] bg-slate-900 text-white font-black py-5 rounded-2xl shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95">
                  <Save size={22} />
                  <span>COMMIT CHANGES</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {commentTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[48px] shadow-2xl overflow-hidden animate-in fade-in zoom-in">
            <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
              <h3 className="text-2xl font-black">הוספת הערה</h3>
              <button onClick={() => setCommentTarget(null)} className="hover:bg-white/20 p-2.5 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              onAddComment(commentTarget.id, commentText);
              setCommentText('');
              setCommentTarget(null);
            }} className="p-8 space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">עבור: {commentTarget.recName}</p>
                <textarea required autoFocus className="w-full px-6 py-5 rounded-[32px] border border-slate-200 focus:border-indigo-500 outline-none transition-all text-sm leading-relaxed" rows={5} placeholder="כתוב כאן הערה..." value={commentText} onChange={e => setCommentText(e.target.value)} />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-[24px] shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                <Save size={20} />
                שמור הערה
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftList;
