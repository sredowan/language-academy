import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PremiumBanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const student = user?.Student;
  const isPremium = student?.plan_type === 'premium';
  
  if (isPremium) {
    const expiryDate = new Date(student.premium_expiry_date);
    const now = new Date();
    const diffTime = Math.abs(expiryDate - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return (
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-4 py-2 rounded-lg mb-6 flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-full">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">Premium Active</p>
            <p className="text-[11px] opacity-90 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {diffDays} days remaining
            </p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/subscription')}
          className="text-[11px] bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-all font-semibold"
        >
          Manage Plan
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-4 py-3 rounded-xl mb-6 flex items-center justify-between shadow-xl ring-1 ring-white/10">
      <div className="flex items-center gap-4">
        <div className="bg-yellow-400 p-2 rounded-lg shadow-inner">
          <Zap className="w-5 h-5 text-indigo-900 fill-indigo-900" />
        </div>
        <div>
          <h4 className="text-sm font-bold">Upgrade to Premium</h4>
          <p className="text-xs opacity-90">Unlock full AI scoring, mock tests & prediction bank.</p>
        </div>
      </div>
      <button 
        onClick={() => navigate('/subscription')}
        className="bg-white text-indigo-600 px-5 py-2 rounded-lg font-bold text-xs shadow-sm hover:scale-105 transition-transform active:scale-95"
      >
        Buy Now - 2500 BDT
      </button>
    </div>
  );
};

export default PremiumBanner;
