
import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  LayoutDashboard, 
  Database, 
  Package, 
  Users, 
  History, 
  Gift as GiftIcon, 
  User as UserIcon,
  LogOut,
  Plus,
  Target,
  Sparkles,
  BarChart2,
  ShieldAlert,
  Calendar as CalendarIcon,
  Cloud,
  CloudOff,
  RefreshCw
} from 'lucide-react';
import { User, GiftEntry, InventoryItem, IncentiveRequest, AuditLog, Goal } from './types';
import { ToastProvider, useToast } from './context/ToastContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GiftForm from './components/GiftForm';
import GiftList from './components/GiftList';
import Inventory from './components/Inventory';
import Coordinators from './components/Coordinators';
import AuditLogView from './components/AuditLog';
import IncentiveRequests from './components/IncentiveRequests';
import Goals from './components/Goals';
import AIAssistant from './components/AIAssistant';
import Profile from './components/Profile';
import Reports from './components/Reports';
import SecurityDashboard from './components/SecurityDashboard';
import CalendarView from './components/CalendarView';
import HistoryModal from './components/HistoryModal';
import { MOCK_GIFTS, MOCK_INVENTORY, MOCK_INCENTIVES, MOCK_AUDIT_LOGS, MOCK_GOALS } from './services/mockData';
import { api } from './services/api';

