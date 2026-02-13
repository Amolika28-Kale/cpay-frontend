import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Bell, LayoutGrid, ArrowRightLeft,
  Wallet, PieChart, Settings, HelpCircle, PlusCircle,
  Repeat, ScanLine, CheckCircle, LogOut, X, Info,
  UploadCloud, Check, Clock, User, Menu, Loader,
  Zap, AlertCircle
} from "lucide-react";
import {
  getWallets,
  getTransactions,
  createDeposit,
  createScanner,
  getActiveScanners,
  payScanner,
  transferCashback,
  convertUsdtToInr,
  getActivePaymentMethods,
  confirmScannerPayment,
  getCurrentRate, 
  selfPay
} from "../services/apiService";


export default function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Data State
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [scanners, setScanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Form States
  const [depositData, setDepositData] = useState({ amount: "", network: "TRC20" });
  const [convertAmount, setConvertAmount] = useState("");
  const [uploadAmount, setUploadAmount] = useState("");

  const [paymentMethods, setPaymentMethods] = useState([]);
const [selectedMethod, setSelectedMethod] = useState(null);
const [txHash, setTxHash] = useState("");
const [selectedImage, setSelectedImage] = useState(null);
const [selectedScanner, setSelectedScanner] = useState(null);
const [paymentMode, setPaymentMode] = useState("INR");
const [paymentScreenshot, setPaymentScreenshot] = useState(null);

const [depositScreenshot, setDepositScreenshot] = useState(null);
const [showSelfPay, setShowSelfPay] = useState(false);
const [qrData, setQrData] = useState("");
const [amount, setAmount] = useState("");
const [scannerActive, setScannerActive] = useState(false);


  const user = JSON.parse(localStorage.getItem("user")) || { name: "User" };

  // --- Sync Logic ---
  const loadAllData = async () => {
    try {
const [w, t, s, pm] = await Promise.all([
  getWallets(),
  getTransactions(),
  getActiveScanners(),
  getActivePaymentMethods()
]);

setWallets(w);
setTransactions(t);
setScanners(s);
setPaymentMethods(pm);

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
  if (!depositData.amount) return alert("Enter amount");
  if (!selectedMethod) return alert("Select payment method");
  if (!txHash) return alert("Enter transaction hash");

  setActionLoading(true);

if (!depositScreenshot) return alert("Upload payment screenshot");

const res = await createDeposit(
  depositData.amount,
  txHash,
  selectedMethod._id,
  depositScreenshot
);


  if (res?._id) {
    alert("Deposit submitted successfully!");
    setDepositData({ amount: "" });
    setTxHash("");
    setSelectedMethod(null);
    setActiveTab("Overview");
  } else {
    alert(res.message || "Error occurred");
  }

  setActionLoading(false);
};


  const handleConversion = async () => {
    if (!convertAmount || convertAmount <= 0) return alert("Enter valid amount");
    setActionLoading(true);
    const res = await convertUsdtToInr(convertAmount);
    if (res) {
      alert("Conversion Successful!");
      setConvertAmount("");
      loadAllData();
      setActiveTab("Overview");
    }
    setActionLoading(false);
  };

  const handleRedeemCashback = async () => {
    const cb = wallets.find(w => w.type === 'CASHBACK')?.balance || 0;
    if (cb <= 0) return alert("No balance to redeem");
    setActionLoading(true);
    await transferCashback(cb);
    alert("Cashback moved to INR wallet!");
    loadAllData();
    setActionLoading(false);
  };
const getTimeLeft = (expiry) => {
  const diff = new Date(expiry) - new Date();
  if (diff <= 0) return "Expired";

  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  return `${mins}m ${secs}s`;
};

const handlePayClick = async (scannerId, mode) => {
  setActionLoading(true);

  const res = await payScanner(scannerId, mode);

 if (res?.message && !res._id)
 {
    alert(res.message);
    setSelectedScanner(scannerId);
    setPaymentMode(mode);
  } else {
    alert("Unable to lock scanner");
  }

  setActionLoading(false);
};


const handleConfirmPayment = async () => {
  if (!paymentScreenshot)
    return alert("Upload payment screenshot");

  setActionLoading(true);

  const confirmRes = await confirmScannerPayment(
    selectedScanner,
    paymentScreenshot
  );

  if (confirmRes?.cashbackEarned !== undefined) {
    alert(
      `Payment Successful 🎉\nCashback Earned: ₹${confirmRes.cashbackEarned}`
    );
  } else {
    alert(confirmRes?.message || "Something went wrong");
  }

  setSelectedScanner(null);
  setPaymentScreenshot(null);
  loadAllData();
  setActionLoading(false);
};


const handleCreateScanner = async () => {
  if (!uploadAmount || uploadAmount <= 0)
    return alert("Enter valid amount");

  if (!selectedImage)
    return alert("Select QR image");

  setActionLoading(true);

  const res = await createScanner(uploadAmount, selectedImage);

  if (res?._id) {
    alert("Scanner created successfully!");
    setUploadAmount("");
    setSelectedImage(null);
    loadAllData();
  } else {
    alert(res?.message || "Error creating scanner");
  }

  setActionLoading(false);
};

const startScanner = () => {
  const qrCode = new Html5Qrcode("reader");

  qrCode.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: 250
    },
    (decodedText) => {
      setQrData(decodedText);
      qrCode.stop();
      setScannerActive(false);
    },
    (errorMessage) => {}
  );

  setScannerActive(true);
};

  // --- Sub-Pages ---
  const OverviewPage = () => {
    const usdt = wallets.find(w => w.type === 'USDT')?.balance || 0;
    const inr = wallets.find(w => w.type === 'INR')?.balance || 0;
    const cb = wallets.find(w => w.type === 'CASHBACK')?.balance || 0;

    return (
      <div className="animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <WalletCard label="USDT Wallet" val={usdt.toFixed(2)} sub={`≈ ₹${(usdt * 90).toLocaleString()}`} trend="CRYPTO" />
          <WalletCard label="INR Wallet" val={`₹${inr.toLocaleString()}`} sub="Ready to spend" highlight />
          <WalletCard label="Cashback" val={`₹${cb.toLocaleString()}`} sub="Redeemable" claim onClaim={handleRedeemCashback} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-10">
          <ActionButton icon={<PlusCircle size={24}/>} label="Deposit" onClick={() => setActiveTab("Deposit")} />
          <ActionButton icon={<Repeat size={24}/>} label="Convert" onClick={() => setActiveTab("Convert")} />
          <ActionButton icon={<ScanLine size={24}/>} label="Pay Scanner" primary onClick={() => setActiveTab("Scanner")} />
          <ActionButton
  icon={<Wallet size={24}/>}
  label="Self Pay"
  onClick={() => {
    const amount = prompt("Enter Amount to Pay");
    if (amount) {
      selfPay(amount).then((res) => {
        alert(res.message);
        loadAllData();
      });
    }
  }}
/>

        </div>

        <div className="lg:col-span-2 bg-[#0A1F1A] border border-white/10 rounded-[2.5rem] p-6 md:p-8">
            <h3 className="text-xl font-bold mb-8 italic">Recent Activity</h3>
            <div className="space-y-1">
              {transactions.slice(0, 5).map(tx => (
                <TransactionRow key={tx._id} merchant={tx.type} date={new Date(tx.createdAt).toLocaleDateString()} amt={`₹${tx.amount}`} status="SUCCESS" />
              ))}
              {transactions.length === 0 && <p className="text-gray-600 text-center py-10 uppercase text-xs font-black">No history found</p>}
            </div>
        </div>
      </div>
    );
  };

  const ConvertPage = () => {
    const usdt = wallets.find(w => w.type === 'USDT')?.balance || 0;
    const [rate, setRate] = useState(90);

useEffect(() => {
  const loadRate = async () => {
    const r = await getCurrentRate();
    if (r?.rate) setRate(r.rate); setRate(r.usdtToInr);
  };
  loadRate();
}, []);

    return (
        <div className="max-w-xl mx-auto bg-[#0A1F1A] border border-white/10 rounded-[2.5rem] p-10 text-center animate-in zoom-in duration-300">
            <h2 className="text-3xl font-black italic mb-2 text-[#00F5A0]">Swap USDT</h2>
<p className="text-gray-500 mb-10 font-bold uppercase text-[10px] tracking-widest">
  Rate: 1 USDT = ₹{rate}
</p>
            <div className="bg-black/20 p-8 rounded-3xl border border-white/5 space-y-4 mb-8 text-left">
                <p className="text-[10px] font-black text-gray-500 uppercase">Available: {usdt.toFixed(2)} USDT</p>
                <div className="flex justify-between items-center">
                    <input type="number" value={convertAmount} onChange={(e)=>setConvertAmount(e.target.value)} placeholder="0.00" className="bg-transparent text-4xl font-black text-white focus:outline-none w-2/3" />
                    <span className="font-bold text-blue-400">USDT</span>
                </div>
                <div className="h-px bg-white/5"></div>
                <div className="flex justify-between items-center">
                    <p className="text-2xl font-black text-[#00F5A0]">₹{(convertAmount * rate).toLocaleString()}</p>
                    <span className="font-bold text-gray-600">INR</span>
                </div>
            </div>
            <button onClick={handleConversion} disabled={actionLoading} className="w-full bg-[#00F5A0] text-[#051510] py-5 rounded-2xl font-black italic shadow-lg hover:scale-[1.02] transition-all">
                {actionLoading ? "PROCESSING..." : "CONVERT NOW"}
            </button>
        </div>
    )
  }

  const HistoryPage = () => (
    <div className="bg-[#0A1F1A] border border-white/10 rounded-[2.5rem] overflow-hidden animate-in slide-in-from-bottom duration-500">
        <div className="p-8 border-b border-white/5"><h3 className="text-xl font-bold">Transaction History</h3></div>
        <div className="p-4 space-y-2">
            {transactions.map(tx => (
                <div key={tx._id} className="bg-black/20 p-5 rounded-2xl flex justify-between items-center border border-white/5">
                    <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 rounded-full bg-[#00F5A0]/10 flex items-center justify-center text-[#00F5A0]"><Clock size={18}/></div>
                        <div>
                            <p className="font-bold text-sm">{tx.type}</p>
                            <p className="text-[10px] text-gray-500 font-bold">{new Date(tx.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-black text-white italic">₹{tx.amount}</p>
                        <p className="text-[8px] font-black text-[#00F5A0] uppercase tracking-widest italic">{tx.status || 'Success'}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
  )

  if (loading) return (
    <div className="min-h-screen bg-[#051510] flex flex-col items-center justify-center gap-4 text-[#00F5A0] font-black italic">
        <Loader className="animate-spin" size={40} />
        SYNCING WALLETS...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#051510] text-white flex flex-col md:flex-row font-sans">
      
      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#051510] sticky top-0 z-[100]">
        <div className="flex items-center gap-2"><Zap size={20} className="text-[#00F5A0]" /><span className="font-black italic text-xl">CPay</span></div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-[#00F5A0]"><Menu /></button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[150] w-64 bg-[#051510] border-r border-white/5 flex flex-col p-6 transition-transform md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0 shadow-2xl shadow-black" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2 px-2 cursor-pointer" onClick={() => {setActiveTab("Overview"); setIsSidebarOpen(false);}}>
            <div className="bg-[#00F5A0] p-1.5 rounded-lg text-[#051510] shadow-[0_0_20px_rgba(0,245,160,0.3)]"><Zap size={20} /></div>
            <span className="text-2xl font-black italic tracking-tighter">CPay</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500"><X /></button>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink icon={<LayoutGrid size={20}/>} label="Overview" active={activeTab === "Overview"} onClick={() => { setActiveTab("Overview"); setIsSidebarOpen(false); }} />
          <SidebarLink icon={<ScanLine size={20}/>} label="Scanner Queue" active={activeTab === "Scanner"} onClick={() => { setActiveTab("Scanner"); setIsSidebarOpen(false); }} />
          <SidebarLink icon={<Wallet size={20}/>} label="Deposit Funds" active={activeTab === "Deposit"} onClick={() => { setActiveTab("Deposit"); setIsSidebarOpen(false); }} />
          <SidebarLink icon={<ArrowRightLeft size={20}/>} label="History" active={activeTab === "History"} onClick={() => { setActiveTab("History"); setIsSidebarOpen(false); }} />
          <SidebarLink icon={<Repeat size={20}/>} label="Convert" active={activeTab === "Convert"} onClick={() => { setActiveTab("Convert"); setIsSidebarOpen(false); }} />
          <div className="pt-10 border-t border-white/5 mt-10">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-bold text-sm hover:bg-red-500/5 rounded-xl italic transition-all"><LogOut size={20} /> Sign Out</button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto min-h-screen">
        <header className="hidden md:flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black tracking-tight uppercase italic">{activeTab}</h1>
          <div className="flex items-center gap-6 bg-white/5 p-1 pr-4 rounded-full border border-white/10">
              <div className="w-9 h-9 rounded-full bg-[#00F5A0]/20 flex items-center justify-center text-[#00F5A0] font-black">{user.name.charAt(0)}</div>
              <div><p className="text-xs font-bold">{user.name}</p><p className="text-[8px] font-black text-[#00F5A0] uppercase tracking-widest italic">VERIFIED USER</p></div>
          </div>
        </header>

        {activeTab === "Overview" && <OverviewPage />}
        {activeTab === "Convert" && <ConvertPage />}
        {activeTab === "History" && <HistoryPage />}
{activeTab === "Scanner" && (
  <div className="max-w-5xl mx-auto space-y-10">

    {/* CREATE SCANNER */}
<div className="bg-[#0A1F1A] border border-white/10 p-8 rounded-[2.5rem]">
  <h2 className="text-2xl font-black text-[#00F5A0] mb-6 italic">
    Create Scanner
  </h2>

  <input
    type="number"
    placeholder="Enter Amount"
    value={uploadAmount}
    onChange={(e) => setUploadAmount(e.target.value)}
    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-white font-bold outline-none mb-6"
  />

  <div className="space-y-4">

    <label className="w-full block bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-white font-bold cursor-pointer text-center">
      📷 Capture Photo
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => setSelectedImage(e.target.files[0])}
        className="hidden"
      />
    </label>

    <label className="w-full block bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-white font-bold cursor-pointer text-center">
      ⬆ Upload from Gallery
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setSelectedImage(e.target.files[0])}
        className="hidden"
      />
    </label>

  </div>

  {selectedImage && (
    <div className="mt-4">
      <img
        src={URL.createObjectURL(selectedImage)}
        alt="Preview"
        className="w-40 h-40 mx-auto rounded-xl object-cover"
      />
    </div>
  )}

  <button
    onClick={handleCreateScanner}
    disabled={actionLoading}
    className="w-full mt-6 bg-[#00F5A0] text-[#051510] py-4 rounded-2xl font-black italic"
  >
    {actionLoading ? "UPLOADING..." : "CREATE SCANNER"}
  </button>
</div>


    {/* ACTIVE SCANNERS */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {scanners.map((s) => {

const isOwner = String(s.user?._id) === String(user._id);
        const isPending = s.status === "PENDING_CONFIRMATION";
        const isPaid = s.status === "PAID";

        return (
          <div
            key={s._id}
            className="bg-[#0A1F1A] border border-white/10 p-8 rounded-[2.5rem] relative"
          >

            {isPaid && (
              <div className="absolute top-4 right-4 text-green-400 text-xs font-black">
                PAID
              </div>
            )}

            <img
              src={`https://cpay-backend.onrender.com${s.image}`}
              alt="QR"
              className="w-40 h-40 mx-auto mb-4 rounded-xl"
            />

            <h3 className="text-3xl font-black text-center mb-2">
              ₹{s.amount}
            </h3>

            <p className="text-center text-xs text-gray-400 mb-4">
              Expires in: {getTimeLeft(s.expiresAt)}
            </p>

            {isOwner && (
              <div className="text-center text-gray-500 text-sm">
                Your Scanner
              </div>
            )}

            {!isOwner && !isPending && !isPaid && (
              <>
                <button
                  onClick={() => handlePayClick(s._id, "INR")}
                  className="w-full bg-[#00F5A0] text-[#051510] py-3 rounded-xl font-black mb-2"
                >
                  Pay Using INR
                </button>

                <button
                  onClick={() => handlePayClick(s._id, "CASHBACK")}
                  className="w-full bg-white/10 text-white py-3 rounded-xl font-black"
                >
                  Pay Using Cashback
                </button>
              </>
            )}

            {isPending && s.paidBy === user._id && (
              <div className="text-yellow-400 text-sm text-center font-bold">
                Waiting for confirmation...
              </div>
            )}
          </div>
        );
      })}

      {scanners.length === 0 && (
        <div className="col-span-full text-center text-gray-500">
          No scanners in queue
        </div>
      )}
    </div>

    {/* PAYMENT MODAL */}
    {selectedScanner && (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200]">
        <div className="bg-[#0A1F1A] p-8 rounded-3xl w-[400px] border border-white/10 space-y-6">

          <h3 className="text-xl font-black text-[#00F5A0] italic">
            Confirm Payment
          </h3>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPaymentScreenshot(e.target.files[0])}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white"
          />

          <button
            onClick={handleConfirmPayment}
            disabled={actionLoading}
            className="w-full bg-[#00F5A0] text-[#051510] py-3 rounded-xl font-black"
          >
            {actionLoading ? "PROCESSING..." : "CONFIRM PAYMENT"}
          </button>

          <button
            onClick={() => setSelectedScanner(null)}
            className="w-full bg-white/10 text-white py-3 rounded-xl font-black"
          >
            Cancel
          </button>
        </div>
      </div>
    )}
  </div>
)}



   {activeTab === "Deposit" && (
  <div className="max-w-xl mx-auto bg-[#0A1F1A] border border-white/10 rounded-[2.5rem] p-10">
    <h2 className="text-2xl font-black italic text-[#00F5A0] mb-8 uppercase">
      Deposit Funds
    </h2>

    {/* Select Payment Method */}
    <div className="space-y-4 mb-6">
      <p className="text-xs font-bold text-gray-500 uppercase">
        Select Payment Method
      </p>

      {paymentMethods.map((method) => (
        <button
          key={method._id}
          onClick={() => setSelectedMethod(method)}
          className={`w-full p-4 rounded-xl border text-left ${
            selectedMethod?._id === method._id
              ? "border-[#00F5A0] bg-[#00F5A0]/10"
              : "border-white/10 bg-black/20"
          }`}
        >
          <p className="font-bold">{method.method}</p>
        </button>
      ))}
    </div>

    {/* Show Dynamic Details */}
    {selectedMethod && (
      <div className="p-4 bg-[#00F5A0]/5 border border-[#00F5A0]/20 rounded-xl mb-6 text-xs">
        <p className="font-black text-gray-400 mb-2 uppercase">
          Payment Details
        </p>

        {selectedMethod.method === "UPI" && (
          <>
            <p>UPI ID: {selectedMethod.details.upiId}</p>
            <p>Name: {selectedMethod.details.name}</p>
          </>
        )}

        {selectedMethod.method === "BANK" && (
          <>
            <p>Account: {selectedMethod.details.accountNumber}</p>
            <p>IFSC: {selectedMethod.details.ifsc}</p>
            <p>Bank: {selectedMethod.details.bankName}</p>
          </>
        )}

        {selectedMethod.method.includes("USDT") && (
          <>
            <p>Address: {selectedMethod.details.address}</p>
            <p>Network: {selectedMethod.details.network}</p>
          </>
        )}
      </div>
    )}

    {/* Amount */}
    <input
      type="number"
      value={depositData.amount}
      onChange={(e) =>
        setDepositData({ ...depositData, amount: e.target.value })
      }
      placeholder="Enter Amount"
      className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-white font-bold outline-none mb-4"
    />

    {/* Transaction Hash */}
    <input
      type="text"
      value={txHash}
      onChange={(e) => setTxHash(e.target.value)}
      placeholder="Enter Transaction Hash / UTR"
      className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-white font-bold outline-none mb-6"
    />
<input
  type="file"
  accept="image/*"
  onChange={(e) => setDepositScreenshot(e.target.files[0])}
  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-white font-bold outline-none mb-6"
/>

    <button
      onClick={handleDepositSubmit}
      disabled={actionLoading}
      className="w-full bg-[#00F5A0] text-[#051510] py-4 rounded-2xl font-black italic shadow-lg"
    >
      {actionLoading ? "PROCESSING..." : "SUBMIT DEPOSIT"}
    </button>
  </div>
)}

      </main>
     
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[140] md:hidden" onClick={()=>setIsSidebarOpen(false)} />}
   {showSelfPay && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="bg-[#0A1F1A] p-6 rounded-3xl w-full max-w-md border border-white/10">

      <h2 className="text-xl font-bold text-[#00F5A0] mb-4">
        Scan & Pay
      </h2>

      {!qrData && (
        <div>
          <div id="reader" className="w-full rounded-xl overflow-hidden mb-4" />
          {!scannerActive && (
            <button
              onClick={startScanner}
              className="w-full bg-[#00F5A0] text-black py-3 rounded-xl font-bold"
            >
              Start Camera
            </button>
          )}
        </div>
      )}

      {qrData && (
        <>
          <div className="bg-black/40 p-3 rounded-xl text-xs break-all mb-4">
            {qrData}
          </div>

          <input
            type="number"
            placeholder="Enter Amount (INR)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 mb-4"
          />

          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowSelfPay(false);
                setQrData("");
              }}
              className="flex-1 bg-red-500 py-3 rounded-xl font-bold"
            >
              Cancel
            </button>

            <button
              onClick={async () => {
                const res = await selfPay(amount, qrData);
                alert(res.message);
                setShowSelfPay(false);
                setQrData("");
                setAmount("");
              }}
              className="flex-1 bg-[#00F5A0] text-black py-3 rounded-xl font-bold"
            >
              Pay Now
            </button>
          </div>
        </>
      )}
    </div>
  </div>
)}

    </div>
    
  );
  
}

