import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid, ArrowRightLeft, Wallet, ScanLine, CheckCircle,
  LogOut, X, Clock, Menu, Loader, Zap, PlusCircle, Camera, UploadCloud, Bell
} from "lucide-react";

import {
  getWallets, getTransactions, createDeposit, transferCashback,
  getActivePaymentMethods, selfPay, requestToPay, getActiveRequests,
  acceptRequest, submitPayment, confirmRequest,
} from "../services/apiService";
import { getReferralStats } from "../services/authService";
import { Copy } from "lucide-react";
import toast from 'react-hot-toast';
import { Html5Qrcode } from "html5-qrcode";
import QRCode from 'react-qr-code';

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
  
  // Refs for notifications
  const prevActiveCount = useRef(0);
  const prevWalletsRef = useRef({});
  const prevTransactionsRef = useRef([]);
  
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
  
  // Timer related states
  const [requestTimer, setRequestTimer] = useState(null);
  const [timerExpired, setTimerExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  const user = JSON.parse(localStorage.getItem("user")) || { 
    name: "User",
    mobile: "XXXXXXXXXX"
  };
  
  // Calculate counts
  const activeRequestsCount = scanners.filter(s => s.status === "ACTIVE" && String(s.user?._id) !== String(user._id)).length;
  const myActiveRequestsCount = scanners.filter(s => s.status === "ACTIVE" && String(s.user?._id) === String(user._id) && !s.acceptedBy).length;

  // Play notification sound
  const playNotificationSound = (type = 'new') => {
    const sounds = {
      new: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
      success: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
      cashback: "https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3"
    };
    const audio = new Audio(sounds[type] || sounds.new);
    audio.play().catch(err => console.log("Audio play blocked by browser"));
  };

  // Check for new active requests
  useEffect(() => {
    if (activeRequestsCount > prevActiveCount.current) {
      playNotificationSound('new');
      toast.success(
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-[#00F5A0]" />
          <div>
            <div className="font-bold">New Pay Request! 🎯</div>
            <div className="text-xs text-gray-400">{activeRequestsCount} requests available</div>
          </div>
        </div>,
        { 
          duration: 5000,
          style: {
            background: '#0A1F1A',
            color: 'white',
            border: '1px solid #00F5A0/20'
          }
        }
      );
    }
    prevActiveCount.current = activeRequestsCount;
  }, [activeRequestsCount]);

  // Check for wallet changes (cashback, credits, debits)
  useEffect(() => {
    if (wallets.length > 0) {
      wallets.forEach(wallet => {
        const prevBalance = prevWalletsRef.current[wallet.type] || 0;
        const currentBalance = wallet.balance;
        
        if (currentBalance > prevBalance && prevBalance !== 0) {
          const difference = (currentBalance - prevBalance).toFixed(2);
          
          if (wallet.type === 'CASHBACK') {
            playNotificationSound('cashback');
            toast.success(
              <div className="flex items-center gap-2">
                <Zap size={20} className="text-[#00F5A0]" />
                <div>
                  <div className="font-bold">Cashback Received! 🎉</div>
                  <div className="text-xs text-[#00F5A0]">+₹{difference} added</div>
                </div>
              </div>,
              { 
                duration: 1000,
                style: {
                  background: '#0A1F1A',
                  color: 'white',
                  border: '1px solid #00F5A0/20'
                }
              }
            );
          } else if (wallet.type === 'INR') {
            playNotificationSound('success');
            toast.success(
              <div className="flex items-center gap-2">
                <Wallet size={20} className="text-green-500" />
                <div>
                  <div className="font-bold">INR Wallet Updated</div>
                  <div className="text-xs text-green-500">+₹{difference} credited</div>
                </div>
              </div>,
              { duration: 2000 }
            );
          } else if (wallet.type === 'USDT') {
            playNotificationSound('success');
            toast.success(
              <div className="flex items-center gap-2">
                <Wallet size={20} className="text-blue-500" />
                <div>
                  <div className="font-bold">USDT Wallet Updated</div>
                  <div className="text-xs text-blue-500">+{difference} USDT</div>
                </div>
              </div>,
              { duration: 2000 }
            );
          }
        }
        
        prevWalletsRef.current[wallet.type] = currentBalance;
      });
    }
  }, [wallets]);

  // Check for new transactions
  useEffect(() => {
    if (transactions.length > prevTransactionsRef.current.length) {
      const newTransactions = transactions.slice(0, transactions.length - prevTransactionsRef.current.length);
      
      newTransactions.forEach(tx => {
        if (tx.type === 'CREDIT' || tx.type === 'DEBIT') {
          playNotificationSound('success');
          toast(
            <div className="flex items-center gap-2">
              {tx.type === 'CREDIT' ? (
                <ArrowRightLeft size={20} className="text-green-500" />
              ) : (
                <ArrowRightLeft size={20} className="text-red-500" />
              )}
              <div>
                <div className="font-bold">{tx.type} Transaction</div>
                <div className="text-xs">₹{tx.amount} • {tx.fromWallet} → {tx.toWallet}</div>
              </div>
            </div>,
            { 
              duration: 2000,
              style: {
                background: '#0A1F1A',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)'
              }
            }
          );
        }
      });
    }
    prevTransactionsRef.current = transactions;
  }, [transactions]);

  const loadAllData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("Sync aborted: No token found");
        return;
      }

      const [w, t, s, pm, ref] = await Promise.all([
        getWallets(),
        getTransactions(),
        getActiveRequests(),
        getActivePaymentMethods(),
        getReferralStats(token),
      ]);

      setWallets(w || []);
      setTransactions(t || []);
      setScanners(s || []);
      setPaymentMethods(pm || []);
      
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
    
    return () => {
      clearInterval(interval);
      if (window.currentScanner) {
        window.currentScanner.stop().catch(() => {});
        window.currentScanner = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (requestTimer) {
        clearTimeout(requestTimer);
      }
    };
  }, [requestTimer]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth");
  };

  const handleDepositSubmit = async () => {
    if (!depositData.amount || !selectedMethod || !txHash || !depositScreenshot) {
      toast.error("Please fill all fields and upload screenshot");
      return;
    }
    
    setActionLoading(true);
    const toastId = toast.loading('Submitting deposit...');
    
    const res = await createDeposit(depositData.amount, txHash, selectedMethod._id, depositScreenshot);
    if (res?._id) {
      toast.dismiss(toastId);
      toast.success(
        <div>
          <div className="font-bold">Deposit Submitted! 📥</div>
          <div className="text-sm text-[#00F5A0] mt-1">
            Amount: ₹{depositData.amount}
          </div>
        </div>,
        { duration: 5000 }
      );
      
      setDepositData({ amount: "" }); 
      setTxHash(""); 
      setSelectedMethod(null);
      loadAllData();
    } else {
      toast.dismiss(toastId);
      toast.error("Deposit submission failed");
    }
    setActionLoading(false);
  };

  const handleCreateScanner = async () => {
    if (!uploadAmount || !selectedImage) {
      toast.error("Please enter amount and select QR image");
      return;
    }

    setActionLoading(true);
    const toastId = toast.loading('Creating pay request...');

    try {
      const res = await requestToPay(uploadAmount, selectedImage);
      
      if (res?.scanner?._id) {
        toast.dismiss(toastId);
        toast.success(
          <div>
            <div className="font-bold">Pay Request Created! 🎉</div>
            <div className="text-sm text-[#00F5A0] mt-1">
              Amount: ₹{uploadAmount}
            </div>
          </div>,
          { duration: 5000 }
        );
        
        setUploadAmount(""); 
        setSelectedImage(null);
        
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => { input.value = ""; });

        setTimerExpired(false);
        setTimeLeft(300);
        
        const timer = setTimeout(() => {
          setTimerExpired(true);
          toast.error('Request expired! No one accepted within 5 minutes.', {
            duration: 5000,
            icon: '⏰'
          });
        }, 300000);
        
        setRequestTimer(timer);

        setActiveTab("Scanner"); 
        loadAllData();
      } else {
        toast.dismiss(toastId);
        toast.error(res?.message || "Failed to create request");
      }
    } catch (error) {
      console.error("Post Error:", error);
      toast.dismiss(toastId);
      toast.error(error?.response?.data?.message || "Something went wrong while uploading");
    } finally {
      setActionLoading(false);
    }
  };

  const downloadQR = (s) => {
    const imageUrl = `https://cpay-backend.onrender.com${s.image}`;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `QR-${s.amount}-${s._id.slice(-4)}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('QR Code Downloaded!', {
      duration: 3000,
      icon: '📥',
      style: {
        background: '#00F5A0',
        color: '#051510',
      }
    });
  };

  const handleCancelRequest = async (requestId) => {
    try {
      const toastId = toast.loading('Cancelling request...');
      // Call your API to cancel the request
      // const res = await cancelRequest(requestId);
      
      toast.dismiss(toastId);
      toast.success('Request cancelled successfully!');
      
      if (requestTimer) {
        clearTimeout(requestTimer);
        setRequestTimer(null);
      }
      
      setTimerExpired(false);
      loadAllData();
    } catch (error) {
      toast.error('Failed to cancel request');
    }
  };

  const handleRedeemCashback = async () => {
    const toastId = toast.loading('Redeeming cashback...');
    try {
      const res = await transferCashback();
      toast.dismiss(toastId);
      toast.success(
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-[#00F5A0]" />
          <div>
            <div className="font-bold">Cashback Redeemed! 🎉</div>
            <div className="text-sm">Transferred to INR wallet</div>
          </div>
        </div>,
        { 
          duration: 1000,
          style: {
            background: '#00F5A0',
            color: '#051510',
          }
        }
      );
      playNotificationSound('cashback');
      loadAllData();
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Failed to redeem cashback");
    }
  };

  const handleConfirmPayment = async () => {
    if (!paymentScreenshot) {
      toast.error("Please upload screenshot");
      return;
    }
    
    setActionLoading(true);
    const toastId = toast.loading('Submitting proof...');
    
    const res = await submitPayment(selectedScanner, paymentScreenshot);
    if (res) {
      toast.dismiss(toastId);
      toast.success(
        <div>
          <div className="font-bold">Proof Submitted! 📸</div>
          <div className="text-sm text-[#00F5A0] mt-1">
            Waiting for confirmation
          </div>
        </div>,
        { duration: 5000 }
      );
      
      setSelectedScanner(null); 
      setPaymentScreenshot(null);
      loadAllData();
    } else {
      toast.dismiss(toastId);
      toast.error("Failed to submit proof");
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
          <span className="font-bold text-xl italic">CpayLink</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/5 rounded-lg relative">
          <Menu className="text-[#00F5A0]" />
          {activeRequestsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          )}
        </button>
      </div>

      {/* SIDEBAR / MOBILE DRAWER */}
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[200] transition-opacity duration-300 md:hidden ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={() => setIsSidebarOpen(false)} />
      
      <aside className={`fixed md:relative inset-y-0 left-0 z-[210] w-72 bg-[#051510] border-r border-white/5 flex flex-col p-6 transition-transform duration-300 transform md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2 px-2">
            <div className="bg-[#00F5A0] p-1.5 rounded-lg text-[#051510]"><Zap size={20} /></div>
            <span className="text-2xl font-black italic">CpayLink</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2"><X size={24} /></button>
        </div>
        
        <nav className="flex-1 space-y-2">
          <SidebarLink 
            icon={<LayoutGrid size={20} />} 
            label="Overview" 
            active={activeTab === "Overview"} 
            onClick={() => { setActiveTab("Overview"); setIsSidebarOpen(false); }} 
          />
          <SidebarLink 
            icon={<ScanLine size={20} />} 
            label="Scanner Queue" 
            active={activeTab === "Scanner"} 
            badge={activeRequestsCount}
            highlight={activeRequestsCount > 0}
            onClick={() => { setActiveTab("Scanner"); setIsSidebarOpen(false); }} 
          />
          <SidebarLink 
            icon={<Wallet size={20} />} 
            label="Deposit" 
            active={activeTab === "Deposit"} 
            onClick={() => { setActiveTab("Deposit"); setIsSidebarOpen(false); }} 
          />
          <SidebarLink 
            icon={<ArrowRightLeft size={20} />} 
            label="History" 
            active={activeTab === "History"} 
            onClick={() => { setActiveTab("History"); setIsSidebarOpen(false); }} 
          />
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
            {activeTab === "Scanner" ? "Scanner Queue" : activeTab}
          </h1>
          <div className="flex items-center gap-4">
            {activeRequestsCount > 0 && activeTab !== "Scanner" && (
              <button 
                onClick={() => setActiveTab("Scanner")}
                className="flex items-center gap-2 bg-orange-500/10 text-orange-500 px-4 py-2 rounded-full text-xs font-bold animate-pulse"
              >
                <Bell size={14} />
                {activeRequestsCount} New Request{activeRequestsCount > 1 ? 's' : ''}
              </button>
            )}
            <div className="flex items-center gap-4 bg-white/5 p-2 pr-6 rounded-full border border-white/10">
              <div>
                <p className="text-[8px] text-[#00F5A0] font-black italic uppercase tracking-widest">
                  ID: {user._id?.slice(-6)}
                </p>
              </div>
            </div>
          </div>
        </header>

        {activeTab === "Overview" && <OverviewPage wallets={wallets} transactions={transactions} setActiveTab={setActiveTab} />}

        {activeTab === "Scanner" && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0A1F1A] border border-white/10 p-4 rounded-2xl">
                <p className="text-[10px] text-gray-500 font-bold">Available Requests</p>
                <h3 className="text-2xl font-black text-[#00F5A0]">{activeRequestsCount}</h3>
              </div>
              <div className="bg-[#0A1F1A] border border-white/10 p-4 rounded-2xl">
                <p className="text-[10px] text-gray-500 font-bold">My Active Requests</p>
                <h3 className="text-2xl font-black text-orange-500">{myActiveRequestsCount}</h3>
              </div>
            </div>

            {/* CREATE PAY REQUEST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0A1F1A] border border-white/10 p-6 rounded-[2rem]">
                <h2 className="text-xl font-black text-[#00F5A0] mb-6 italic flex items-center gap-2">
                  <UploadCloud size={20} /> Create Pay Request
                </h2>

                <input
                  type="number"
                  placeholder="Enter Amount"
                  value={uploadAmount}
                  onChange={(e) => setUploadAmount(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 mb-6 font-bold outline-none text-lg"
                />
                
                <label className="block bg-black/40 border border-white/10 rounded-xl py-4 text-center cursor-pointer font-bold text-sm mb-4 hover:bg-black/60 transition-all">
                  <Camera size={18} className="inline mr-2 text-[#00F5A0]" /> 
                  Take Photo with Camera
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    onChange={(e) => setSelectedImage(e.target.files[0])} 
                    className="hidden" 
                  />
                </label>
                
                <label className="block bg-black/40 border border-white/10 rounded-xl py-4 text-center cursor-pointer font-bold text-sm mb-4 hover:bg-black/60 transition-all">
                  <UploadCloud size={18} className="inline mr-2 text-[#00F5A0]" /> 
                  Choose from Gallery
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedImage(e.target.files[0])}
                    className="hidden"
                  />
                </label>

                {selectedImage && (
                  <div className="mb-4">
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      className="w-full max-w-[180px] mx-auto rounded-xl border-2 border-[#00F5A0] object-cover aspect-square"
                      alt="preview"
                    />
                    <p className="text-center text-xs text-[#00F5A0] mt-2 truncate">
                      {selectedImage.name}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleCreateScanner}
                  disabled={actionLoading || !uploadAmount || !selectedImage}
                  className={`w-full py-4 rounded-2xl font-black italic ${
                    actionLoading || !uploadAmount || !selectedImage
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-[#00F5A0] text-black hover:bg-[#00d88c] active:scale-95 transition-all"
                  }`}
                >
                  {actionLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader size={16} className="animate-spin" />
                      UPLOADING...
                    </span>
                  ) : (
                    "POST TO PAY REQUESTS"
                  )}
                </button>
              </div>
            </div>

            {/* MY REQUESTS SECTION */}
            <div>
              <h2 className="text-lg font-black text-white/70 italic mb-4 flex items-center gap-2">
                My Pay Requests
                {myActiveRequestsCount > 0 && (
                  <span className="bg-orange-500/10 text-orange-500 text-[10px] px-2 py-1 rounded-full">
                    {myActiveRequestsCount} active
                  </span>
                )}
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
                      handleCancelRequest={handleCancelRequest}
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

            {/* ACCEPT PAY REQUESTS SECTION */}
            <div>
              <h2 className="text-lg font-black text-white/70 italic mb-4 flex items-center gap-2">
                Accept Pay Requests
                {activeRequestsCount > 0 && (
                  <span className="bg-[#00F5A0]/10 text-[#00F5A0] text-[10px] px-2 py-1 rounded-full animate-pulse">
                    {activeRequestsCount} available
                  </span>
                )}
              </h2>
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
                      handleCancelRequest={handleCancelRequest}
                    />
                  ))}

                {scanners.filter((s) => String(s.user?._id) !== String(user._id))
                  .length === 0 && (
                  <div className="col-span-full text-center py-20 text-gray-600 font-black italic uppercase">
                    No Pay Requests Available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Deposit" && (
          <DepositPage 
            paymentMethods={paymentMethods} 
            selectedMethod={selectedMethod} 
            setSelectedMethod={setSelectedMethod} 
            depositData={depositData} 
            setDepositData={setDepositData} 
            txHash={txHash} 
            setTxHash={setTxHash} 
            setDepositScreenshot={setDepositScreenshot} 
            handleDepositSubmit={handleDepositSubmit} 
            actionLoading={actionLoading} 
          />
        )}
        
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
                    toast.success('Referral code copied!', { duration: 2000 });
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

        <div className="h-20 md:hidden" />
      </main>

      {/* MODAL */}
      {selectedScanner && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[300] p-4 backdrop-blur-sm">
          <div className="bg-[#0A1F1A] p-6 md:p-8 rounded-[2rem] w-full max-w-md border border-white/10 shadow-2xl">
            <h3 className="text-xl font-black text-[#00F5A0] mb-6 italic">Submit Transaction Proof</h3>
            <input type="file" accept="image/*" onChange={(e) => setPaymentScreenshot(e.target.files[0])} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 mb-6 text-sm" />
            <div className="flex gap-4">
              <button onClick={() => setSelectedScanner(null)} className="flex-1 bg-white/5 py-4 rounded-2xl font-black">CANCEL</button>
              <button onClick={handleConfirmPayment} disabled={actionLoading} className="flex-1 bg-[#00F5A0] text-black py-4 rounded-2xl font-black">SUBMIT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// SidebarLink Component with Badge
const SidebarLink = ({ icon, label, active, onClick, badge, highlight }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all font-bold text-base relative ${
      active 
        ? "bg-[#00F5A0]/10 text-[#00F5A0]" 
        : highlight && badge > 0
          ? "text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 animate-pulse"
          : "text-gray-400 hover:text-white"
    }`}
  >
    <div className="flex items-center gap-4">
      {icon} <span>{label}</span>
    </div>
    {badge > 0 && (
      <span className={`${
        highlight ? 'bg-orange-500 text-white' : 'bg-[#00F5A0] text-[#051510]'
      } text-[10px] px-2 py-0.5 rounded-full font-black shadow-[0_0_10px_#00F5A0]`}>
        {badge}
      </span>
    )}
    {highlight && badge > 0 && !active && (
      <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
    )}
  </button>
);

