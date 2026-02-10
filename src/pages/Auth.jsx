import React, { useState } from "react";
import { 
  Zap, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff 
} from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-indigo-50 flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Logo / Back to Home */}
      <a href="/" className="flex items-center gap-2 mb-8 group">
        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
          <Zap size={24} className="text-white fill-current" />
        </div>
        <span className="text-2xl font-black tracking-tighter text-slate-900">CPAY</span>
      </a>

      <div className="w-full max-w-[400px]">
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_20px_50px_rgba(79,70,229,0.1)] p-8 md:p-10">
          
          {/* Toggle Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-900 mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-slate-500 font-medium">
              {isLogin 
                ? "Enter your details to access your wallet" 
                : "Join 5,000+ users earning 5% cashback"}
            </p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            
            {/* Name Input (Only for Signup) */}
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            )}

            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {isLogin && (
              <div className="text-right px-1">
                <button className="text-xs font-bold text-indigo-600 hover:underline">Forgot Password?</button>
              </div>
            )}

            {/* Action Button */}
            <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
              {isLogin ? "Sign In" : "Get Started"}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-slate-400">
              <span className="bg-white px-4">Secure Access</span>
            </div>
          </div>

          {/* Switch Link */}
          <p className="text-center text-slate-600 font-bold">
            {isLogin ? "New to CPay?" : "Already have an account?"}{" "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 hover:underline ml-1"
            >
              {isLogin ? "Create Account" : "Login Now"}
            </button>
          </p>
        </div>

        {/* Security Footer */}
        <div className="mt-8 flex items-center justify-center gap-4 text-slate-400">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={16} className="text-green-500" />
            AES-256 Encryption
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
          <div className="text-xs font-bold uppercase tracking-wider">
            USDT Secured
          </div>
        </div>
      </div>
    </div>
  );
}