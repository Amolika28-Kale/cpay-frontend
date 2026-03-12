import React, { useEffect, useState, useRef } from "react";
import { 
  LayoutDashboard, Users, CreditCard, RefreshCcw, 
  Settings, LogOut, Check, X, ShieldAlert, Menu, Loader2, ArrowRightLeft,
  Zap, Clock, Search, ScanLine, Eye, ListOrdered, TrendingUp, Award,
  ChevronDown, ChevronUp, User, Copy, DollarSign, PieChart, BarChart3,
  Users2, GitBranch, Network, Wallet, Coins, History, Download,
  Filter
} from "lucide-react";
import { 
  getAllUsers, getAllDeposits, updateDepositStatus, 
  getAllWithdraws, updateWithdrawStatus, updateExchangeRate,
  getAllScanners, getAllTransactions, getSystemStats, getUserDetails 
} from "../services/adminService";
import toast from 'react-hot-toast';
// Add these imports at the top of your file if not already present
import { ChevronLeft, ChevronRight } from "lucide-react";

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

/* ================= DASHBOARD VIEW - RESPONSIVE (NO WITHDRAW/EXCHANGE) ================= */
const DashboardView = ({ 
  systemStats, users, deposits, withdraws, scanners, transactions,
  exchangeRate, setExchangeRate, updateExchangeRate,
  pendingDeposits, pendingWithdraws
}) => {
  // Calculate total volume
  const totalDepositVolume = deposits.reduce((sum, d) => d.status === 'approved' ? sum + d.amount : sum, 0);
  const totalScannerVolume = scanners.reduce((sum, s) => s.status === 'COMPLETED' ? sum + s.amount : sum, 0);
  
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in duration-500">
      
      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatBox 
          label="Total Users" 
          val={users.length} 
          icon={<Users size={16} className="sm:w-[18px] sm:h-[18px]" />}
        />
        <StatBox 
          label="Active Scanners" 
          val={scanners.filter(s => s.status === 'ACTIVE').length} 
          highlight={scanners.filter(s => s.status === 'ACTIVE').length > 0}
          icon={<ScanLine size={16} className="sm:w-[18px] sm:h-[18px]" />}
        />
        <StatBox 
          label="Pending Deposits" 
          val={pendingDeposits} 
          highlight={pendingDeposits > 0}
          icon={<CreditCard size={16} className="sm:w-[18px] sm:h-[18px]" />}
        />
        <StatBox 
          label="Total Transactions" 
          val={transactions.length} 
          icon={<Clock size={16} className="sm:w-[18px] sm:h-[18px]" />}
        />
      </div>

      {/* Volume Stats - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Deposit Volume Card */}
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl">
          <p className="text-[8px] sm:text-[9px] md:text-[10px] text-blue-400 font-black uppercase mb-1 sm:mb-2">
            Deposit Volume
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-black text-white">
            ${totalDepositVolume.toFixed(2)}
          </p>
          <p className="text-[6px] sm:text-[7px] md:text-[8px] text-gray-500 mt-1">
            Total approved deposits
          </p>
        </div>
        
        {/* Scanner Volume Card */}
        <div className="bg-gradient-to-br from-[#00F5A0]/10 to-green-600/5 border border-[#00F5A0]/20 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl">
          <p className="text-[8px] sm:text-[9px] md:text-[10px] text-[#00F5A0] font-black uppercase mb-1 sm:mb-2">
            Scanner Volume
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-black text-white">
            ₹{totalScannerVolume.toFixed(2)}
          </p>
          <p className="text-[6px] sm:text-[7px] md:text-[8px] text-gray-500 mt-1">
            Total completed scans
          </p>
        </div>
      </div>

      {/* Recent Transactions - Full Width Responsive */}
      <div className="bg-[#0A1F1A] border border-white/10 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-4 sm:p-5 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-4 sm:mb-5 md:mb-6">
          <h3 className="text-base sm:text-lg md:text-xl font-bold italic flex items-center gap-2">
            <Clock size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 text-[#00F5A0]" /> 
            <span>Recent Transactions</span>
          </h3>
          
          {/* Pending Badge */}
          {(pendingDeposits > 0 || pendingWithdraws > 0) && (
            <span className="bg-red-500/10 text-red-500 text-[8px] sm:text-[9px] px-2 sm:px-3 py-1 rounded-full animate-pulse w-fit">
              {pendingDeposits + pendingWithdraws} pending
            </span>
          )}
        </div>

        {/* Transactions List - Responsive */}
        <div className="space-y-2 sm:space-y-3 max-h-[300px] sm:max-h-[350px] md:max-h-[400px] overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-white/10">
          {transactions.slice(0, 10).map(tx => (
            <div 
              key={tx._id} 
              className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 xs:gap-3 p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5 group transition-all hover:bg-white/[0.08]"
            >
              {/* Left Section - User Info */}
              <div className="flex gap-2 sm:gap-3 md:gap-4 items-center min-w-0 flex-1">
                {/* Type Icon */}
                <div className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex-shrink-0 flex items-center justify-center font-black italic text-[10px] sm:text-xs ${
                  tx.type === 'DEBIT' ? 'text-red-400 bg-red-400/10' : 
                  tx.type === 'CREDIT' ? 'text-green-400 bg-green-400/10' :
                  'text-[#00F5A0] bg-[#00F5A0]/10'
                }`}>
                  {tx.type ? tx.type[0] : 'T'}
                </div>
                
                {/* User Details */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-bold truncate max-w-[120px] xs:max-w-[150px] sm:max-w-[200px]">
                    {tx.user?.email || tx.user?.userId || 'System'}
                  </p>
                  <p className="text-[7px] sm:text-[8px] md:text-[9px] text-gray-500 font-mono uppercase italic">
                    {tx.type || 'TRANSFER'} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Right Section - Amount */}
              <div className="text-right flex-shrink-0 pl-10 xs:pl-0">
                <p className="text-xs sm:text-sm font-black italic text-[#00F5A0]">
                  {tx.type === 'DEBIT' ? '-' : '+'}₹{tx.amount}
                </p>
                <p className="text-[6px] sm:text-[7px] md:text-[8px] text-gray-600 font-bold uppercase hidden xs:block">
                  {tx.fromWallet || 'System'} → {tx.toWallet || 'System'}
                </p>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {transactions.length === 0 && (
            <div className="text-center py-8 sm:py-10 md:py-12">
              <Clock size={32} className="mx-auto mb-3 opacity-30 text-gray-500" />
              <p className="text-xs sm:text-sm text-gray-500">No transactions yet</p>
            </div>
          )}
        </div>

        {/* View All Link (if more than 10 transactions) */}
        {transactions.length > 10 && (
          <div className="mt-3 sm:mt-4 text-center">
            <button className="text-[10px] sm:text-xs text-[#00F5A0] font-bold hover:underline">
              View All Transactions ({transactions.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


/* ================= USERS VIEW - FULLY RESPONSIVE ================= */
const UsersView = ({ 
  users, searchTerm, setSearchTerm, setSelectedUser, 
  expandedUser, setExpandedUser, expandedLevel, setExpandedLevel,
  copyToClipboard 
}) => {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter users based on search
  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.referralCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle window resize for responsive view mode
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setViewMode('table');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="bg-[#0A1F1A] border border-white/10 rounded-xl md:rounded-2xl lg:rounded-[2rem] overflow-hidden animate-in fade-in">
      
      {/* Header */}
      <div className="p-4 sm:p-5 md:p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
          <h3 className="text-base sm:text-lg md:text-xl font-bold italic uppercase tracking-tighter flex items-center gap-2">
            <Users size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 text-[#00F5A0]" />
            <span>User Base</span>
            <span className="bg-[#00F5A0]/10 text-[#00F5A0] text-[8px] sm:text-[10px] px-2 py-0.5 rounded-full">
              {filteredUsers.length}
            </span>
          </h3>
          
          <div className="flex flex-col xs:flex-row gap-2">
            {/* Mobile View Toggle */}
            <div className="flex md:hidden bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`flex-1 px-3 py-1.5 rounded text-[10px] font-bold transition-all ${
                  viewMode === 'table' ? 'bg-[#00F5A0] text-black' : 'text-gray-400'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`flex-1 px-3 py-1.5 rounded text-[10px] font-bold transition-all ${
                  viewMode === 'cards' ? 'bg-[#00F5A0] text-black' : 'text-gray-400'
                }`}
              >
                Cards
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm} 
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }} 
                className="bg-black/40 border border-white/10 rounded-lg md:rounded-xl pl-8 sm:pl-9 md:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs sm:text-sm w-full outline-none focus:border-[#00F5A0] transition-all" 
              />
            </div>
          </div>
        </div>

        {/* Items Per Page & Pagination Info (Mobile) */}
        <div className="flex md:hidden items-center justify-between mt-3">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] font-bold text-white/80 outline-none"
          >
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
          
          <span className="text-[8px] text-gray-500">
            Page {currentPage} of {totalPages || 1}
          </span>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className={`hidden md:block overflow-x-auto`}>
        <table className="w-full text-left">
          <thead className="text-[8px] lg:text-[10px] uppercase text-gray-600 font-black border-b border-white/5 bg-black/10">
            <tr>
              <th className="px-3 lg:px-4 py-3 lg:py-5">User</th>
              <th className="px-3 lg:px-4 py-3 lg:py-5">Wallets</th>
              <th className="px-3 lg:px-4 py-3 lg:py-5">Scanners</th>
              <th className="px-3 lg:px-4 py-3 lg:py-5">Team</th>
              <th className="px-3 lg:px-4 py-3 lg:py-5">Earnings</th>
              <th className="px-3 lg:px-4 py-3 lg:py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map(u => {
                const teamCount = calculateTeamCount(u);
                return (
                  <React.Fragment key={u._id}>
                    <tr className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setExpandedUser(expandedUser === u._id ? null : u._id)}>
                      <td className="px-3 lg:px-4 py-3 lg:py-4">
                        <UserTableCell user={u} />
                      </td>
                      <td className="px-3 lg:px-4 py-3 lg:py-4">
                        <WalletCell user={u} />
                      </td>
                      <td className="px-3 lg:px-4 py-3 lg:py-4">
                        <ScannerCell user={u} />
                      </td>
                      <td className="px-3 lg:px-4 py-3 lg:py-4">
                        <span className="text-xs lg:text-sm font-bold text-[#00F5A0]">{teamCount}</span>
                      </td>
                      <td className="px-3 lg:px-4 py-3 lg:py-4">
                        <p className="text-xs lg:text-sm font-bold text-orange-400">
                          ₹{u.referralEarnings?.total?.toFixed(2) || 0}
                        </p>
                      </td>
                      <td className="px-3 lg:px-4 py-3 lg:py-4 text-right">
                        <ActionButtons 
                          user={u}
                          expandedUser={expandedUser}
                          setExpandedUser={setExpandedUser}
                          setSelectedUser={setSelectedUser}
                        />
                      </td>
                    </tr>
                    
                    {/* Expanded Row */}
                    {expandedUser === u._id && (
                      <tr className="bg-black/40">
                        <td colSpan="6" className="px-3 lg:px-4 py-4 lg:py-6">
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
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-8 py-12 text-center text-gray-500">
                  <Users size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-bold">No users found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className={`md:hidden space-y-2 p-3 ${viewMode === 'cards' ? 'block' : 'hidden'}`}>
        {paginatedUsers.length > 0 ? (
          paginatedUsers.map(u => (
            <MobileUserCard 
              key={u._id}
              user={u}
              expandedUser={expandedUser}
              setExpandedUser={setExpandedUser}
              setSelectedUser={setSelectedUser}
              copyToClipboard={copyToClipboard}
              expandedLevel={expandedLevel}
              setExpandedLevel={setExpandedLevel}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 bg-black/40 rounded-xl">
            <Users size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-xs font-bold">No users found</p>
          </div>
        )}
      </div>

      {/* Mobile Table View (Compact) */}
      <div className={`md:hidden overflow-x-auto ${viewMode === 'table' ? 'block' : 'hidden'}`}>
        <table className="w-full text-left min-w-[300px]">
          <thead className="text-[8px] uppercase text-gray-600 font-black border-b border-white/5 bg-black/20">
            <tr>
              <th className="px-2 py-2">User</th>
              <th className="px-2 py-2">Wallet</th>
              <th className="px-2 py-2">Team</th>
              <th className="px-2 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedUsers.map(u => (
              <tr key={u._id} className="hover:bg-white/[0.02]">
                <td className="px-2 py-2">
                  <p className="text-[10px] font-bold truncate max-w-[80px]">
                    {u.email?.split('@')[0] || u.userId?.slice(-8)}
                  </p>
                </td>
                <td className="px-2 py-2">
                  <p className="text-[8px] text-[#00F5A0]">₹{u.wallets?.INR?.toFixed(0) || 0}</p>
                </td>
                <td className="px-2 py-2">
                  <span className="text-[8px] text-blue-400">{calculateTeamCount(u)}</span>
                </td>
                <td className="px-2 py-2 text-right">
                  <button
                    onClick={() => setSelectedUser(u)}
                    className="bg-[#00F5A0]/10 text-[#00F5A0] px-2 py-1 rounded text-[8px] font-bold"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredUsers.length > itemsPerPage && (
        <div className="p-3 sm:p-4 md:p-5 lg:p-6 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Items Per Page (Desktop) */}
            <div className="hidden md:flex items-center gap-2">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] font-bold text-white/80 outline-none"
              >
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
              <span className="text-[10px] text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
              </span>
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 ${
                  currentPage === 1 
                    ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                    : 'bg-[#00F5A0] text-black hover:bg-[#00d88c]'
                }`}
              >
                <ChevronLeft size={12} />
                <span className="hidden xs:inline">Prev</span>
              </button>
              
              <span className="md:hidden text-[10px] text-gray-500 px-2">
                {currentPage} / {totalPages}
              </span>
              
              <div className="hidden md:flex items-center gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      pageNum = currentPage - 3 + i;
                    }
                    if (pageNum > totalPages) return null;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all ${
                        currentPage === pageNum
                          ? 'bg-[#00F5A0] text-black'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 ${
                  currentPage === totalPages 
                    ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                    : 'bg-[#00F5A0] text-black hover:bg-[#00d88c]'
                }`}
              >
                <span className="hidden xs:inline">Next</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= MOBILE USER CARD COMPONENT ================= */
const MobileUserCard = ({ user, expandedUser, setExpandedUser, setSelectedUser, copyToClipboard, expandedLevel, setExpandedLevel }) => {
  const isExpanded = expandedUser === user._id;
  const teamCount = calculateTeamCount(user);

  return (
    <div className="bg-black/40 border border-white/5 rounded-xl overflow-hidden">
      {/* Card Header */}
      <div 
        className="p-3 flex items-center justify-between cursor-pointer"
        onClick={() => setExpandedUser(isExpanded ? null : user._id)}
      >
        <div className="flex items-center gap-2 flex-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00F5A0] to-green-600 flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
            {user.email?.charAt(0)?.toUpperCase() || user.userId?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate max-w-[120px]">
              {user.email || user.userId}
            </p>
            <p className="text-[8px] text-gray-500 font-mono">
              ID: {user._id?.slice(-8)}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[8px] text-blue-400">📱 {user.scanners?.created?.length || 0}</span>
              <span className="text-[8px] text-[#00F5A0]">👥 {teamCount}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-orange-400">
            ₹{user.referralEarnings?.total?.toFixed(2) || 0}
          </p>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-3 pb-2 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedUser(user);
          }}
          className="flex-1 bg-[#00F5A0]/10 text-[#00F5A0] py-2 rounded-lg text-[10px] font-bold"
        >
          View Details
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(user.referralCode);
          }}
          className="bg-white/5 text-gray-400 px-3 py-2 rounded-lg text-[10px] font-bold flex items-center gap-1"
        >
          <Copy size={10} /> Ref
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-white/5">
          <UserExpandedDetails 
            user={user} 
            copyToClipboard={copyToClipboard}
            expandedLevel={expandedLevel}
            setExpandedLevel={setExpandedLevel}
            mobileView={true}
          />
        </div>
      )}
    </div>
  );
};

