import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail, ArrowRight, ChevronLeft, Key, User,
  Shield, CheckCircle, AlertCircle, Clock,
  Lock, Send, Copy
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE from '../services/api';

const FindAccount = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);

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

  // Step 1: Find account by email
  const handleFindAccount = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    
    try {
 const response = await axios.post(`${API_BASE}/find/find-account`, { email });      
      if (response.data.success) {
        toast.success('OTP sent to your email!');
        setStep(2);
        startTimer(60);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to find account');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    setLoading(true);
    
    try {
const response = await axios.post(`${API_BASE}/find/verify-otp-userid`, { email, otp });      
      if (response.data.success) {
        toast.success('User ID sent to your email!');
        setStep(3);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendDisabled) return;
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE}/find/find-account`, { email });
      
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

  // Go to PIN reset
  const handlePinReset = () => {
    navigate('/reset-pin', { state: { email } });
  };

  return (
    <div className="min-h-screen bg-[#051510] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00F5A0]/10 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] -z-10"></div>

      <Link to="/auth" className="absolute top-10 left-10 flex items-center gap-2 text-gray-500 hover:text-[#00F5A0] transition-colors font-bold text-sm uppercase tracking-widest group">
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Login
      </Link>

      <div className="flex flex-col items-center mb-10 group">
        <div className="bg-[#00F5A0] p-3 rounded-2xl shadow-[0_0_30px_rgba(0,245,160,0.3)] mb-4 transition-transform group-hover:scale-110">
          <User size={32} className="text-[#051510]" />
        </div>
        <span className="text-3xl font-black tracking-tighter italic">Find Account</span>
      </div>

      <div className="w-full max-w-[440px] relative">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#00F5A0]/20 to-transparent rounded-[2.5rem] blur-sm"></div>
        
        <div className="relative bg-[#0A1F1A] border border-white/10 rounded-[2.5rem] shadow-2xl p-8 md:p-12 backdrop-blur-xl">
          
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s === step
                    ? 'w-8 bg-[#00F5A0]'
                    : s < step
                    ? 'w-4 bg-[#00F5A0]/50'
                    : 'w-4 bg-white/10'
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#00F5A0]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail size={32} className="text-[#00F5A0]" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Find Your Account</h2>
                <p className="text-gray-500 text-sm">
                  Enter your registered email to receive OTP
                </p>
              </div>

              <form onSubmit={handleFindAccount} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 ml-2">Email Address</label>
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-4 pl-12 focus:outline-none focus:border-[#00F5A0]/50 transition-all text-white"
                      required
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00F5A0]" size={20} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00F5A0] text-[#051510] py-5 rounded-2xl font-black text-lg shadow-[0_10px_30px_rgba(0,245,160,0.2)] hover:shadow-[0_10px_40px_rgba(0,245,160,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                  {!loading && <Send size={20} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#00F5A0]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Key size={32} className="text-[#00F5A0]" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Verify OTP</h2>
                <p className="text-gray-500 text-sm">
                  Enter the 6-digit code sent to<br />
                  <span className="text-[#00F5A0] font-bold">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 ml-2">6-digit OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-4 text-center text-2xl tracking-[0.5em] font-mono font-bold focus:outline-none focus:border-[#00F5A0]/50 transition-all text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-[#00F5A0] text-[#051510] py-5 rounded-2xl font-black text-lg disabled:opacity-60"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
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
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Account Found!</h2>
                <p className="text-gray-500 text-sm mb-4">
                  We've sent your User ID to<br />
                  <span className="text-[#00F5A0] font-bold">{email}</span>
                </p>
                
                <div className="bg-black/40 p-4 rounded-xl border border-white/10 space-y-2">
                  <Link
                    to="/auth"
                    className="block w-full bg-[#00F5A0]/10 hover:bg-[#00F5A0]/20 p-3 rounded-xl text-sm font-bold transition-all"
                  >
                    Login with User ID
                  </Link>
                  
                  <button
                    onClick={handlePinReset}
                    className="w-full bg-blue-500/10 hover:bg-blue-500/20 p-3 rounded-xl text-sm font-bold transition-all"
                  >
                    Forgot PIN? Reset it
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-gray-600">
          <Shield size={14} className="text-[#00F5A0]" />
          <span className="text-[10px] font-black uppercase tracking-widest">Secure OTP Verification</span>
        </div>
      </div>
    </div>
  );
};

export default FindAccount;