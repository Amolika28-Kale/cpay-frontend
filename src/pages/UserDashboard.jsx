import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid, ArrowRightLeft, Wallet, ScanLine, CheckCircle,
  LogOut, X, Clock, Menu, Loader, Zap, PlusCircle, Camera, UploadCloud, Bell,
  Users, TrendingUp, Award, Gift, Copy, ChevronDown, ChevronUp, User, Key, AlertCircle,
  ArrowRight
} from "lucide-react";

import {
  getWallets, getTransactions, createDeposit, transferCashback,
  getActivePaymentMethods, selfPay, requestToPay, getActiveRequests,
  acceptRequest, submitPayment, confirmRequest,
} from "../services/apiService";
import { 
  getReferralStats, 
  getTeamCashbackSummary, 
  activateWallet, 
  getActivationStatus 
} from "../services/authService";
import toast from 'react-hot-toast';
import { Html5Qrcode } from "html5-qrcode";
import QRCode from 'react-qr-code';
import API_BASE from "../services/api";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [referralData, setReferralData] = useState({
    referralCode: "",
    totalReferrals: 0,
    referralEarnings: { total: 0, level1: 0, level2: 0, level3: 0, level4: 0, level5: 0 },
    cashbackBalance: 0,
    referralTree: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0 },
    earningsByLevel: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0, total: 0 }
  });

  const [teamStats, setTeamStats] = useState(null);
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

  // Redeem states
  const [redeemAmount, setRedeemAmount] = useState("");
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [isRedeemMode, setIsRedeemMode] = useState(false);

  // Terms and conditions states
  const [createTermsAccepted, setCreateTermsAccepted] = useState(false);
  const [acceptTermsAccepted, setAcceptTermsAccepted] = useState(false);

  // Daily limit states
// Daily limit states - आता amount मध्ये
// Daily limit states
const [dailyAcceptLimit, setDailyAcceptLimit] = useState(1000);
const [todayAcceptedTotal, setTodayAcceptedTotal] = useState(0);
const [walletActivated, setWalletActivated] = useState(false);
const [showActivationModal, setShowActivationModal] = useState(false);
const [activationAmount, setActivationAmount] = useState(0);
const [activationStatus, setActivationStatus] = useState({
  activated: false,
  dailyLimit: 1000,
  todayAccepted: 0,
  remaining: 1000
});
  

  const user = JSON.parse(localStorage.getItem("user")) || { 
    userId: "User",
    _id: ""
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
        if (tx.type === 'CREDIT' || tx.type === 'DEBIT' || tx.type === 'TEAM_CASHBACK') {
          playNotificationSound('success');
          toast(
            <div className="flex items-center gap-2">
              {tx.type === 'TEAM_CASHBACK' ? (
                <Users size={20} className="text-purple-500" />
              ) : tx.type === 'CREDIT' ? (
                <ArrowRightLeft size={20} className="text-green-500" />
              ) : (
                <ArrowRightLeft size={20} className="text-red-500" />
              )}
              <div>
                <div className="font-bold">{tx.type === 'TEAM_CASHBACK' ? 'Team Cashback' : tx.type} </div>
                <div className="text-xs">₹{tx.amount} • {tx.fromWallet || 'System'} → {tx.toWallet || 'CASHBACK'}</div>
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

  // Calculate today's accepted total
  useEffect(() => {
    const calculateTodayAccepted = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayAccepted = scanners.filter(s => 
        s.status === "ACCEPTED" && 
        new Date(s.acceptedAt) >= today &&
        String(s.acceptedBy?._id) === String(user._id)
      ).length;
      
      setTodayAcceptedTotal(todayAccepted);
    };
    
    calculateTodayAccepted();
  }, [scanners, user._id]);

const loadActivationStatus = async () => {
  try {
    const token = localStorage.getItem("token");
    const status = await getActivationStatus(token);
    setActivationStatus(status);
    setWalletActivated(status.activated);
    setDailyAcceptLimit(status.dailyLimit || 1000);
    setTodayAcceptedTotal(status.todayAccepted || 0);
  } catch (error) {
    console.error("Error loading activation status:", error);
  }
};

  const loadAllData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("Sync aborted: No token found");
        return;
      }

      const [w, t, s, pm, ref, team] = await Promise.all([
        getWallets(),
        getTransactions(),
        getActiveRequests(),
        getActivePaymentMethods(),
        getReferralStats(token),
        getTeamCashbackSummary(token)
      ]);

      setWallets(w || []);
      setTransactions(t || []);
      setScanners(s || []);
      setPaymentMethods(pm || []);
      
      if (ref && !ref.message) {
        setReferralData({
          referralCode: ref.referralCode || "",
          totalReferrals: ref.totalReferrals || 0,
          referralEarnings: ref.referralEarnings || { total: 0 },
          cashbackBalance: ref.cashbackBalance || 0,
          referralTree: ref.referralTree || { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0 },
          earningsByLevel: ref.earningsByLevel || { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0, total: 0 }
        });
      }
      
      setTeamStats(team);

    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    loadActivationStatus();
    const interval = setInterval(() => {
      loadAllData();
      loadActivationStatus();
    }, 10000);
    
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

// Check if deposit completed for activation
// Check if deposit completed for activation - SIMPLE FIX
useEffect(() => {
  const checkActivationDeposit = async () => {
    const pending = localStorage.getItem("pendingActivation");
    if (!pending) return;
    
    const { dailyLimit, amount, timestamp } = JSON.parse(pending);
    
    // Check if deposit was completed in last 10 minutes
    if (Date.now() - timestamp > 10 * 60 * 1000) {
      localStorage.removeItem("pendingActivation");
      return;
    }
    
    // ✅ 2 minutes उलटले का तपासा
    if (Date.now() - timestamp < 2 * 60 * 1000) {
      console.log("⏳ Waiting for 2 minutes verification...");
      return; // 2 minutes पूर्ण झाले नाहीत तर return
    }
    
    // Check if user has USDT wallet with sufficient balance
    const usdtWallet = wallets.find(w => w.type === "USDT");
    if (usdtWallet && usdtWallet.balance >= amount) {
      try {
        const token = localStorage.getItem("token");
        
        const res = await fetch(`${API_BASE}/scanner/activate-wallet`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ 
            dailyLimit: dailyLimit,
            activationAmount: amount
          })
        });
        
        const data = await res.json();
        
        if (data.message) {
          toast.success(
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-[#00F5A0]" />
              <div>
                <div className="font-bold">Wallet Activated! 🎉</div>
                <div className="text-xs">
                  <span className="text-blue-400">{amount} USDT</span> → 
                  <span className="text-green-400"> ₹{data.inrAmount}</span>
                </div>
                <div className="text-xs text-gray-400">
                  Daily limit: ₹{dailyLimit}
                </div>
              </div>
            </div>,
            { duration: 6000 }
          );
          
          setWalletActivated(true);
          setDailyAcceptLimit(dailyLimit);
          await loadActivationStatus();
          await loadAllData();
          localStorage.removeItem("pendingActivation");
        }
      } catch (error) {
        console.error("Activation failed:", error);
        toast.error("Failed to activate wallet");
      }
    }
  };
  
  checkActivationDeposit();
}, [wallets]); // फक्त wallets वर अवलंबून