/* ================= HELPER COMPONENTS FOR TABLE CELLS ================= */
const UserTableCell = ({ user }) => (
  <div className="flex items-center gap-2">
    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-[#00F5A0] to-green-600 flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
      {user.email?.charAt(0)?.toUpperCase() || user.userId?.charAt(0) || 'U'}
    </div>
    <div className="min-w-0">
      <p className="font-bold text-xs lg:text-sm truncate max-w-[100px] lg:max-w-[150px]">
        {user.email || user.userId}
      </p>
      <div className="flex items-center gap-1">
        <p className="text-[6px] lg:text-[8px] text-gray-500 font-mono">
          {user._id?.slice(-6)}
        </p>
        <span className="text-[6px] lg:text-[8px] text-[#00F5A0]">
          • {user.referralCode}
        </span>
      </div>
    </div>
  </div>
);

const WalletCell = ({ user }) => (
  <div className="space-y-0.5">
    <p className="text-[8px] lg:text-[10px]">
      <span className="text-blue-400">₮</span> {user.wallets?.USDT?.toFixed(2) || 0}
    </p>
    <p className="text-[8px] lg:text-[10px]">
      <span className="text-[#00F5A0]">₹</span> {user.wallets?.INR?.toFixed(2) || 0}
    </p>
  </div>
);

const ScannerCell = ({ user }) => (
  <div className="flex items-center gap-1 lg:gap-2">
    <span className="text-xs lg:text-sm font-bold text-blue-400">
      {user.scanners?.created?.length || 0}
    </span>
    <span className="text-gray-600 text-[8px] lg:text-[10px]">/</span>
    <span className="text-xs lg:text-sm font-bold text-green-400">
      {user.scanners?.accepted?.length || 0}
    </span>
  </div>
);

const ActionButtons = ({ user, expandedUser, setExpandedUser, setSelectedUser }) => (
  <div className="flex items-center justify-end gap-1 lg:gap-2">
    <button 
      onClick={(e) => {
        e.stopPropagation();
        setSelectedUser(user);
      }}
      className="bg-[#00F5A0]/10 text-[#00F5A0] px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg text-[8px] lg:text-[10px] font-bold hover:bg-[#00F5A0]/20 transition-all"
    >
      Details
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        setExpandedUser(expandedUser === user._id ? null : user._id);
      }}
      className="text-gray-500 hover:text-white p-1"
    >
      {expandedUser === user._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </button>
  </div>
);