const AppContent: React.FC = () => {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Main Data States
  const [gifts, setGifts] = useState<GiftEntry[]>(MOCK_GIFTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [incentives, setIncentives] = useState<IncentiveRequest[]>(MOCK_INCENTIVES);
  const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  
  // Modal States
  const [historyItem, setHistoryItem] = useState<{ id: string; name: string } | null>(null);
  const [coordinators, setCoordinators] = useState<User[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem('authUser');
    if (stored) {
      const user = JSON.parse(stored);
      setCurrentUser(user);
      fetchCloudData(user.email);
    }
  }, []);

  const fetchCloudData = async (email: string) => {
    setIsSyncing(true);
    try {
      // Parallel fetching from GAS backend
      const [giftsRes, inventoryRes, goalsRes, coordsRes] = await Promise.all([
        api.getData(email),
        api.getInventory(email),
        api.getGoals(email),
        api.getCoordinators(email)
      ]);

      if (giftsRes && Array.isArray(giftsRes)) setGifts(giftsRes);
      if (inventoryRes && Array.isArray(inventoryRes)) setInventory(inventoryRes);
      if (goalsRes && Array.isArray(goalsRes)) setGoals(goalsRes);
      if (coordsRes && Array.isArray(coordsRes)) setCoordinators(coordsRes);
      
      showToast('הנתונים סונכרנו מול הענן', 'success');
    } catch (e) {
      console.error("Sync error", e);
      showToast('שגיאה בסנכרון נתונים', 'error');
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  const handleAddGift = async (g: GiftEntry) => {
    if (!currentUser) return;
    setIsSyncing(true);
    const res = await api.processForm(g, currentUser.email);
    setGifts([g, ...gifts]);
    // Local stock decrement mirroring GAS logic
    setInventory(prev => prev.map(item => 
      item.product === g.giftType ? { ...item, stockQuantity: Math.max(0, item.stockQuantity - 1) } : item
    ));
    setIsSyncing(false);
    showToast(`רשומה עבור ${g.recName} נשמרה בשרת`, 'success');
  };

  const handleUpdateStatus = async (id: string, status: GiftEntry['status'], extra?: Partial<GiftEntry>) => {
    if (!currentUser) return;
    setIsSyncing(true);
    await api.updateStatus(id, status, currentUser.email);
    setGifts(gifts.map(g => g.id === id ? { ...g, status, ...extra } : g));
    setIsSyncing(false);
    showToast('סטטוס עודכן בשרת', 'success');
  };

  const handleUpdateGoal = async (id: string, updatedData: Partial<Goal>) => {
    if (!currentUser) return;
    setIsSyncing(true);
    // If status changed, call specific GAS function
    if (updatedData.status) {
      await api.updateGoalStatus(id, updatedData.status, updatedData.comments || '', currentUser.email);
    }
    setGoals(goals.map(g => g.id === id ? { ...g, ...updatedData } : g));
    setIsSyncing(false);
    showToast('היעד עודכן', 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('authUser');
    setActiveTab('dashboard');
    showToast('התנתקת מהמערכת', 'info');
  };

  if (!currentUser) return <Login onLogin={(user) => { setCurrentUser(user); sessionStorage.setItem('authUser', JSON.stringify(user)); fetchCloudData(user.email); }} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard gifts={gifts} inventory={inventory} incentives={incentives} goals={goals} auditLogs={auditLogs} onQuickAction={setActiveTab} />;
      case 'new-entry': return <GiftForm onAdd={handleAddGift} inventory={inventory} />;
      case 'view-data': return <GiftList gifts={gifts} currentUser={currentUser} onUpdateStatus={handleUpdateStatus} onUpdateGift={(id, data) => api.updateRow(id, data, currentUser.email)} onDeleteGift={(id) => api.deleteRow(id, currentUser.email)} onOpenHistory={(id, name) => setHistoryItem({ id, name })} onAddComment={(id, text) => api.updateRow(id, { comments: text }, currentUser.email)} />;
      case 'calendar': return <CalendarView goals={goals} onAddGoal={() => setActiveTab('goals')} />;
      case 'inventory': return <Inventory inventory={inventory} onAdd={item => api.addGiftItem(item, currentUser.email)} onUpdate={updated => api.updateGiftItem(updated.rowIndex || 0, updated, currentUser.email)} onOpenHistory={(id, name) => setHistoryItem({ id, name })} onRestock={(id, amount) => { 
        const item = inventory.find(i => i.id === id);
        if (item) api.addStock(item.rowIndex || 0, amount, item.product, currentUser.email);
      }} onDelete={id => {}} />;
      case 'goals': return <Goals goals={goals} currentUser={currentUser} coordinators={coordinators} onAdd={g => api.addGoal(g, currentUser.email)} onUpdate={handleUpdateGoal} onDelete={id => {}} onOpenHistory={(id, name) => setHistoryItem({ id, name })} onAddComment={(id, text) => handleUpdateGoal(id, { comments: text })} />;
      case 'ai-assistant': return <AIAssistant gifts={gifts} goals={goals} inventory={inventory} />;
      case 'coordinators': return <Coordinators currentUser={currentUser} coordinators={coordinators} onAdd={c => api.addCoordinator(c, currentUser.email)} onUpdate={c => api.updateCoordinator(c.rowIndex || 0, c, currentUser.email)} onDelete={email => {}} />;
      case 'audit': return <AuditLogView logs={auditLogs} />;
      case 'incentives': return <IncentiveRequests requests={incentives} currentUser={currentUser} onAction={(id, status, notes) => {}} onAdd={req => api.addIncentive(req, currentUser.email)} />;
      case 'reports': return <Reports gifts={gifts} inventory={inventory} />;
      case 'profile': return <Profile user={currentUser} auditLogs={auditLogs} onUpdate={u => setCurrentUser(u)} />;
      case 'security': return <SecurityDashboard coordinators={coordinators} auditLogs={auditLogs} onUpdateUser={u => {}} />;
      default: return <Dashboard gifts={gifts} inventory={inventory} auditLogs={auditLogs} onQuickAction={setActiveTab} />;
    }
  };

  const visibleTabs = [
    { id: 'dashboard', label: 'דשבורד', icon: LayoutDashboard, roles: ['ארצי', 'מחוזי', 'סניפי'], mobile: true },
    { id: 'new-entry', label: 'הזנה', icon: Plus, roles: ['ארצי'], mobile: true },
    { id: 'view-data', label: 'צפייה', icon: Database, roles: ['ארצי', 'מחוזי', 'סניפי'], mobile: true },
    { id: 'calendar', label: 'לו"ז', icon: CalendarIcon, roles: ['ארצי', 'מחוזי', 'סניפי'], mobile: true },
    { id: 'inventory', label: 'מלאי', icon: Package, roles: ['ארצי'] },
    { id: 'goals', label: 'משימות', icon: Target, roles: ['ארצי', 'מחוזי', 'סניפי'], badge: goals.filter(g => g.status !== 'בוצע').length },
    { id: 'ai-assistant', label: 'AI Helper', icon: Sparkles, roles: ['ארצי', 'מחוזי', 'סניפי'] },
    { id: 'reports', label: 'דוחות', icon: BarChart2, roles: ['ארצי'] },
    { id: 'coordinators', label: 'צוות', icon: Users, roles: ['ארצי'] },
    { id: 'security', label: 'אבטחה', icon: ShieldAlert, roles: ['ארצי'] },
    { id: 'profile', label: 'פרופיל', icon: UserIcon, roles: ['ארצי', 'מחוזי', 'סניפי'], mobile: true },
  ].filter(tab => tab.roles.includes(currentUser.type));

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      {historyItem && <HistoryModal itemId={historyItem.id} itemName={historyItem.name} logs={auditLogs} onClose={() => setHistoryItem(null)} />}
      
      <aside className="hidden md:flex flex-col w-72 bg-white border-l border-slate-200 shadow-sm sticky top-0 h-screen shrink-0 z-50">
        <div className="p-8 flex items-center gap-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="bg-indigo-500 p-2.5 rounded-xl shadow-lg rotate-3"><Gift size={26} /></div>
          <div className="flex flex-col">
            <span className="font-black text-xl italic tracking-tighter leading-none">HALACHA</span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Control Panel</span>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {visibleTabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === tab.id ? 'bg-indigo-600 text-white font-black shadow-xl shadow-indigo-100 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold'}`}>
              <div className="flex items-center gap-4"><tab.icon size={22} /><span className="text-sm uppercase tracking-wider">{tab.label}</span></div>
              {tab.badge ? <span className={`text-[10px] px-2 py-0.5 rounded-full min-w-[20px] text-center font-black ${activeTab === tab.id ? 'bg-white text-indigo-600' : 'bg-rose-500 text-white animate-pulse'}`}>{tab.badge}</span> : null}
            </button>
          ))}
        </nav>
        
        <div className="p-6 space-y-6">
          <button onClick={() => fetchCloudData(currentUser.email)} className="w-full bg-slate-50 hover:bg-white p-5 rounded-3xl border border-slate-100 space-y-4 group transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cloud Health</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className={`text-[9px] font-black uppercase ${isSyncing ? 'text-amber-600' : 'text-emerald-600'}`}>
                   {isSyncing ? 'Syncing...' : 'Active'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
               {isSyncing ? <RefreshCw size={14} className="text-amber-500 animate-spin" /> : <Cloud size={14} className="text-indigo-600" />}
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-indigo-600">Manual Refresh</span>
            </div>
          </button>

           <div className="bg-slate-900 rounded-3xl p-5 text-white relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/5 rounded-full group-hover:scale-150 transition-transform" />
            <div className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">OPERATOR</div>
            <div className="font-black text-sm truncate italic">{currentUser.name}</div>
            <div className="flex items-center justify-between mt-3">
              <div className="text-[9px] bg-indigo-500 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">{currentUser.type}</div>
              <button onClick={handleLogout} className="text-rose-500 hover:text-rose-400 transition-colors"><LogOut size={16} /></button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen">
        <div className="p-6 md:p-12 max-w-[1400px] mx-auto w-full text-right">{renderContent()}</div>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <ToastProvider>
    <AppContent />
  </ToastProvider>
);

export default App;
