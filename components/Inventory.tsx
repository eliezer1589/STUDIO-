import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { Plus, Package, MapPin, Shield, DollarSign, Edit, Trash2, TrendingUp, RefreshCcw, X, Save, History, ArrowUpRight, Calculator } from 'lucide-react';

interface InventoryProps {
  inventory: InventoryItem[];
  onAdd: (item: InventoryItem) => void;
  onUpdate: (item: InventoryItem) => void;
  onOpenHistory: (id: string, name: string) => void;
  onRestock: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ inventory, onAdd, onUpdate, onOpenHistory, onRestock, onDelete }) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [restockAmount, setRestockAmount] = useState(1);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({});

  const filtered = inventory.filter(i => i.product.toLowerCase().includes(search.toLowerCase()));

  // Financial calculations
  const totalInstitutionalValue = inventory.reduce((sum, item) => {
    const price = parseInt(item.priceWithVAT.replace(/[^0-9]/g, '')) || 0;
    return sum + (price * item.stockQuantity);
  }, 0);

  const totalMarketValue = inventory.reduce((sum, item) => {
    const price = parseInt(item.marketPrice.replace(/[^0-9]/g, '')) || 0;
    return sum + (price * item.stockQuantity);
  }, 0);

  const totalAgafSavings = totalMarketValue - totalInstitutionalValue;

  const openModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        itemCondition: 'חדש',
        stockQuantity: 0,
        orderedQuantity: 0,
        itemLocation: 'מחסן ראשי',
        priceWithVAT: '₪0',
        marketPrice: '₪0'
      });
    }
    setIsModalOpen(true);
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem && editingItem.id) {
      onRestock(editingItem.id, restockAmount);
      setIsRestockOpen(false);
      setRestockAmount(1);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      onUpdate({ ...editingItem, ...formData } as InventoryItem);
    } else {
      onAdd({ 
        ...formData, 
        id: 'INV-' + Math.random().toString(36).substr(2, 9).toUpperCase() 
      } as InventoryItem);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Financial BI Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform"><DollarSign size={120} /></div>
          <div className="relative z-10">
            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">TOTAL STOCK SAVINGS</div>
            <div className="text-3xl font-black italic">₪{totalAgafSavings.toLocaleString()}</div>
            <p className="text-[9px] font-bold text-slate-500 mt-2">חיסכון אגפי מצטבר במלאי הקיים</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">MARKET VALUE</div>
          <div className="text-3xl font-black text-slate-800">₪{totalMarketValue.toLocaleString()}</div>
          <div className="mt-2 flex items-center gap-1 text-emerald-500 text-[10px] font-black">
            <ArrowUpRight size={14} /> VALUE ASSET
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ITEMS COUNT</div>
          <div className="text-3xl font-black text-slate-800">{inventory.length}</div>
          <div className="mt-2 text-slate-400 text-[10px] font-black uppercase">Active SKU's</div>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 hover:bg-indigo-700 transition-all rounded-[40px] shadow-xl shadow-indigo-100 flex flex-col items-center justify-center gap-2 text-white transform active:scale-95"
        >
          <Plus size={32} />
          <span className="text-xs font-black uppercase tracking-tighter">New Asset</span>
        </button>
      </div>

      <div className="relative group">
        <input 
          type="text"
          className="w-full px-10 py-6 rounded-[32px] border border-slate-200 outline-none focus:border-indigo-500 focus:ring-8 focus:ring-indigo-50 transition-all font-bold text-slate-700 bg-white"
          /* Fixed double quote in placeholder that was breaking JSX parsing by switching to single quotes for the attribute value */
          placeholder='חפש מוצר, מק"ט או מיקום במחסן...'
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filtered.map((item, idx) => {
          const stockPercentage = Math.min(100, (item.stockQuantity / (item.orderedQuantity || 1)) * 100);
          const institutionalPrice = parseInt(item.priceWithVAT.replace(/[^0-9]/g, '')) || 0;
          const marketPrice = parseInt(item.marketPrice.replace(/[^0-9]/g, '')) || 0;
          const unitSavings = marketPrice - institutionalPrice;

          return (
            <div key={idx} className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm relative group hover:shadow-2xl hover:shadow-indigo-50/30 transition-all duration-500 flex flex-col h-full overflow-hidden">
              
              <div className="absolute left-8 top-10 flex gap-2 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                <button onClick={() => { setEditingItem(item); setIsRestockOpen(true); }} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white shadow-sm transition-all"><RefreshCcw size={18} /></button>
                <button onClick={() => onOpenHistory(item.id || '', item.product)} className="p-3 bg-violet-50 text-violet-600 rounded-2xl hover:bg-violet-600 hover:text-white shadow-sm transition-all"><History size={18} /></button>
                <button onClick={() => openModal(item)} className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-900 hover:text-white shadow-sm transition-all"><Edit size={18} /></button>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-4 mb-2 pr-12">
                   <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black italic">
                      {item.product.charAt(0)}
                   </div>
                   <h4 className="text-xl font-black text-slate-800 truncate">{item.product}</h4>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-12">
                   <MapPin size={12} className="text-indigo-400" /> {item.itemLocation}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                    <div className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">In Stock</div>
                    <div className={`text-3xl font-black italic ${item.stockQuantity <= 5 ? 'text-rose-500 animate-pulse' : 'text-slate-800'}`}>{item.stockQuantity}</div>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                    <div className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Unit Value</div>
                    <div className="text-3xl font-black text-slate-800 italic">{item.marketPrice}</div>
                 </div>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                 <div className="flex justify-between items-center bg-indigo-50/50 px-6 py-3 rounded-2xl border border-indigo-50">
                    <span className="text-[9px] font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2"><Calculator size={12}/> AGAF SAVINGS</span>
                    <span className="text-sm font-black text-indigo-600">₪{unitSavings} / Unit</span>
                 </div>
                 <div className="space-y-2 px-2">
                    <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                       <span>Inventory Health</span>
                       <span>{Math.round(stockPercentage)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className={`h-full transition-all duration-1000 ${stockPercentage <= 20 ? 'bg-rose-500' : 'bg-indigo-600'}`} style={{ width: `${stockPercentage}%` }} />
                    </div>
                 </div>
              </div>

              <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                 <div className="flex items-center gap-2">
                    <Shield size={14} className="text-slate-300" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{item.itemCondition}</span>
                 </div>
                 <span className="text-[10px] font-black text-slate-300 italic">LOGGED: {item.date}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Item Modal mirroring GAS addGiftItem / updateGiftItem */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-900 p-10 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black italic">{editingItem ? 'UPDATE SKU' : 'CREATE NEW SKU'}</h3>
                <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">Inventory Asset Management - Agaf Halacha</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-3 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-10 space-y-8 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">שם המוצר (מדויק) *</label>
                  <input type="text" required className="w-full px-6 py-4.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-bold" value={formData.product || ''} onChange={e => setFormData({...formData, product: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">מיקום לוגיסטי</label>
                  <input type="text" className="w-full px-6 py-4.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none" value={formData.itemLocation || ''} onChange={e => setFormData({...formData, itemLocation: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">מחיר מוסדי (כולל מע"מ)</label>
                  <input type="text" className="w-full px-6 py-4.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-mono" placeholder="₪0" value={formData.priceWithVAT || ''} onChange={e => setFormData({...formData, priceWithVAT: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">מחיר שוק (שווי תמריץ)</label>
                  <input type="text" className="w-full px-6 py-4.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-mono" placeholder="₪0" value={formData.marketPrice || ''} onChange={e => setFormData({...formData, marketPrice: e.target.value})} />
                </div>
                {!editingItem && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">מלאי התחלתי</label>
                      <input type="number" className="w-full px-6 py-4.5 rounded-2xl border border-slate-200 outline-none font-bold text-indigo-600" value={formData.stockQuantity || 0} onChange={e => setFormData({...formData, stockQuantity: parseInt(e.target.value) || 0, orderedQuantity: parseInt(e.target.value) || 0})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">מצב הפריט</label>
                       <select className="w-full px-6 py-4.5 rounded-2xl border border-slate-200 outline-none" value={formData.itemCondition || 'חדש'} onChange={e => setFormData({...formData, itemCondition: e.target.value})}>
                          <option value="חדש">חדש - בקרטון ✨</option>
                          <option value="משומש">במצב טוב 👍</option>
                       </select>
                    </div>
                  </>
                )}
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-black py-6 rounded-[32px] shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95 group">
                <Save size={24} className="group-hover:rotate-12 transition-transform" />
                <span className="text-xl italic uppercase">COMMIT ASSET RECORD</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;