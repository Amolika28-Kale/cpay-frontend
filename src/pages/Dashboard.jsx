import React from "react";
import { 
  Wallet, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Scan, 
  Gift, 
  History, 
  TrendingUp,
  LayoutDashboard,
  MessageSquare,
  UserCircle
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 lg:pb-0 lg:pl-64">
      
      {/* ================= SIDEBAR (DESKTOP) / BOTTOM NAV (MOBILE) ================= */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 lg:top-0 lg:left-0 lg:w-64 lg:h-full lg:border-t-0 lg:border-r z-50 p-4">
        <div className="hidden lg:flex items-center gap-2 mb-10 px-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Scan size={20} />
          </div>
          <span className="text-xl font-black tracking-tighter">CPAY</span>
        </div>
        
        <div className="flex lg:flex-col justify-around lg:justify-start gap-2">
          <NavItem icon={<LayoutDashboard />} label="Home" active />
          <NavItem icon={<Scan />} label="Scanner" />
          <NavItem icon={<History />} label="Activity" />
          <NavItem icon={<Gift />} label="Rewards" />
          <NavItem icon={<UserCircle />} label="Profile" />
        </div>
      </nav>

      {/* ================= HEADER ================= */}
      <header className="bg-white border-b border-slate-200 p-6 flex justify-between items-center sticky top-0 z-40">
        <div>
          <h1 className="text-xl font-black text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Welcome back, User</p>
        </div>
        <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
          <TrendingUp size={16} />
          $1.00 = ₹83.45
        </div>
      </header>

      <main className="p-6 max-w-5xl mx-auto space-y-8">
        
        {/* ================= BALANCE CARDS ================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Wallet */}
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 bg-white/10 w-40 h-40 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
            <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest mb-2">Total Balance</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-black">₹45,280.00</h2>
              <span className="text-indigo-200 font-medium">542.10 USDT</span>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button className="flex-1 bg-white text-indigo-600 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-50">
                <PlusCircle size={18} /> Deposit
              </button>
              <button className="flex-1 bg-indigo-500/50 text-white py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-500">
                <ArrowUpRight size={18} /> Send
              </button>
            </div>
          </div>

          {/* Reward Wallet */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200 relative overflow-hidden">
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Cashback Rewards</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-black text-indigo-400">₹1,240.50</h2>
              <span className="text-slate-500 font-medium">Earned</span>
            </div>
            <div className="mt-8 flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="bg-indigo-500/20 p-2 rounded-lg"><Gift className="text-indigo-400" /></div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                You've earned <span className="text-white font-bold">5% cashback</span> on 12 transactions this month.
              </p>
            </div>
          </div>
        </section>

        {/* ================= ACTIVE SCANNER FEED ================= */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black flex items-center gap-2">
              <MessageSquare size={20} className="text-indigo-600" /> 
              Active Scanners
            </h3>
            <span className="text-xs font-black text-green-500 bg-green-50 px-3 py-1 rounded-full animate-pulse uppercase">Live Feed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ScannerCard amount="5,000" user="Merchant_Ind" time="2m ago" />
            <ScannerCard amount="1,200" user="Travel_Pay" time="Just now" />
          </div>
        </section>

        {/* ================= RECENT ACTIVITY ================= */}
        <section>
          <h3 className="text-lg font-black mb-6">Recent Activity</h3>
          <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden">
            <TransactionItem 
              type="payment" 
              title="Scanner Payment #882" 
              date="10 Feb, 01:45 AM" 
              amount="-₹5,000.00" 
              status="Success" 
            />
            <TransactionItem 
              type="cashback" 
              title="Cashback Reward" 
              date="10 Feb, 01:45 AM" 
              amount="+₹250.00" 
              status="Received" 
            />
            <TransactionItem 
              type="deposit" 
              title="USDT Deposit (TRC20)" 
              date="09 Feb, 11:20 PM" 
              amount="+100.00 USDT" 
              status="Success" 
            />
          </div>
        </section>

      </main>
    </div>
  );
}

/* ================= MINI COMPONENTS ================= */

const NavItem = ({ icon, label, active = false }) => (
  <button className={`flex flex-col lg:flex-row items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
    active ? "text-indigo-600 bg-indigo-50 font-black" : "text-slate-400 hover:text-slate-600 font-bold"
  }`}>
    {icon}
    <span className="text-[10px] lg:text-sm uppercase lg:capitalize tracking-widest lg:tracking-normal">{label}</span>
  </button>
);

const ScannerCard = ({ amount, user, time }) => (
  <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
          <UserCircle size={24} />
        </div>
        <div>
          <p className="text-sm font-black">{user}</p>
          <p className="text-[10px] text-slate-400 font-bold">{time}</p>
        </div>
      </div>
      <div className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-1 rounded">PENDING</div>
    </div>
    <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center border border-dashed border-slate-200 mb-4">
      <Scan className="text-slate-200 mb-2" size={40} />
      <p className="text-2xl font-black text-slate-900">₹{amount}</p>
    </div>
    <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
      PAY NOW
    </button>
  </div>
);

const TransactionItem = ({ type, title, date, amount, status }) => {
  const isNegative = amount.startsWith("-");
  return (
    <div className="flex items-center justify-between p-5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
          type === 'cashback' ? 'bg-green-100 text-green-600' : 
          type === 'deposit' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
        }`}>
          {type === 'payment' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
        </div>
        <div>
          <p className="text-sm font-black text-slate-900">{title}</p>
          <p className="text-xs text-slate-400 font-medium">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-black ${isNegative ? 'text-slate-900' : 'text-green-600'}`}>
          {amount}
        </p>
        <p className="text-[10px] font-black uppercase text-slate-300 tracking-tighter">{status}</p>
      </div>
    </div>
  );
};