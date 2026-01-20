
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { useToast } from '../context/ToastContext';
import { ShieldAlert, Lock, User as UserIcon, Loader2, RefreshCw } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPass, setForgotPass] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  const MAX_ATTEMPTS = 4;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) return;
    
    setIsLoading(true);

    // Mock login logic mirroring GAS security logic
    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      
      // Simulate successful admin login
      if (cleanEmail === 'admin@hatzalah.org.il' && password === 'admin123') {
        onLogin({
          email: cleanEmail,
          name: 'מנהל מערכת',
          district: 'ארצי',
          branch: 'מטה',
          type: 'ארצי',
          password,
          status: 'פעיל'
        });
        return;
      } 
      
      // Simulate successful coordinator login
      if (cleanEmail === 'coord@hatzalah.org.il' && password === '123456') {
        onLogin({
          email: cleanEmail,
          name: 'ישראל ישראלי',
          district: 'ירושלים',
          branch: 'מרכז העיר',
          type: 'סניפי',
          password,
          status: 'פעיל'
        });
        return;
      }

      // Handle failure
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setIsLoading(false);

      if (nextAttempts >= MAX_ATTEMPTS) {
        setIsBlocked(true);
        showToast(`❌ החשבון נחסם עקב ${MAX_ATTEMPTS} ניסיונות כושלים.`, 'error');
      } else {
        showToast(`פרטי התחברות שגויים. נותרו עוד ${MAX_ATTEMPTS - nextAttempts} ניסיונות.`, 'error');
      }
    }, 1200);
  };

  const handleForgotPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('נא להזין כתובת אימייל', 'error');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      showToast('בקשת איפוס סיסמה נרשמה במערכת ותטופל עליה ידי המנהל', 'info');
      setForgotPass(false);
      setIsLoading(false);
    }, 1200);
  };

  if (isBlocked) {
    return (
      <div className="animated-bg min-h-screen flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-[56px] shadow-2xl w-full max-w-lg text-center space-y-8 animate-in zoom-in duration-500">
          <div className="bg-rose-100 text-rose-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-rose-100">
            <ShieldAlert size={48} />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-slate-800">הגישה נחסמה</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              עקב מספר ניסיונות התחברות כושלים, המערכת חסמה זמנית את הגישה מחשבון זה מטעמי אבטחה.
            </p>
          </div>
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">כיצד לשחרר את החסימה?</p>
            <p className="text-sm font-bold text-slate-700">פנה למנהל הארצי במטה האגף לצורך אימות זהות ואיפוס הרשאות.</p>
          </div>
          <button onClick={() => { setIsBlocked(false); setAttempts(0); }} className="text-indigo-600 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:underline">
            <RefreshCw size={14} />
            ניסיון התחברות חוזר
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animated-bg min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-xl p-8 md:p-12 rounded-[48px] shadow-2xl w-full max-w-md border border-white/50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -left-20 -top-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
        
        <div className="flex flex-col items-center mb-10 relative z-10">
          <div className="bg-slate-900 text-white p-4 rounded-[28px] shadow-2xl shadow-indigo-200 text-4xl mb-6 transform hover:rotate-6 transition-transform">
            🎁
          </div>
          <h1 className="text-3xl font-black text-slate-900 text-center tracking-tighter">איחוד הצלה</h1>
          <h2 className="text-lg font-bold text-indigo-600 mt-1 uppercase tracking-widest italic">Halacha Portal</h2>
          <div className="h-1 w-12 bg-indigo-500 rounded-full mt-4" />
        </div>

        {!forgotPass ? (
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">מזהה משתמש (אימייל)</label>
              <div className="relative">
                <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hatzalah.org.il"
                  className="w-full pr-12 pl-5 py-4 rounded-[24px] border border-slate-200 focus:border-indigo-500 focus:ring-8 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-700 bg-white/50"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1.5 mr-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">מפתח גישה (סיסמה)</label>
                <button type="button" onClick={() => setForgotPass(true)} className="text-[10px] text-indigo-500 font-black uppercase tracking-tighter hover:underline">שכחתי?</button>
              </div>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-12 pl-5 py-4 rounded-[24px] border border-slate-200 focus:border-indigo-500 focus:ring-8 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-700 bg-white/50"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white font-black py-5 rounded-[24px] shadow-2xl hover:bg-indigo-600 transition-all disabled:opacity-50 mt-6 active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'SECURE LOGIN'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPass} className="space-y-6 animate-in slide-in-from-right-10 duration-300 relative z-10">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-800">שחזור מפתח גישה</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed px-4">בקשת האיפוס תירשם ביומן הביקורת ותישלח לבדיקת הנהלה.</p>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">אימייל לשחזור</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@hatzalah.org.il"
                className="w-full px-5 py-4 rounded-[24px] border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white font-black py-5 rounded-[24px] transition-all shadow-xl shadow-indigo-100 flex items-center justify-center"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'שלח בקשת איפוס'}
            </button>
            <button 
              type="button" 
              onClick={() => setForgotPass(false)}
              className="w-full text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              חזרה להתחברות
            </button>
          </form>
        )}

        <div className="mt-12 text-center border-t border-slate-50 pt-8">
          <p className="text-slate-300 text-[9px] font-black uppercase tracking-[0.4em]">Encrypted Connection</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