// Rest of your components (OverviewPage, RequestCard, DepositPage, etc.) remain the same...
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
          sub="From referrals & transactions"  // हा message बदलला
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

const RequestCard = ({ s, user, loadAllData, setSelectedScanner, handleCancelRequest }) => {
  const isOwner = String(s.user?._id) === String(user._id);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isExpired, setIsExpired] = useState(false);
  
  // Timer effect for ALL users - हा बदल केलाय
  useEffect(() => {
    // फक्त ACTIVE आणि ACCEPTED न झालेल्या requests साठी timer चालवा
    if (s.status === "ACTIVE" && !s.acceptedBy) {
      const createdTime = new Date(s.createdAt).getTime();
      const currentTime = new Date().getTime();
      const elapsedSeconds = Math.floor((currentTime - createdTime) / 1000);
      const remaining = Math.max(0, 300 - elapsedSeconds);
      
      setTimeLeft(remaining);
      setIsExpired(remaining === 0);

      if (remaining > 0) {
        const timer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              setIsExpired(true);
              
              // Auto-refresh data when request expires
              loadAllData();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      }
    } else {
      // जर request accepted असेल किंवा status बदलला असेल तर timer reset करा
      setTimeLeft(0);
      setIsExpired(false);
    }
  }, [s.createdAt, s.status, s.acceptedBy, loadAllData]); // isOwner काढून टाकलंय

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Status display with proper formatting
  const getStatusDisplay = () => {
    // सगळ्यांसाठी EXPIRED status दाखवा
    if (isExpired && s.status === "ACTIVE" && !s.acceptedBy) {
      return { text: "EXPIRED", color: "bg-red-500/10 text-red-500 border border-red-500/20" };
    }
    
    switch(s.status) {
      case "COMPLETED":
        return { text: "COMPLETED ✓", color: "bg-green-500/10 text-green-500 border border-green-500/20" };
      case "ACCEPTED":
        return { text: "ACCEPTED ⚡", color: "bg-blue-500/10 text-blue-500 border border-blue-500/20" };
      case "PAYMENT_SUBMITTED":
        return { text: "PROOF SUBMITTED 📸", color: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" };
      default:
        // जर expire झाली असेल तर ACTIVE न दाखवता EXPIRED दाखवा
        if (isExpired) {
          return { text: "EXPIRED", color: "bg-red-500/10 text-red-500 border border-red-500/20" };
        }
        return { text: "ACTIVE", color: "bg-[#00F5A0]/10 text-[#00F5A0] border border-[#00F5A0]/20" };
    }
  };

  const statusDisplay = getStatusDisplay();

  // Download QR function
  const downloadQR = () => {
    const imageUrl = `https://cpay-backend.onrender.com${s.image}`;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `QR-${s.amount}-${s._id.slice(-4)}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('QR Code Downloaded!', {
      duration: 5000,
      icon: '📥',
      style: {
        background: '#00F5A0',
        color: '#051510',
      }
    });
  };

  return (
    <div className="bg-[#0A1F1A] border border-white/10 p-5 rounded-[2rem] relative flex flex-col h-full hover:border-white/20 transition-all">
      {/* Status Badge with Timer - Top Left */}
      <div className="flex items-center gap-2 mb-3">
        {/* Status Badge */}
        <div className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${statusDisplay.color}`}>
          {statusDisplay.text}
        </div>
        
        {/* Timer - सगळ्यांना दाखवा, पण फक्त ACTIVE आणि NOT ACCEPTED असताना */}
        {s.status === "ACTIVE" && !s.acceptedBy && !isExpired && (
          <div className="bg-yellow-500/20 text-yellow-500 text-[8px] font-black px-2 py-1.5 rounded-full flex items-center gap-1 border border-yellow-500/20">
            <Clock size={10} />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>
      
      {/* QR Code Image */}
      <div className="relative mb-3">
        <div className="bg-white p-3 rounded-2xl w-fit mx-auto shadow-lg">
          <img 
            src={`https://cpay-backend.onrender.com${s.image}`} 
            className="w-28 h-28 md:w-32 md:h-32 object-contain" 
            alt="QR" 
          />
        </div>
      </div>
      
      {/* Download Button - Below QR */}
      <button
        onClick={downloadQR}
        className="mb-4 w-full bg-white/5 hover:bg-[#00F5A0]/10 border border-white/10 rounded-xl py-2 px-3 flex items-center justify-center gap-2 transition-all group"
      >
        <UploadCloud size={16} className="text-[#00F5A0] group-hover:scale-110 transition-transform" />
        <span className="text-xs font-bold text-gray-400 group-hover:text-[#00F5A0]">DOWNLOAD QR</span>
      </button>
      
      {/* Amount */}
      <h3 className="text-2xl font-black text-center mb-1 text-white">₹{s.amount}</h3>
      
      {/* Created BY SECTION */}
      <p className="text-center text-[10px] text-gray-500 font-bold mb-3 italic uppercase bg-white/5 py-1.5 px-3 rounded-full mx-auto">
        Created by: {s.user?.name || `User ${s.user?.mobile?.slice(-4) || s.user?._id?.slice(-6)}`}
      </p>

      {/* Expired Message - सगळ्यांना दाखवा */}
      {isExpired && s.status === "ACTIVE" && !s.acceptedBy && (
        <div className="mb-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
          <p className="text-center text-xs text-red-500 font-bold flex items-center justify-center gap-1">
            <Clock size={14} /> This request has expired
          </p>
        </div>
      )}

      {/* ACCEPTED BY SECTION */}
      {s.acceptedBy && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
          <p className="text-center text-[10px] text-blue-400 font-bold uppercase mb-2 tracking-wider">
            ⚡ ACCEPTED BY
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-black text-sm shadow-lg">
              {s.acceptedBy.name?.charAt(0) || s.acceptedBy.mobile?.charAt(0) || '?'}
            </div>
            <div>
              <p className="text-sm font-bold text-blue-400">
                {s.acceptedBy.name || `User ${s.acceptedBy.mobile?.slice(-4)}`}
              </p>
              <p className="text-[8px] text-gray-500">Accepted at: {new Date(s.acceptedAt).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-auto space-y-2">
        {isOwner ? (
          // Owner View
          s.status === "PAYMENT_SUBMITTED" && (
            <div className="space-y-2">
              <button 
                onClick={() => window.open(`https://cpay-backend.onrender.com${s.paymentScreenshot}`)} 
                className="w-full text-[#00F5A0] text-xs font-bold underline py-2 hover:text-[#00d88c] transition-colors"
              >
                👁️ VIEW PROOF
              </button>
              <button 
                onClick={() => confirmRequest(s._id).then(loadAllData)} 
                className="w-full bg-gradient-to-r from-[#00F5A0] to-[#00d88c] text-black py-3 rounded-xl font-black text-sm hover:shadow-lg hover:shadow-[#00F5A0]/20 transition-all"
              >
                ✅ CONFIRM RECEIPT
              </button>
            </div>
          )
        ) : (
          // Other Users View
          <>
            {s.status === "ACTIVE" && !isExpired && (
              <button 
                onClick={() => acceptRequest(s._id).then(loadAllData)} 
                className="w-full bg-gradient-to-r from-[#00F5A0] to-[#00d88c] text-black py-3 rounded-xl font-black italic text-sm hover:shadow-lg hover:shadow-[#00F5A0]/20 transition-all"
              >
                ⚡ ACCEPT & PAY
              </button>
            )}
            {(s.status !== "ACTIVE" || isExpired) && (
              <button 
                disabled
                className="w-full bg-gray-700 text-gray-400 py-3 rounded-xl font-black italic text-sm cursor-not-allowed opacity-50"
              >
                ⏰ {isExpired ? "EXPIRED" : "UNAVAILABLE"}
              </button>
            )}
          </>
        )}
        
        {/* Accepted by current user */}
        {String(s.acceptedBy?._id) === String(user._id) && s.status === "ACCEPTED" && (
          <button 
            onClick={() => setSelectedScanner(s._id)} 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-black text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all"
          >
            📸 UPLOAD SCREENSHOT
          </button>
        )}

        {/* Cancel Button for Owner */}
        {isOwner && s.status === "ACTIVE" && !s.acceptedBy && (
          <button 
            onClick={() => handleCancelRequest(s._id)}
            className="w-full bg-red-500/20 text-red-500 py-3 rounded-xl font-black text-sm hover:bg-red-500/30 transition-all border border-red-500/20"
          >
            ✕ CANCEL REQUEST
          </button>
        )}
      </div>
    </div>
  );
};
const DepositPage = ({ paymentMethods, selectedMethod, setSelectedMethod, depositData, setDepositData, txHash, setTxHash, setDepositScreenshot, handleDepositSubmit, actionLoading }) => {
  // Filter to only show USDT methods
  const usdtMethods = paymentMethods.filter(m => m.method?.includes("USDT"));
  
  // Timer states
  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isVerifying, setIsVerifying] = useState(false);

  // Timer effect
  useEffect(() => {
    let timerInterval;
    
    if (showTimer && timeLeft > 0) {
      timerInterval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            setShowTimer(false);
            setIsVerifying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [showTimer, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

const handleSubmit = async () => {  // e काढला
  await handleDepositSubmit();  // e पाठवू नका
  if (!actionLoading) {
    setShowTimer(true);
    setTimeLeft(300);
    setIsVerifying(true);
  }
};

  return (
    <div className="max-w-xl mx-auto bg-[#0A1F1A] border border-white/10 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem]">
      <h2 className="text-xl font-black italic text-[#00F5A0] mb-8 uppercase tracking-widest">Add Funds</h2>
      
      {/* Payment Method Selection */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {usdtMethods.map(m => (
          <button 
            key={m._id} 
            onClick={() => setSelectedMethod(m)} 
            className={`w-full p-4 rounded-xl border text-left transition-all ${
              selectedMethod?._id === m._id 
                ? "border-[#00F5A0] bg-[#00F5A0]/10" 
                : "border-white/10 bg-black/20"
            }`}
          >
            <p className="font-bold text-sm">{m.method}</p>
          </button>
        ))}
      </div>

      {/* Protocol Info with QR Code */}
      {selectedMethod && (
        <div className="p-4 bg-white/5 rounded-xl mb-6 text-[11px] font-mono text-gray-400 border border-white/5">
          <p className="text-[#00F5A0] font-black mb-2 uppercase">Protocol Info:</p>
          
          {selectedMethod.method.includes("USDT") && (
            <div className="flex flex-col items-center mb-3">
              {/* QR Code for the address */}
              <div className="bg-white p-3 rounded-xl mb-3">
                <QRCode 
                  value={selectedMethod.details.address}
                  size={150}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                />
              </div>
              
              {/* Copyable Address */}
              <div className="w-full">
                <p className="text-[#00F5A0] font-bold text-xs mb-1">Address:</p>
                <div className="flex items-center gap-2">
                  <p className="break-all text-white/80 text-xs">{selectedMethod.details.address}</p>
                  <button 
                    onClick={() => navigator.clipboard.writeText(selectedMethod.details.address)}
                    className="bg-[#00F5A0]/10 p-2 rounded-lg hover:bg-[#00F5A0]/20 transition-colors"
                    title="Copy address"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#00F5A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Network Info */}
              <div className="w-full mt-2">
                <p className="text-[#00F5A0] font-bold text-xs mb-1">Network:</p>
                <p className="text-white/80 text-xs">{selectedMethod.details.network}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timer Display - Shows after submission */}
      {showTimer && (
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isVerifying ? (
                <Loader size={16} className="animate-spin text-yellow-500" />
              ) : (
                <Clock size={16} className="text-yellow-500" />
              )}
              <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">
                {isVerifying ? "VERIFYING YOUR PAYMENT" : "PAYMENT VERIFIED"}
              </span>
            </div>
            <div className="bg-yellow-500/20 px-3 py-1 rounded-full">
              <span className="text-sm font-black text-yellow-500 font-mono">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-1000"
              style={{ width: `${(timeLeft / 300) * 100}%` }}
            />
          </div>
          
          <p className="text-[10px] text-gray-500 mt-2 text-center">
            Please wait while we verify your transaction. This may take up to 5 minutes.
          </p>
        </div>
      )}

      {/* Deposit Form */}
      <input 
        type="number" 
        value={depositData.amount} 
        onChange={e => setDepositData({ ...depositData, amount: e.target.value })} 
        placeholder="Amount" 
        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 mb-3 font-bold text-lg outline-none" 
        disabled={showTimer}
      />
      
      <input 
        type="text" 
        value={txHash} 
        onChange={e => setTxHash(e.target.value)} 
        placeholder="Transaction Hash / TxID" 
        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 mb-4 font-bold outline-none" 
        disabled={showTimer}
      />
      
      <input 
        type="file" 
        onChange={e => setDepositScreenshot(e.target.files[0])} 
        className="w-full mb-6 text-xs text-gray-500" 
        disabled={showTimer}
      />
      
      <button 
        onClick={handleSubmit} 
        className={`w-full py-5 rounded-2xl font-black italic transition-all ${
          showTimer 
            ? "bg-gray-700 text-gray-400 cursor-not-allowed" 
            : "bg-[#00F5A0] text-black hover:bg-[#00d88c] active:scale-95"
        }`}
        disabled={actionLoading || showTimer}
      >
        {actionLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader size={16} className="animate-spin" />
            PROCESSING...
          </span>
        ) : showTimer ? (
          <span className="flex items-center justify-center gap-2">
            <Clock size={16} />
            VERIFICATION IN PROGRESS
          </span>
        ) : (
          "SUBMIT DEPOSIT"
        )}
      </button>

      {/* Success Message */}
      {showTimer && timeLeft === 0 && (
        <div className="mt-4 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
          <p className="text-center text-xs text-green-500 font-bold">
            ✓ Verification complete! Your deposit will be credited soon.
          </p>
        </div>
      )}
    </div>
  );
};
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