/* ================= COMPONENT: HELPERS ================= */

const SidebarLink = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${active ? 'bg-[#00F5A0]/10 text-[#00F5A0]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
    {icon} <span>{label}</span>
  </button>
);

const WalletCard = ({ label, val, sub, highlight, claim, onClaim }) => (
  <div className={`p-8 rounded-[2.5rem] relative overflow-hidden border ${highlight ? 'bg-[#00F5A0] text-[#051510] border-transparent shadow-[0_20px_50px_rgba(0,245,160,0.15)]' : 'bg-[#0A1F1A] border-white/10'}`}>
    <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${highlight ? 'text-black/60' : 'text-gray-500'}`}>{label}</p>
    <div className="space-y-1"><h3 className="text-3xl md:text-4xl font-black tracking-tighter italic">{val}</h3><p className={`text-xs font-bold ${highlight ? 'text-black/70' : 'text-gray-500'}`}>{sub}</p></div>
    {claim && <button onClick={onClaim} className="absolute bottom-8 right-8 text-[9px] font-black bg-[#00F5A0]/10 text-[#00F5A0] px-3 py-1.5 rounded-full border border-[#00F5A0]/30 uppercase hover:bg-[#00F5A0] hover:text-[#051510] transition-colors">Redeem</button>}
    {highlight && <CheckCircle size={20} className="absolute top-8 right-8 opacity-30" />}
  </div>
);

const TransactionRow = ({ merchant, date, amt, status }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.02] transition-all">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#00F5A0]"><CheckCircle size={18}/></div>
      <div><p className="font-bold text-sm italic">{merchant}</p><p className="text-[9px] text-gray-500 font-bold italic tracking-widest">{date}</p></div>
    </div>
    <div className="text-right"><p className="font-black text-white italic">{amt}</p><p className="text-[8px] font-black text-[#00F5A0] uppercase tracking-widest italic">{status}</p></div>
  </div>
);

const ActionButton = ({ icon, label, primary, onClick }) => (
  <button onClick={onClick} className={`${primary ? "bg-[#00F5A0] text-[#051510] shadow-[0_0_40px_rgba(0,245,160,0.2)]" : "bg-white/5 border border-white/10 hover:bg-white/10"} py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 transition-all active:scale-95`}>
    <div className={`p-2 rounded-full ${primary ? "bg-[#051510]/10" : "bg-[#00F5A0]/20 text-[#00F5A0]"}`}>{icon}</div>
    <span className="text-sm italic">{label}</span>
  </button>
);

const StatProgress = ({ label, val, percent }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-end"><p className="text-xs font-bold text-gray-500 uppercase italic tracking-widest">{label}</p><p className="font-black text-[#00F5A0] italic tracking-tighter">{val}</p></div>
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-[#00F5A0] rounded-full shadow-[0_0_10px_#00F5A0]" style={{ width: `${percent}%` }}></div></div>
  </div>
);