const handleDepositSubmit = async () => {
  // Current validation
  if (!depositData.amount || !selectedMethod || !txHash || !depositScreenshot) {
    toast.error("Please fill all fields and upload screenshot");
    return false;  // ← false return करा
  }
  
  setActionLoading(true);
  const toastId = toast.loading('Submitting deposit...');
  
  try {
    const res = await createDeposit(depositData.amount, txHash, selectedMethod._id, depositScreenshot);
    
    if (res?._id) {
      toast.dismiss(toastId);
      toast.success("Deposit Submitted! 📥");
      
      // Clear form
      setDepositData({ amount: "" }); 
      setTxHash(""); 
      setSelectedMethod(null);
      setDepositScreenshot(null); // हे महत्वाचे!
      
      // Refresh data
      loadAllData();
      
      return true;  // ← success झाल्यावर true return करा
      
    } else {
      toast.dismiss(toastId);
      toast.error("Deposit submission failed");
      return false;  // ← failure झाल्यावर false return करा
    }
  } catch (error) {
    console.error("Deposit error:", error);
    toast.dismiss(toastId);
    toast.error(error?.response?.data?.message || "Deposit submission failed");
    return false;  // ← error झाल्यावर false return करा
  } finally {
    setActionLoading(false);
  }
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
        setIsRedeemMode(false);
        
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
    const cashbackWallet = wallets.find(w => w.type === "CASHBACK");
    
    if (!cashbackWallet || cashbackWallet.balance <= 0) {
      toast.error("No cashback available to redeem");
      return;
    }

    setShowRedeemModal(true);
  };

  const confirmRedeem = async () => {
    if (!redeemAmount || Number(redeemAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const cashbackWallet = wallets.find(w => w.type === "CASHBACK");
    
    if (Number(redeemAmount) > cashbackWallet.balance) {
      toast.error("Insufficient cashback balance");
      return;
    }

    setShowRedeemModal(false);
    const toastId = toast.loading('Processing cashback redemption...');
    
    try {
      const res = await transferCashback(Number(redeemAmount));
      
      if (res) {
        toast.dismiss(toastId);
        toast.success(
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-[#00F5A0]" />
            <div>
              <div className="font-bold">Cashback Redeemed! 🎉</div>
              <div className="text-sm">₹{redeemAmount} transferred to INR wallet</div>
            </div>
          </div>,
          { duration: 3000 }
        );
        playNotificationSound('cashback');
        loadAllData();
        
        // Automatically switch to Scanner tab and set amount
        setActiveTab("Scanner");
        setUploadAmount(redeemAmount);
        setIsRedeemMode(true);
        setRedeemAmount("");
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Failed to redeem cashback");
    }
  };

const handleActivateWallet = async () => {
  // Calculate 10% of daily limit (in USDT)
  const requiredAmount = dailyAcceptLimit * 0.1;
  
  // Show activation confirmation modal
  setActivationAmount(requiredAmount);
  setShowActivationModal(true);
};

const confirmActivation = async () => {
  setShowActivationModal(false);
  
  // Store activation info in localStorage
  localStorage.setItem("pendingActivation", JSON.stringify({
    dailyLimit: dailyAcceptLimit,
    amount: activationAmount,
    timestamp: Date.now()
  }));
  
  // Redirect to Deposit tab with pre-filled amount
  setActiveTab("Deposit");
  
  // Set deposit amount to activation amount
  setDepositData({ 
    amount: activationAmount.toFixed(2), 
    network: "TRC20" 
  });
  
  // Auto-select USDT method
  if (paymentMethods.length > 0) {
    const usdtMethod = paymentMethods.find(m => m.method?.includes("USDT"));
    if (usdtMethod) {
      setSelectedMethod(usdtMethod);
    }
  }
  
  // Show message to user
  toast.success(
    <div className="flex items-center gap-2">
      <ArrowRight size={20} className="text-[#00F5A0]" />
      <div>
        <div className="font-bold">Please Deposit ${activationAmount.toFixed(2)} USDT</div>
        <div className="text-xs">This will activate your wallet for today</div>
      </div>
    </div>,
    { duration: 6000 }
  );
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
                  ID: {user.userId || user._id?.slice(-6)}
                </p>
              </div>
            </div>
          </div>
        </header>

        {activeTab === "Overview" && (
          <OverviewPage 
            wallets={wallets} 
            transactions={transactions} 
            setActiveTab={setActiveTab} 
            onRedeem={handleRedeemCashback} 
          />
        )}

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

      {/* Daily Limit Status */}
<div className="bg-[#0A1F1A] border border-white/10 p-4 rounded-2xl">
  <div className="flex justify-between items-center mb-2">
    <span className="text-xs text-gray-400">Today's Accept Limit</span>
    <span className="text-sm font-bold text-[#00F5A0]">₹{dailyAcceptLimit}</span>
  </div>
  <div className="flex justify-between items-center mb-3">
    <span className="text-xs text-gray-400">Accepted Today</span>
    <span className="text-sm font-bold text-orange-500">₹{todayAcceptedTotal}</span>
  </div>
  
  {!walletActivated && (
    <button
      onClick={handleActivateWallet}
      className="w-full bg-blue-500/20 text-blue-500 py-3 rounded-xl font-black text-sm hover:bg-blue-500/30 transition-all border border-blue-500/20 mt-2"
    >
      Activate Wallet (Deposit ₹{(dailyAcceptLimit * 0.1).toFixed(2)} USDT)
    </button>
  )}
  
  {walletActivated && (
    <div className="bg-green-500/10 text-green-500 p-2 rounded-xl text-xs font-bold text-center">
      ✓ Wallet Activated • ₹{dailyAcceptLimit - todayAcceptedTotal} remaining today
    </div>
  )}
</div>

            {/* CREATE PAY REQUEST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0A1F1A] border border-white/10 p-6 rounded-[2rem]">
                <h2 className="text-xl font-black text-[#00F5A0] mb-6 italic flex items-center gap-2">
                  <UploadCloud size={20} /> Create Pay Request
                </h2>

                {/* Redeem Mode Indicator */}
                {isRedeemMode && (
                  <div className="mb-4 p-3 bg-[#00F5A0]/10 border border-[#00F5A0]/20 rounded-xl">
                    <p className="text-[10px] text-[#00F5A0] font-bold flex items-center gap-1">
                      <Zap size={12} />
                      Redeemed Cashback Mode: Amount fixed at ₹{uploadAmount}
                    </p>
                  </div>
                )}

                <input
                  type="number"
                  placeholder="Enter Amount"
                  value={uploadAmount}
                  onChange={(e) => setUploadAmount(e.target.value)}
                  disabled={isRedeemMode}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 mb-6 font-bold outline-none text-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

                {/* Disclaimer and Terms for Create Pay Request */}
                <div className="mb-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-xs text-gray-400 mb-3 font-bold">DISCLAIMER:</p>
                    <ul className="text-[10px] text-gray-500 list-disc list-inside mb-3 space-y-1">
                      <li>You are creating a pay request for ₹{uploadAmount || '0'}</li>
                      <li>This request will expire in 5 minutes if not accepted</li>
                      <li>Ensure your QR code is valid and scannable</li>
                      <li>You must have sufficient balance to complete the transaction</li>
                      <li>By creating this request, you agree to our terms of service</li>
                    </ul>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createTermsAccepted}
                        onChange={(e) => setCreateTermsAccepted(e.target.checked)}
                        className="w-4 h-4 accent-[#00F5A0]"
                      />
                      <span className="text-xs text-gray-300">I agree to the terms and conditions</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleCreateScanner}
                  disabled={actionLoading || !uploadAmount || !selectedImage || !createTermsAccepted}
                  className={`w-full py-4 rounded-2xl font-black italic ${
                    actionLoading || !uploadAmount || !selectedImage || !createTermsAccepted
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
              
              {/* Accept Terms Checkbox */}
              {activeRequestsCount > 0 && (
                <div className="mb-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-xs text-gray-400 mb-3 font-bold">BEFORE ACCEPTING:</p>
                    <ul className="text-[10px] text-gray-500 list-disc list-inside mb-3 space-y-1">
                      <li>You have 5 minutes to complete the payment after accepting</li>
                      <li>Upload clear screenshot of payment proof</li>
                      <li>Daily accept limit: {dailyAcceptLimit} requests</li>
                      <li>Wallet must be activated to accept requests today</li>
                    </ul>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptTermsAccepted}
                        onChange={(e) => setAcceptTermsAccepted(e.target.checked)}
                        className="w-4 h-4 accent-[#00F5A0]"
                      />
                      <span className="text-xs text-gray-300">I agree to the terms and conditions</span>
                    </label>
                  </div>
                </div>
              )}
              
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
                      walletActivated={walletActivated}
                      acceptTermsAccepted={acceptTermsAccepted}
                        onActivateWallet={handleActivateWallet}  // ही लाइन जोडा
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
          <ReferralPage 
            referralData={referralData}
            teamStats={teamStats}
          />
        )}

        <div className="h-20 md:hidden" />
      </main>

      {/* MODAL - Submit Transaction Proof */}
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

      {/* Redeem Cashback Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[400] p-4 backdrop-blur-sm">
          <div className="bg-[#0A1F1A] p-6 md:p-8 rounded-[2rem] w-full max-w-md border border-white/10 shadow-2xl">
            <h3 className="text-xl font-black text-[#00F5A0] mb-4 italic">Redeem Cashback</h3>
            
            <div className="mb-6">
              <p className="text-gray-400 mb-2 text-sm">Available Cashback:</p>
              <p className="text-2xl font-black text-[#00F5A0]">
                ₹{wallets.find(w => w.type === "CASHBACK")?.balance.toLocaleString() || 0}
              </p>
            </div>
            
            <input
              type="number"
              placeholder="Enter amount to redeem"
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 mb-4 font-bold outline-none text-lg"
            />
            
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl mb-6">
              <p className="text-yellow-500 text-xs font-bold flex items-center gap-2">
                <Clock size={14} />
                This amount will be used to create a pay request automatically.
              </p>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setShowRedeemModal(false);
                  setRedeemAmount("");
                }} 
                className="flex-1 bg-white/5 py-4 rounded-2xl font-black hover:bg-white/10 transition-all"
              >
                CANCEL
              </button>
              <button 
                onClick={confirmRedeem} 
                className="flex-1 bg-[#00F5A0] text-black py-4 rounded-2xl font-black hover:bg-[#00d88c] transition-all"
              >
                REDEEM
              </button>
            </div>
          </div>
        </div>
      )}

   {/* Wallet Activation Modal */}
{/* Wallet Activation Modal */}
{showActivationModal && (
  <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[400] p-4 backdrop-blur-sm">
    <div className="bg-[#0A1F1A] p-6 md:p-8 rounded-[2rem] w-full max-w-md border border-white/10 shadow-2xl">
      <h3 className="text-xl font-black text-[#00F5A0] mb-4 italic">Activate Wallet</h3>
      
      <p className="text-gray-400 mb-4 text-sm">
        Set your daily accept limit to start accepting pay requests
      </p>

      <div className="mb-6">
        <label className="text-xs text-gray-500 mb-2 block">Daily Accept Limit (₹)</label>
        <input
          type="number"
          min="100"
          max="100000"
          step="100"
          value={dailyAcceptLimit}
          onChange={(e) => {
            const newLimit = Number(e.target.value);
            setDailyAcceptLimit(newLimit);
            setActivationAmount(newLimit * 0.1);
          }}
          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 font-bold text-lg outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">You can accept pay requests up to this amount today</p>
        
        <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <p className="text-xs text-gray-400">Activation Amount (10% of limit):</p>
          <p className="text-2xl font-black text-[#00F5A0] mt-1">{activationAmount.toFixed(2)} USDT</p>
          <p className="text-[10px] text-gray-500 mt-2">Deposit this amount in USDT to activate</p>
        </div>
      </div>
      
      <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl mb-6">
        <p className="text-yellow-500 text-xs font-bold flex items-center gap-2">
          <AlertCircle size={14} />
          After successful deposit, your wallet will be activated automatically
        </p>
      </div>
      
      <div className="flex gap-4">
        <button 
          onClick={() => setShowActivationModal(false)} 
          className="flex-1 bg-white/5 py-4 rounded-2xl font-black hover:bg-white/10 transition-all"
        >
          CANCEL
        </button>
        <button 
          onClick={confirmActivation} 
          className="flex-1 bg-[#00F5A0] text-black py-4 rounded-2xl font-black hover:bg-[#00d88c] transition-all"
        >
          PROCEED TO DEPOSIT
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

// SidebarLink Component
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

// OverviewPage Component
const OverviewPage = ({ wallets, transactions, setActiveTab, onRedeem }) => {
  const usdt = wallets.find(w => w.type === "USDT")?.balance || 0;
  const inr = wallets.find(w => w.type === "INR")?.balance || 0;
  const cb = wallets.find(w => w.type === "CASHBACK")?.balance || 0;
  
  return (
    <div className="animate-in fade-in space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <WalletCard
          label="USDT Wallet"
          val={usdt.toFixed(2)}
          sub={`≈ ₹${(usdt * 95).toLocaleString()}`}
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
          sub="Available to redeem"
          showRedeem={cb > 0}
          onRedeem={onRedeem}
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

// RequestCard Component
// RequestCard Component - With clickable toast for wallet activation
const RequestCard = ({ s, user, loadAllData, setSelectedScanner, handleCancelRequest, walletActivated, acceptTermsAccepted, onActivateWallet }) => {
  const isOwner = String(s.user?._id) === String(user._id);
  const [timeLeft, setTimeLeft] = useState(300); // Changed from 300 to 120
  const [isExpired, setIsExpired] = useState(false);
  
  useEffect(() => {
    if (s.status === "ACTIVE" && !s.acceptedBy) {
      const createdTime = new Date(s.createdAt).getTime();
      const currentTime = new Date().getTime();
      const elapsedSeconds = Math.floor((currentTime - createdTime) / 1000);
      const remaining = Math.max(0, 300 - elapsedSeconds); // Changed from 300 to 120
      
      setTimeLeft(remaining);
      setIsExpired(remaining === 0);

      if (remaining > 0) {
        const timer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              setIsExpired(true);
              loadAllData();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      }
    } else {
      setTimeLeft(0);
      setIsExpired(false);
    }
  }, [s.createdAt, s.status, s.acceptedBy, loadAllData]);


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusDisplay = () => {
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
        if (isExpired) {
          return { text: "EXPIRED", color: "bg-red-500/10 text-red-500 border border-red-500/20" };
        }
        return { text: "ACTIVE", color: "bg-[#00F5A0]/10 text-[#00F5A0] border border-[#00F5A0]/20" };
    }
  };

  const statusDisplay = getStatusDisplay();

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
      duration: 3000,
      icon: '📥',
      style: {
        background: '#00F5A0',
        color: '#051510',
      }
    });
  };

  // Handle accept with proper validation and toasts
  const handleAccept = async () => {
    // Check if wallet is activated
    if (!walletActivated) {
      toast(
        <div 
          className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-all"
          onClick={() => {
            toast.dismiss(); // Dismiss current toast
            onActivateWallet(); // Open wallet activation modal
          }}
        >
          <div className="bg-yellow-500/20 p-2 rounded-full">
            <AlertCircle size={24} className="text-yellow-500" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-yellow-500">Wallet Not Activated!</div>
            <div className="text-xs text-gray-400 mt-1">Click here to activate your wallet now</div>
          </div>
          <div className="bg-yellow-500/20 p-2 rounded-full">
            <ArrowRight size={20} className="text-yellow-500" />
          </div>
        </div>,
        { 
          duration: 8000, // Show for 8 seconds
          style: {
            background: '#0A1F1A',
            color: 'white',
            border: '1px solid #eab308/20',
            padding: '12px',
          },
          icon: null // Remove default icon
        }
      );
      return;
    }

    // Check if terms are accepted
    if (!acceptTermsAccepted) {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle size={20} className="text-red-500" />
          <div>
            <div className="font-bold">Terms Not Accepted!</div>
            <div className="text-xs">Please accept the terms and conditions first</div>
          </div>
        </div>,
        { 
          duration: 4000,
          style: {
            background: '#0A1F1A',
            color: 'white',
            border: '1px solid #ef4444/20'
          }
        }
      );
      return;
    }
    
    try {
      console.log("Accepting request:", s._id);
      const result = await acceptRequest(s._id);
      console.log("Accept result:", result);
      
      // Success toast
// Success toast - update message to 2 minutes
toast.success(
  <div className="flex items-center gap-2">
    <CheckCircle size={20} className="text-[#00F5A0]" />
    <div>
      <div className="font-bold">Request Accepted! 🎯</div>
      <div className="text-xs">You have 5 minutes to complete the payment</div>
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
      
      loadAllData();
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle size={20} className="text-red-500" />
          <div>
            <div className="font-bold">Failed to Accept!</div>
            <div className="text-xs">{error.message || "Something went wrong"}</div>
          </div>
        </div>,
        { duration: 4000 }
      );
    }
  };

  return (
    <div className="bg-[#0A1F1A] border border-white/10 p-5 rounded-[2rem] relative flex flex-col h-full hover:border-white/20 transition-all">
      <div className="flex items-center gap-2 mb-3">
        <div className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${statusDisplay.color}`}>
          {statusDisplay.text}
        </div>
        
        {s.status === "ACTIVE" && !s.acceptedBy && !isExpired && (
          <div className="bg-yellow-500/20 text-yellow-500 text-[8px] font-black px-2 py-1.5 rounded-full flex items-center gap-1 border border-yellow-500/20">
            <Clock size={10} />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>
      
      <div className="relative mb-3">
        <div className="bg-white p-3 rounded-2xl w-fit mx-auto shadow-lg">
          <img 
            src={`https://cpay-backend.onrender.com${s.image}`} 
            className="w-28 h-28 md:w-32 md:h-32 object-contain" 
            alt="QR" 
          />
        </div>
      </div>
      
      <button
        onClick={downloadQR}
        className="mb-4 w-full bg-white/5 hover:bg-[#00F5A0]/10 border border-white/10 rounded-xl py-2 px-3 flex items-center justify-center gap-2 transition-all group"
      >
        <UploadCloud size={16} className="text-[#00F5A0] group-hover:scale-110 transition-transform" />
        <span className="text-xs font-bold text-gray-400 group-hover:text-[#00F5A0]">DOWNLOAD QR</span>
      </button>
      
      <h3 className="text-2xl font-black text-center mb-1 text-white">₹{s.amount}</h3>
      
      <p className="text-center text-[10px] text-gray-500 font-bold mb-3 italic uppercase bg-white/5 py-1.5 px-3 rounded-full mx-auto">
        Created by: {s.user?.name || s.user?.userId || `User ${s.user?._id?.slice(-6)}`}
      </p>

      {isExpired && s.status === "ACTIVE" && !s.acceptedBy && (
        <div className="mb-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
          <p className="text-center text-xs text-red-500 font-bold flex items-center justify-center gap-1">
            <Clock size={14} /> This request has expired
          </p>
        </div>
      )}

      {s.acceptedBy && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
          <p className="text-center text-[10px] text-blue-400 font-bold uppercase mb-2 tracking-wider">
            ⚡ ACCEPTED BY
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-black text-sm shadow-lg">
              {s.acceptedBy.name?.charAt(0) || s.acceptedBy.userId?.charAt(0) || '?'}
            </div>
            <div>
              <p className="text-sm font-bold text-blue-400">
                {s.acceptedBy.name || s.acceptedBy.userId || `User ${s.acceptedBy._id?.slice(-6)}`}
              </p>
              <p className="text-[8px] text-gray-500">Accepted at: {new Date(s.acceptedAt).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto space-y-2">
        {isOwner ? (
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
          <>
            {s.status === "ACTIVE" && !isExpired && (
              <button 
                onClick={handleAccept}
                className={`w-full bg-gradient-to-r from-[#00F5A0] to-[#00d88c] text-black py-3 rounded-xl font-black italic text-sm hover:shadow-lg hover:shadow-[#00F5A0]/20 transition-all ${
                  (!walletActivated || !acceptTermsAccepted) ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={!walletActivated || !acceptTermsAccepted}
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
        
        {String(s.acceptedBy?._id) === String(user._id) && s.status === "ACCEPTED" && (
          <button 
            onClick={() => setSelectedScanner(s._id)} 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-black text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all"
          >
            📸 UPLOAD SCREENSHOT
          </button>
        )}

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

// DepositPage Component - FIXED PROGRESS BAR
const DepositPage = ({ 
  paymentMethods, 
  selectedMethod, 
  setSelectedMethod, 
  depositData, 
  setDepositData, 
  txHash, 
  setTxHash, 
  setDepositScreenshot, 
  handleDepositSubmit, 
  actionLoading 
}) => {
  const usdtMethods = paymentMethods.filter(m => m.method?.includes("USDT"));
  
  // Local state for timer and file upload
  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes = 120 seconds
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [depositSubmitted, setDepositSubmitted] = useState(false);
  
  const fileInputRef = useRef(null);

  // Timer effect - counts down from 120 to 0
  useEffect(() => {
    let timerInterval;
    
    if (showTimer && timeLeft > 0) {
      timerInterval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            // Don't hide timer immediately, show completion message
            setIsVerifying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [showTimer]);

  // Separate effect to handle timer when timeLeft changes
  useEffect(() => {
    if (timeLeft === 0 && showTimer) {
      // Timer completed
      setIsVerifying(false);
    }
  }, [timeLeft, showTimer]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = ((120 - timeLeft) / 120) * 100;

  // Handle file selection with validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      setSelectedFile(null);
      setSelectedFileName("");
      setPreviewUrl(null);
      setDepositScreenshot(null);
      return;
    }

    // File size validation (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large! Maximum size is 5MB", {
        duration: 3000,
        icon: '⚠️',
        style: { background: '#0A1F1A', border: '1px solid #ef4444/20' }
      });
      e.target.value = "";
      return;
    }

    // File type validation
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file (JPEG, PNG, etc.)", {
        duration: 3000,
        icon: '📸',
        style: { background: '#0A1F1A', border: '1px solid #ef4444/20' }
      });
      e.target.value = "";
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);
    setSelectedFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
    setDepositScreenshot(file);
    
    toast.success(`Selected: ${file.name}`, { 
      duration: 2000,
      icon: '✅',
      style: { background: '#0A1F1A', border: '1px solid #00F5A0/20' }
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation checks
    const errors = [];
    
    if (!depositData.amount || Number(depositData.amount) <= 0) {
      errors.push("Valid amount is required");
    }
    
    if (!selectedMethod) {
      errors.push("Please select a payment method");
    }
    
    if (!txHash || txHash.trim() === "") {
      errors.push("Transaction hash is required");
    }
    
    if (!selectedFile) {
      errors.push("Payment screenshot is required");
    }

    if (errors.length > 0) {
      errors.forEach(error => {
        toast.error(error, {
          duration: 3000,
          style: { background: '#0A1F1A', border: '1px solid #ef4444/20' }
        });
      });
      return;
    }

    const success = await handleDepositSubmit();
    
    if (success) {
      setShowTimer(true);
      setTimeLeft(120);
      setIsVerifying(true);
      setDepositSubmitted(true);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedFile(null);
      setSelectedFileName("");
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      
      toast.success("Deposit submitted! Auto-verification will complete in 2 minutes.", {
        duration: 4000,
        icon: '⏱️',
        style: { background: '#0A1F1A', border: '1px solid #00F5A0/20' }
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-[#0A1F1A] border border-white/10 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem]">
      <h2 className="text-xl font-black italic text-[#00F5A0] mb-8 uppercase tracking-widest">Add Funds</h2>
      
      {/* Payment Methods Selection */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {usdtMethods.length > 0 ? (
          usdtMethods.map(m => (
            <button 
              type="button"
              key={m._id} 
              onClick={() => setSelectedMethod(m)} 
              className={`w-full p-4 rounded-xl border text-left transition-all ${
                selectedMethod?._id === m._id 
                  ? "border-[#00F5A0] bg-[#00F5A0]/10" 
                  : "border-white/10 bg-black/20 hover:bg-black/40"
              }`}
              disabled={showTimer}
            >
              <p className="font-bold text-sm">{m.method}</p>
              {m.details?.network && (
                <p className="text-[10px] text-gray-500 mt-1">Network: {m.details.network}</p>
              )}
            </button>
          ))
        ) : (
          <div className="p-4 bg-yellow-500/10 rounded-xl text-yellow-500 text-xs text-center">
            No payment methods available
          </div>
        )}
      </div>

      {/* Selected Method Details */}
      {selectedMethod && selectedMethod.method.includes("USDT") && (
        <div className="p-4 bg-white/5 rounded-xl mb-6 border border-white/5">
          <p className="text-[#00F5A0] font-black mb-3 uppercase text-xs">Payment Details:</p>
          
          {/* QR Code */}
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-xl">
              <QRCode 
                value={selectedMethod.details.address}
                size={150}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
              />
            </div>
          </div>
          
          {/* Address with Copy */}
          <div className="mb-3">
            <p className="text-[10px] text-gray-500 mb-1">Address:</p>
            <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg">
              <p className="text-xs text-white/80 font-mono break-all flex-1">
                {selectedMethod.details.address}
              </p>
              <button 
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(selectedMethod.details.address);
                  toast.success("Address copied!", { duration: 2000 });
                }}
                className="bg-[#00F5A0]/10 p-2 rounded-lg hover:bg-[#00F5A0]/20 transition-colors flex-shrink-0"
              >
                <Copy size={16} className="text-[#00F5A0]" />
              </button>
            </div>
          </div>
          
          {/* Network */}
          <div className="mb-3">
            <p className="text-[10px] text-gray-500 mb-1">Network:</p>
            <p className="text-xs text-white/80 bg-black/40 p-2 rounded-lg">
              {selectedMethod.details.network}
            </p>
          </div>
          
          {/* Rate Display */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Rate:</span>
              <span className="font-bold text-[#00F5A0]">1 USDT = ₹95</span>
            </div>
            {depositData.amount && (
              <div className="flex justify-between items-center mt-2 text-base">
                <span className="text-gray-400">You'll get:</span>
                <span className="font-black text-white">
                  ₹{(Number(depositData.amount) * 95).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ⏱️ 2-MINUTE TIMER DISPLAY WITH PROGRESS BAR - FIXED */}
      {showTimer && (
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isVerifying && timeLeft > 0 ? (
                <Loader size={16} className="animate-spin text-yellow-500" />
              ) : (
                <Clock size={16} className="text-yellow-500" />
              )}
              <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">
                {timeLeft > 0 ? "AUTO-VERIFICATION IN PROGRESS" : "VERIFICATION COMPLETE"}
              </span>
            </div>
            <div className="bg-yellow-500/20 px-3 py-1 rounded-full">
              <span className="text-sm font-black text-yellow-500 font-mono">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          
          {/* PROGRESS BAR - Fixed */}
          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-1000 ease-linear"
              style={{ 
                width: `${progressPercentage}%`,
              }}
            />
          </div>
          
          <p className="text-[10px] text-gray-500 mt-2 text-center">
            {timeLeft > 0 ? (
              <>⏱️ Auto-verification in {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')} minutes</>
            ) : (
              <>✅ Verification complete! Your deposit will be credited shortly.</>
            )}
          </p>
          
          <p className="text-[8px] text-gray-600 mt-1 text-center">
            Please wait while we verify your transaction. Your INR will be credited automatically after verification.
          </p>
        </div>
      )}

      {/* Amount Input */}
      <div className="mb-3">
        <label className="text-xs text-gray-500 mb-1 block">Amount (USDT) *</label>
        <input 
          type="number" 
          value={depositData.amount} 
          onChange={e => setDepositData({ ...depositData, amount: e.target.value })} 
          placeholder="Enter amount in USDT" 
          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 font-bold text-lg outline-none focus:border-[#00F5A0] transition-all" 
          disabled={showTimer}
          min="1"
          step="0.01"
          required
        />
      </div>
      
      {/* Transaction Hash Input */}
      <div className="mb-4">
        <label className="text-xs text-gray-500 mb-1 block">Transaction Hash / TXID *</label>
        <input 
          type="text" 
          value={txHash} 
          onChange={e => setTxHash(e.target.value)} 
          placeholder="Enter transaction hash" 
          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 font-bold outline-none focus:border-[#00F5A0] transition-all" 
          disabled={showTimer}
          required
        />
      </div>
      
      {/* File Upload with Preview */}
      <div className="mb-6">
        <label className="text-xs text-gray-500 mb-1 block">Payment Screenshot *</label>
        
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*"
          onChange={handleFileChange} 
          className="hidden" 
          id="screenshot-upload"
          disabled={showTimer}
        />
        
        <label 
          htmlFor="screenshot-upload"
          className={`block border-2 border-dashed rounded-xl py-6 text-center cursor-pointer font-bold text-sm transition-all ${
            selectedFile 
              ? "border-[#00F5A0] bg-[#00F5A0]/10" 
              : "border-white/10 bg-black/40 hover:bg-black/60"
          }`}
        >
          <UploadCloud size={32} className="mx-auto mb-2 text-[#00F5A0]" />
          {selectedFileName || "Click to upload payment screenshot"}
          <p className="text-[8px] text-gray-500 mt-1">Max file size: 5MB (JPEG, PNG)</p>
        </label>
        
        {previewUrl && (
          <div className="mt-3">
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border-2 border-[#00F5A0]"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setSelectedFileName("");
                  setPreviewUrl(null);
                  setDepositScreenshot(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-all"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#00F5A0] mt-1">
              {selectedFileName} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </p>
          </div>
        )}
      </div>
      
      {/* Submit Button */}
      <button 
        type="submit"
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
            WAITING FOR VERIFICATION ({formatTime(timeLeft)})
          </span>
        ) : (
          "SUBMIT DEPOSIT"
        )}
      </button>
    </form>
  );
};

// HistoryPage Component
const HistoryPage = ({ transactions }) => (
  <div className="bg-[#0A1F1A] border border-white/10 p-4 md:p-8 rounded-[2rem]">
    <h2 className="text-xl font-bold mb-6 italic">History</h2>
    <div className="space-y-3">
      {transactions.map(tx => (
        <div key={tx._id} className="flex justify-between items-center p-4 bg-black/20 rounded-2xl border border-white/5">
          <div className="min-w-0 flex-1 mr-4">
            <p className="font-bold text-sm truncate">
              {tx.type === 'TEAM_CASHBACK' ? 'Team Cashback' : tx.type}
            </p>
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

// ReferralPage Component
const ReferralPage = ({ referralData, teamStats }) => {
  const [showDetails, setShowDetails] = useState(false);

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralData.referralCode);
    toast.success('Referral code copied!', { duration: 2000 });
  };

  const levels = [
    { level: 1, rate: "30%", color: "from-yellow-500 to-orange-500" },
    { level: 2, rate: "15%", color: "from-blue-500 to-cyan-500" },
    { level: 3, rate: "10%", color: "from-green-500 to-emerald-500" },
    { level: 4, rate: "5%", color: "from-purple-500 to-pink-500" },
    { level: 5, rate: "3%", color: "from-red-500 to-rose-500" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      
      {/* Referral Code Card */}
      <div className="bg-gradient-to-br from-[#00F5A0] to-[#00d88c] p-8 rounded-[2.5rem] text-[#051510] shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black italic">Your Referral Code</h2>
          <Gift size={28} className="opacity-60" />
        </div>
        
        <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl backdrop-blur-sm">
          <span className="text-3xl font-black tracking-widest">
            {referralData.referralCode}
          </span>
          <button
            onClick={copyReferralCode}
            className="bg-black text-[#00F5A0] p-3 rounded-xl hover:bg-black/80 transition-all"
          >
            <Copy size={20} />
          </button>
        </div>
        
        <p className="text-sm font-bold mt-4 opacity-70">
          Share this code & earn up to 30% commission on 5 levels!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0A1F1A] border border-white/10 p-6 rounded-2xl">
          <Users size={24} className="text-[#00F5A0] mb-2" />
          <p className="text-xs text-gray-500 uppercase font-bold">Total Team</p>
          <h3 className="text-3xl font-black italic">
            {Object.values(referralData.referralTree || {}).reduce((a, b) => a + b, 0)}
          </h3>
        </div>
        
        <div className="bg-[#0A1F1A] border border-white/10 p-6 rounded-2xl">
          <TrendingUp size={24} className="text-[#00F5A0] mb-2" />
          <p className="text-xs text-gray-500 uppercase font-bold">Your Earnings</p>
          <h3 className="text-3xl font-black italic text-[#00F5A0]">
            ₹{Number(referralData.referralEarnings?.total || 0).toFixed(2)}
          </h3>
        </div>
        
        <div className="bg-[#0A1F1A] border border-white/10 p-6 rounded-2xl">
          <Award size={24} className="text-[#00F5A0] mb-2" />
          <p className="text-xs text-gray-500 uppercase font-bold">Cashback Balance</p>
          <h3 className="text-3xl font-black italic text-orange-500">
            ₹{Number(referralData.cashbackBalance || 0).toFixed(2)}
          </h3>
        </div>
      </div>

      {/* Team Cashback Section */}
      <div className="bg-[#0A1F1A] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-[#00F5A0]" />
            <h3 className="text-lg font-black italic">Team Cashback</h3>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[#00F5A0] hover:bg-[#00F5A0]/10 p-2 rounded-lg transition-all"
          >
            {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {/* Commission Rates */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {levels.map((level) => (
            <div key={level.level} className="text-center">
              <div className={`bg-gradient-to-r ${level.color} p-1 rounded-t-lg`}>
                <span className="text-[8px] font-black text-white">L{level.level}</span>
              </div>
              <div className="bg-black/40 p-1 rounded-b-lg">
                <span className="text-[10px] font-bold text-[#00F5A0]">{level.rate}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-xl">
            <p className="text-[8px] text-gray-500 uppercase">Team Members</p>
            <p className="text-xl font-black text-[#00F5A0]">
              {Object.values(referralData.referralTree || {}).reduce((a, b) => a + b, 0)}
            </p>
          </div>
          <div className="bg-black/40 p-3 rounded-xl">
            <p className="text-[8px] text-gray-500 uppercase">Team Earnings</p>
            <p className="text-xl font-black text-[#00F5A0]">
              ₹{referralData.earningsByLevel?.total?.toFixed(2) || 0}
            </p>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
            {levels.map((level) => (
              <div key={level.level} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${level.color}`} />
                  <span className="text-xs text-gray-400">Level {level.level}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-xs text-gray-500">
                    {referralData.referralTree?.[`level${level.level}`] || 0} members
                  </span>
                  <span className="text-xs font-bold text-[#00F5A0]">
                    ₹{(referralData.earningsByLevel?.[`level${level.level}`] || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}

            <div className="mt-4 p-3 bg-blue-500/10 rounded-xl">
              <p className="text-[10px] text-blue-400">
                <TrendingUp size={12} className="inline mr-1" />
                When your team members earn cashback, you earn commission at these rates!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// WalletCard Component
const WalletCard = ({ label, val, sub, highlight, showRedeem, onRedeem }) => (
  <div className={`p-6 md:p-8 rounded-[2rem] border ${highlight ? "bg-[#00F5A0] text-black shadow-[0_10px_30px_rgba(0,245,160,0.2)]" : "bg-[#0A1F1A] border-white/10"}`}>
    <p className={`text-[10px] font-black uppercase mb-4 ${highlight ? "text-black/50" : "text-gray-500"}`}>{label}</p>
    <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter">{val}</h3>
    <p className="text-[10px] font-bold opacity-60 italic">{sub}</p>
    {showRedeem && (
      <button 
        onClick={onRedeem} 
        className="mt-4 text-[9px] font-black bg-[#00F5A0] text-black px-3 py-1 rounded-full uppercase hover:shadow-lg hover:shadow-[#00F5A0]/20 transition-all"
      >
        REDEEM CASHBACK
      </button>
    )}
  </div>
);

// TransactionRow Component
const TransactionRow = ({ merchant, date, amt, status }) => (
  <div className="flex justify-between items-center p-3 hover:bg-white/5 rounded-2xl transition-colors">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#00F5A0]/10 flex items-center justify-center text-[#00F5A0]">
        {merchant === 'TEAM_CASHBACK' ? <Users size={14} /> : <CheckCircle size={14} />}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold truncate">
          {merchant === 'TEAM_CASHBACK' ? 'Team Cashback' : merchant}
        </p>
        <p className="text-[9px] text-gray-500 font-bold">{date}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm font-black italic">{amt}</p>
      <p className="text-[8px] text-[#00F5A0] font-black uppercase italic tracking-widest">{status}</p>
    </div>
  </div>
);

// ActionButton Component
const ActionButton = ({ icon, label, primary, onClick }) => (
  <button onClick={onClick} className={`flex-1 py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black flex items-center justify-center gap-3 border transition-all active:scale-95 ${primary ? "bg-[#00F5A0] text-black border-transparent" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
    <div className={primary ? "" : "text-[#00F5A0]"}>{icon}</div>
    <span className="text-xs md:text-sm italic">{label}</span>
  </button>
);

