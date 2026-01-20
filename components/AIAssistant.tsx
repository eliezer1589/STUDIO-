
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Send, Bot, User, Loader2, ExternalLink, Globe, Target, Package, Truck } from 'lucide-react';
import { GiftEntry, Goal, InventoryItem } from '../types';

interface Props {
  gifts: GiftEntry[];
  goals: Goal[];
  inventory: InventoryItem[];
}

interface Message {
  role: 'user' | 'ai';
  content: string;
  sources?: { title: string; uri: string }[];
}

const AIAssistant: React.FC<Props> = ({ gifts, goals, inventory }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'שלום! אני העוזר המודיעיני של אגף הלכה. אני יכול לנתח עבורך את מצב המלאי, לבדוק את התקדמות המשימות בשטח או לחפש עבורך מידע הלכתי ורפואי עדכני בגוגל. במה אוכל לסייע?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const lowStockItems = inventory.filter(i => i.stockQuantity <= 5);
      const openTasks = goals.filter(g => g.status !== 'בוצע');
      const recentGiftsCount = gifts.filter(g => g.status === 'נמסר').length;

      const systemPrompt = `
        You are "Halacha-Bot", the elite intelligence assistant for the Halacha Department of Ichud Hatzalah Israel.
        Your goal is to assist commanders and coordinators in managing regional logistics and strategic tasks.
        
        CURRENT DEPARTMENT STATS:
        - Total successful distributions: ${recentGiftsCount}
        - Low stock items: ${lowStockItems.map(i => i.product).join(', ') || 'None'}
        - Active operational goals: ${openTasks.length}
        - Regional breakdown: ${[...new Set(gifts.map(g => g.district))].join(', ')}
        
        RULES:
        1. Respond in Hebrew only.
        2. Use a professional, authoritative yet helpful tone (Military/Logistics style).
        3. For internal data queries (e.g. "מה חסר במלאי?"), use the provided stats.
        4. For external knowledge (e.g. "מה פסק ההלכה לגבי נסיעה בשבת?"), use the Google Search tool.
        5. Be concise.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          ...messages.map(m => ({ 
            role: m.role === 'user' ? 'user' : 'model', 
            parts: [{ text: m.content }] 
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.6,
        }
      });

      const aiText = response.text || "סליחה, חל עיכוב בתקשורת הנתונים. נסה שוב.";
      
      const sources: { title: string; uri: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web) sources.push({ title: chunk.web.title, uri: chunk.web.uri });
        });
      }

      setMessages(prev => [...prev, { role: 'ai', content: aiText, sources: sources.length > 0 ? sources : undefined }]);
    } catch (error) {
      console.error('Gemini Error:', error);
      setMessages(prev => [...prev, { role: 'ai', content: 'שגיאת מערכת Gemini. בדוק חיבור לרשת או תוקף מפתח API.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[75vh] bg-white rounded-[48px] border border-slate-100 shadow-xl overflow-hidden relative">
      <div className="bg-indigo-600 p-8 text-white flex items-center justify-between relative overflow-hidden shrink-0">
        <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black italic tracking-tight leading-none">INTELLIGENCE UNIT</h3>
            <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Agaf Halacha AI Core</p>
          </div>
        </div>
        <div className="hidden md:flex gap-4 relative z-10">
           <div className="bg-white/10 px-4 py-2 rounded-xl text-center border border-white/10">
              <div className="text-[8px] font-black uppercase opacity-60">Tasks</div>
              <div className="text-xs font-black">{goals.filter(g => g.status !== 'בוצע').length}</div>
           </div>
           <div className="bg-white/10 px-4 py-2 rounded-xl text-center border border-white/10">
              <div className="text-[8px] font-black uppercase opacity-60">Alerts</div>
              <div className="text-xs font-black text-amber-300">{inventory.filter(i => i.stockQuantity <= 5).length}</div>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 scroll-smooth custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end animate-in fade-in slide-in-from-bottom-2 duration-400'}`}>
            <div className={`max-w-[85%] flex gap-4 ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
                msg.role === 'user' ? 'bg-white text-slate-400 border-slate-100' : 'bg-slate-900 text-white border-slate-800'
              }`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className="flex flex-col gap-3">
                <div className={`p-6 rounded-[32px] text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.role === 'user' 
                  ? 'bg-white text-slate-700 rounded-tr-none border border-slate-100' 
                  : 'bg-indigo-50 text-indigo-900 rounded-tl-none border border-indigo-100 font-medium'
                }`}>
                  {msg.content}
                </div>
                {msg.sources && (
                  <div className="flex flex-col gap-1.5 px-4">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Globe size={10} /> Grounding Sources
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.slice(0, 3).map((source, sIdx) => (
                        <a key={sIdx} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full text-[9px] font-black text-indigo-600 border border-indigo-50 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                          {source.title.substring(0, 25)}...
                          <ExternalLink size={10} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-end">
            <div className="bg-indigo-100/50 backdrop-blur-sm p-6 rounded-[32px] rounded-tl-none border border-indigo-100 flex items-center gap-3 text-indigo-600 text-xs font-black shadow-sm">
              <Loader2 size={18} className="animate-spin" />
              ANALYZING LOGISTICS DATA...
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-white border-t border-slate-100 shrink-0">
        <div className="relative flex items-center gap-4">
          <div className="flex-1 relative group">
             <input 
              type="text"
              className="w-full pl-16 pr-6 py-5 rounded-[28px] border border-slate-200 focus:border-indigo-500 focus:ring-8 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-700 bg-slate-50/50"
              placeholder="שאל על חוסרים, יעדי שטח או חפש בגוגל..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500">
               <Target size={20} />
            </div>
          </div>
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-indigo-600 text-white p-5 rounded-[24px] hover:bg-indigo-700 transition-all disabled:opacity-30 shadow-2xl shadow-indigo-100 transform active:scale-95 group"
          >
            <Send size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
