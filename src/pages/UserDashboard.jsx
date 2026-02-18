import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid, ArrowRightLeft, Wallet, ScanLine, CheckCircle,
  LogOut, X, Clock, Menu, Loader, Zap, PlusCircle, Camera, UploadCloud
} from "lucide-react";

import {
  getWallets, getTransactions, createDeposit, transferCashback,
  getActivePaymentMethods, selfPay, requestToPay, getActiveRequests,
  acceptRequest, submitPayment, confirmRequest,
} from "../services/apiService";
import { getReferralStats } from "../services/authService";
import { Copy } from "lucide-react";

import { Html5Qrcode } from "html5-qrcode";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [referralData, setReferralData] = useState({
  referralCode: "",
  totalReferrals: 0,
  referralEarnings: 0,
});

  const [activeTab, setActiveTab] = useState("Overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data State
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [scanners, setScanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
// Notification Ref to track previous count
  const prevActiveCount = useRef(0);
  // Form States
  const [depositData, setDepositData] = useState({ amount: "", network: "TRC20" });
  const [uploadAmount, setUploadAmount] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [txHash, setTxHash] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedScanner, setSelectedScanner] = useState(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [depositScreenshot, setDepositScreenshot] = useState(null);
  const [qrData, setQrData] = useState("");
  const [amount, setAmount] = useState("");
  const [scannerActive, setScannerActive] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || { name: "User" };

  // Calculate active requests for the badge
  const activeRequestsCount = scanners.filter(s => s.status === "ACTIVE" && String(s.user?._id) !== String(user._id)).length;

  // Sound Notification Logic
  useEffect(() => {
    if (activeRequestsCount > prevActiveCount.current) {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.play().catch(err => console.log("Audio play blocked by browser"));
    }
    prevActiveCount.current = activeRequestsCount;
  }, [activeRequestsCount]);
const loadAllData = async () => {
    try {
      // 1. Extract the token from localStorage
      const token = localStorage.getItem("token");

      // 2. Safety check: If token is missing, stop here to avoid 401 errors
      if (!token) {
        console.warn("Sync aborted: No token found");
        return;
      }

      // 3. Pass the token specifically to getReferralStats
      const [w, t, s, pm, ref] = await Promise.all([
        getWallets(),
        getTransactions(),
        getActiveRequests(),
        getActivePaymentMethods(),
        getReferralStats(token), // Pass the token here!
      ]);

      // 4. Update states
      setWallets(w || []);
      setTransactions(t || []);
      setScanners(s || []);
      setPaymentMethods(pm || []);
      
      // Ensure state is updated with the referral object
      if (ref && !ref.message) {
        setReferralData(ref);
      }

    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth");
  };

  // --- Handlers ---
  const handleDepositSubmit = async () => {
    if (!depositData.amount || !selectedMethod || !txHash || !depositScreenshot) {
      return alert("Fill all fields and upload screenshot");
    }
    setActionLoading(true);
    const res = await createDeposit(depositData.amount, txHash, selectedMethod._id, depositScreenshot);
    if (res?._id) {
      alert("Deposit submitted!");
      setDepositData({ amount: "" }); setTxHash(""); setSelectedMethod(null);
      setActiveTab("Overview");
      loadAllData();
    }
    setActionLoading(false);
  };

 const handleCreateScanner = async () => {
    // 1. Validation
    if (!uploadAmount || !selectedImage) return alert("Enter amount and select QR");

    setActionLoading(true);

    try {
      const res = await requestToPay(uploadAmount, selectedImage);

      if (res?._id) {
        // 2. Clear Data Immediately (UI Refresh)
        setUploadAmount(""); 
        setSelectedImage(null);
        
        // Reset the file input field visually if needed
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => { input.value = ""; });

        // 3. Trigger Toast/Success Message
        // Jar tu library use karat asshil tar: toast.success("Pay Request Created!");
        alert("🎉 Pay Request Created Successfully!");

        // 4. Navigation & Sync
        setActiveTab("PayRequests"); 
        loadAllData();
      } else {
        alert(res?.message || "Failed to create request");
      }
    } catch (error) {
      console.error("Post Error:", error);
      alert("Something went wrong while uploading.");
    } finally {
      setActionLoading(false);
    }
  };
const startScanner = () => {
  const qrCode = new Html5Qrcode("reader");

  qrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      setQrData(decodedText);

      qrCode.stop();
      setScannerActive(false);

      // 🔥 AUTO OPEN UPI APP
      if (decodedText.startsWith("upi://")) {
        window.location.href = decodedText;
      }
    },
    () => {}
  );

  setScannerActive(true);
};


  const handleConfirmPayment = async () => {
    if (!paymentScreenshot) return alert("Upload screenshot");
    setActionLoading(true);
    const res = await submitPayment(selectedScanner, paymentScreenshot);
    if (res) {
      alert("Proof submitted! Waiting for confirmation.");
      setSelectedScanner(null); setPaymentScreenshot(null);
      loadAllData();
    }
    setActionLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#051510] flex flex-col items-center justify-center text-[#00F5A0] font-black italic">
      <Loader className="animate-spin mb-4" size={40} />
      SYNCING...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#051510] text-white flex flex-col md:flex-row font-sans overflow-x-hidden">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0A1F1A] border-b border-white/5 sticky top-0 z-[100]">
        <div className="flex items-center gap-2">
          <Zap size={24} className="text-[#00F5A0]" />
          <span className="font-bold text-xl italic">CPay</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/5 rounded-lg">
          <Menu className="text-[#00F5A0]" />
        </button>
      </div>

      {/* SIDEBAR / MOBILE DRAWER */}
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[200] transition-opacity duration-300 md:hidden ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={() => setIsSidebarOpen(false)} />
      
      <aside className={`fixed md:relative inset-y-0 left-0 z-[210] w-72 bg-[#051510] border-r border-white/5 flex flex-col p-6 transition-transform duration-300 transform md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2 px-2">
            <div className="bg-[#00F5A0] p-1.5 rounded-lg text-[#051510]"><Zap size={20} /></div>
            <span className="text-2xl font-black italic">CPay</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2"><X size={24} /></button>
        </div>
        
        <nav className="flex-1 space-y-2">
          <SidebarLink icon={<LayoutGrid size={20} />} label="Overview" active={activeTab === "Overview"} onClick={() => { setActiveTab("Overview"); setIsSidebarOpen(false); }} />
          <SidebarLink icon={<ScanLine size={20} />} label="Scanner Queue" active={activeTab === "Scanner"} onClick={() => { setActiveTab("Scanner"); setIsSidebarOpen(false); }} />
{/* PAY REQUESTS WITH BADGE */}
          <SidebarLink 
            icon={<Clock size={20} />} 
            label="Pay Requests" 
            active={activeTab === "PayRequests"} 
            badge={activeRequestsCount}
            onClick={() => { setActiveTab("PayRequests"); setIsSidebarOpen(false); }} 
          />     
         <SidebarLink icon={<Wallet size={20} />} label="Deposit" active={activeTab === "Deposit"} onClick={() => { setActiveTab("Deposit"); setIsSidebarOpen(false); }} />
          <SidebarLink icon={<ArrowRightLeft size={20} />} label="History" active={activeTab === "History"} onClick={() => { setActiveTab("History"); setIsSidebarOpen(false); }} />
          <SidebarLink
  icon={<Zap size={20} />}
  label="Referral"
  active={activeTab === "Referral"}
  onClick={() => { setActiveTab("Referral"); setIsSidebarOpen(false); }}
/>

          <div className="pt-10 border-t border-white/5 mt-10">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-bold italic transition-all hover:bg-red-500/10 rounded-xl">
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto w-full">
        {/* DESKTOP HEADER */}
        <header className="hidden md:flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            {activeTab === "Scanner" ? "Scanner Queue" : activeTab === "PayRequests" ? "Pay Requests" : activeTab}
          </h1>
          <div className="flex items-center gap-4 bg-white/5 p-2 pr-6 rounded-full border border-white/10">
            <div className="w-10 h-10 rounded-full bg-[#00F5A0] text-black flex items-center justify-center font-black">{user.name.charAt(0)}</div>
            <div>
              <p className="text-xs font-bold">{user.name}</p>
              <p className="text-[8px] text-[#00F5A0] font-black italic uppercase tracking-widest">Active Node</p>
            </div>
          </div>
        </header>

        {activeTab === "Overview" && <OverviewPage wallets={wallets} transactions={transactions} setActiveTab={setActiveTab} />}

        {/* WORK STATION: RESPONSIVE CARDS */}
{activeTab === "Scanner" && (
  <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">

    {/* 🔥 TOP ROW - SELF PAY + CREATE REQUEST */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* ================= SELF PAY ================= */}
      <div className="bg-[#0A1F1A] border border-white/10 p-6 rounded-[2rem]">
        <h2 className="text-xl font-black text-[#00F5A0] mb-6 italic flex items-center gap-2">
          <Camera size={20} /> Self Pay
        </h2>

        {!qrData ? (
          <div className="space-y-4">
            <div id="reader" className="w-full max-w-xs mx-auto rounded-2xl overflow-hidden border border-white/10 bg-black aspect-square" />
            <button
              onClick={startScanner}
              className="w-full bg-[#00F5A0] text-black py-4 rounded-2xl font-black italic active:scale-95"
            >
              START CAMERA
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-black/40 p-4 rounded-xl text-xs break-all text-gray-400 border border-white/5">
              {qrData}
            </div>

            <input
              type="number"
              placeholder="Enter Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 font-bold outline-none text-lg"
            />

            <div className="flex gap-4">
              <button
                onClick={() => setQrData("")}
                className="flex-1 bg-white/5 py-4 rounded-2xl font-black"
              >
                RESET
              </button>

              <button
                onClick={async () => {
                  const res = await selfPay(amount);
                  alert(res.message);
                  setQrData("");
                  setAmount("");
                  loadAllData();
                }}
                className="flex-1 bg-[#00F5A0] text-black py-4 rounded-2xl font-black"
              >
                PAY NOW
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= CREATE PAY REQUEST ================= */}
      <div className="bg-[#0A1F1A] border border-white/10 p-6 rounded-[2rem]">
        <h2 className="text-xl font-black text-[#00F5A0] mb-6 italic flex items-center gap-2">
          <UploadCloud size={20} /> Create Your Pay Request
        </h2>

        <input
          type="number"
          placeholder="Enter Amount"
          value={uploadAmount}
          onChange={(e) => setUploadAmount(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 mb-6 font-bold outline-none text-lg"
        />
        <label className="block bg-black/40 border border-white/10 rounded-xl py-4 text-center cursor-pointer font-bold text-sm mb-4">
 Capture QR
  <input key={selectedImage ? 'has-image' : 'no-image'} type="file" accept="image/*" capture="environment" onChange={(e) => setSelectedImage(e.target.files[0])} className="hidden" /> </label>
        <label className="block bg-black/40 border border-white/10 rounded-xl py-4 text-center cursor-pointer font-bold text-sm mb-4">
          Upload QR Image
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedImage(e.target.files[0])}
            className="hidden"
          />
        </label>

        {selectedImage && (
          <img
            src={URL.createObjectURL(selectedImage)}
            className="w-full max-w-[180px] mx-auto rounded-xl border border-[#00F5A0] object-cover aspect-square mb-4"
            alt="preview"
          />
        )}

        <button
          onClick={handleCreateScanner}
          disabled={actionLoading}
          className={`w-full py-4 rounded-2xl font-black italic ${
            actionLoading
              ? "bg-gray-700 text-gray-400"
              : "bg-[#00F5A0] text-black"
          }`}
        >
          {actionLoading ? "UPLOADING..." : "POST TO Pay Requests"}
        </button>
      </div>
    </div>

    {/* 🔥 MY REQUESTS SECTION (User A chi requests) */}
    <div>
      <h2 className="text-lg font-black text-white/70 italic mb-4">
        My Pay Requests
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {scanners
          .filter((s) => String(s.user?._id) === String(user._id))
          .map((s) => (
            <RequestCard
              key={s._id}
              s={s}
              user={user}
              loadAllData={loadAllData}
              setSelectedScanner={setSelectedScanner}
            />
          ))}

        {scanners.filter((s) => String(s.user?._id) === String(user._id))
          .length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-600 font-black italic">
            No Requests Created
          </div>
        )}
      </div>
    </div>
  </div>
)}

        {/* Pay Requests: GRID FOR MOBILE */}
    {activeTab === "PayRequests" && (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in slide-in-from-bottom">
    {scanners
      .filter((s) => String(s.user?._id) !== String(user._id))
      .map((s) => (
        <RequestCard
          key={s._id}
          s={s}
          user={user}
          loadAllData={loadAllData}
          setSelectedScanner={setSelectedScanner}
        />
      ))}

    {scanners.filter((s) => String(s.user?._id) !== String(user._id))
      .length === 0 && (
      <div className="col-span-full text-center py-20 text-gray-600 font-black italic uppercase">
        No Pay Requests Available
      </div>
    )}
  </div>
)}


        {activeTab === "Deposit" && <DepositPage paymentMethods={paymentMethods} selectedMethod={selectedMethod} setSelectedMethod={setSelectedMethod} depositData={depositData} setDepositData={setDepositData} txHash={txHash} setTxHash={setTxHash} setDepositScreenshot={setDepositScreenshot} handleDepositSubmit={handleDepositSubmit} actionLoading={actionLoading} />}
        {activeTab === "History" && <HistoryPage transactions={transactions} />}
        {activeTab === "Referral" && (
  <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">

    <div className="bg-[#0A1F1A] border border-white/10 p-8 rounded-[2.5rem] text-center">
      <h2 className="text-2xl font-black text-[#00F5A0] italic mb-6">
        Your Referral Code
      </h2>

      <div className="flex items-center justify-center gap-3 bg-black/40 px-6 py-4 rounded-xl text-xl font-black tracking-widest">
        {referralData.referralCode}
        <button
          onClick={() => {
            navigator.clipboard.writeText(referralData.referralCode);
            alert("Copied!");
          }}
          className="text-[#00F5A0]"
        >
          <Copy size={18} />
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Share this code & earn passive income 🔥
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      <div className="bg-[#0A1F1A] border border-white/10 p-6 rounded-2xl">
        <p className="text-xs text-gray-500 uppercase font-bold mb-2">
          Total Referrals
        </p>
        <h3 className="text-3xl font-black italic">
          {referralData.totalReferrals}
        </h3>
      </div>

      <div className="bg-[#0A1F1A] border border-white/10 p-6 rounded-2xl">
        <p className="text-xs text-gray-500 uppercase font-bold mb-2">
          Referral Earnings
        </p>
        <h3 className="text-3xl font-black italic text-[#00F5A0]">
          ₹{Number(referralData.referralEarnings || 0).toFixed(2)}
        </h3>
      </div>

    </div>
  </div>
)}

        {/* Padding for Mobile thumb reach */}
        <div className="h-20 md:hidden" />
      </main>

      {/* MODAL: FULL SCREEN MOBILE OPTIMIZED */}
      {selectedScanner && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[300] p-4 backdrop-blur-sm">
          <div className="bg-[#0A1F1A] p-6 md:p-8 rounded-[2rem] w-full max-w-md border border-white/10 shadow-2xl">
            <h3 className="text-xl font-black text-[#00F5A0] mb-6 italic">Submit Transaction Proof</h3>
            <input type="file" accept="image/*" onChange={(e) => setPaymentScreenshot(e.target.files[0])} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 mb-6 text-sm" />
            <div className="flex gap-4">
              <button onClick={() => setSelectedScanner(null)} className="flex-1 bg-white/5 py-4 rounded-2xl font-black">CANCEL</button>
              <button onClick={async () => {
                if (!paymentScreenshot) return alert("Upload screenshot");
                setActionLoading(true);
                const res = await submitPayment(selectedScanner, paymentScreenshot);
                if (res) { alert("Proof submitted!"); setSelectedScanner(null); setPaymentScreenshot(null); loadAllData(); }
                setActionLoading(false);
              }} disabled={actionLoading} className="flex-1 bg-[#00F5A0] text-black py-4 rounded-2xl font-black">SUBMIT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= COMPONENT MODULES ================= */

const SidebarLink = ({ icon, label, active, onClick, badge }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all font-bold text-base ${active ? "bg-[#00F5A0]/10 text-[#00F5A0]" : "text-gray-400 hover:text-white"}`}>
    <div className="flex items-center gap-4">
      {icon} <span>{label}</span>
    </div>
    {badge > 0 && (
      <span className="bg-[#00F5A0] text-[#051510] text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse shadow-[0_0_10px_#00F5A0]">
        {badge}
      </span>
    )}
  </button>
);
const OverviewPage = ({ wallets, transactions, setActiveTab }) => {
  const usdt = wallets.find(w => w.type === "USDT")?.balance || 0;
  const inr = wallets.find(w => w.type === "INR")?.balance || 0;
  const cb = wallets.find(w => w.type === "CASHBACK")?.balance || 0;
  
  return (
    <div className="animate-in fade-in space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
     <WalletCard
            label="USDT Wallet"
            val={usdt.toFixed(2)}
            sub={`≈ ₹${(usdt * 90).toLocaleString()}`}
            trend="CRYPTO"
          />

          <WalletCard
            label="INR Wallet"
            val={`₹${inr.toLocaleString()}`}
            sub="Ready to spend"
            highlight
          />

          <WalletCard
            label="Cashback"
            val={`₹${cb.toLocaleString()}`}
            sub="Redeemable"
            claim
            onClaim={transferCashback}
          />

      </div>
      
      <div className="flex gap-4">
        <ActionButton icon={<PlusCircle />} label="Deposit" onClick={() => setActiveTab("Deposit")} />
        <ActionButton icon={<ScanLine />} label="Scanner Queue" primary onClick={() => setActiveTab("Scanner")} />
      </div>
      
      <div className="bg-[#0A1F1A] border border-white/10 rounded-[2rem] p-6 md:p-8">
        <h3 className="font-black italic mb-6">Recent Ledger</h3>
        <div className="space-y-2">
          {transactions.slice(0, 5).map(tx => (
            <TransactionRow key={tx._id} merchant={tx.type} date={new Date(tx.createdAt).toLocaleDateString()} amt={`₹${tx.amount}`} status="SUCCESS" />
          ))}
        </div>
      </div>
    </div>
  );
};

