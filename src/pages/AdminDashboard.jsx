import React, { useEffect, useState, useRef } from "react";
import { 
  LayoutDashboard, Users, CreditCard, RefreshCcw, 
  Settings, LogOut, Check, X, ShieldAlert, Menu, Loader2, ArrowRightLeft,
  Zap, Clock, Search, ScanLine, Eye, ListOrdered, TrendingUp, Award,
  ChevronDown, ChevronUp, User, Copy, DollarSign, PieChart, BarChart3,
  Users2, GitBranch, Network, Wallet, Coins, History, Download
} from "lucide-react";
import { 
  getAllUsers, getAllDeposits, updateDepositStatus, 
  getAllWithdraws, updateWithdrawStatus, updateExchangeRate,
  getAllScanners, getAllTransactions, getSystemStats, getUserDetails 
} from "../services/adminService";
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [users, setUsers] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdraws, setWithdraws] = useState([]);
  const [scanners, setScanners] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [exchangeRate, setExchangeRate] = useState("90.00");
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [expandedLevel, setExpandedLevel] = useState(null);
  
  // Refs for notification tracking
  const prevDepositCount = useRef(0);
  const prevWithdrawCount = useRef(0);

  // Calculate pending counts
  const pendingDeposits = deposits.filter(d => d.status === 'pending').length;
  const pendingWithdraws = withdraws.filter(w => w.status === 'pending').length;

  const loadData = async () => {
    try {
      const [uData, dData, wData, sData, tData, statsData] = await Promise.all([
        getAllUsers(),
        getAllDeposits(),
        getAllWithdraws(),
        getAllScanners(),
        getAllTransactions(),
        getSystemStats()
      ]);
      
      // Check for new pending deposits
      const newDeposits = (Array.isArray(dData) ? dData : []).filter(d => d.status === 'pending').length;
      if (newDeposits > prevDepositCount.current) {
        playNotificationSound();
      }
      prevDepositCount.current = newDeposits;
      
      // Check for new pending withdraws
      const newWithdraws = (Array.isArray(wData) ? wData : []).filter(w => w.status === 'pending').length;
      if (newWithdraws > prevWithdrawCount.current) {
        playNotificationSound();
      }
      prevWithdrawCount.current = newWithdraws;
      
      setUsers(uData || []);
      setDeposits(Array.isArray(dData) ? dData : []);
      setWithdraws(Array.isArray(wData) ? wData : []);
      setScanners(Array.isArray(sData) ? sData : []);
      setTransactions(Array.isArray(tData) ? tData : []);
      setSystemStats(statsData || null);
    } catch (err) {
      console.error("Data Fetch Error:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Notification sound function
  const playNotificationSound = () => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    audio.play().catch(err => console.log("Audio play blocked by browser"));
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
    if (res) { 
      loadData(); 
      toast.success(`${type} ${status} successfully!`);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
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
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/5 rounded-lg relative">
          <Menu className="text-[#00F5A0]" />
          {(pendingDeposits > 0 || pendingWithdraws > 0) && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          )}
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
          <SidebarLink 
            icon={<LayoutDashboard size={18}/>} 
            label="Dashboard" 
            active={activeTab === "Dashboard"} 
            onClick={() => {setActiveTab("Dashboard"); setIsSidebarOpen(false);}} 
          />
          <SidebarLink 
            icon={<Users size={18}/>} 
            label="Users" 
            badge={users.length}
            active={activeTab === "Users"} 
            onClick={() => {setActiveTab("Users"); setIsSidebarOpen(false);}} 
          />
          <SidebarLink 
            icon={<CreditCard size={18}/>} 
            label="Deposits" 
            badge={pendingDeposits} 
            active={activeTab === "Deposits"} 
            onClick={() => {setActiveTab("Deposits"); setIsSidebarOpen(false);}} 
            highlight={pendingDeposits > 0}
          />
         
          <SidebarLink 
            icon={<ScanLine size={18}/>} 
            label="Scanners" 
            badge={scanners.filter(s => s.status === 'ACTIVE').length}
            active={activeTab === "Scanners"} 
            onClick={() => {setActiveTab("Scanners"); setIsSidebarOpen(false);}} 
          />
          <SidebarLink 
            icon={<ListOrdered size={18}/>} 
            label="Ledger" 
            badge={transactions.length}
            active={activeTab === "Ledger"} 
            onClick={() => {setActiveTab("Ledger"); setIsSidebarOpen(false);}} 
          />
          
          <div className="pt-10 mt-10 border-t border-white/5">
            <button 
              onClick={() => {localStorage.clear(); window.location.href="/auth"}} 
              className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-black text-sm hover:bg-red-500/10 rounded-xl transition-all italic"
            >
              <LogOut size={18} /> Shutdown Access
            </button>
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
            {(pendingDeposits > 0 || pendingWithdraws > 0) && (
              <span className="flex items-center gap-1 bg-red-500/10 text-red-500 px-2 py-1 rounded-full text-[8px] font-black uppercase animate-pulse">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                {pendingDeposits + pendingWithdraws} PENDING
              </span>
            )}
          </div>
        </header>

        {/* DASHBOARD TAB */}
        {activeTab === "Dashboard" && (
          <DashboardView 
            systemStats={systemStats}
            users={users}
            deposits={deposits}
            withdraws={withdraws}
            scanners={scanners}
            transactions={transactions}
            exchangeRate={exchangeRate}
            setExchangeRate={setExchangeRate}
            updateExchangeRate={updateExchangeRate}
            pendingDeposits={pendingDeposits}
            pendingWithdraws={pendingWithdraws}
          />
        )}

        {/* USERS TAB - COMPLETE DETAILS */}
        {activeTab === "Users" && (
          <UsersView 
            users={users}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setSelectedUser={setSelectedUser}
            expandedUser={expandedUser}
            setExpandedUser={setExpandedUser}
            expandedLevel={expandedLevel}
            setExpandedLevel={setExpandedLevel}
            copyToClipboard={copyToClipboard}
          />
        )}

        {/* DEPOSITS TAB */}
        {activeTab === "Deposits" && (
          <DepositsView 
            deposits={deposits}
            pendingDeposits={pendingDeposits}
            handleAction={handleAction}
          />
        )}
        
        {/* WITHDRAWS TAB */}
        {activeTab === "Withdraws" && (
          <WithdrawsView 
            withdraws={withdraws}
            pendingWithdraws={pendingWithdraws}
            handleAction={handleAction}
          />
        )}
        
        {/* SCANNERS TAB */}
        {activeTab === "Scanners" && (
          <ScannersView scanners={scanners} />
        )}

        {/* LEDGER TAB */}
        {activeTab === "Ledger" && (
          <LedgerView 
            transactions={transactions} 
            loadData={loadData}
          />
        )}

        {/* BOTTOM SPACER FOR MOBILE */}
        <div className="h-20 md:hidden" />
      </main>

      {/* USER DETAILS MODAL */}
      {selectedUser && (
        <UserDetailsModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}
    </div>
  );
}

/* ================= DASHBOARD VIEW ================= */
const DashboardView = ({ 
  systemStats, users, deposits, withdraws, scanners, transactions,
  exchangeRate, setExchangeRate, updateExchangeRate,
  pendingDeposits, pendingWithdraws
}) => {
  // Calculate total volume
  const totalDepositVolume = deposits.reduce((sum, d) => d.status === 'approved' ? sum + d.amount : sum, 0);
  const totalWithdrawVolume = withdraws.reduce((sum, w) => w.status === 'approved' ? sum + w.amount : sum, 0);
  const totalScannerVolume = scanners.reduce((sum, s) => s.status === 'COMPLETED' ? sum + s.amount : sum, 0);
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox 
          label="Total Users" 
          val={users.length} 
          icon={<Users size={18} />}
        />
        <StatBox 
          label="Active Scanners" 
          val={scanners.filter(s => s.status === 'ACTIVE').length} 
          highlight={scanners.filter(s => s.status === 'ACTIVE').length > 0}
          icon={<ScanLine size={18} />}
        />
        <StatBox 
          label="Pending Deposits" 
          val={pendingDeposits} 
          highlight={pendingDeposits > 0}
          icon={<CreditCard size={18} />}
        />
       
      </div>

      {/* Volume Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-6 rounded-2xl">
          <p className="text-[10px] text-blue-400 font-black uppercase mb-2">Deposit Volume</p>
          <p className="text-3xl font-black text-white">${totalDepositVolume.toFixed(2)}</p>
          <p className="text-[8px] text-gray-500 mt-1">Total approved deposits</p>
        </div>
        
        <div className="bg-gradient-to-br from-[#00F5A0]/10 to-green-600/5 border border-[#00F5A0]/20 p-6 rounded-2xl">
          <p className="text-[10px] text-[#00F5A0] font-black uppercase mb-2">Scanner Volume</p>
          <p className="text-3xl font-black text-white">₹{totalScannerVolume.toFixed(2)}</p>
          <p className="text-[8px] text-gray-500 mt-1">Total completed scans</p>
        </div>
      </div>

      {/* Exchange Rate & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
       

        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-[#0A1F1A] border border-white/10 rounded-[2.5rem] p-6 md:p-8">
          <h3 className="text-xl font-bold mb-6 italic flex items-center gap-2">
            <Clock size={20} className="text-[#00F5A0]"/> 
            Recent Transactions
            {(pendingDeposits > 0 || pendingWithdraws > 0) && (
              <span className="bg-red-500/10 text-red-500 text-[8px] px-2 py-1 rounded-full animate-pulse">
                {pendingDeposits + pendingWithdraws} pending
              </span>
            )}
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {transactions.slice(0, 10).map(tx => (
              <div key={tx._id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 group transition-all hover:bg-white/[0.08]">
                <div className="flex gap-4 items-center min-w-0">
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-black italic text-xs ${
                    tx.type === 'DEBIT' ? 'text-red-400 bg-red-400/10' : 
                    tx.type === 'CREDIT' ? 'text-green-400 bg-green-400/10' :
                    'text-[#00F5A0] bg-[#00F5A0]/10'
                  }`}>
                    {tx.type ? tx.type[0] : 'T'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{tx.user?.email || tx.user?.userId || 'System'}</p>
                    <p className="text-[9px] text-gray-500 font-mono uppercase italic">{tx.type || 'TRANSFER'} • {new Date(tx.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black italic text-[#00F5A0]">
                    {tx.type === 'DEBIT' ? '-' : '+'}₹{tx.amount}
                  </p>
                  <p className="text-[8px] text-gray-600 font-bold uppercase">{tx.fromWallet || 'System'} → {tx.toWallet || 'System'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= USERS VIEW - COMPLETE DETAILS ================= */
const UsersView = ({ 
  users, searchTerm, setSearchTerm, setSelectedUser, 
  expandedUser, setExpandedUser, expandedLevel, setExpandedLevel,
  copyToClipboard 
}) => {
  return (
    <div className="bg-[#0A1F1A] border border-white/10 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden animate-in fade-in">
      <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between gap-4">
        <h3 className="text-xl font-bold italic uppercase tracking-tighter flex items-center gap-2">
          <Users size={20} className="text-[#00F5A0]" />
          User Base ({users.length})
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
          <input 
            type="text" 
            placeholder="Search by email or ID..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm w-full md:w-80 outline-none focus:border-[#00F5A0] transition-all" 
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-[10px] uppercase text-gray-600 font-black border-b border-white/5 bg-black/10">
            <tr>
              <th className="px-4 py-5">User</th>
              <th className="px-4 py-5">Wallets</th>
              <th className="px-4 py-5">Scanners (Created/Accepted)</th>
              <th className="px-4 py-5">Team Size</th>
              <th className="px-4 py-5">Total Earnings</th>
              <th className="px-4 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users
              .filter(u => 
                u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u._id?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(u => {
                // Calculate team count from referralTree
                let teamCount = 0;
                if (u.referralTree) {
                  for (let i = 1; i <= 21; i++) {
                    teamCount += u.referralTree[`level${i}`]?.length || 0;
                  }
                }
                
                return (
                  <React.Fragment key={u._id}>
                    <tr className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setExpandedUser(expandedUser === u._id ? null : u._id)}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00F5A0] to-green-600 flex items-center justify-center text-black font-bold">
                            {u.email?.charAt(0)?.toUpperCase() || u.userId?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{u.email || u.userId}</p>
                            <p className="text-[8px] text-gray-500 font-mono">ID: {u._id?.slice(-6)}</p>
                            <p className="text-[8px] text-[#00F5A0]">Ref: {u.referralCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <p className="text-[10px]"><span className="text-blue-400">USDT:</span> {u.wallets?.USDT?.toFixed(2) || 0}</p>
                          <p className="text-[10px]"><span className="text-[#00F5A0]">INR:</span> ₹{u.wallets?.INR?.toFixed(2) || 0}</p>
                          <p className="text-[10px]"><span className="text-orange-400">CB:</span> ₹{u.wallets?.CASHBACK?.toFixed(2) || 0}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-blue-400">{u.scanners?.created?.length || 0}</span>
                          <span className="text-gray-600">/</span>
                          <span className="text-sm font-bold text-green-400">{u.scanners?.accepted?.length || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-[#00F5A0]">{teamCount}</span>
                          <span className="text-[8px] text-gray-500">members</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-bold text-orange-400">₹{u.referralEarnings?.total?.toFixed(2) || 0}</p>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(u);
                            }}
                            className="bg-[#00F5A0]/10 text-[#00F5A0] px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-[#00F5A0]/20 transition-all"
                          >
                            Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedUser(expandedUser === u._id ? null : u._id);
                            }}
                            className="text-gray-500 hover:text-white"
                          >
                            {expandedUser === u._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded User Details - COMPLETE INFO */}
                    {expandedUser === u._id && (
                      <tr className="bg-black/40">
                        <td colSpan="6" className="px-4 py-6">
                          <UserExpandedDetails 
                            user={u} 
                            copyToClipboard={copyToClipboard}
                            expandedLevel={expandedLevel}
                            setExpandedLevel={setExpandedLevel}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ================= USER EXPANDED DETAILS - COMPLETE ================= */
const UserExpandedDetails = ({ user, copyToClipboard, expandedLevel, setExpandedLevel }) => {
  // Calculate team members per level
  const teamLevels = [];
  for (let i = 1; i <= 21; i++) {
    const levelMembers = user.referralTree?.[`level${i}`] || [];
    if (levelMembers.length > 0) {
      teamLevels.push({
        level: i,
        count: levelMembers.length,
        members: levelMembers
      });
    }
  }

  // Calculate scanner stats
  const createdScanners = user.scanners?.created || [];
  const acceptedScanners = user.scanners?.accepted || [];
  const createdTotal = createdScanners.reduce((sum, s) => sum + (s.amount || 0), 0);
  const acceptedTotal = acceptedScanners.reduce((sum, s) => sum + (s.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-black/40 p-4 rounded-xl">
          <p className="text-[8px] text-gray-500">User ID</p>
          <p className="text-sm font-bold">{user.userId}</p>
        </div>
        <div className="bg-black/40 p-4 rounded-xl">
          <p className="text-[8px] text-gray-500">Referral Code</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[#00F5A0]">{user.referralCode}</p>
            <button onClick={() => copyToClipboard(user.referralCode)} className="text-[#00F5A0] hover:text-[#00d88c]">
              <Copy size={12} />
            </button>
          </div>
        </div>
        <div className="bg-black/40 p-4 rounded-xl">
          <p className="text-[8px] text-gray-500">Joined</p>
          <p className="text-xs">{new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="bg-black/40 p-4 rounded-xl">
          <p className="text-[8px] text-gray-500">Referred By</p>
          <p className="text-xs">{user.referredBy?.userId || user.referredBy?.email || 'None'}</p>
        </div>
      </div>

      {/* Wallets */}
      <div className="bg-black/40 p-4 rounded-xl">
        <h4 className="text-xs font-bold mb-3 text-[#00F5A0] flex items-center gap-2">
          <Wallet size={14} /> Wallet Balances
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] text-gray-500">USDT</p>
            <p className="text-lg font-bold text-blue-400">{user.wallets?.USDT?.toFixed(2) || 0}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500">INR</p>
            <p className="text-lg font-bold text-[#00F5A0]">₹{user.wallets?.INR?.toFixed(2) || 0}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500">CASHBACK</p>
            <p className="text-lg font-bold text-orange-400">₹{user.wallets?.CASHBACK?.toFixed(2) || 0}</p>
          </div>
        </div>
      </div>

      {/* Scanner Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/40 p-4 rounded-xl">
          <h4 className="text-xs font-bold mb-3 text-blue-400 flex items-center gap-2">
            <ScanLine size={14} /> Created Scanners ({createdScanners.length})
          </h4>
          <p className="text-2xl font-bold">₹{createdTotal.toFixed(2)}</p>
          <p className="text-[8px] text-gray-500 mt-1">Total Volume</p>
          <div className="mt-2 max-h-32 overflow-y-auto">
            {createdScanners.map(s => (
              <div key={s._id} className="text-[8px] text-gray-400 py-1 border-b border-white/5">
                ₹{s.amount} - {s.status} ({new Date(s.createdAt).toLocaleDateString()})
              </div>
            ))}
          </div>
        </div>
        <div className="bg-black/40 p-4 rounded-xl">
          <h4 className="text-xs font-bold mb-3 text-green-400 flex items-center gap-2">
            <Check size={14} /> Accepted Scanners ({acceptedScanners.length})
          </h4>
          <p className="text-2xl font-bold">₹{acceptedTotal.toFixed(2)}</p>
          <p className="text-[8px] text-gray-500 mt-1">Total Volume</p>
          <div className="mt-2 max-h-32 overflow-y-auto">
            {acceptedScanners.map(s => (
              <div key={s._id} className="text-[8px] text-gray-400 py-1 border-b border-white/5">
                ₹{s.amount} - Created by: {s.user?.userId}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Structure - All 21 Levels */}
      <div className="bg-black/40 p-4 rounded-xl">
        <h4 className="text-xs font-bold mb-3 text-[#00F5A0] flex items-center gap-2">
          <Network size={14} /> Team Structure ({teamLevels.reduce((sum, l) => sum + l.count, 0)} members)
        </h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {teamLevels.map(level => (
            <div key={level.level} className="border border-white/10 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedLevel(expandedLevel === level.level ? null : level.level)}
                className="w-full flex justify-between items-center p-3 bg-black/30 hover:bg-black/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold">Level {level.level}</span>
                  <span className="text-[10px] text-[#00F5A0]">{level.count} members</span>
                </div>
                {expandedLevel === level.level ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              
              {expandedLevel === level.level && (
                <div className="p-3 bg-black/20 grid grid-cols-2 gap-2">
                  {level.members.map(memberId => (
                    <div key={memberId} className="text-[8px] bg-black/40 p-2 rounded">
                      <p className="font-mono">{memberId.toString().slice(-8)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {teamLevels.length === 0 && (
            <p className="text-center text-gray-500 py-4">No team members yet</p>
          )}
        </div>
      </div>

      {/* Earnings by Level */}
      <div className="bg-black/40 p-4 rounded-xl">
        <h4 className="text-xs font-bold mb-3 text-orange-400 flex items-center gap-2">
          <Coins size={14} /> Commission Earnings
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
          {user.referralEarnings && Object.entries(user.referralEarnings).map(([level, amount]) => {
            if (level === 'total' || amount === 0) return null;
            return (
              <div key={level} className="bg-black/30 p-2 rounded text-center">
                <p className="text-[8px] text-gray-500">{level}</p>
                <p className="text-[10px] font-bold text-orange-400">₹{amount}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Total Earnings:</span>
            <span className="text-orange-400 font-bold">₹{user.referralEarnings?.total || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= DEPOSITS VIEW ================= */
const DepositsView = ({ deposits, pendingDeposits, handleAction }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-black italic">Deposit Queue</h2>
      <div className="bg-orange-500/10 text-orange-500 px-4 py-2 rounded-full text-sm font-bold">
        {pendingDeposits} Pending {pendingDeposits === 1 ? 'Request' : 'Requests'}
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom">
      {deposits.map(item => (
        <div key={item._id} className="bg-[#0A1F1A] border border-white/10 p-6 rounded-[2rem] relative flex flex-col h-full shadow-xl">
          <div className={`absolute top-0 right-0 px-6 py-2 text-[9px] font-black uppercase italic rounded-bl-2xl ${
            item.status === 'pending' 
              ? 'bg-orange-500 text-white animate-pulse' 
              : item.status === 'approved'
                ? 'bg-green-500 text-black'
                : 'bg-red-500 text-white'
          }`}>{item.status}</div>
          <div className="mb-6">
            <p className="text-[10px] font-bold text-gray-600 uppercase mb-4 tracking-tighter">Deposit Protocol</p>
            <p className="font-bold text-sm truncate mb-4 text-[#00F5A0]">{item.user?.email || item.userId}</p>
            <div className="bg-black/40 rounded-2xl p-6 text-center border border-white/5 shadow-inner">
              <h3 className="text-3xl font-black text-white italic">{item.amount} USDT</h3>
              <p className="text-[9px] text-blue-400 mt-2 truncate font-mono uppercase italic">TX: {item.txHash}</p>
            </div>
          </div>
          {item.paymentScreenshot && (
            <div className="mt-auto mb-6 rounded-xl overflow-hidden h-36 border border-white/10 group cursor-pointer relative" onClick={() => window.open(`https://cpay-backend.onrender.com${item.paymentScreenshot}`)}>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                <Eye className="text-[#00F5A0]" />
              </div>
              <img src={`https://cpay-backend.onrender.com${item.paymentScreenshot}`} className="w-full h-full object-cover" alt="Proof" />
            </div>
          )}
          {item.status === 'pending' && (
            <div className="flex gap-2 mt-auto">
              <button onClick={() => handleAction('DEPOSIT', item._id, 'approved')} className="flex-1 bg-[#00F5A0] text-black py-3.5 rounded-xl font-black text-xs uppercase shadow-lg active:scale-95 transition-all">Approve</button>
              <button onClick={() => handleAction('DEPOSIT', item._id, 'rejected')} className="flex-1 bg-red-500 text-white py-3.5 rounded-xl font-black text-xs uppercase shadow-lg active:scale-95 transition-all">Reject</button>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);



/* ================= SCANNERS VIEW ================= */
const ScannersView = ({ scanners }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom">
    {scanners.map(s => (
      <div key={s._id} className="bg-[#0A1F1A] border border-white/10 p-6 rounded-[2rem] relative flex flex-col shadow-xl">
        <div className={`absolute top-4 right-6 px-2 py-1 ${
          s.status === 'ACTIVE' 
            ? 'bg-green-500/10 text-green-500 animate-pulse' 
            : s.status === 'COMPLETED'
              ? 'bg-blue-500/10 text-blue-400'
              : s.status === 'ACCEPTED'
                ? 'bg-yellow-500/10 text-yellow-500'
                : 'bg-gray-500/10 text-gray-400'
        } text-[9px] font-black uppercase rounded-full`}>{s.status}</div>
        <div className="bg-white p-3 rounded-2xl mb-6 w-fit mx-auto mt-6 shadow-2xl">
          <img src={`https://cpay-backend.onrender.com${s.image}`} className="w-24 h-24 object-contain" alt="QR" />
        </div>
        <div className="text-center mb-6">
          <h3 className="text-3xl font-black text-white italic tracking-tighter">₹{s.amount}</h3>
          <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Market Listing</p>
        </div>
        <div className="mt-auto pt-4 border-t border-white/5">
          <p className="text-[10px] text-[#00F5A0] font-black uppercase mb-1 truncate">Creator: {s.user?.email || s.user?.userId}</p>
          <div className="flex justify-between text-[9px] text-gray-600 font-bold uppercase tracking-widest">
            <span>Taker: {s.acceptedBy?.email?.split('@')[0] || s.acceptedBy?.userId || "Open"}</span>
            <span>{new Date(s.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ================= LEDGER VIEW ================= */
const LedgerView = ({ transactions, loadData }) => (
  <div className="bg-[#0A1F1A] border border-white/10 rounded-[2.5rem] overflow-hidden animate-in slide-in-from-bottom">
    <div className="p-8 border-b border-white/5 flex justify-between items-center">
      <h3 className="text-xl font-bold italic flex items-center gap-2">
        <ListOrdered size={20} className="text-[#00F5A0]" />
        Global System Ledger
      </h3>
      <button onClick={loadData} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all active:rotate-180">
        <RefreshCcw size={16} />
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="text-[10px] uppercase text-gray-600 font-black border-b border-white/5">
          <tr>
            <th className="px-8 py-5">User</th>
            <th className="px-8 py-5">Type</th>
            <th className="px-8 py-5">Amount</th>
            <th className="px-8 py-5">Route</th>
            <th className="px-8 py-5 text-right">Timestamp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {transactions.map(tx => (
            <tr key={tx._id} className="hover:bg-white/[0.02]">
              <td className="px-8 py-4">
                <p className="text-xs font-bold truncate max-w-[150px]">
                  {tx.user?.email || tx.user?.userId || 'System'}
                </p>
              </td>
              <td className="px-8 py-4">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                  tx.type === 'CREDIT' ? 'bg-green-500/10 text-green-500' : 
                  tx.type === 'DEBIT' ? 'bg-red-500/10 text-red-500' : 
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  {tx.type}
                </span>
              </td>
              <td className="px-8 py-4 font-mono font-bold text-sm text-[#00F5A0]">
                {tx.type === 'DEBIT' ? '-' : '+'}₹{tx.amount}
              </td>
              <td className="px-8 py-4 text-[10px] text-gray-500 font-bold uppercase italic">
                {tx.fromWallet || 'System'} ➔ {tx.toWallet || 'System'}
              </td>
              <td className="px-8 py-4 text-right text-[10px] text-gray-600 font-bold">
                {new Date(tx.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/* ================= USER DETAILS MODAL ================= */
const UserDetailsModal = ({ user, onClose }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedLevel, setExpandedLevel] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const data = await getUserDetails(user._id);
      if (data?.success) {
        setUserDetails(data.user);
      }
      setLoading(false);
    };
    fetchDetails();
  }, [user._id]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[1000]">
        <Loader2 className="animate-spin text-[#00F5A0]" size={40} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
      <div className="bg-[#0A1F1A] border border-white/10 rounded-[2rem] w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0A1F1A] p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-black italic">User Details: {userDetails?.userId || userDetails?.email}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/40 p-4 rounded-xl">
              <p className="text-[8px] text-gray-500">User ID</p>
              <p className="text-sm font-bold">{userDetails?.userId}</p>
            </div>
            <div className="bg-black/40 p-4 rounded-xl">
              <p className="text-[8px] text-gray-500">Referral Code</p>
              <p className="text-sm font-bold text-[#00F5A0]">{userDetails?.referralCode}</p>
            </div>
            <div className="bg-black/40 p-4 rounded-xl">
              <p className="text-[8px] text-gray-500">Joined</p>
              <p className="text-xs">{new Date(userDetails?.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="bg-black/40 p-4 rounded-xl">
              <p className="text-[8px] text-gray-500">Referred By</p>
              <p className="text-xs">{userDetails?.referredBy?.userId || 'None'}</p>
            </div>
          </div>

          {/* Wallets */}
          <div className="bg-black/40 p-4 rounded-xl">
            <h3 className="text-sm font-bold mb-3">Wallet Balances</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] text-gray-500">USDT</p>
                <p className="text-lg font-bold text-blue-400">{userDetails?.wallets?.USDT?.toFixed(2) || 0}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">INR</p>
                <p className="text-lg font-bold text-[#00F5A0]">₹{userDetails?.wallets?.INR?.toFixed(2) || 0}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">CASHBACK</p>
                <p className="text-lg font-bold text-orange-400">₹{userDetails?.wallets?.CASHBACK?.toFixed(2) || 0}</p>
              </div>
            </div>
          </div>

          {/* Scanner Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/40 p-4 rounded-xl">
              <h3 className="text-sm font-bold mb-3 text-blue-400">Created Scanners</h3>
              <p className="text-2xl font-bold">{userDetails?.scanners?.created?.length || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                Total Amount: ₹{userDetails?.scanners?.created?.reduce((sum, s) => sum + s.amount, 0) || 0}
              </p>
              <div className="mt-2 max-h-40 overflow-y-auto">
                {userDetails?.scanners?.created?.map(s => (
                  <div key={s._id} className="text-[8px] text-gray-400 py-1 border-b border-white/5">
                    ₹{s.amount} - {s.status} ({new Date(s.createdAt).toLocaleDateString()})
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-black/40 p-4 rounded-xl">
              <h3 className="text-sm font-bold mb-3 text-green-400">Accepted Scanners</h3>
              <p className="text-2xl font-bold">{userDetails?.scanners?.accepted?.length || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                Total Amount: ₹{userDetails?.scanners?.accepted?.reduce((sum, s) => sum + s.amount, 0) || 0}
              </p>
              <div className="mt-2 max-h-40 overflow-y-auto">
                {userDetails?.scanners?.accepted?.map(s => (
                  <div key={s._id} className="text-[8px] text-gray-400 py-1 border-b border-white/5">
                    ₹{s.amount} - Created by: {s.user?.userId}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Structure */}
          {userDetails?.team?.levels && userDetails.team.levels.length > 0 && (
            <div className="bg-black/40 p-4 rounded-xl">
              <h3 className="text-sm font-bold mb-3 text-[#00F5A0]">Team Structure ({userDetails.team.total} members)</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {userDetails.team.levels.map(level => (
                  <div key={level.level} className="border border-white/10 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedLevel(expandedLevel === level.level ? null : level.level)}
                      className="w-full flex justify-between items-center p-3 bg-black/30 hover:bg-black/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold">Level {level.level}</span>
                        <span className="text-[10px] text-[#00F5A0]">{level.count} members</span>
                      </div>
                      {expandedLevel === level.level ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    
                    {expandedLevel === level.level && (
                      <div className="p-3 bg-black/20 grid grid-cols-2 gap-2">
                        {level.members.map(member => (
                          <div key={member.userId} className="text-[8px] bg-black/40 p-2 rounded">
                            <p className="font-bold">{member.userId}</p>
                            <p className="text-gray-500">Earned: ₹{member.earnings}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Earnings by Level */}
          <div className="bg-black/40 p-4 rounded-xl">
            <h3 className="text-sm font-bold mb-3 text-orange-400">Commission Earnings</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
              {Object.entries(userDetails?.earnings || {}).map(([level, amount]) => {
                if (level === 'total' || amount === 0) return null;
                return (
                  <div key={level} className="bg-black/30 p-2 rounded text-center">
                    <p className="text-[8px] text-gray-500">{level}</p>
                    <p className="text-[10px] font-bold text-orange-400">₹{amount}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-sm font-bold text-right">
                Total: <span className="text-orange-400">₹{userDetails?.earnings?.total || 0}</span>
              </p>
            </div>
          </div>

          {/* Transactions */}
          {userDetails?.transactions && userDetails.transactions.length > 0 && (
            <div className="bg-black/40 p-4 rounded-xl">
              <h3 className="text-sm font-bold mb-3 text-blue-400">Recent Transactions</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {userDetails.transactions.slice(0, 10).map(tx => (
                  <div key={tx._id} className="flex justify-between items-center text-[10px] bg-black/30 p-2 rounded">
                    <div>
                      <span className="text-gray-400">{new Date(tx.createdAt).toLocaleString()}</span>
                      <span className={`ml-2 ${tx.type === 'CREDIT' ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.type}
                      </span>
                    </div>
                    <span className="font-bold text-[#00F5A0]">₹{tx.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================= SIDEBAR LINK COMPONENT ================= */
const SidebarLink = ({ icon, label, active, badge, onClick, highlight }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all font-bold text-sm relative ${
    active 
      ? 'bg-[#00F5A0] text-[#051510] shadow-[0_10px_25px_rgba(0,245,160,0.3)]' 
      : highlight && badge > 0
        ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 animate-pulse'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
  }`}>
    <div className="flex items-center gap-3">{icon} {label}</div>
    {badge > 0 && (
      <span className={`${
        active 
          ? 'bg-black text-white' 
          : highlight 
            ? 'bg-orange-500 text-white'
            : 'bg-[#00F5A0] text-black'
      } text-[10px] px-2 py-0.5 rounded-full font-black italic shadow-sm`}>
        {badge}
      </span>
    )}
    {highlight && badge > 0 && !active && (
      <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
    )}
  </button>
);

/* ================= STAT BOX COMPONENT ================= */
const StatBox = ({ label, val, highlight, subText, icon }) => (
  <div className={`bg-[#0A1F1A] border ${
    highlight ? 'border-orange-500/50 bg-orange-500/5' : 'border-white/10'
  } p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] group hover:border-[#00F5A0]/50 transition-all shadow-lg relative`}>
    <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest italic mb-2 flex items-center gap-1">
      {icon && <span className="text-[#00F5A0]">{icon}</span>}
      {label}
      {highlight && <span className="ml-2 text-orange-500 animate-pulse">●</span>}
    </p>
    <h3 className={`text-xl md:text-3xl font-black ${
      highlight ? 'text-orange-500 animate-pulse' : 'text-white'
    } italic tracking-tighter`}>{val}</h3>
    {subText && <p className="text-[8px] text-gray-600 mt-1">{subText}</p>}
  </div>
);