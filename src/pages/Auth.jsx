import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Zap,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  ChevronLeft,
  Phone
} from "lucide-react";

import {
  login,
  register,
} from "../services/authService";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    mobile: "", // name ऐवजी mobile
    email: "",
    password: "",
    referralCode: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    let response;

    if (isLogin) {
      response = await login(formData.email, formData.password);
    } else {
      response = await register({
        mobile: formData.mobile, // mobile पाठवतो
        email: formData.email,
        password: formData.password,
        referralCode: formData.referralCode || undefined
      });
    }

    if (response.ok) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      if (response.data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    } else {
      setError(response.data.message || "Authentication failed");
    }

  } catch (err) {
    setError("Network error. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#051510] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00F5A0]/10 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] -z-10"></div>

      {/* Back to Home */}
      <Link to="/" className="absolute top-10 left-10 flex items-center gap-2 text-gray-500 hover:text-[#00F5A0] transition-colors font-bold text-sm uppercase tracking-widest group">
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
      </Link>

      {/* Logo */}
      <div className="flex flex-col items-center mb-10 group">
        <div className="bg-[#00F5A0] p-3 rounded-2xl shadow-[0_0_30px_rgba(0,245,160,0.3)] mb-4 transition-transform group-hover:scale-110">
          <Zap size={32} className="text-[#051510] fill-current" />
        </div>
        <span className="text-3xl font-black tracking-tighter italic">CPAY</span>
      </div>

      <div className="w-full max-w-[440px] relative">
        {/* Decorative Border Layer */}
        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#00F5A0]/20 to-transparent rounded-[2.5rem] blur-sm"></div>
        
        {/* Main Card */}
        <div className="relative bg-[#0A1F1A] border border-white/10 rounded-[2.5rem] shadow-2xl p-8 md:p-12 backdrop-blur-xl">
          
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-3 tracking-tight">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-gray-500 font-medium text-sm">
              {isLogin
                ? "Enter your credentials to access your secure wallet"
                : "Join the next-gen crypto payment ecosystem"}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-center mb-6 text-xs font-bold uppercase tracking-widest">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>

            {!isLogin && (
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00F5A0] transition-colors" size={20} />
                <input
                  type="tel"
                  name="mobile"
                  placeholder="WhatsApp Number"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit mobile number"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00F5A0]/50 transition-all font-bold placeholder:text-gray-700 text-white"
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00F5A0] transition-colors" size={20} />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00F5A0]/50 transition-all font-bold placeholder:text-gray-700 text-white"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00F5A0] transition-colors" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:border-[#00F5A0]/50 transition-all font-bold placeholder:text-gray-700 text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#00F5A0] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {!isLogin && (
              <div className="relative group">
                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00F5A0] transition-colors" size={20} />
                <input
                  type="text"
                  name="referralCode"
                  placeholder="Referral Code (Optional)"
                  value={formData.referralCode}
                  onChange={handleInputChange}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00F5A0]/50 transition-all font-bold placeholder:text-gray-700 text-white"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00F5A0] text-[#051510] py-5 rounded-2xl font-black text-lg shadow-[0_10px_30px_rgba(0,245,160,0.2)] hover:shadow-[0_10px_40px_rgba(0,245,160,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-60 mt-4"
            >
              {loading
                ? "Processing..."
                : isLogin
                ? "Sign In"
                : "Create Account"}

              {!loading && (
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              )}
            </button>
          </form>

          {/* Switch Tab */}
          <div className="mt-10 pt-6 border-t border-white/5 text-center">
            <p className="text-gray-500 font-bold text-sm">
              {isLogin ? "New to the platform?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#00F5A0] hover:underline ml-2 italic font-black"
              >
                {isLogin ? "Sign Up Now" : "Login Here"}
              </button>
            </p>
          </div>
        </div>

        {/* Footer Security Info */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 text-gray-600">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck size={14} className="text-[#00F5A0]" />
              AES-256 Secure
            </div>
            <div className="w-1 h-1 bg-white/10 rounded-full"></div>
            <div className="text-[10px] font-black uppercase tracking-widest">
              2FA Ready
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}