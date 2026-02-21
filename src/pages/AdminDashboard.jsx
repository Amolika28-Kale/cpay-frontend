import React, { useEffect, useState } from "react";
import { 
  LayoutDashboard, Users, CreditCard, RefreshCcw, 
  Settings, LogOut, Check, X, ShieldAlert, Menu, Loader2, ArrowRightLeft,
  Zap, Clock, Search, ScanLine, Eye, ListOrdered
} from "lucide-react";
import { 
  getAllUsers, getAllDeposits, updateDepositStatus, 
  getAllWithdraws, updateWithdrawStatus, updateExchangeRate,
  getAllScanners, getAllTransactions 
} from "../services/adminService";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [users, setUsers] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdraws, setWithdraws] = useState([]);
  const [scanners, setScanners] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [exchangeRate, setExchangeRate] = useState("90.00");
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      const [uData, dData, wData, sData, tData] = await Promise.all([
        getAllUsers(),
        getAllDeposits(),
        getAllWithdraws(),
        getAllScanners(),
        getAllTransactions()
      ]);
      setUsers(uData || []);
      setDeposits(Array.isArray(dData) ? dData : []);
      setWithdraws(Array.isArray(wData) ? wData : []);
      setScanners(Array.isArray(sData) ? sData : []);
      setTransactions(Array.isArray(tData) ? tData : []);
    } catch (err) {
      console.error("Data Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (type, id, status) => {
    const action = status === 'approved' ? 'approve' : 'reject';
    let res;
    if (type === 'DEPOSIT') res = await updateDepositStatus(id, action);
    else res = await updateWithdrawStatus(id, action);
    if (res) { loadData(); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#051510] flex flex-col items-center justify-center gap-4 text-[#00F5A0] font-black italic">
      <Loader2 className="animate-spin" size={40} />
      SYNCING ADMIN CORE...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#051510] text-white flex flex-col md:flex-row font-sans">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0A1F1A] border-b border-white/5 sticky top-0 z-[100]">
        <div className="flex items-center gap-2">
          <Zap size={24} className="text-[#00F5A0]" />
          <span className="font-bold text-xl italic tracking-tighter">ADMIN HUB</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/5 rounded-lg">
          <Menu className="text-[#00F5A0]" />
        </button>
      </div>

      {/* SIDEBAR / MOBILE DRAWER */}
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[200] transition-opacity duration-300 md:hidden ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={() => setIsSidebarOpen(false)} />
      
      <aside className={`fixed md:relative inset-y-0 left-0 z-[210] w-72 bg-[#051510] border-r border-white/5 flex flex-col p-6 transition-transform duration-300 transform md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-2">
            <div className="bg-[#00F5A0] p-1.5 rounded-lg text-[#051510]"><Zap size={20} /></div>
            <span className="text-2xl font-black italic tracking-tighter">CpayLink</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden"><X size={24} /></button>
        </div>
        
        <nav className="flex-1 space-y-1">
          <SidebarLink icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activeTab === "Dashboard"} onClick={() => {setActiveTab("Dashboard"); setIsSidebarOpen(false);}} />
          <SidebarLink icon={<Users size={18}/>} label="User Base" active={activeTab === "Users"} onClick={() => {setActiveTab("Users"); setIsSidebarOpen(false);}} />
          <SidebarLink icon={<CreditCard size={18}/>} label="Deposits" badge={deposits.filter(d=>d.status==='pending').length} active={activeTab === "Deposits"} onClick={() => {setActiveTab("Deposits"); setIsSidebarOpen(false);}} />
          <SidebarLink icon={<ArrowRightLeft size={18}/>} label="Withdraws" badge={withdraws.filter(w=>w.status==='pending').length} active={activeTab === "Withdraws"} onClick={() => {setActiveTab("Withdraws"); setIsSidebarOpen(false);}} />
          <SidebarLink icon={<ScanLine size={18}/>} label="P2P Scanners" active={activeTab === "Scanners"} onClick={() => {setActiveTab("Scanners"); setIsSidebarOpen(false);}} />
          <SidebarLink icon={<ListOrdered size={18}/>} label="Global Ledger" active={activeTab === "Ledger"} onClick={() => {setActiveTab("Ledger"); setIsSidebarOpen(false);}} />
          
          <div className="pt-10 mt-10 border-t border-white/5">
            <button onClick={() => {localStorage.clear(); window.location.href="/auth"}} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-black text-sm hover:bg-red-500/10 rounded-xl transition-all italic"><LogOut size={18} /> Shutdown Access</button>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto min-h-screen w-full">
        <header className="hidden md:flex justify-between items-center mb-10">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">{activeTab}</h1>
            <div className="flex items-center gap-4 bg-white/5 p-2 pr-6 rounded-full border border-white/10">
              <div className="w-8 h-8 rounded-full bg-[#00F5A0] text-[#051510] flex items-center justify-center font-black">A</div>
              <span className="text-xs font-bold text-gray-400">ROOT ADMIN</span>
            </div>
        </header>

        {activeTab === "Dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatBox label="Network Nodes" val={users.length} />
              <StatBox label="Verification Queue" val={deposits.filter(d=>d.status==='pending').length} highlight />
              <StatBox label="Total Float (USDT)" val={users.reduce((a, b) => a + (b.wallets?.find(w=>w.type==="USDT")?.balance || 0), 0).toFixed(2)} />
              <StatBox label="System Volume" val={transactions.length} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-[#00F5A0] rounded-[2.5rem] p-8 text-[#051510] flex flex-col justify-between min-h-[300px]">
                <div>
                    <p className="text-[10px] font-black uppercase opacity-60 mb-2 italic">Global Exchange Protocol</p>
                    <h2 className="text-6xl font-black italic tracking-tighter mb-4">₹{exchangeRate}</h2>
                    <input type="number" value={exchangeRate} onChange={(e)=>setExchangeRate(e.target.value)} className="w-full bg-black/10 border border-black/10 rounded-2xl py-5 px-6 font-black text-3xl focus:outline-none mb-4" />
                </div>
                <button onClick={() => updateExchangeRate(exchangeRate)} className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all">Sync Global Rate</button>
              </div>

              <div className="lg:col-span-2 bg-[#0A1F1A] border border-white/10 rounded-[2.5rem] p-6 md:p-8">
                <h3 className="text-xl font-bold mb-6 italic flex items-center gap-2"><Clock size={20} className="text-[#00F5A0]"/> Recent Transactions</h3>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map(tx => (
                    <div key={tx._id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 group transition-all hover:bg-white/[0.08]">
                        <div className="flex gap-4 items-center min-w-0">
                            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-black italic text-xs ${tx.type === 'DEBIT' ? 'text-red-400 bg-red-400/10' : 'text-[#00F5A0] bg-[#00F5A0]/10'}`}>{tx.type[0]}</div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold truncate">{tx.user?.email || 'System'}</p>
                                <p className="text-[9px] text-gray-500 font-mono uppercase italic">{tx.type} • {new Date(tx.createdAt).toLocaleTimeString()}</p>
                            </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-sm font-black italic text-[#00F5A0]">₹{tx.amount}</p>
                            <p className="text-[8px] text-gray-600 font-bold uppercase">{tx.fromWallet} → {tx.toWallet}</p>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Users" && (
            <div className="bg-[#0A1F1A] border border-white/10 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden animate-in fade-in">
              <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between gap-4">
                 <h3 className="text-xl font-bold italic uppercase tracking-tighter">Verified Node Base</h3>
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
                    <input type="text" placeholder="Filter by email..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm w-full md:w-80 outline-none focus:border-[#00F5A0] transition-all" />
                 </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] uppercase text-gray-600 font-black border-b border-white/5 bg-black/10">
                    <tr>
                        <th className="px-6 py-5">Node ID</th>
                        <th className="px-6 py-5">USDT Balance</th>
                        <th className="px-6 py-5">INR Balance</th>
                        <th className="px-6 py-5">Cashback</th>
                        <th className="px-6 py-5 text-right">Join Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                      <tr key={u._id} className="hover:bg-white/[0.02] group transition-colors">
                        <td className="px-6 py-5">
                            <p className="font-bold text-sm group-hover:text-[#00F5A0]">{u.name}</p>
                            <p className="text-[10px] text-gray-500 font-mono">{u.email}</p>
                        </td>
                        <td className="px-6 py-5 font-mono text-blue-400 font-bold italic">{u.wallets?.find(w=>w.type==="USDT")?.balance?.toFixed(2) || 0}</td>
                        <td className="px-6 py-5 font-mono text-[#00F5A0] font-bold italic">₹{u.wallets?.find(w=>w.type==="INR")?.balance?.toLocaleString() || 0}</td>
                        <td className="px-6 py-5 font-mono text-orange-400 font-bold italic text-xs">₹{u.wallets?.find(w=>w.type==="CASHBACK")?.balance?.toFixed(2) || 0}</td>
                        <td className="px-6 py-5 text-right text-[10px] text-gray-600 font-bold">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
        )}

        {activeTab === "Ledger" && (
            <div className="bg-[#0A1F1A] border border-white/10 rounded-[2.5rem] overflow-hidden animate-in slide-in-from-bottom">
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-xl font-bold italic">Global System Ledger</h3>
                    <button onClick={loadData} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all active:rotate-180"><RefreshCcw size={16}/></button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[10px] uppercase text-gray-600 font-black border-b border-white/5">
                            <tr><th className="px-8 py-5">User Node</th><th className="px-8 py-5">Category</th><th className="px-8 py-5">Amount</th><th className="px-8 py-5">Route</th><th className="px-8 py-5 text-right">Timestamp</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {transactions.map(tx => (
                                <tr key={tx._id} className="hover:bg-white/[0.02]">
                                    <td className="px-8 py-4"><p className="text-xs font-bold truncate max-w-[150px]">{tx.user?.email || 'N/A'}</p></td>
                                    <td className="px-8 py-4"><span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${tx.type === 'CREDIT' ? 'bg-green-500/10 text-green-500' : tx.type === 'DEBIT' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-400'}`}>{tx.type}</span></td>
                                    <td className="px-8 py-4 font-mono font-bold text-sm text-[#00F5A0]">₹{tx.amount}</td>
                                    <td className="px-8 py-4 text-[10px] text-gray-500 font-bold uppercase italic">{tx.fromWallet} ➔ {tx.toWallet}</td>
                                    <td className="px-8 py-4 text-right text-[10px] text-gray-600 font-bold">{new Date(tx.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === "Deposits" && <DepositListView items={deposits} handleAction={handleAction} />}
        {activeTab === "Withdraws" && <WithdrawListView items={withdraws} handleAction={handleAction} />}
        {activeTab === "Scanners" && <ScannerListView items={scanners} />}

        {/* BOTTOM SPACER FOR MOBILE */}
        <div className="h-20 md:hidden" />
      </main>
    </div>
  );
}

/* ================= COMPONENT MODULES ================= */

const SidebarLink = ({ icon, label, active, badge, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all font-bold text-sm ${active ? 'bg-[#00F5A0] text-[#051510] shadow-[0_10px_25px_rgba(0,245,160,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
    <div className="flex items-center gap-3">{icon} {label}</div>
    {badge > 0 && <span className={`${active ? 'bg-black text-white' : 'bg-[#00F5A0] text-black'} text-[10px] px-2 py-0.5 rounded-full font-black italic shadow-sm`}>{badge}</span>}
  </button>
);

const StatBox = ({ label, val, highlight }) => (
  <div className="bg-[#0A1F1A] border border-white/10 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] group hover:border-[#00F5A0]/50 transition-all shadow-lg">
    <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest italic mb-2">{label}</p>
    <h3 className={`text-xl md:text-3xl font-black ${highlight ? 'text-orange-500 animate-pulse' : 'text-white'} italic tracking-tighter`}>{val}</h3>
  </div>
);

const DepositListView = ({ items, handleAction }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom">
        {items.map(item => (
            <div key={item._id} className="bg-[#0A1F1A] border border-white/10 p-6 rounded-[2rem] relative flex flex-col h-full shadow-xl">
                <div className={`absolute top-0 right-0 px-6 py-2 text-[9px] font-black uppercase italic rounded-bl-2xl ${item.status === 'pending' ? 'bg-orange-500 text-white' : 'bg-green-500 text-black'}`}>{item.status}</div>
                <div className="mb-6">
                    <p className="text-[10px] font-bold text-gray-600 uppercase mb-4 tracking-tighter">Deposit Protocol</p>
                    <p className="font-bold text-sm truncate mb-4 text-[#00F5A0]">{item.user?.email}</p>
                    <div className="bg-black/40 rounded-2xl p-6 text-center border border-white/5 shadow-inner">
                        <h3 className="text-3xl font-black text-white italic">{item.amount} USDT</h3>
                        <p className="text-[9px] text-blue-400 mt-2 truncate font-mono uppercase italic">TX: {item.txHash}</p>
                    </div>
                </div>
                {item.paymentScreenshot && (
                    <div className="mt-auto mb-6 rounded-xl overflow-hidden h-36 border border-white/10 group cursor-pointer relative" onClick={() => window.open(`https://cpay-backend.onrender.com${item.paymentScreenshot}`)}>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300"><Eye className="text-[#00F5A0]"/></div>
                        <img src={`https://cpay-backend.onrender.com${item.paymentScreenshot}`} className="w-full h-full object-cover" alt="Proof" />
                    </div>
                )}
                {item.status === 'pending' && (
                    <div className="flex gap-2">
                        <button onClick={() => handleAction('DEPOSIT', item._id, 'approved')} className="flex-1 bg-[#00F5A0] text-black py-3.5 rounded-xl font-black text-xs uppercase shadow-lg active:scale-95 transition-all">Approve</button>
                        <button onClick={() => handleAction('DEPOSIT', item._id, 'rejected')} className="flex-1 bg-red-500 text-white py-3.5 rounded-xl font-black text-xs uppercase shadow-lg active:scale-95 transition-all">Reject</button>
                    </div>
                )}
            </div>
        ))}
    </div>
);

const WithdrawListView = ({ items, handleAction }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom">
        {items.map(item => (
            <div key={item._id} className="bg-[#0A1F1A] border border-white/10 p-6 rounded-[2rem] relative flex flex-col h-full shadow-xl">
                <div className={`absolute top-0 right-0 px-6 py-2 text-[9px] font-black uppercase italic rounded-bl-2xl ${item.status === 'pending' ? 'bg-orange-500 text-white' : 'bg-green-500 text-black'}`}>{item.status}</div>
                <div className="mb-6">
                    <p className="text-[10px] font-bold text-gray-600 uppercase mb-4 tracking-tighter">Withdraw Protocol</p>
                    <p className="font-bold text-sm truncate mb-4 text-[#00F5A0]">{item.user?.email || item.userId?.email}</p>
                    <div className="bg-black/40 rounded-2xl p-6 text-center border border-white/5 shadow-inner">
                        <h3 className="text-3xl font-black text-white italic">₹{item.amount}</h3>
                        <p className="text-[9px] text-gray-500 mt-2 italic">Routing: Bank/UPI Transfer</p>
                    </div>
                </div>
                {item.status === 'pending' && (
                    <div className="flex gap-2 mt-auto">
                        <button onClick={() => handleAction('WITHDRAW', item._id, 'approved')} className="flex-1 bg-[#00F5A0] text-black py-3.5 rounded-xl font-black text-xs uppercase shadow-lg active:scale-95 transition-all">Approve</button>
                        <button onClick={() => handleAction('WITHDRAW', item._id, 'rejected')} className="flex-1 bg-red-500 text-white py-3.5 rounded-xl font-black text-xs uppercase shadow-lg active:scale-95 transition-all">Reject</button>
                    </div>
                )}
            </div>
        ))}
    </div>
);

const ScannerListView = ({ items }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom">
        {items.map(s => (
            <div key={s._id} className="bg-[#0A1F1A] border border-white/10 p-6 rounded-[2rem] relative flex flex-col shadow-xl">
                <div className={`absolute top-4 right-6 px-2 py-1 bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase rounded-full`}>{s.status}</div>
                <div className="bg-white p-3 rounded-2xl mb-6 w-fit mx-auto mt-6 shadow-2xl">
                    <img src={`https://cpay-backend.onrender.com${s.image}`} className="w-24 h-24 object-contain" alt="QR" />
                </div>
                <div className="text-center mb-6">
                    <h3 className="text-3xl font-black text-white italic tracking-tighter">₹{s.amount}</h3>
                    <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Market Listing</p>
                </div>
                <div className="mt-auto pt-4 border-t border-white/5">
                    <p className="text-[10px] text-[#00F5A0] font-black uppercase mb-1 truncate">Creator: {s.user?.email}</p>
                    <div className="flex justify-between text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                        <span>Taker: {s.acceptedBy?.email?.split('@')[0] || "Open"}</span>
                        <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        ))}
    </div>
);