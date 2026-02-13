import React, { useEffect, useState } from "react";
import { 
  LayoutDashboard, Users, CreditCard, RefreshCcw, 
  History, Settings, LogOut, Check, X, ShieldAlert, Menu, Loader2, ArrowRightLeft,
  Zap, Clock, Search
} from "lucide-react";
import { 
  getAllUsers, getAllDeposits, updateDepositStatus, 
  getAllWithdraws, updateWithdrawStatus, updateExchangeRate 
} from "../services/adminService";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [users, setUsers] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdraws, setWithdraws] = useState([]);
  const [exchangeRate, setExchangeRate] = useState("90.00");
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      const [uData, dData, wData] = await Promise.all([
        getAllUsers(),
        getAllDeposits(),
        getAllWithdraws()
      ]);
      setUsers(uData || []);
setDeposits(Array.isArray(dData) ? dData : []);
setWithdraws(Array.isArray(wData) ? wData : []);

    } catch (err) {
      console.error("Data Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (type, id, status) => {
    const action = status === 'approved' ? 'approve' : 'reject';
    let res;
    if (type === 'DEPOSIT') res = await updateDepositStatus(id, action);
    else res = await updateWithdrawStatus(id, action);
    
    if (res) {
      alert(`${type} ${status} successfully`);
      loadData();
    }
  };

  const handleRateUpdate = async () => {
    const res = await updateExchangeRate(exchangeRate);
    if (res) alert("Global Rate Updated!");
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/auth";
  };

  if (loading) return (
    <div className="min-h-screen bg-[#051510] flex flex-col items-center justify-center gap-4 text-[#00F5A0] font-black italic">
      <Loader2 className="animate-spin" size={40} />
      SYNCING CONTROL CENTER...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#051510] text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[150] w-64 bg-[#051510] border-r border-white/5 flex flex-col p-6 transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2 px-2"><Zap className="text-[#00F5A0]" /><span className="text-xl font-black italic tracking-tighter uppercase">CPay Admin</span></div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500"><X /></button>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activeTab === "Dashboard"} onClick={() => {setActiveTab("Dashboard"); setIsSidebarOpen(false);}} />
          <SidebarLink icon={<Users size={18}/>} label="Users" active={activeTab === "Users"} onClick={() => {setActiveTab("Users"); setIsSidebarOpen(false);}} />
          <SidebarLink icon={<CreditCard size={18}/>} label="Deposits" active={activeTab === "Deposits"} badge={deposits.filter(d=>d.status==='pending').length} onClick={() => {setActiveTab("Deposits"); setIsSidebarOpen(false);}} />
          <SidebarLink icon={<ArrowRightLeft size={18}/>} label="Withdraws" active={activeTab === "Withdraws"} badge={withdraws.filter(w=>w.status==='pending').length} onClick={() => {setActiveTab("Withdraws"); setIsSidebarOpen(false);}} />
          
          <div className="pt-10 border-t border-white/5 mt-10">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-black text-sm hover:bg-red-500/10 rounded-xl italic transition-all"><LogOut size={18} /> Logout</button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto min-h-screen">
        <header className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">{activeTab}</h1>
            <div className="md:hidden"><button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/5 rounded-lg"><Menu /></button></div>
        </header>

        {activeTab === "Dashboard" && (
          <div className="space-y-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatBox label="Total Members" val={users.length} sub="Active accounts" />
              <StatBox label="Verify Queue" val={deposits.filter(d=>d.status==='pending').length} sub="Pending Deposits" highlight />
              <StatBox label="Platform USDT" val={users.reduce((a, b) => {
  const usdt = b.wallets?.find(w => w.type === "USDT")?.balance || 0;
  return a + usdt;
}, 0).toFixed(2)} sub="Internal Liquidity" />
              <StatBox label="Withdraw Queue" val={withdraws.filter(w=>w.status==='pending').length} sub="Action Required" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-[#00F5A0] rounded-[2.5rem] p-8 text-[#051510] flex flex-col justify-between min-h-[300px]">
                <div>
                    <p className="text-[10px] font-black uppercase opacity-60 italic mb-2">Exchange Logic</p>
                    <h2 className="text-5xl font-black italic tracking-tighter mb-4">₹{exchangeRate}</h2>
                    <input type="number" value={exchangeRate} onChange={(e)=>setExchangeRate(e.target.value)} className="w-full bg-white/20 border border-black/10 rounded-2xl py-4 px-6 font-black text-2xl focus:outline-none mb-4" />
                </div>
                <button onClick={handleRateUpdate} className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">Apply to Platform</button>
              </div>

              <div className="lg:col-span-2 bg-[#0A1F1A] border border-white/10 rounded-[2.5rem] p-8">
                <h3 className="text-xl font-bold mb-6 italic flex items-center gap-2"><Clock size={20} className="text-[#00F5A0]"/> Recent Requests</h3>
                <div className="space-y-4">
                  {[...deposits, ...withdraws].filter(x => x.status === 'pending').slice(0, 4).map(item => (
                    <div key={item._id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex gap-4 items-center">
                            <div className="w-10 h-10 rounded-full bg-[#00F5A0]/10 flex items-center justify-center text-[#00F5A0] font-black italic text-xs">{item.amount > 0 ? 'D' : 'W'}</div>
                            <div><p className="text-sm font-bold truncate max-w-[150px]">{item.user?.email || item.userId?.email}</p><p className="text-[10px] text-gray-500 font-mono italic">{item.amount} Amt</p></div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleAction(item.txHash ? 'DEPOSIT' : 'WITHDRAW', item._id, 'approved')} className="p-2 bg-green-500 text-[#051510] rounded-lg"><Check size={16}/></button>
                            <button onClick={() => handleAction(item.txHash ? 'DEPOSIT' : 'WITHDRAW', item._id, 'rejected')} className="p-2 bg-red-500 text-white rounded-lg"><X size={16}/></button>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Users" && (
           <div className="bg-[#0A1F1A] border border-white/10 rounded-[2.5rem] overflow-hidden">
             <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between gap-4">
                <h3 className="text-xl font-bold italic">Member Database</h3>
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16}/><input type="text" placeholder="Search by email..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm w-full md:w-64 focus:border-[#00F5A0] outline-none" /></div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase text-gray-600 font-black tracking-widest border-b border-white/5">
                      <th className="px-8 py-4">Name & Email</th>
                      <th className="px-8 py-4">USDT Wallet</th>
                      <th className="px-8 py-4">INR Wallet</th>
                      <th className="px-8 py-4 text-right">Join Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                      <tr key={u._id} className="hover:bg-white/[0.02]">
                        <td className="px-8 py-5"><p className="font-bold text-sm">{u.name}</p><p className="text-[10px] text-gray-500">{u.email}</p></td>
                        <td className="px-8 py-5 font-mono text-blue-400 font-bold italic">{u.wallets?.usdt || 0}</td>
                        <td className="px-8 py-5 font-mono text-[#00F5A0] font-bold italic">₹{u.wallets?.inr || 0}</td>
                        <td className="px-8 py-5 text-right text-xs text-gray-600 font-bold">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           </div>
        )}

        {(activeTab === "Deposits" || activeTab === "Withdraws") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom duration-500">
            {(activeTab === "Deposits" ? deposits : withdraws).map(item => (
              <div key={item._id} className="bg-[#0A1F1A] border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
                <div className={`absolute top-0 right-0 px-4 py-1 text-[9px] font-black uppercase italic ${item.status === 'pending' ? 'bg-orange-500 text-white' : 'bg-green-500 text-[#051510]'}`}>{item.status}</div>
                <div className="flex gap-4 items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center font-black italic text-[#00F5A0]">{item.user?.name?.[0] || item.userId?.name?.[0]}</div>
                    <div><p className="font-bold text-sm">{item.user?.email || item.userId?.email}</p><p className="text-[10px] text-gray-500 font-bold italic uppercase tracking-widest">{activeTab.slice(0,-1)} Request</p></div>
                </div>
                <div className="bg-black/20 rounded-2xl p-6 text-center border border-white/5 mb-6">
                    <h3 className="text-4xl font-black text-white italic">{(activeTab === "Deposits" ? item.amount + " USDT" : "₹" + item.amount)}</h3>
                    {item.txHash && <p className="text-[9px] text-gray-600 mt-2 truncate font-mono">TX: {item.txHash}</p>}
                    {item.walletAddress && <p className="text-[9px] text-gray-600 mt-2 truncate font-mono">TO: {item.walletAddress}</p>}
                </div>
                {item.status === 'pending' && (
                    <div className="flex gap-2">
                        <button onClick={() => handleAction(activeTab === "Deposits" ? 'DEPOSIT' : 'WITHDRAW', item._id, 'approved')} className="flex-1 bg-[#00F5A0] text-[#051510] py-3 rounded-xl font-black italic text-xs uppercase shadow-lg shadow-[#00F5A0]/10">Approve</button>
                        <button onClick={() => handleAction(activeTab === "Deposits" ? 'DEPOSIT' : 'WITHDRAW', item._id, 'rejected')} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-black italic text-xs uppercase shadow-lg shadow-red-500/10">Reject</button>
                    </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ================= HELPERS ================= */

const SidebarLink = ({ icon, label, active, badge, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-sm ${active ? 'bg-[#00F5A0]/10 text-[#00F5A0]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
    <div className="flex items-center gap-3">{icon} {label}</div>
    {badge > 0 && <span className="bg-[#00F5A0] text-[#051510] text-[10px] px-2 py-0.5 rounded-full font-black italic">{badge}</span>}
  </button>
);

const StatBox = ({ label, val, sub, trend, highlight }) => (
  <div className="bg-[#0A1F1A] border border-white/10 p-5 rounded-3xl space-y-1 relative overflow-hidden group hover:border-[#00F5A0]/30 transition-all shadow-lg">
    <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest italic">{label}</p>
    <div className="flex justify-between items-end">
      <h3 className={`text-xl md:text-2xl font-black ${highlight ? 'text-orange-500' : 'text-white'} italic`}>{val}</h3>
      {trend && <span className="text-[10px] font-black text-[#00F5A0] italic">{trend}</span>}
    </div>
    <p className="text-[8px] text-gray-600 font-bold uppercase">{sub}</p>
  </div>
);