/* ================= HELPER FUNCTION ================= */
const calculateTeamCount = (user) => {
  let count = 0;
  if (user.referralTree) {
    for (let i = 1; i <= 21; i++) {
      count += user.referralTree[`level${i}`]?.length || 0;
    }
  }
  return count;
};

/* ================= USER EXPANDED DETAILS - RESPONSIVE ================= */
const UserExpandedDetails = ({ user, copyToClipboard, expandedLevel, setExpandedLevel, mobileView = false }) => {
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
    <div className="space-y-3 md:space-y-4 lg:space-y-6">
      
      {/* Quick Stats Grid - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
        <QuickStatCard label="User ID" value={user.userId} />
        <QuickStatCard label="Referral Code" value={user.referralCode} copyable onCopy={() => copyToClipboard(user.referralCode)} />
        <QuickStatCard label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
        <QuickStatCard label="Referred By" value={user.referredBy?.userId || 'None'} />
      </div>

      {/* Wallets - Responsive Grid */}
      <div className="bg-black/40 p-3 md:p-4 rounded-lg md:rounded-xl">
        <h4 className="text-[10px] md:text-xs font-bold mb-2 md:mb-3 text-[#00F5A0] flex items-center gap-2">
          <Wallet size={mobileView ? 12 : 14} /> Wallet Balances
        </h4>
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <WalletBalanceCard 
            label="USDT" 
            value={user.wallets?.USDT?.toFixed(2) || 0} 
            color="blue"
            mobileView={mobileView}
          />
          <WalletBalanceCard 
            label="INR" 
            value={`₹${user.wallets?.INR?.toFixed(2) || 0}`} 
            color="green"
            mobileView={mobileView}
          />
          <WalletBalanceCard 
            label="CASHBACK" 
            value={`₹${user.wallets?.CASHBACK?.toFixed(2) || 0}`} 
            color="orange"
            mobileView={mobileView}
          />
        </div>
      </div>

      {/* Scanner Stats - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <ScannerStatCard 
          title="Created Scanners"
          count={createdScanners.length}
          total={createdTotal}
          scanners={createdScanners}
          color="blue"
          icon={<ScanLine size={mobileView ? 12 : 14} />}
          mobileView={mobileView}
        />
        <ScannerStatCard 
          title="Accepted Scanners"
          count={acceptedScanners.length}
          total={acceptedTotal}
          scanners={acceptedScanners}
          color="green"
          icon={<Check size={mobileView ? 12 : 14} />}
          mobileView={mobileView}
        />
      </div>

      {/* Team Structure - Responsive */}
      <div className="bg-black/40 p-3 md:p-4 rounded-lg md:rounded-xl">
        <h4 className="text-[10px] md:text-xs font-bold mb-2 md:mb-3 text-[#00F5A0] flex items-center gap-2">
          <Network size={mobileView ? 12 : 14} /> Team Structure ({teamLevels.reduce((sum, l) => sum + l.count, 0)} members)
        </h4>
        <div className="space-y-2 max-h-48 md:max-h-60 lg:max-h-96 overflow-y-auto">
          {teamLevels.length > 0 ? (
            teamLevels.map(level => (
              <TeamLevelCard 
                key={level.level}
                level={level}
                expandedLevel={expandedLevel}
                setExpandedLevel={setExpandedLevel}
                mobileView={mobileView}
              />
            ))
          ) : (
            <p className="text-center text-gray-500 py-4 text-[10px] md:text-xs">No team members yet</p>
          )}
        </div>
      </div>

      {/* Earnings by Level - Responsive */}
      <div className="bg-black/40 p-3 md:p-4 rounded-lg md:rounded-xl">
        <h4 className="text-[10px] md:text-xs font-bold mb-2 md:mb-3 text-orange-400 flex items-center gap-2">
          <Coins size={mobileView ? 12 : 14} /> Commission Earnings
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 md:gap-2 max-h-40 md:max-h-60 overflow-y-auto">
          {user.referralEarnings && Object.entries(user.referralEarnings).map(([level, amount]) => {
            if (level === 'total' || amount === 0) return null;
            return (
              <EarningBadge key={level} level={level} amount={amount} />
            );
          })}
        </div>
        <div className="mt-2 md:mt-3 pt-2 border-t border-white/10">
          <div className="flex justify-between text-[8px] md:text-[10px] lg:text-xs">
            <span className="text-gray-400">Total Earnings:</span>
            <span className="text-orange-400 font-bold">₹{user.referralEarnings?.total || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= SUB-COMPONENTS FOR EXPANDED DETAILS ================= */
const QuickStatCard = ({ label, value, copyable, onCopy }) => (
  <div className="bg-black/40 p-2 md:p-3 lg:p-4 rounded-lg md:rounded-xl">
    <p className="text-[6px] md:text-[8px] text-gray-500">{label}</p>
    <div className="flex items-center gap-1 md:gap-2">
      <p className="text-[8px] md:text-[10px] lg:text-xs font-bold truncate">{value}</p>
      {copyable && (
        <button onClick={onCopy} className="text-[#00F5A0] hover:text-[#00d88c] flex-shrink-0">
          <Copy size={10} className="md:w-3 md:h-3" />
        </button>
      )}
    </div>
  </div>
);

const WalletBalanceCard = ({ label, value, color, mobileView }) => {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-[#00F5A0]',
    orange: 'text-orange-400'
  };

  return (
    <div>
      <p className="text-[8px] md:text-[10px] text-gray-500">{label}</p>
      <p className={`text-sm md:text-base lg:text-lg font-bold ${colorClasses[color]}`}>
        {value}
      </p>
    </div>
  );
};

const ScannerStatCard = ({ title, count, total, scanners, color, icon, mobileView }) => {
  const [showList, setShowList] = useState(false);
  
  return (
    <div className="bg-black/40 p-3 md:p-4 rounded-lg md:rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <h4 className={`text-[10px] md:text-xs font-bold text-${color}-400 flex items-center gap-2`}>
          {icon} {title} ({count})
        </h4>
        {scanners.length > 0 && (
          <button
            onClick={() => setShowList(!showList)}
            className="text-gray-500 hover:text-white"
          >
            {showList ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>
      <p className="text-sm md:text-base lg:text-lg font-bold">₹{total.toFixed(2)}</p>
      <p className="text-[6px] md:text-[8px] text-gray-500 mt-1">Total Volume</p>
      
      {showList && scanners.length > 0 && (
        <div className="mt-2 max-h-24 md:max-h-32 overflow-y-auto border-t border-white/5 pt-2">
          {scanners.map(s => (
            <div key={s._id} className="text-[6px] md:text-[8px] text-gray-400 py-1 border-b border-white/5">
              ₹{s.amount} - {s.status} ({new Date(s.createdAt).toLocaleDateString()})
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TeamLevelCard = ({ level, expandedLevel, setExpandedLevel, mobileView }) => (
  <div className="border border-white/10 rounded-lg overflow-hidden">
    <button
      onClick={() => setExpandedLevel(expandedLevel === level.level ? null : level.level)}
      className="w-full flex justify-between items-center p-2 md:p-3 bg-black/30 hover:bg-black/50 transition-colors"
    >
      <div className="flex items-center gap-2 md:gap-3">
        <span className="text-[8px] md:text-[10px] lg:text-xs font-bold">Level {level.level}</span>
        <span className="text-[6px] md:text-[8px] lg:text-[10px] text-[#00F5A0]">{level.count} members</span>
      </div>
      {expandedLevel === level.level ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
    </button>
    
    {expandedLevel === level.level && (
      <div className="p-2 md:p-3 bg-black/20 grid grid-cols-2 gap-1 md:gap-2">
        {level.members.map(memberId => (
          <div key={memberId} className="text-[6px] md:text-[8px] bg-black/40 p-1 md:p-2 rounded">
            <p className="font-mono truncate">{memberId.toString().slice(-8)}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

const EarningBadge = ({ level, amount }) => (
  <div className="bg-black/30 p-1 md:p-2 rounded text-center">
    <p className="text-[6px] md:text-[8px] text-gray-500">{level}</p>
    <p className="text-[8px] md:text-[10px] font-bold text-orange-400">₹{amount}</p>
  </div>
);

// Add these imports at the top if not present
// import { ChevronLeft, ChevronRight } from "lucide-react";

/* ================= DEPOSITS VIEW - FULLY RESPONSIVE ================= */
const DepositsView = ({ deposits, pendingDeposits, handleAction }) => {
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileStats, setShowMobileStats] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filter deposits
  const filteredDeposits = deposits.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  // Sort deposits
  const sortedDeposits = [...filteredDeposits].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date || 0);
    const dateB = new Date(b.createdAt || b.date || 0);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Pagination
  const totalPages = Math.ceil(sortedDeposits.length / itemsPerPage);
  const paginatedDeposits = sortedDeposits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Stats
  const approvedCount = deposits.filter(d => d.status === 'approved').length;
  const rejectedCount = deposits.filter(d => d.status === 'rejected').length;

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 animate-in fade-in duration-500">
      
      {/* Mobile Header - Always Visible */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black italic bg-gradient-to-r from-[#00F5A0] to-green-400 bg-clip-text text-transparent">
            Deposit Queue
          </h2>
          <div className="bg-orange-500/10 text-orange-500 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold border border-orange-500/20">
            {pendingDeposits} Pending
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex-1 flex items-center justify-between bg-[#0A1F1A] border border-white/10 rounded-xl px-4 py-3"
          >
            <span className="text-xs font-bold flex items-center gap-2">
              <Filter size={14} /> Filters & Sort
            </span>
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <button
            onClick={() => setShowMobileStats(!showMobileStats)}
            className="bg-[#0A1F1A] border border-white/10 rounded-xl px-4 py-3"
          >
            <PieChart size={16} />
          </button>
        </div>

        {/* Filter Controls - Desktop Always, Mobile Toggle */}
        <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row gap-2 sm:gap-3`}>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[#0A1F1A] border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-2.5 text-xs sm:text-sm font-bold text-white/80 focus:border-[#00F5A0] outline-none w-full sm:w-auto appearance-none"
          >
            <option value="all">All Deposits</option>
            <option value="pending">Pending Only</option>
            <option value="approved">Approved Only</option>
            <option value="rejected">Rejected Only</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-[#0A1F1A] border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-2.5 text-xs sm:text-sm font-bold text-white/80 focus:border-[#00F5A0] outline-none w-full sm:w-auto appearance-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Mobile Stats Summary - Collapsible */}
      <div className={`${showMobileStats ? 'grid' : 'hidden'} sm:grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 transition-all duration-300`}>
        <StatCard 
          label="Total" 
          value={deposits.length} 
          color="blue" 
          icon={<CreditCard size={14} />}
        />
        <StatCard 
          label="Pending" 
          value={pendingDeposits} 
          color="orange" 
          highlight={pendingDeposits > 0}
          icon={<Clock size={14} />}
        />
        <StatCard 
          label="Approved" 
          value={approvedCount} 
          color="green" 
          icon={<Check size={14} />}
        />
        <StatCard 
          label="Rejected" 
          value={rejectedCount} 
          color="red" 
          icon={<X size={14} />}
        />
      </div>


      {/* Desktop Table View (Hidden on Mobile) */}
      <div className="hidden md:block bg-[#0A1F1A] border border-white/10 rounded-xl lg:rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 lg:gap-4 p-3 lg:p-4 bg-black/40 border-b border-white/5 text-[8px] lg:text-[10px] font-black uppercase text-gray-500 tracking-wider">
          <div className="col-span-3">User Details</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-2">Transaction ID</div>
          <div className="col-span-2">Date & Time</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-white/5">
          {paginatedDeposits.length > 0 ? (
            paginatedDeposits.map(item => (
              <div key={item._id} className="grid grid-cols-12 gap-2 lg:gap-4 p-3 lg:p-4 hover:bg-white/[0.02] transition-all items-center">
                {/* User Details */}
                <div className="col-span-3">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-[#00F5A0] to-green-600 flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
                      {item.user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs lg:text-sm truncate max-w-[120px] lg:max-w-[150px]">
                        {item.user?.email || item.userId || 'Unknown'}
                      </p>
                      <p className="text-[6px] lg:text-[8px] text-gray-500 font-mono">
                        ID: {item.user?._id?.slice(-6) || item.userId?.slice(-6) || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="col-span-2">
                  <p className="text-sm lg:text-base font-black text-[#00F5A0]">{item.amount} USDT</p>
                  <p className="text-[6px] lg:text-[8px] text-gray-600">≈ ₹{(item.amount * 90).toFixed(2)}</p>
                </div>

                {/* Transaction ID */}
                <div className="col-span-2">
                  <p className="text-[8px] lg:text-[10px] font-mono font-bold text-blue-400 truncate" title={item.txHash}>
                    {item.txHash?.slice(0, 8)}...{item.txHash?.slice(-6)}
                  </p>
                </div>

                {/* Date & Time */}
                <div className="col-span-2">
                  <p className="text-[10px] lg:text-xs font-bold text-white">
                    {formatShortDate(item.createdAt || item.date)}
                  </p>
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <span className={`inline-block px-2 py-1 text-[8px] lg:text-[9px] font-black uppercase rounded-full ${
                    item.status === 'pending' 
                      ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30 animate-pulse' 
                      : item.status === 'approved'
                        ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                        : 'bg-red-500/20 text-red-500 border border-red-500/30'
                  }`}>
                    {item.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2">
                  {item.status === 'pending' ? (
                    <div className="flex gap-1 lg:gap-2 justify-end">
                      <button 
                        onClick={() => handleAction('DEPOSIT', item._id, 'approved')} 
                        className="bg-[#00F5A0] text-black px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg font-black text-[8px] lg:text-[10px] uppercase hover:bg-[#00d88c] transition-all shadow-lg flex items-center gap-1"
                        title="Approve"
                      >
                        <Check size={10} className="lg:w-3 lg:h-3" />
                      </button>
                      <button 
                        onClick={() => handleAction('DEPOSIT', item._id, 'rejected')} 
                        className="bg-red-500 text-white px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg font-black text-[8px] lg:text-[10px] uppercase hover:bg-red-600 transition-all shadow-lg flex items-center gap-1"
                        title="Reject"
                      >
                        <X size={10} className="lg:w-3 lg:h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-right text-gray-500 text-[8px] lg:text-[10px] italic">
                      {formatShortDate(item.updatedAt)}
                    </div>
                  )}
                </div>

                {/* Screenshot */}
                {item.paymentScreenshot && (
                  <div className="col-span-12 mt-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => window.open(`https://cpay-backend.onrender.com${item.paymentScreenshot}`)}
                      className="text-[#00F5A0] text-[8px] lg:text-[10px] font-bold flex items-center gap-1 hover:underline"
                    >
                      <Eye size={10} /> View Screenshot
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 lg:p-12 text-center text-gray-500">
              <CreditCard size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-xs lg:text-sm font-bold">No deposits found</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Card View (Visible on Mobile) */}
      <div className="md:hidden space-y-3">
        {paginatedDeposits.length > 0 ? (
          paginatedDeposits.map(item => (
            <MobileDepositCard 
              key={item._id} 
              item={item} 
              handleAction={handleAction}
              formatDate={formatShortDate}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 bg-[#0A1F1A] rounded-xl">
            <CreditCard size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-xs font-bold">No deposits found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {sortedDeposits.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 sm:mt-6">
          <p className="text-[10px] sm:text-xs text-gray-500 order-2 sm:order-1">
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedDeposits.length)} of {sortedDeposits.length}
          </p>
          <div className="flex gap-2 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 1 
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                  : 'bg-[#00F5A0] text-black hover:bg-[#00d88c]'
              }`}
            >
              Previous
            </button>
            <span className="px-3 sm:px-4 py-2 bg-[#0A1F1A] border border-white/10 rounded-lg text-xs font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === totalPages 
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                  : 'bg-[#00F5A0] text-black hover:bg-[#00d88c]'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= MOBILE DEPOSIT CARD COMPONENT ================= */
const MobileDepositCard = ({ item, handleAction, formatDate }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#0A1F1A] border border-white/10 rounded-xl overflow-hidden">
      {/* Card Header - Always Visible */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00F5A0] to-green-600 flex items-center justify-center text-black font-bold text-xs">
              {item.user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-bold text-xs truncate max-w-[120px]">
                {item.user?.email || item.userId || 'Unknown'}
              </p>
              <p className="text-[6px] text-gray-500">
                {formatDate(item.createdAt)}
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 text-[8px] font-black uppercase rounded-full ${
            item.status === 'pending' 
              ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30 animate-pulse' 
              : item.status === 'approved'
                ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                : 'bg-red-500/20 text-red-500 border border-red-500/30'
          }`}>
            {item.status}
          </span>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-black/30 p-2 rounded">
            <p className="text-[6px] text-gray-500">Amount</p>
            <p className="text-sm font-black text-[#00F5A0]">{item.amount} USDT</p>
            <p className="text-[6px] text-gray-600">≈ ₹{(item.amount * 90).toFixed(2)}</p>
          </div>
          <div className="bg-black/30 p-2 rounded">
            <p className="text-[6px] text-gray-500">TXID</p>
            <p className="text-[8px] font-mono text-blue-400 truncate">
              {item.txHash?.slice(0, 8)}...{item.txHash?.slice(-4)}
            </p>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 text-[8px] text-gray-500 py-1"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          <span>{expanded ? 'Show Less' : 'Show More'}</span>
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-white/5">
          {/* User ID */}
          <div className="bg-black/30 p-2 rounded mb-2">
            <p className="text-[6px] text-gray-500">User ID</p>
            <p className="text-[8px] font-mono">{item.user?._id || item.userId || 'N/A'}</p>
          </div>

          {/* Full Transaction ID */}
          {item.txHash && (
            <div className="bg-black/30 p-2 rounded mb-2">
              <p className="text-[6px] text-gray-500">Full Transaction ID</p>
              <p className="text-[8px] font-mono break-all">{item.txHash}</p>
            </div>
          )}

          {/* Screenshot */}
          {item.paymentScreenshot && (
            <button
              onClick={() => window.open(`https://cpay-backend.onrender.com${item.paymentScreenshot}`)}
              className="w-full bg-black/30 p-2 rounded mb-3 text-[#00F5A0] text-[8px] font-bold flex items-center justify-center gap-1"
            >
              <Eye size={10} /> View Payment Screenshot
            </button>
          )}

          {/* Actions */}
          {item.status === 'pending' && (
            <div className="flex gap-2">
              <button 
                onClick={() => handleAction('DEPOSIT', item._id, 'approved')} 
                className="flex-1 bg-[#00F5A0] text-black py-3 rounded-lg font-black text-[10px] uppercase flex items-center justify-center gap-1"
              >
                <Check size={12} /> Approve
              </button>
              <button 
                onClick={() => handleAction('DEPOSIT', item._id, 'rejected')} 
                className="flex-1 bg-red-500 text-white py-3 rounded-lg font-black text-[10px] uppercase flex items-center justify-center gap-1"
              >
                <X size={12} /> Reject
              </button>
            </div>
          )}

          {item.status !== 'pending' && (
            <div className="text-center text-[8px] text-gray-500 py-2">
              Processed on {formatDate(item.updatedAt)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ================= STAT CARD COMPONENT ================= */
const StatCard = ({ label, value, color, highlight, icon }) => {
  const colorClasses = {
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400',
    orange: 'from-orange-500/10 to-orange-600/5 border-orange-500/20 text-orange-400',
    green: 'from-green-500/10 to-green-600/5 border-green-500/20 text-green-400',
    red: 'from-red-500/10 to-red-600/5 border-red-500/20 text-red-400'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border p-3 sm:p-4 rounded-lg sm:rounded-xl ${
      highlight ? 'animate-pulse' : ''
    }`}>
      <p className="text-[8px] sm:text-[10px] font-black uppercase flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white">{value}</p>
    </div>
  );
};

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

/* ================= LEDGER VIEW - FULLY RESPONSIVE ================= */
const LedgerView = ({ transactions, loadData }) => {
  const [showFull, setShowFull] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards' (for mobile)
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Pagination
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format date for different screen sizes
  const formatDate = (dateString, format = 'full') => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    
    if (format === 'mobile') {
      return date.toLocaleString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short'
      });
    }
    
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Handle window resize for responsive view mode
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setViewMode('table');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="bg-[#0A1F1A] border border-white/10 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] overflow-hidden animate-in slide-in-from-bottom">
      
      {/* Header */}
      <div className="p-4 sm:p-5 md:p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
          <h3 className="text-base sm:text-lg md:text-xl font-bold italic flex items-center gap-2">
            <ListOrdered size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 text-[#00F5A0]" />
            <span className="hidden xs:inline">Global System Ledger</span>
            <span className="xs:hidden">Ledger</span>
            <span className="bg-[#00F5A0]/10 text-[#00F5A0] text-[8px] sm:text-[10px] px-2 py-0.5 rounded-full">
              {transactions.length}
            </span>
          </h3>
          
          <div className="flex items-center gap-2">
            {/* Mobile View Toggle */}
            <div className="flex md:hidden bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                  viewMode === 'table' ? 'bg-[#00F5A0] text-black' : 'text-gray-400'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                  viewMode === 'cards' ? 'bg-[#00F5A0] text-black' : 'text-gray-400'
                }`}
              >
                Cards
              </button>
            </div>
            
            {/* Refresh Button */}
            <button 
              onClick={loadData} 
              className="p-1.5 sm:p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all active:rotate-180"
              aria-label="Refresh"
            >
              <RefreshCcw size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Items Per Page Selector (Mobile) */}
        <div className="flex md:hidden items-center justify-between mt-3">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] font-bold text-white/80 outline-none"
          >
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
          
          <span className="text-[8px] text-gray-500">
            Page {currentPage} of {totalPages || 1}
          </span>
        </div>
      </div>

      {/* Desktop Table View (Hidden on Mobile) */}
      <div className={`hidden md:block overflow-x-auto`}>
        <table className="w-full text-left">
          <thead className="text-[8px] lg:text-[10px] uppercase text-gray-600 font-black border-b border-white/5">
            <tr>
              <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5">User</th>
              <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5">Type</th>
              <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5">Amount</th>
              <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5">Route</th>
              <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map(tx => (
                <tr key={tx._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4">
                    <p className="text-xs lg:text-sm font-bold truncate max-w-[120px] lg:max-w-[150px] xl:max-w-[200px]">
                      {tx.user?.email || tx.user?.userId || 'System'}
                    </p>
                    {tx.user?._id && (
                      <p className="text-[6px] lg:text-[8px] text-gray-600 font-mono mt-0.5">
                        ID: {tx.user._id.slice(-6)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4">
                    <span className={`inline-block text-[8px] lg:text-[9px] font-black px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full ${
                      tx.type === 'CREDIT' ? 'bg-green-500/10 text-green-500' : 
                      tx.type === 'DEBIT' ? 'bg-red-500/10 text-red-500' : 
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 font-mono font-bold text-sm lg:text-base text-[#00F5A0]">
                    {tx.type === 'DEBIT' ? '−' : '+'}₹{tx.amount?.toFixed(2)}
                  </td>
                  <td className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 text-[8px] lg:text-[10px] text-gray-500 font-bold uppercase italic">
                    <span className="hidden xl:inline">{tx.fromWallet || 'System'} → {tx.toWallet || 'System'}</span>
                    <span className="xl:hidden">{tx.fromWallet?.slice(0,3) || 'Sys'} → {tx.toWallet?.slice(0,3) || 'Sys'}</span>
                  </td>
                  <td className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 text-right text-[8px] lg:text-[10px] text-gray-600 font-bold">
                    <span className="hidden lg:inline">{formatDate(tx.createdAt)}</span>
                    <span className="lg:hidden">{formatDate(tx.createdAt, 'mobile')}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-8 py-12 text-center text-gray-500">
                  <ListOrdered size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-bold">No transactions found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className={`md:hidden space-y-2 p-3 ${viewMode === 'cards' ? 'block' : 'hidden'}`}>
        {paginatedTransactions.length > 0 ? (
          paginatedTransactions.map(tx => (
            <MobileLedgerCard key={tx._id} transaction={tx} formatDate={formatDate} />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 bg-black/40 rounded-xl">
            <ListOrdered size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-xs font-bold">No transactions found</p>
          </div>
        )}
      </div>

      {/* Mobile Table View (Alternative) */}
      <div className={`md:hidden overflow-x-auto ${viewMode === 'table' ? 'block' : 'hidden'}`}>
        <table className="w-full text-left min-w-[400px]">
          <thead className="text-[8px] uppercase text-gray-600 font-black border-b border-white/5 bg-black/20">
            <tr>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedTransactions.map(tx => (
              <tr key={tx._id} className="hover:bg-white/[0.02]">
                <td className="px-3 py-2">
                  <p className="text-[10px] font-bold truncate max-w-[80px]">
                    {tx.user?.email?.split('@')[0] || tx.user?.userId?.slice(-8) || 'System'}
                  </p>
                </td>
                <td className="px-3 py-2">
                  <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full ${
                    tx.type === 'CREDIT' ? 'bg-green-500/10 text-green-500' : 
                    tx.type === 'DEBIT' ? 'bg-red-500/10 text-red-500' : 
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    {tx.type?.slice(0,3)}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono font-bold text-[10px] text-[#00F5A0]">
                  {tx.type === 'DEBIT' ? '-' : '+'}₹{tx.amount}
                </td>
                <td className="px-3 py-2 text-right text-[7px] text-gray-500">
                  {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {sortedTransactions.length > itemsPerPage && (
        <div className="p-3 sm:p-4 md:p-5 lg:p-6 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Items Per Page (Desktop) */}
            <div className="hidden md:flex items-center gap-2">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] font-bold text-white/80 outline-none"
              >
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
              <span className="text-[10px] text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedTransactions.length)} of {sortedTransactions.length}
              </span>
            </div>

            {/* Page Info (Mobile) */}
            <div className="md:hidden text-[8px] text-gray-500">
              Page {currentPage} of {totalPages}
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 ${
                  currentPage === 1 
                    ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                    : 'bg-[#00F5A0] text-black hover:bg-[#00d88c]'
                }`}
              >
                <ChevronLeft size={12} />
                <span className="hidden xs:inline">Prev</span>
              </button>
              
              {/* Page Numbers */}
              <div className="hidden sm:flex items-center gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      pageNum = currentPage - 3 + i;
                    }
                    if (pageNum > totalPages) return null;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all ${
                        currentPage === pageNum
                          ? 'bg-[#00F5A0] text-black'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 ${
                  currentPage === totalPages 
                    ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                    : 'bg-[#00F5A0] text-black hover:bg-[#00d88c]'
                }`}
              >
                <span className="hidden xs:inline">Next</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View All Toggle (if no pagination) */}
      {!showFull && transactions.length > 10 && (
        <div className="p-4 text-center border-t border-white/5">
          <button
            onClick={() => setShowFull(true)}
            className="text-[10px] sm:text-xs text-[#00F5A0] font-bold hover:underline"
          >
            View All Transactions ({transactions.length})
          </button>
        </div>
      )}
    </div>
  );
};

/* ================= MOBILE LEDGER CARD COMPONENT ================= */
const MobileLedgerCard = ({ transaction: tx, formatDate }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-black/40 border border-white/5 rounded-xl overflow-hidden">
      {/* Card Header */}
      <div 
        className="p-3 flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
            tx.type === 'CREDIT' ? 'bg-green-500/10 text-green-500' : 
            tx.type === 'DEBIT' ? 'bg-red-500/10 text-red-500' :
            'bg-blue-500/10 text-blue-400'
          }`}>
            {tx.type ? tx.type[0] : 'T'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate max-w-[120px]">
              {tx.user?.email?.split('@')[0] || tx.user?.userId || 'System'}
            </p>
            <p className="text-[8px] text-gray-500">
              {formatDate(tx.createdAt, 'mobile')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <p className="text-sm font-black text-[#00F5A0]">
            {tx.type === 'DEBIT' ? '−' : '+'}₹{tx.amount}
          </p>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-2">
          {/* Full User Info */}
          <div className="bg-black/30 p-2 rounded">
            <p className="text-[6px] text-gray-500">User</p>
            <p className="text-[8px] font-bold">{tx.user?.email || tx.user?.userId || 'System'}</p>
            {tx.user?._id && (
              <p className="text-[6px] text-gray-500 font-mono">ID: {tx.user._id}</p>
            )}
          </div>

          {/* Transaction Type */}
          <div className="bg-black/30 p-2 rounded">
            <p className="text-[6px] text-gray-500">Type</p>
            <span className={`inline-block text-[8px] font-black px-2 py-0.5 rounded-full mt-1 ${
              tx.type === 'CREDIT' ? 'bg-green-500/10 text-green-500' : 
              tx.type === 'DEBIT' ? 'bg-red-500/10 text-red-500' : 
              'bg-blue-500/10 text-blue-400'
            }`}>
              {tx.type}
            </span>
          </div>

          {/* Route */}
          <div className="bg-black/30 p-2 rounded">
            <p className="text-[6px] text-gray-500">Route</p>
            <p className="text-[8px] font-bold uppercase">
              {tx.fromWallet || 'System'} → {tx.toWallet || 'System'}
            </p>
          </div>

          {/* Full Timestamp */}
          <div className="bg-black/30 p-2 rounded">
            <p className="text-[6px] text-gray-500">Date & Time</p>
            <p className="text-[8px]">{formatDate(tx.createdAt)}</p>
          </div>

          {/* Transaction ID if available */}
          {tx.transactionId && (
            <div className="bg-black/30 p-2 rounded">
              <p className="text-[6px] text-gray-500">Transaction ID</p>
              <p className="text-[6px] font-mono break-all">{tx.transactionId}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


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

/* ================= UPDATED STATBOX COMPONENT FOR BETTER RESPONSIVENESS ================= */
const StatBox = ({ label, val, highlight, icon }) => (
  <div className={`bg-[#0A1F1A] border ${
    highlight ? 'border-orange-500/50 bg-orange-500/5 animate-pulse' : 'border-white/10'
  } p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl group hover:border-[#00F5A0]/50 transition-all shadow-lg relative`}>
    <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase text-gray-500 tracking-widest italic mb-1 sm:mb-2 flex items-center gap-1">
      <span className="text-[#00F5A0]">{icon}</span>
      <span className="hidden xs:inline">{label}</span>
      <span className="xs:hidden">{label.split(' ')[0]}</span>
      {highlight && <span className="ml-1 text-orange-500 animate-pulse">●</span>}
    </p>
    <h3 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-black ${
      highlight ? 'text-orange-500' : 'text-white'
    } italic tracking-tighter`}>{val}</h3>
  </div>
);