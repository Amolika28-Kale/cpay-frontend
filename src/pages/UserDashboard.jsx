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
  getActivationStatus, 
  getTodayTeamStats
} from "../services/authService";
import toast from 'react-hot-toast';
import { Html5Qrcode } from "html5-qrcode";
import QRCode from 'react-qr-code';
import API_BASE from "../services/api";

export default function UserDashboard() {
  const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user")) || { 
    userId: "User",
    _id: ""
  };

// Referral data state - Level 21 पर्यंत
const [referralData, setReferralData] = useState({
  referralCode: "",
  totalReferrals: 0,
  referralEarnings: { 
    total: 0, 
    level1: 0, level2: 0, level3: 0, level4: 0, level5: 0,
    level6: 0, level7: 0, level8: 0, level9: 0, level10: 0,
    level11: 0, level12: 0, level13: 0, level14: 0, level15: 0,
    level16: 0, level17: 0, level18: 0, level19: 0, level20: 0,
    level21: 0
  },
  cashbackBalance: 0,
  referralTree: { 
    level1: 0, level2: 0, level3: 0, level4: 0, level5: 0,
    level6: 0, level7: 0, level8: 0, level9: 0, level10: 0,
    level11: 0, level12: 0, level13: 0, level14: 0, level15: 0,
    level16: 0, level17: 0, level18: 0, level19: 0, level20: 0,
    level21: 0
  },
  earningsByLevel: { 
    level1: 0, level2: 0, level3: 0, level4: 0, level5: 0,
    level6: 0, level7: 0, level8: 0, level9: 0, level10: 0,
    level11: 0, level12: 0, level13: 0, level14: 0, level15: 0,
    level16: 0, level17: 0, level18: 0, level19: 0, level20: 0,
    level21: 0, total: 0
  }
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
const [dailyAcceptLimit, setDailyAcceptLimit] = useState(""); // ✅ Actual limit (used after confirmation)
const [localInputLimit, setLocalInputLimit] = useState(""); // ✅ Local input for modal
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

// Timer states for deposit verification - moved to parent for persistence
const [showDepositTimer, setShowDepositTimer] = useState(false);
const [depositTimeLeft, setDepositTimeLeft] = useState(120); // 2 minutes
const [depositVerifying, setDepositVerifying] = useState(false);
  
    // Helper function to check if request is expired
  const isRequestExpired = (request) => {
    if (request.status !== "ACTIVE") return false;
    if (request.acceptedBy) return false;
    
    const createdTime = new Date(request.createdAt).getTime();
    const currentTime = new Date().getTime();
    const elapsedSeconds = Math.floor((currentTime - createdTime) / 1000);
    return elapsedSeconds >= 600; // 10 minutes = 600 seconds
  };

  
  // Calculate counts - FIXED to handle expired requests properly
  const activeRequestsCount = scanners.filter(s => 
    s.status === "ACTIVE" && 
    String(s.user?._id) !== String(user._id) &&
    !isRequestExpired(s) // Only count non-expired requests
  ).length;
  
  const myActiveRequestsCount = scanners.filter(s => 
    s.status === "ACTIVE" && 
    String(s.user?._id) === String(user._id) && 
    !s.acceptedBy &&
    !isRequestExpired(s) // Only count non-expired requests
  ).length;



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

  // // Check for new transactions
  // useEffect(() => {
  //   if (transactions.length > prevTransactionsRef.current.length) {
  //     const newTransactions = transactions.slice(0, transactions.length - prevTransactionsRef.current.length);
      
  //     newTransactions.forEach(tx => {
  //       if (tx.type === 'CREDIT' || tx.type === 'DEBIT' || tx.type === 'TEAM_CASHBACK') {
  //         playNotificationSound('success');
  //         toast(
  //           <div className="flex items-center gap-2">
  //             {tx.type === 'TEAM_CASHBACK' ? (
  //               <Users size={20} className="text-purple-500" />
  //             ) : tx.type === 'CREDIT' ? (
  //               <ArrowRightLeft size={20} className="text-green-500" />
  //             ) : (
  //               <ArrowRightLeft size={20} className="text-red-500" />
  //             )}
  //             <div>
  //               <div className="font-bold">{tx.type === 'TEAM_CASHBACK' ? 'Team Cashback' : tx.type} </div>
  //               <div className="text-xs">₹{tx.amount} • {tx.fromWallet || 'System'} → {tx.toWallet || 'CASHBACK'}</div>
  //             </div>
  //           </div>,
  //           { 
  //             duration: 2000,
  //             style: {
  //               background: '#0A1F1A',
  //               color: 'white',
  //               border: '1px solid rgba(255,255,255,0.1)'
  //             }
  //           }
  //         );
  //       }
  //     });
  //   }
  //   prevTransactionsRef.current = transactions;
  // }, [transactions]);

// Calculate today's accepted total - QUICK FIX
useEffect(() => {
  const calculateTodayAccepted = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // ✅ Activation status वरून थेट value घ्या
    if (activationStatus.todayAccepted > 0) {
      // console.log("📊 Using activation status value:", activationStatus.todayAccepted);
      setTodayAcceptedTotal(activationStatus.todayAccepted);
      return;
    }
    
    // नाहीतर scanners वरून calculate करा
    const todayTotal = scanners
      .filter(s => 
        s.status === "ACCEPTED" && 
        new Date(s.acceptedAt) >= today &&
        String(s.acceptedBy?._id) === String(user._id)
      )
      .reduce((sum, request) => sum + (request.amount || 0), 0);
    
    // console.log("📊 Calculated from scanners:", todayTotal);
    setTodayAcceptedTotal(todayTotal);
  };
  
  calculateTodayAccepted();
}, [scanners, user._id, activationStatus.todayAccepted]);

// Add this with other useEffects
// Load pending deposit from localStorage on mount
useEffect(() => {
  const savedDeposit = localStorage.getItem("pendingDeposit");
  if (savedDeposit) {
    const deposit = JSON.parse(savedDeposit);
    const elapsedSeconds = Math.floor((Date.now() - deposit.timestamp) / 1000);
    const remaining = Math.max(0, 120 - elapsedSeconds);
    
    if (remaining > 0) {
      setShowDepositTimer(true);
      setDepositTimeLeft(remaining);
      setDepositVerifying(true);
    } else {
      localStorage.removeItem("pendingDeposit");
    }
  }
}, []);

const loadActivationStatus = async () => {
  try {
    const token = localStorage.getItem("token");
    const status = await getActivationStatus(token);
    
    setActivationStatus(status);
    setWalletActivated(status.activated);
    
    // Set 7-day limit
    setDailyAcceptLimit(status.dailyLimit && status.activated ? status.dailyLimit : "");
    
    // Set 7-day total (previously todayAccepted)
    setTodayAcceptedTotal(status.sevenDayTotal || 0);
    
    // Store expiry info
    if (status.expiryDate) {
      localStorage.setItem("walletExpiry", status.expiryDate);
    }
    
    // Show warning if near expiry
    if (status.activated && status.remainingDays <= 2 && status.remainingDays > 0) {
      toast(
        <div className="flex items-center gap-2">
          <AlertCircle size={20} className="text-yellow-500" />
          <div>
            <div className="font-bold text-yellow-500">Wallet Expiring Soon!</div>
            <div className="text-xs">{status.remainingDays} days remaining</div>
          </div>
        </div>,
        { duration: 10000 }
      );
    }
    
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

// In UserDashboard.jsx - Replace the existing checkActivationDeposit useEffect

// UserDashboard.jsx मध्ये - checkActivationDeposit useEffect मध्ये बदल

// Check if deposit completed for activation - FIXED
useEffect(() => {
  const checkActivationDeposit = async () => {
    const pending = localStorage.getItem("pendingActivation");
    if (!pending) return;
    
    const pendingData = JSON.parse(pending);
    
    // ✅ IMPORTANT: Check if deposit was actually submitted
    // If depositPending is true, it means user hasn't submitted deposit yet
    if (pendingData.depositPending) {
      // console.log("⏳ Deposit not submitted yet, waiting...");
      return;
    }
    
    const { dailyLimit, amount, timestamp } = pendingData;
    
    // Check if deposit was completed in last 10 minutes
    if (Date.now() - timestamp > 10 * 60 * 1000) {
      localStorage.removeItem("pendingActivation");
      return;
    }
    
    // ✅ Check if 2 minutes have passed since deposit submission
    if (Date.now() - timestamp < 2 * 60 * 1000) {
      // console.log("⏳ Waiting for 2 minutes verification after deposit...");
      return;
    }
    
    // ✅ First check if wallet is already activated (maybe by backend)
    if (walletActivated) {
      // console.log("✅ Wallet already activated, clearing pending...");
      localStorage.removeItem("pendingActivation");
      
      // Refresh data to show updated status
      await loadActivationStatus();
      await loadAllData();
      return;
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
        
        if (res.ok && data.message) {
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
        } else {
          // Handle error
          console.error("Activation failed:", data);
          if (data.message === "Wallet already activated") {
            setWalletActivated(true);
            setDailyAcceptLimit(data.dailyLimit || dailyLimit);
            localStorage.removeItem("pendingActivation");
            toast.success("Wallet already activated!");
            
            // Refresh data
            await loadActivationStatus();
            await loadAllData();
          } else {
            toast.error(data.message || "Failed to activate wallet");
          }
        }
      } catch (error) {
        console.error("Activation failed:", error);
        toast.error("Failed to activate wallet");
      }
    } else {
      // Wallet not yet credited? Check again after some time
      console.log("USDT wallet balance not updated yet, waiting...");
    }
  };
  
  checkActivationDeposit();
}, [wallets, walletActivated, loadActivationStatus, loadAllData]);
// ✅ Activation amount calculate करा (10% of daily limit in INR, then convert to USDT)
const calculateActivationAmount = (limit) => {
  // 10% of daily limit in INR
  const inrAmount = limit * 0.1;
  
  // Convert to USDT (1 USDT = ₹95)
  const usdtAmount = inrAmount / 95;
  
  // Return with 2 decimal places
  return Number(usdtAmount.toFixed(2));
};

// Example:
// dailyLimit = 1000 → inrAmount = 100 → usdtAmount = 100/95 = 1.05 USDT
// dailyLimit = 2000 → inrAmount = 200 → usdtAmount = 200/95 = 2.11 USDT
// dailyLimit = 5000 → inrAmount = 500 → usdtAmount = 500/95 = 5.26 USDT
// In UserDashboard.jsx - Update handleDepositSubmit

const handleDepositSubmit = async () => {
  // Current validation
  if (!depositData.amount || !selectedMethod || !txHash || !depositScreenshot) {
    toast.error("Please fill all fields and upload screenshot");
    return false;
  }
  
  setActionLoading(true);
  const toastId = toast.loading('Submitting deposit...');
  
  try {
    const res = await createDeposit(depositData.amount, txHash, selectedMethod._id, depositScreenshot);
    
    if (res?._id) {
      toast.dismiss(toastId);
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle size={20} className="text-[#00F5A0]" />
          <div>
            <div className="font-bold">Deposit Submitted! 📥</div>
            <div className="text-xs">Your wallet will be activated after 2 minutes verification</div>
          </div>
        </div>,
        { duration: 5000 }
      );
      
      // ✅ Update pendingActivation to mark deposit as submitted
      const pending = localStorage.getItem("pendingActivation");
      if (pending) {
        const pendingData = JSON.parse(pending);
        pendingData.depositPending = false; // Mark deposit as submitted
        pendingData.depositSubmitted = true;
        pendingData.timestamp = Date.now(); // Reset timer to start from now
        localStorage.setItem("pendingActivation", JSON.stringify(pendingData));
        
        // Start timer in DepositPage
        setShowDepositTimer(true);
        setDepositTimeLeft(120);
        setDepositVerifying(true);
      }
      
      // Clear form
      setDepositData({ amount: "" }); 
      setTxHash(""); 
      setSelectedMethod(null);
      setDepositScreenshot(null);
      
      // Refresh data
      loadAllData();
      
      return true;
      
    } else {
      toast.dismiss(toastId);
      toast.error("Deposit submission failed");
      return false;
    }
  } catch (error) {
    console.error("Deposit error:", error);
    toast.dismiss(toastId);
    toast.error(error?.response?.data?.message || "Deposit submission failed");
    return false;
  } finally {
    setActionLoading(false);
  }
};

// In UserDashboard.jsx - Update handleCreateScanner

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
          <div className="text-xs text-gray-400 mt-1">
            ⏰ Valid for 10 minutes
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
      setTimeLeft(600); // Changed from 300 to 600
      
      const timer = setTimeout(() => {
        setTimerExpired(true);
        toast.error('Request expired! No one accepted within 10 minutes.', {
          duration: 5000,
          icon: '⏰'
        });
      }, 600000); // 10 minutes = 600,000 milliseconds
      
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

// In UserDashboard.jsx - Update these functions

const handleActivateWallet = async () => {
  // Reset local input when opening modal
  setLocalInputLimit("");
  setShowActivationModal(true);
};

const confirmActivation = async () => {
  setShowActivationModal(false);
  
  // Calculate activation amount based on localInputLimit
  const requiredAmount = calculateActivationAmount(localInputLimit);
  
  // ✅ Store pending activation with a flag that deposit is pending
  localStorage.setItem("pendingActivation", JSON.stringify({
    dailyLimit: localInputLimit,
    amount: requiredAmount,
    timestamp: Date.now(),
    depositPending: true, // Important: This flag indicates deposit is not yet submitted
    depositSubmitted: false // Track if deposit was actually submitted
  }));
  
  // Redirect to Deposit tab with pre-filled amount
  setActiveTab("Deposit");
  
  // Set deposit amount to activation amount
  setDepositData({ 
    amount: requiredAmount.toFixed(2), 
    network: "TRC20" 
  });
  
  // Show message to user
  toast.success(
    <div className="flex items-center gap-2">
      <ArrowRight size={20} className="text-[#00F5A0]" />
      <div>
        <div className="font-bold">Please Deposit {requiredAmount} USDT</div>
        <div className="text-xs">For ₹{localInputLimit.toLocaleString()} daily limit</div>
        <div className="text-xs text-gray-400 mt-1">After deposit submission, wallet will activate in 2 minutes ⏱️</div>
      </div>
    </div>,
    { duration: 6000 }
  );
  
  // Reset local input
  setLocalInputLimit("");
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
          <Zap size={24} className="text-[#00F5A0]" /><span className="font-bold text-xl italic">CpayLink</span>
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

    {/* Stats Row - With better labels */}
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-[#0A1F1A] border border-white/10 p-4 rounded-2xl">
        <p className="text-[10px] text-gray-500 font-bold">Available to Accept</p>
        <h3 className="text-2xl font-black text-[#00F5A0]">{activeRequestsCount}</h3>
        <p className="text-[8px] text-gray-600 mt-1">Valid for 10 minutes each</p>
      </div>
      <div className="bg-[#0A1F1A] border border-white/10 p-4 rounded-2xl">
        <p className="text-[10px] text-gray-500 font-bold">My Active Requests</p>
        <h3 className="text-2xl font-black text-orange-500">{myActiveRequestsCount}</h3>
        <p className="text-[8px] text-gray-600 mt-1">Waiting for acceptance</p>
      </div>
    </div>
{/* 7-DAY LIMIT STATUS */}
<div className="bg-[#0A1F1A] border border-white/10 p-4 rounded-2xl">
  {/* Header - 7 Day Limit Info */}
  <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
    <span className="text-xs text-gray-400">7-Day Limit Status</span>
    {walletActivated && activationStatus?.expiryDate && (
      <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
        Expires: {new Date(activationStatus.expiryDate).toLocaleDateString()}
      </span>
    )}
  </div>

  {/* Total 7-Day Limit */}
  <div className="flex justify-between items-center mb-2">
    <span className="text-xs text-gray-400">Total 7-Day Limit</span>
    <span className="text-sm font-bold text-[#00F5A0]">
      {dailyAcceptLimit ? `₹${dailyAcceptLimit.toLocaleString()}` : "Not set"}
    </span>
  </div>
  
  {/* Daily Average */}
  {dailyAcceptLimit && (
    <div className="flex justify-between items-center mb-2">
      <span className="text-xs text-gray-400">Daily Average</span>
      <span className="text-sm font-bold text-blue-400">
        ₹{(dailyAcceptLimit / 7).toFixed(2)}/day
      </span>
    </div>
  )}
  
  {/* Used in Last 7 Days */}
  <div className="flex justify-between items-center mb-2">
    <span className="text-xs text-gray-400">Used (Last 7 Days)</span>
    <span className="text-sm font-bold text-orange-500">₹{todayAcceptedTotal.toLocaleString()}</span>
  </div>
  
  {/* Remaining for 7 Days */}
  {dailyAcceptLimit && (
    <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
      <span className="text-xs text-gray-400">Remaining for 7 Days</span>
      <span className="text-sm font-bold text-[#00F5A0]">
        ₹{(dailyAcceptLimit - todayAcceptedTotal).toLocaleString()}
        {dailyAcceptLimit > 0 && (
          <span className="text-[10px] text-gray-500 ml-2">
            ({Math.round(((dailyAcceptLimit - todayAcceptedTotal) / dailyAcceptLimit) * 100)}% left)
          </span>
        )}
      </span>
    </div>
  )}
  
  {/* Progress Bar for 7 Days */}
  {dailyAcceptLimit && dailyAcceptLimit > 0 && (
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4">
      <div 
        className="h-full bg-gradient-to-r from-orange-500 to-[#00F5A0] transition-all duration-300"
        style={{ width: `${Math.min((todayAcceptedTotal / dailyAcceptLimit) * 100, 100)}%` }}
      />
    </div>
  )}
  
  {/* Days remaining in current cycle */}
  {walletActivated && activationStatus?.remainingDays > 0 && (
    <div className="mb-3 p-2 bg-blue-500/5 rounded-lg border border-blue-500/10">
      <div className="flex justify-between items-center text-[10px]">
        <span className="text-gray-400">Days Remaining:</span>
        <span className="font-bold text-blue-400">
          {activationStatus.remainingDays} days
        </span>
      </div>
      <div className="w-full h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
        <div 
          className="h-full bg-blue-500"
          style={{ 
            width: `${((7 - activationStatus.remainingDays) / 7) * 100}%` 
          }}
        />
      </div>
    </div>
  )}
  
  {/* Change Limit Button - Available Anytime */}
  {walletActivated && (
    <button
      onClick={handleActivateWallet}
      className="w-full bg-blue-500/20 text-blue-500 py-2 rounded-xl font-black text-xs hover:bg-blue-500/30 transition-all border border-blue-500/20 mb-3"
    >
      Change 7-Day Limit (Pay Additional Amount)
    </button>
  )}
  
  {/* Activation Info */}
  {!walletActivated ? (
    <>
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
        <span className="text-xs text-gray-400">Activation Required:</span>
        <span className="text-sm font-bold text-blue-400">
          Set your 7-day limit to activate
        </span>
      </div>
      
      <button
        onClick={handleActivateWallet}
        className="w-full bg-blue-500/20 text-blue-500 py-3 rounded-xl font-black text-sm hover:bg-blue-500/30 transition-all border border-blue-500/20 mt-2"
      >
        Activate Wallet (7 Days)
      </button>
    </>
  ) : (
    <div className="bg-green-500/10 text-green-500 p-3 rounded-xl text-xs font-bold text-center">
      <div className="flex items-center justify-center gap-2 mb-1">
        <CheckCircle size={14} />
        <span>Wallet Active for 7 Days</span>
      </div>
      <div className="text-[10px] text-gray-400">
        {dailyAcceptLimit && dailyAcceptLimit - todayAcceptedTotal > 0 ? (
          <>₹{(dailyAcceptLimit - todayAcceptedTotal).toLocaleString()} remaining this week</>
        ) : (
          <>
            <span className="text-red-400">7-day limit exhausted</span>
            <span className="block mt-1 text-[8px]">Click "Change 7-Day Limit" above to add more</span>
          </>
        )}
      </div>
    </div>
  )}
</div>

            {/* CREATE PAY REQUEST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0A1F1A] border border-white/10 p-6 rounded-[2rem]">
                <h2 className="text-xl font-black text-[#00F5A0] mb-6 italic flex items-center gap-2">
                  <UploadCloud size={20} /> Pay My Bill
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
                      <li>This request will expire in 10 minutes if not accepted</li>
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
                    "POST TO BILL PAYMENTS"
                  )}
                </button>
              </div>
            </div>
 <div>
      <h2 className="text-lg font-black text-white/70 italic mb-4 flex items-center gap-2">
        My Bill Payments
        {myActiveRequestsCount > 0 && (
          <span className="bg-orange-500/10 text-orange-500 text-[10px] px-2 py-1 rounded-full">
            {myActiveRequestsCount} active
          </span>
        )}
        {scanners.filter(s => String(s.user?._id) === String(user._id) && s.status !== "ACTIVE").length > 0 && (
          <span className="bg-gray-500/10 text-gray-400 text-[10px] px-2 py-1 rounded-full">
            {scanners.filter(s => String(s.user?._id) === String(user._id) && s.status !== "ACTIVE").length} completed/expired
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
              walletActivated={walletActivated}
              acceptTermsAccepted={acceptTermsAccepted}
              onActivateWallet={handleActivateWallet}
            />
          ))}

        {scanners.filter((s) => String(s.user?._id) === String(user._id))
          .length === 0 && (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-600 font-black italic">No Bill Payments Created</p>
            <p className="text-[10px] text-gray-700 mt-2">Create your first payment request above</p>
          </div>
        )}
      </div>
    </div>
{/* ACCEPT PAY REQUESTS SECTION - Updated with better messages */}
    <div>
      <h2 className="text-lg font-black text-white/70 italic mb-4 flex items-center gap-2">
        Accept Bill Payments
        {activeRequestsCount > 0 && (
          <span className="bg-[#00F5A0]/10 text-[#00F5A0] text-[10px] px-2 py-1 rounded-full animate-pulse">
            {activeRequestsCount} available
          </span>
        )}
      </h2>
      
      {/* Accept Terms Checkbox - Only show if there are available requests */}
      {activeRequestsCount > 0 && (
        <div className="mb-4">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <p className="text-xs text-gray-400 mb-3 font-bold">BEFORE ACCEPTING:</p>
            <ul className="text-[10px] text-gray-500 list-disc list-inside mb-3 space-y-1">
              <li>You have 10 minutes to complete the payment after accepting</li>
              <li>Upload clear screenshot of payment proof</li>
              <li>7-day limit remaining: ₹{(dailyAcceptLimit - todayAcceptedTotal).toLocaleString()}</li>
              <li>Wallet must be activated to accept requests</li>
              <li>Each request expires in 10 minutes if not accepted</li>
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
              onActivateWallet={handleActivateWallet}
            />
          ))}

        {scanners.filter((s) => String(s.user?._id) !== String(user._id))
          .length === 0 && (
          <div className="col-span-full text-center py-20">
            <p className="text-gray-600 font-black italic uppercase">No Bill Payments Available</p>
            <p className="text-[10px] text-gray-700 mt-2">Check back later for new requests</p>
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
    setActiveTab={setActiveTab}
    loadAllData={loadAllData}
    // Timer props
    showDepositTimer={showDepositTimer}
    depositTimeLeft={depositTimeLeft}
    depositVerifying={depositVerifying}
    setShowDepositTimer={setShowDepositTimer}
    setDepositTimeLeft={setDepositTimeLeft}
    setDepositVerifying={setDepositVerifying}
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

{/* Wallet Activation Modal - Updated for 7 Days */}
{showActivationModal && (
  <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[400] p-4 backdrop-blur-sm">
    <div className="bg-[#0A1F1A] p-6 md:p-8 rounded-[2rem] w-full max-w-md border border-white/10 shadow-2xl">
      <h3 className="text-xl font-black text-[#00F5A0] mb-4 italic">Activate Wallet for 7 Days</h3>
      
      <p className="text-gray-400 mb-4 text-sm">
        Enter your 7-day accept limit. Valid for 7 days from activation.
      </p>

      <div className="mb-6">
        <label className="text-xs text-gray-500 mb-2 block">7-Day Accept Limit (₹)</label>
        <input
          type="number"
          min="1"
          value={localInputLimit}
          onChange={(e) => {
            const newLimit = e.target.value === "" ? "" : Number(e.target.value);
            setLocalInputLimit(newLimit);
          }}
          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 font-bold text-lg outline-none focus:border-[#00F5A0]"
          placeholder="Enter 7-day limit (e.g. 35000)"
        />
        <p className="text-xs text-gray-500 mt-1">
          You can change this limit anytime by paying additional amount
        </p>
        
        {localInputLimit && localInputLimit > 0 ? (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
            {/* 7-Day Limit Display */}
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-gray-400">Your 7-Day Limit:</p>
              <p className="text-sm font-bold text-white">₹{localInputLimit.toLocaleString()}</p>
            </div>
            
            {/* Daily Average */}
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-gray-400">Daily Average:</p>
              <p className="text-sm font-bold text-orange-400">
                ₹{(localInputLimit / 7).toFixed(2)}/day
              </p>
            </div>
            
            {/* 10% in INR */}
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-gray-400">10% in INR:</p>
              <p className="text-sm font-bold text-orange-400">
                ₹{(localInputLimit * 0.1).toFixed(2)}
              </p>
            </div>
            
            {/* Exchange Rate */}
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-gray-400">Exchange Rate:</p>
              <p className="text-sm font-bold text-[#00F5A0]">1 USDT = ₹95</p>
            </div>
            
            {/* Activation Amount in USDT - $ symbol */}
            <div className="flex justify-between items-center pt-2 border-t border-blue-500/20">
              <p className="text-xs text-gray-400">Activation Amount:</p>
              <p className="text-lg font-black text-[#00F5A0]">
                ${calculateActivationAmount(localInputLimit)} USDT
              </p>
            </div>
            
            {/* Calculation Explanation */}
            <p className="text-[10px] text-gray-500 mt-2 text-center bg-black/20 p-2 rounded-lg">
              ⚡ {(localInputLimit * 0.1).toFixed(2)} INR ÷ 95 = {calculateActivationAmount(localInputLimit)} USDT
            </p>
            
            {/* Validity Period */}
            <p className="text-[10px] text-green-500 mt-2 text-center">
              ✅ Valid for 7 days from activation
            </p>
          </div>
        ) : (
          <div className="mt-4 p-4 bg-gray-500/10 rounded-xl border border-gray-500/20">
            <p className="text-xs text-gray-400 text-center">
              Enter your 7-day limit to see activation amount
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl mb-6">
        <p className="text-yellow-500 text-xs font-bold flex items-center gap-2">
          <AlertCircle size={14} />
          After successful deposit, your wallet will be activated for 7 days automatically
        </p>
      </div>
      
      <div className="flex gap-4">
        <button 
          onClick={() => {
            setShowActivationModal(false);
            setLocalInputLimit("");
          }} 
          className="flex-1 bg-white/5 py-4 rounded-2xl font-black hover:bg-white/10 transition-all"
        >
          CANCEL
        </button>
        <button 
          onClick={() => {
            setDailyAcceptLimit(localInputLimit);
            confirmActivation();
          }}
          disabled={!localInputLimit || localInputLimit <= 0}
          className={`flex-1 py-4 rounded-2xl font-black transition-all ${
            !localInputLimit || localInputLimit <= 0
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-[#00F5A0] text-black hover:bg-[#00d88c]"
          }`}
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
        {/* USDT Wallet - $ symbol */}
        <WalletCard
          label="USDT Wallet"
          val={`$${usdt.toFixed(2)}`}
          sub={`≈ ₹${(usdt * 95).toLocaleString()}`}
        />

        {/* INR Wallet - ₹ symbol */}
        <WalletCard
          label="INR Wallet"
          val={`₹${inr.toLocaleString()}`}
          sub="Ready to spend"
          highlight
        />

        {/* Cashback Wallet - ₹ symbol */}
        <WalletCard
          label="Cashback"
          val={`₹${cb.toLocaleString()}`}
          sub="Available to redeem"
          showRedeem={cb > 0}
          onRedeem={onRedeem}
        />
      </div>
      
      {/* Rest remains same */}
      <div className="flex gap-4">
        <ActionButton icon={<PlusCircle />} label="Deposit" onClick={() => setActiveTab("Deposit")} />
        <ActionButton icon={<ScanLine />} label="Scanner Queue" primary onClick={() => setActiveTab("Scanner")} />
      </div>
      
      <div className="bg-[#0A1F1A] border border-white/10 rounded-[2rem] p-6 md:p-8">
        <h3 className="font-black italic mb-6">Recent Ledger</h3>
        <div className="space-y-2">
          {transactions.slice(0, 5).map(tx => (
            <TransactionRow 
  key={tx._id} 
  merchant={tx.type} 
  date={new Date(tx.createdAt).toLocaleDateString()} 
  amt={tx.amount}  // फक्त number पाठवा, symbol नको
  status="SUCCESS" 
  type={tx.type}   // type पाठवा
    meta={tx.meta || {}} 
/>
          ))}
        </div>
      </div>
    </div>
  );
};

// RequestCard Component - Updated to hide expired requests from everyone
const RequestCard = ({ s, user, loadAllData, setSelectedScanner, handleCancelRequest, walletActivated, acceptTermsAccepted, onActivateWallet }) => {
  const isOwner = String(s.user?._id) === String(user._id);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes = 600 seconds
  const [isExpired, setIsExpired] = useState(false);
  
  useEffect(() => {
    // Only calculate time for ACTIVE requests without acceptor
    if (s.status === "ACTIVE" && !s.acceptedBy) {
      const createdTime = new Date(s.createdAt).getTime();
      const currentTime = new Date().getTime();
      const elapsedSeconds = Math.floor((currentTime - createdTime) / 1000);
      const remaining = Math.max(0, 600 - elapsedSeconds); // 10 minutes expiry
      
      setTimeLeft(remaining);
      setIsExpired(remaining === 0);

      if (remaining > 0) {
        const timer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              setIsExpired(true);
              loadAllData(); // Refresh data when expired
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      }
    } else {
      setTimeLeft(0);
      // Check if it's expired based on status or time
      setIsExpired(
        s.status === "EXPIRED" || 
        (s.status === "ACTIVE" && !s.acceptedBy && new Date(s.createdAt).getTime() + 600000 < new Date().getTime())
      );
    }
  }, [s.createdAt, s.status, s.acceptedBy, loadAllData]);

  // ✅ Don't render if expired - for EVERYONE (owners and non-owners)
  // Expired requests should not be visible to anyone
  if (isExpired || s.status === "EXPIRED") {
    return null;
  }

  // Also don't render if status is COMPLETED (hide completed requests)
  if (s.status === "COMPLETED") {
    return null;
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusDisplay = () => {
    switch(s.status) {
      case "ACCEPTED":
        return { text: "ACCEPTED ⚡", color: "bg-blue-500/10 text-blue-500 border border-blue-500/20" };
      case "PAYMENT_SUBMITTED":
        return { text: "PROOF SUBMITTED 📸", color: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" };
      default:
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
    // Check if request is expired (double-check)
    if (isExpired) {
      toast.error(
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-red-500" />
          <div>
            <div className="font-bold">Request Expired!</div>
            <div className="text-xs">This request is no longer available</div>
          </div>
        </div>,
        { duration: 4000 }
      );
      return;
    }

    // Check if wallet is activated
    if (!walletActivated) {
      toast(
        <div 
          className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-all"
          onClick={() => {
            toast.dismiss();
            onActivateWallet();
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
          duration: 8000,
          style: {
            background: '#0A1F1A',
            color: 'white',
            border: '1px solid #eab308/20',
            padding: '12px',
          },
          icon: null
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
      const result = await acceptRequest(s._id);
      
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle size={20} className="text-[#00F5A0]" />
          <div>
            <div className="font-bold">Request Accepted! 🎯</div>
            <div className="text-xs">You have 10 minutes to complete the payment</div>
            <div className="text-[8px] text-gray-400 mt-1">
              ⏰ Complete payment within 10 minutes
            </div>
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
      {/* Status Badge and Timer */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${statusDisplay.color}`}>
          {statusDisplay.text}
        </div>
        
        {/* Show timer only for active requests */}
        {s.status === "ACTIVE" && !s.acceptedBy && (
          <div className={`${timeLeft < 60 ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'} text-[8px] font-black px-2 py-1.5 rounded-full flex items-center gap-1 border border-yellow-500/20`}>
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
      
      {/* Download QR Button */}
      <button
        onClick={downloadQR}
        className="mb-4 w-full bg-white/5 hover:bg-[#00F5A0]/10 border border-white/10 rounded-xl py-2 px-3 flex items-center justify-center gap-2 transition-all group"
      >
        <UploadCloud size={16} className="text-[#00F5A0] group-hover:scale-110 transition-transform" />
        <span className="text-xs font-bold text-gray-400 group-hover:text-[#00F5A0]">DOWNLOAD QR</span>
      </button>
      
      {/* Amount */}
      <h3 className="text-2xl font-black text-center mb-1 text-white">₹{s.amount}</h3>
      
      {/* Created By */}
      <p className="text-center text-[10px] text-gray-500 font-bold mb-3 italic uppercase bg-white/5 py-1.5 px-3 rounded-full mx-auto">
        Created by: {s.user?.name || s.user?.userId || `User ${s.user?._id?.slice(-6)}`}
      </p>

      {/* Accepted By Section */}
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

      {/* Action Buttons */}
      <div className="mt-auto space-y-2">
        {/* Owner Actions */}
        {isOwner ? (
          s.status === "PAYMENT_SUBMITTED" ? (
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
          ) : s.status === "ACTIVE" && !s.acceptedBy ? (
            <button 
              onClick={() => handleCancelRequest(s._id)}
              className="w-full bg-red-500/20 text-red-500 py-3 rounded-xl font-black text-sm hover:bg-red-500/30 transition-all border border-red-500/20"
            >
              ✕ CANCEL REQUEST
            </button>
          ) : null
        ) : (
          /* Acceptor Actions */
          <>
            {s.status === "ACTIVE" && (
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
          </>
        )}
        
        {/* Upload Screenshot Button (for accepted requests) */}
        {String(s.acceptedBy?._id) === String(user._id) && s.status === "ACCEPTED" && (
          <button 
            onClick={() => setSelectedScanner(s._id)} 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-black text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all"
          >
            📸 UPLOAD SCREENSHOT
          </button>
        )}
      </div>
    </div>
  );
};

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
  actionLoading,
  setActiveTab, // नवीन prop
  loadAllData   // नवीन prop
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
  const [redirectTimer, setRedirectTimer] = useState(null);
  
  const fileInputRef = useRef(null);

  // Timer effect - counts down from 120 to 0
  useEffect(() => {
    let timerInterval;
    
    if (showTimer && timeLeft > 0) {
      timerInterval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            setIsVerifying(false);
            
            // ✅ Timer complete - Set redirect timer
            const redirect = setTimeout(() => {
              setActiveTab("Overview"); // Go to Overview
              setShowTimer(false); // Hide timer
              loadAllData(); // Refresh data
              
              // Show success message
              toast.success(
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-[#00F5A0]" />
                  <div>
                    <div className="font-bold">Deposit Successful! 🎉</div>
                    <div className="text-xs">Your wallet has been activated</div>
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
            }, 2000); // 2 seconds delay before redirect
            
            setRedirectTimer(redirect);
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (redirectTimer) clearTimeout(redirectTimer);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [showTimer, setActiveTab, loadAllData]);

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
      
      toast.success("Deposit submitted! Verification will complete in 2 minutes.", {
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

      {/* ⏱️ 2-MINUTE TIMER DISPLAY WITH PROGRESS BAR */}
      {showTimer && (
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isVerifying && timeLeft > 0 ? (
                <Loader size={16} className="animate-spin text-yellow-500" />
              ) : (
                <CheckCircle size={16} className="text-green-500" />
              )}
              <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">
                {timeLeft > 0 ? "VERIFICATION IN PROGRESS" : "VERIFICATION COMPLETE ✓"}
              </span>
            </div>
            <div className="bg-yellow-500/20 px-3 py-1 rounded-full">
              <span className="text-sm font-black text-yellow-500 font-mono">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          
          {/* PROGRESS BAR */}
          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-green-500 transition-all duration-1000 ease-linear"
              style={{ 
                width: `${progressPercentage}%`,
              }}
            />
          </div>
          
          <p className="text-[10px] text-gray-500 mt-2 text-center">
            {timeLeft > 0 ? (
              <>⏱️ Verification in {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')} minutes</>
            ) : (
              <span className="text-green-500 font-bold">
                ✅ Verification complete! Redirecting to Overview...
              </span>
            )}
          </p>
          
          {timeLeft === 0 && (
            <p className="text-[10px] text-green-500 mt-1 text-center animate-pulse">
              Your wallet has been activated! You can now accept payments.
            </p>
          )}
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
            {timeLeft > 0 ? `WAITING (${formatTime(timeLeft)})` : "COMPLETED ✓"}
          </span>
        ) : (
          "SUBMIT DEPOSIT"
        )}
      </button>
    </form>
  );
};

// HistoryPage Component - FIXED with proper currency symbols
const HistoryPage = ({ transactions }) => (
  <div className="bg-[#0A1F1A] border border-white/10 p-4 md:p-8 rounded-[2rem]">
    <h2 className="text-xl font-bold mb-6 italic">Transaction History</h2>
    <div className="space-y-3">
      {transactions.map(tx => {
        // Determine which currency symbol to use
        let currencySymbol = "₹"; // Default INR
        
        // Case 1: DEPOSIT always in USD
        if (tx.type === 'DEPOSIT') {
          currencySymbol = "$";
        }
        // Case 2: WALLET_ACTIVATION based on meta or fromWallet
        else if (tx.type === 'WALLET_ACTIVATION') {
          // If meta has usdtAmount or fromWallet is USDT, show in USD
          if (tx.meta?.usdtAmount || tx.fromWallet === 'USDT') {
            currencySymbol = "$";
          } else {
            currencySymbol = "₹";
          }
        }
        // Case 3: Check meta for currency info
        else if (tx.meta?.currency === 'USDT' || tx.meta?.originalCurrency === 'USDT') {
          currencySymbol = "$";
        }
        // Case 4: Based on fromWallet/toWallet
        else if (tx.fromWallet === 'USDT' || tx.toWallet === 'USDT') {
          currencySymbol = "$";
        }
        
        return (
          <div key={tx._id} className="flex justify-between items-center p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-[#00F5A0]/20 transition-all">
            <div className="min-w-0 flex-1 mr-4">
              <p className="font-bold text-sm truncate flex items-center gap-2">
                {/* Icons based on transaction type */}
                {tx.type === 'TEAM_CASHBACK' && <Users size={14} className="text-purple-500" />}
                {tx.type === 'DEPOSIT' && <Wallet size={14} className="text-blue-500" />}
                {tx.type === 'WALLET_ACTIVATION' && <Zap size={14} className="text-[#00F5A0]" />}
                {tx.type === 'CASHBACK' && <Award size={14} className="text-orange-500" />}
                {tx.type === 'DEBIT' && <ArrowRightLeft size={14} className="text-red-500" />}
                {tx.type === 'CREDIT' && <ArrowRightLeft size={14} className="text-green-500" />}
                
                {/* Transaction type display */}
                {tx.type === 'TEAM_CASHBACK' ? 'Team Cashback' : 
                 tx.type === 'DEPOSIT' ? 'USDT Deposit' : 
                 tx.type === 'WALLET_ACTIVATION' ? 'Wallet Activation' : 
                 tx.type}
              </p>
              <p className="text-[10px] text-gray-500 font-bold">
                {new Date(tx.createdAt).toLocaleString()}
                {tx.meta?.type && (
                  <span className="ml-2 text-[8px] bg-white/5 px-2 py-0.5 rounded-full">
                    {tx.meta.type.replace(/_/g, ' ')}
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="font-black italic text-sm">
                {currencySymbol}{tx.amount.toFixed(2)}
                
                {/* Show conversion details for WALLET_ACTIVATION */}
                {tx.type === 'WALLET_ACTIVATION' && tx.meta?.inrAmount && (
                  <span className="block text-[8px] text-gray-500">
                    (≈ ₹{tx.meta.inrAmount})
                  </span>
                )}
                
                {/* Show conversion details for CONVERSION */}
                {tx.type === 'CONVERSION' && tx.meta && (
                  <span className="block text-[8px] text-gray-500">
                    (${tx.meta.originalAmount} → ₹{tx.amount})
                  </span>
                )}
              </p>
              <p className="text-[8px] text-[#00F5A0] font-black uppercase tracking-widest italic">
                {tx.type === 'WALLET_ACTIVATION' ? 'ACTIVATED' : tx.status || 'SUCCESS'}
              </p>
              
              {/* Show wallet movement */}
              {tx.fromWallet && tx.toWallet && (
                <p className="text-[7px] text-gray-600 mt-1">
                  {tx.fromWallet || 'System'} → {tx.toWallet}
                </p>
              )}
            </div>
          </div>
        );
      })}
      {transactions.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-600 font-bold">No Transactions Found</p>
          <p className="text-[10px] text-gray-700 mt-2">Your transactions will appear here</p>
        </div>
      )}
    </div>
  </div>
);

// ReferralPage Component - FULL UPDATED with Stats and Filters
const ReferralPage = ({ referralData, teamStats }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showTeamCashback, setShowTeamCashback] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [expandedMember, setExpandedMember] = useState(null);
  const [statsFilter, setStatsFilter] = useState('total'); // 'today' or 'total'
  const [todayStats, setTodayStats] = useState({
    teamBusiness: 0,
    yourCommission: 0,
    teamMembers: 0
  });

// ReferralPage Component मध्ये हा useEffect जोडा

// Load today's stats
useEffect(() => {
  const fetchTodayStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const data = await getTodayTeamStats(token);
      
      if (data.success) {
        setTodayStats({
          teamBusiness: data.teamBusiness || 0,
          yourCommission: data.yourCommission || 0,
          teamMembers: data.teamMembers || 0
        });
      }
    } catch (error) {
      console.error("Error fetching today stats:", error);
    }
  };
  
  fetchTodayStats();
}, []);

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralData.referralCode);
    toast.success('Referral code copied!', { duration: 2000 });
  };

  const levels = [
    { level: 1, rate: "30%", color: "from-yellow-500 to-orange-500" },
    { level: 2, rate: "15%", color: "from-blue-500 to-cyan-500" },
    { level: 3, rate: "10%", color: "from-green-500 to-emerald-500" },
    { level: 4, rate: "5%", color: "from-purple-500 to-pink-500" },
    { level: 5, rate: "30%", color: "from-red-500 to-rose-500" },
    { level: 6, rate: "3%", color: "from-indigo-500 to-purple-500" },
    { level: 7, rate: "4%", color: "from-pink-500 to-red-500" },
    { level: 8, rate: "3%", color: "from-teal-500 to-green-500" },
    { level: 9, rate: "3%", color: "from-cyan-500 to-blue-500" },
    { level: 10, rate: "30%", color: "from-orange-500 to-red-500" },
    { level: 11, rate: "3%", color: "from-lime-500 to-green-500" },
    { level: 12, rate: "3%", color: "from-amber-500 to-orange-500" },
    { level: 13, rate: "3%", color: "from-emerald-500 to-teal-500" },
    { level: 14, rate: "3%", color: "from-sky-500 to-blue-500" },
    { level: 15, rate: "3%", color: "from-violet-500 to-purple-500" },
    { level: 16, rate: "5%", color: "from-fuchsia-500 to-pink-500" },
    { level: 17, rate: "10%", color: "from-rose-500 to-red-500" },
    { level: 18, rate: "15%", color: "from-amber-500 to-orange-500" },
    { level: 19, rate: "30%", color: "from-emerald-500 to-teal-500" },
    { level: 20, rate: "30%", color: "from-blue-500 to-indigo-500" },
    { level: 21, rate: "63%", color: "from-purple-500 to-pink-500" }
  ];

  // Group levels by legs (7 legs for 21 levels)
  const legs = [
    { name: "Leg 1", levels: [1, 2, 3], unlocked: true },
    { name: "Leg 2", levels: [4, 5, 6], unlocked: teamStats?.legsUnlocked?.leg2 },
    { name: "Leg 3", levels: [7, 8, 9], unlocked: teamStats?.legsUnlocked?.leg3 },
    { name: "Leg 4", levels: [10, 11, 12], unlocked: teamStats?.legsUnlocked?.leg4 },
    { name: "Leg 5", levels: [13, 14, 15], unlocked: teamStats?.legsUnlocked?.leg5 },
    { name: "Leg 6", levels: [16, 17, 18], unlocked: teamStats?.legsUnlocked?.leg6 },
    { name: "Leg 7", levels: [19, 20, 21], unlocked: teamStats?.legsUnlocked?.leg7 }
  ];

  // Calculate total team business
  const totalTeamBusiness = teamStats 
    ? Object.values(teamStats).reduce((sum, level) => {
        if (level && typeof level === 'object' && level.teamCashback) {
          return sum + (level.teamCashback || 0);
        }
        return sum;
      }, 0) 
    : 0;

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
          Share this code & earn commissions on 21 levels!
        </p>
      </div>

      {/* Enhanced Stats Grid with Today/Total Filter */}
      <div className="bg-[#0A1F1A] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black italic">Team Statistics</h3>
          <div className="flex gap-2 bg-black/40 p-1 rounded-lg">
            <button
              onClick={() => setStatsFilter('today')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                statsFilter === 'today' 
                  ? 'bg-[#00F5A0] text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setStatsFilter('total')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                statsFilter === 'total' 
                  ? 'bg-[#00F5A0] text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Total
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Team Members Card */}
          <div className="bg-black/40 p-5 rounded-xl border border-white/5 hover:border-[#00F5A0]/20 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#00F5A0]/10 flex items-center justify-center">
                <Users size={22} className="text-[#00F5A0]" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Team</p>
                <p className="text-2xl font-black text-white">
                  {statsFilter === 'today' ? todayStats.teamMembers : referralData.totalReferrals}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 border-t border-white/5 pt-2">
              {statsFilter === 'today' ? 'Active today' : 'Across 21 levels'}
            </p>
          </div>

          {/* Total Team Business Card */}
          <div className="bg-black/40 p-5 rounded-xl border border-white/5 hover:border-[#00F5A0]/20 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#00F5A0]/10 flex items-center justify-center">
                <TrendingUp size={22} className="text-[#00F5A0]" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Team Business</p>
                <p className="text-2xl font-black text-[#00F5A0]">
                  ₹{statsFilter === 'today' 
                    ? todayStats.teamBusiness.toFixed(2) 
                    : totalTeamBusiness.toFixed(2)}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 border-t border-white/5 pt-2">
              Total cashback earned by team
            </p>
          </div>

          {/* Your Cashback From Team Card */}
          <div className="bg-black/40 p-5 rounded-xl border border-white/5 hover:border-orange-400/20 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Award size={22} className="text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Your Commission</p>
                <p className="text-2xl font-black text-orange-400">
                  ₹{statsFilter === 'today' 
                    ? todayStats.yourCommission.toFixed(2) 
                    : Number(referralData.referralEarnings?.total || 0).toFixed(2)}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 border-t border-white/5 pt-2">
              Commission from team
            </p>
          </div>
        </div>

        {/* Level-wise Quick Stats */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
            <TrendingUp size={14} className="text-[#00F5A0]" />
            Level-wise Team Business
          </h4>
          <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].map(level => {
              const levelStats = teamStats?.[`level${level}`];
              return (
                <div 
                  key={level} 
                  className={`bg-black/30 p-2 rounded-lg text-center ${
                    levelStats?.unlocked ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  <div className="flex justify-center items-center gap-1 mb-1">
                    <span className="text-[8px] text-gray-500">L{level}</span>
                    {levelStats?.unlocked ? (
                      <span className="text-[8px] text-green-500">🔓</span>
                    ) : (
                      <span className="text-[8px] text-yellow-500">🔒</span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-[#00F5A0] truncate">
                    ₹{(levelStats?.teamCashback || 0).toFixed(2)}
                  </p>
                  <p className="text-[7px] text-gray-600">{levelStats?.users || 0} members</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Cashback Section - Main */}
      <div className="bg-[#0A1F1A] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-[#00F5A0]" />
            <h3 className="text-lg font-black italic">Cashback on Team Business</h3>
          </div>
          <button
            onClick={() => setShowTeamCashback(!showTeamCashback)}
            className="text-[#00F5A0] hover:bg-[#00F5A0]/10 p-2 rounded-lg transition-all"
          >
            {showTeamCashback ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {/* Commission Rates by Legs */}
        <div className="space-y-4 mb-4">
          {legs.map((leg, index) => (
            <div key={index} className="border border-white/10 rounded-xl overflow-hidden">
              <div className={`p-3 flex items-center justify-between ${
                leg.unlocked ? 'bg-[#00F5A0]/10' : 'bg-gray-800/50'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${leg.unlocked ? 'text-[#00F5A0]' : 'text-gray-500'}`}>
                    {leg.name}
                  </span>
                  {!leg.unlocked && (
                    <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">
                      Locked
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {leg.levels.map(level => {
                    const levelData = levels.find(l => l.level === level);
                    return (
                      <div key={level} className={`text-[10px] px-2 py-1 rounded ${
                        leg.unlocked ? `bg-gradient-to-r ${levelData.color} text-white` : 'bg-gray-700 text-gray-500'
                      }`}>
                        L{level}: {levelData.rate}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {showTeamCashback && leg.unlocked && leg.levels.map(level => {
                const levelStats = teamStats?.[`level${level}`];
                if (!levelStats) return null;
                
                return (
                  <div key={level} className="p-3 border-t border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">Level {level}</span>
                      <span className="text-xs text-[#00F5A0]">
                        {levelStats.users} members
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-black/40 p-2 rounded-lg">
                        <p className="text-[8px] text-gray-500">Team Cashback</p>
                        <p className="text-sm font-bold text-[#00F5A0]">
                          ₹{(levelStats.teamCashback || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-black/40 p-2 rounded-lg">
                        <p className="text-[8px] text-gray-500">Your Commission</p>
                        <p className="text-sm font-bold text-orange-400">
                          ₹{(levelStats.yourCommission || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Members List */}
                    {levelStats.usersList && levelStats.usersList.length > 0 && (
                      <div className="mt-2">
                        <button
                          onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
                          className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Users size={12} />
                          {selectedLevel === level ? 'Hide members' : `View ${levelStats.users} members`}
                        </button>

                        {selectedLevel === level && (
                          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                            {levelStats.usersList.map((member, i) => (
                              <div key={i} className="bg-black/30 rounded-lg p-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                      {member.userId?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-white">{member.userId}</p>
                                      <p className="text-[8px] text-gray-500">Level {level} Member</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setExpandedMember(expandedMember === member.userId ? null : member.userId)}
                                    className="text-[#00F5A0] hover:text-[#00d88c]"
                                  >
                                    {expandedMember === member.userId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  </button>
                                </div>

                                {expandedMember === member.userId && (
                                  <div className="mt-2 pt-2 border-t border-white/10">
                                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                                      <div>
                                        <p className="text-gray-500">Total Earnings</p>
                                        <p className="text-[#00F5A0] font-bold">₹{(member.earnings || 0).toFixed(2)}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Team Cashback</p>
                                        <p className="text-orange-400 font-bold">₹{(member.teamCashback || 0).toFixed(2)}</p>
                                      </div>
                                    </div>
                                    
                                    {/* Member's own team (if any) */}
                                    {member.downline && member.downline.length > 0 && (
                                      <div className="mt-2">
                                        <p className="text-[8px] text-gray-500 mb-1">Downline Members:</p>
                                        <div className="space-y-1">
                                          {member.downline.slice(0, 3).map((down, idx) => (
                                            <div key={idx} className="flex justify-between text-[8px] bg-black/40 p-1 rounded">
                                              <span className="text-gray-400">{down.userId}</span>
                                              <span className="text-[#00F5A0]">₹{(down.earnings || 0).toFixed(2)}</span>
                                            </div>
                                          ))}
                                          {member.downline.length > 3 && (
                                            <p className="text-[7px] text-gray-600 text-center">
                                              +{member.downline.length - 3} more members
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Unlock Next Leg Info */}
        {legs.some(leg => !leg.unlocked) && (
          <div className="mt-4 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <p className="text-[10px] text-blue-400 flex items-center gap-1">
              <TrendingUp size={12} />
              To unlock next leg, add at least 1 member in the last level of current leg
            </p>
          </div>
        )}
      </div>

      {/* Commission Rates Summary (Collapsible) */}
      <div className="bg-[#0A1F1A] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award size={20} className="text-[#00F5A0]" />
            <h3 className="text-lg font-black italic">Commission Rates (All 21 Levels)</h3>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[#00F5A0] hover:bg-[#00F5A0]/10 p-2 rounded-lg transition-all"
          >
            {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {showDetails && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {levels.map((level) => (
              <div key={level.level} className="bg-black/40 p-2 rounded-lg text-center">
                <span className="text-[8px] text-gray-500">Level {level.level}</span>
                <div className={`text-xs font-bold bg-gradient-to-r ${level.color} text-white px-2 py-1 rounded mt-1`}>
                  {level.rate}
                </div>
              </div>
            ))}
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

// TransactionRow Component - FIXED with safe meta handling
const TransactionRow = ({ merchant, date, amt, status, type, meta = {} }) => {
  // Determine currency symbol
  let currencySymbol = "₹"; // Default INR
  
  // Case 1: DEPOSIT always in USD
  if (type === 'DEPOSIT') {
    currencySymbol = "$";
  }
  // Case 2: WALLET_ACTIVATION based on meta
  else if (type === 'WALLET_ACTIVATION') {
    // Check if it's USDT-based activation
    if (meta?.usdtAmount || meta?.currency === 'USDT' || merchant === 'WALLET_ACTIVATION') {
      currencySymbol = "$";
    }
  }
  // Case 3: Check meta for currency
  else if (meta?.currency === 'USDT' || meta?.originalCurrency === 'USDT') {
    currencySymbol = "$";
  }
  
  return (
    <div className="flex justify-between items-center p-3 hover:bg-white/5 rounded-2xl transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#00F5A0]/10 flex items-center justify-center text-[#00F5A0]">
          {merchant === 'TEAM_CASHBACK' ? <Users size={14} /> : 
           merchant === 'DEPOSIT' ? <Wallet size={14} /> : 
           merchant === 'WALLET_ACTIVATION' ? <Zap size={14} /> : 
           <CheckCircle size={14} />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold truncate">
            {merchant === 'TEAM_CASHBACK' ? 'Team Cashback' : 
             merchant === 'WALLET_ACTIVATION' ? 'Wallet Activation' : 
             merchant}
          </p>
          <p className="text-[9px] text-gray-500 font-bold">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-black italic">
          {currencySymbol}{amt}
          {/* दाखवा की हे USDT आहे */}
          {type === 'WALLET_ACTIVATION' && currencySymbol === '$' && (
            <span className="block text-[8px] text-gray-500">USDT</span>
          )}
        </p>
        <p className="text-[8px] text-[#00F5A0] font-black uppercase italic tracking-widest">
          {merchant === 'WALLET_ACTIVATION' ? 'ACTIVATED' : status}
        </p>
      </div>
    </div>
  );
};

// ActionButton Component
const ActionButton = ({ icon, label, primary, onClick }) => (
  <button onClick={onClick} className={`flex-1 py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black flex items-center justify-center gap-3 border transition-all active:scale-95 ${primary ? "bg-[#00F5A0] text-black border-transparent" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
    <div className={primary ? "" : "text-[#00F5A0]"}>{icon}</div>
    <span className="text-xs md:text-sm italic">{label}</span>
  </button>
);