const RequestCard = ({ s, user, loadAllData, setSelectedScanner }) => {
  const isOwner = String(s.user?._id) === String(user._id);
  const statusColor = s.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' : 'bg-[#00F5A0]/10 text-[#00F5A0]';

  return (
    <div className="bg-[#0A1F1A] border border-white/10 p-5 rounded-[2rem] relative flex flex-col h-full">
      <div className={`absolute top-4 right-5 text-[10px] font-black uppercase px-2 py-1 rounded-full ${statusColor}`}>{s.status}</div>
      <div className="bg-white p-2 rounded-2xl mb-4 w-fit mx-auto">
        <img src={`https://cpay-backend.onrender.com${s.image}`} className="w-24 h-24 md:w-32 md:h-32 object-contain" alt="QR" />
      </div>
      <h3 className="text-2xl font-black text-center mb-1">₹{s.amount}</h3>
      <p className="text-center text-[10px] text-gray-500 font-bold mb-6 italic uppercase">Node: {s.user?.name}</p>

      <div className="mt-auto space-y-2">
        {isOwner ? (
          s.status === "PAYMENT_SUBMITTED" && (
            <div className="space-y-2">
              <button onClick={() => window.open(`https://cpay-backend.onrender.com${s.paymentScreenshot}`)} className="w-full text-[#00F5A0] text-xs font-bold underline py-2">VIEW PROOF</button>
              <button onClick={() => confirmRequest(s._id).then(loadAllData)} className="w-full bg-[#00F5A0] text-black py-3 rounded-xl font-black text-sm">CONFIRM RECEIPT</button>
            </div>
          )
        ) : (
          s.status === "ACTIVE" && <button onClick={() => acceptRequest(s._id).then(loadAllData)} className="w-full bg-[#00F5A0] text-black py-3 rounded-xl font-black italic text-sm">ACCEPT & PAY</button>
        )}
        {String(s.acceptedBy?._id) === String(user._id) && s.status === "ACCEPTED" && (
          <button onClick={() => setSelectedScanner(s._id)} className="w-full bg-blue-500 text-white py-3 rounded-xl font-black text-sm">UPLOAD SCREENSHOT</button>
        )}
      </div>
    </div>
  );
};

const DepositPage = ({ paymentMethods, selectedMethod, setSelectedMethod, depositData, setDepositData, txHash, setTxHash, setDepositScreenshot, handleDepositSubmit, actionLoading }) => (
  <div className="max-w-xl mx-auto bg-[#0A1F1A] border border-white/10 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem]">
    <h2 className="text-xl font-black italic text-[#00F5A0] mb-8 uppercase tracking-widest">Add Funds</h2>
    <div className="grid grid-cols-1 gap-3 mb-6">
      {paymentMethods.map(m => (
        <button key={m._id} onClick={() => setSelectedMethod(m)} className={`w-full p-4 rounded-xl border text-left transition-all ${selectedMethod?._id === m._id ? "border-[#00F5A0] bg-[#00F5A0]/10" : "border-white/10 bg-black/20"}`}>
          <p className="font-bold text-sm">{m.method}</p>
        </button>
      ))}
    </div>
    {selectedMethod && (
      <div className="p-4 bg-white/5 rounded-xl mb-6 text-[11px] font-mono text-gray-400 border border-white/5 break-all">
        <p className="text-[#00F5A0] font-black mb-2 uppercase">Protocol Info:</p>
        {selectedMethod.method === "UPI" && <><p>ID: {selectedMethod.details.upiId}</p><p>NM: {selectedMethod.details.name}</p></>}
        {selectedMethod.method === "BANK" && <><p>AC: {selectedMethod.details.accountNumber}</p><p>IF: {selectedMethod.details.ifsc}</p></>}
        {selectedMethod.method.includes("USDT") && <><p>AD: {selectedMethod.details.address}</p><p>NT: {selectedMethod.details.network}</p></>}
      </div>
    )}
    <input type="number" value={depositData.amount} onChange={e => setDepositData({ ...depositData, amount: e.target.value })} placeholder="Amount" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 mb-3 font-bold text-lg outline-none" />
    <input type="text" value={txHash} onChange={e => setTxHash(e.target.value)} placeholder="UTR / Tx ID" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 mb-4 font-bold outline-none" />
    <input type="file" onChange={e => setDepositScreenshot(e.target.files[0])} className="w-full mb-6 text-xs text-gray-500" />
    <button onClick={handleDepositSubmit} className="w-full bg-[#00F5A0] text-black py-5 rounded-2xl font-black italic active:scale-95 transition-transform">SUBMIT DEPOSIT</button>
  </div>
);

const HistoryPage = ({ transactions }) => (
  <div className="bg-[#0A1F1A] border border-white/10 p-4 md:p-8 rounded-[2rem]">
    <h2 className="text-xl font-bold mb-6 italic">History</h2>
    <div className="space-y-3">
      {transactions.map(tx => (
        <div key={tx._id} className="flex justify-between items-center p-4 bg-black/20 rounded-2xl border border-white/5">
          <div className="min-w-0 flex-1 mr-4">
            <p className="font-bold text-sm truncate">{tx.type}</p>
            <p className="text-[10px] text-gray-500 font-bold">{new Date(tx.createdAt).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="font-black italic text-sm">₹{tx.amount}</p>
            <p className="text-[8px] text-[#00F5A0] font-black uppercase tracking-widest italic">{tx.status || 'SUCCESS'}</p>
          </div>
        </div>
      ))}
      {transactions.length === 0 && <p className="text-center py-10 text-gray-600 font-bold">No Records Found</p>}
    </div>
  </div>
);

const WalletCard = ({ label, val, sub, highlight, claim, onClaim }) => (
  <div className={`p-6 md:p-8 rounded-[2rem] border ${highlight ? "bg-[#00F5A0] text-black shadow-[0_10px_30px_rgba(0,245,160,0.2)]" : "bg-[#0A1F1A] border-white/10"}`}>
    <p className={`text-[10px] font-black uppercase mb-4 ${highlight ? "text-black/50" : "text-gray-500"}`}>{label}</p>
    <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter">{val}</h3>
    <p className="text-[10px] font-bold opacity-60 italic">{sub}</p>
    {claim && <button onClick={onClaim} className="mt-4 text-[9px] font-black bg-white/20 px-3 py-1 rounded-full uppercase">Redeem</button>}
  </div>
);

const TransactionRow = ({ merchant, date, amt, status }) => (
  <div className="flex justify-between items-center p-3 hover:bg-white/5 rounded-2xl transition-colors">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#00F5A0]/10 flex items-center justify-center text-[#00F5A0]"><CheckCircle size={14} /></div>
      <div className="min-w-0">
        <p className="text-sm font-bold truncate">{merchant}</p>
        <p className="text-[9px] text-gray-500 font-bold">{date}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm font-black italic">{amt}</p>
      <p className="text-[8px] text-[#00F5A0] font-black uppercase italic tracking-widest">{status}</p>
    </div>
  </div>
);

const ActionButton = ({ icon, label, primary, onClick }) => (
  <button onClick={onClick} className={`flex-1 py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black flex items-center justify-center gap-3 border transition-all active:scale-95 ${primary ? "bg-[#00F5A0] text-black border-transparent" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
    <div className={primary ? "" : "text-[#00F5A0]"}>{icon}</div>
    <span className="text-xs md:text-sm italic">{label}</span>
  </button>
);