import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Key, ArrowRight, ChevronLeft, Shield,
  Eye, EyeOff, Clock
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE from '../services/api';

const ResetPin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};

  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate('/find-account');
    }
  }, [email, navigate]);

  const startTimer = (seconds = 60) => {
    setTimer(seconds);
    setResendDisabled(true);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRequestPinReset = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error('Please enter your User ID');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE}/find/request-pin-reset`, { 
        userId, 
        email 
      });
      
      if (response.data.success) {
        toast.success('OTP sent to your email!');
        setStep(2);
        startTimer(60);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request PIN reset');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    setLoading(true);
    setStep(3);
    setLoading(false);
  };

  const handleResetPin = async (e) => {
    e.preventDefault();
    
    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      toast.error('PIN must be 6 digits');
      return;
    }
    
    if (newPin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE}/find/reset-pin`, {
        email,
        otp,
        newPin
      });
      
      if (response.data.success) {
        toast.success('PIN reset successfully!');
        setTimeout(() => navigate('/auth'), 2000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendDisabled) return;
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE}/find/request-pin-reset`, { 
        userId, 
        email 
      });
      
      if (response.data.success) {
        toast.success('New OTP sent!');
        startTimer(60);
      }
    } catch (err) {
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#051510] text-white flex flex-col items-center justify-center p-6 font-sans">
      
      <Link to="/find-account" className="absolute top-10 left-10 flex items-center gap-2 text-gray-500 hover:text-[#00F5A0] transition-colors font-bold text-sm uppercase tracking-widest group">
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
      </Link>

      <div className="w-full max-w-[440px]">
        <div className="bg-[#0A1F1A] border border-white/10 rounded-[2.5rem] p-8">
          
          <div className="text-center mb-8">
            <div className="bg-[#00F5A0]/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Key size={32} className="text-[#00F5A0]" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Reset PIN</h2>
            <p className="text-gray-500 text-sm">
              {step === 1 ? 'Enter your User ID' : 
               step === 2 ? 'Enter OTP sent to your email' : 
               'Create new 6-digit PIN'}
            </p>
          </div>

          {step === 1 && (
            <form onSubmit={handleRequestPinReset} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs text-gray-500 ml-2">User ID</label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit User ID"
                  maxLength="6"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-4 text-center text-2xl font-mono font-bold focus:outline-none focus:border-[#00F5A0]/50 transition-all text-white"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                Email: <span className="text-[#00F5A0]">{email}</span>
              </p>
              <button
                type="submit"
                disabled={loading || userId.length !== 6}
                className="w-full bg-[#00F5A0] text-[#051510] py-5 rounded-2xl font-black text-lg disabled:opacity-60"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-4 text-center text-2xl tracking-[0.5em] font-mono font-bold focus:outline-none focus:border-[#00F5A0]/50 transition-all text-white"
              />
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-[#00F5A0] text-[#051510] py-5 rounded-2xl font-black text-lg disabled:opacity-60"
              >
                Verify OTP
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendDisabled}
                  className="text-sm text-gray-500 hover:text-[#00F5A0] transition-colors disabled:opacity-50"
                >
                  {resendDisabled ? (
                    <span className="flex items-center justify-center gap-1">
                      <Clock size={14} /> Resend in {timer}s
                    </span>
                  ) : (
                    'Resend OTP'
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPin} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="New 6-digit PIN"
                    maxLength="6"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-4 text-center text-2xl font-mono font-bold focus:outline-none focus:border-[#00F5A0]/50 transition-all text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#00F5A0]"
                  >
                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPin ? "text" : "password"}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="Confirm PIN"
                    maxLength="6"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-4 text-center text-2xl font-mono font-bold focus:outline-none focus:border-[#00F5A0]/50 transition-all text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#00F5A0]"
                  >
                    {showConfirmPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || newPin.length !== 6 || confirmPin.length !== 6 || newPin !== confirmPin}
                className="w-full bg-[#00F5A0] text-[#051510] py-5 rounded-2xl font-black text-lg disabled:opacity-60"
              >
                {loading ? 'Resetting...' : 'Reset PIN'}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-gray-600">
          <Shield size={14} className="text-[#00F5A0]" />
          <span className="text-[10px] font-black uppercase tracking-widest">Secure PIN Reset</span>
        </div>
      </div>
    </div>
  );
};

export default ResetPin;