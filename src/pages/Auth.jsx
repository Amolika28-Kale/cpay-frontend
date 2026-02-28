// // pages/Auth.jsx
// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import {
//   Zap,
//   Lock,
//   ArrowRight,
//   ShieldCheck,
//   Eye,
//   EyeOff,
//   ChevronLeft,
//   User,
//   Key,
//   Users
// } from "lucide-react";
// import { login as userLogin, register, adminLogin } from "../services/authService";
// import toast from 'react-hot-toast';

// export default function Auth() {
//   const [isLogin, setIsLogin] = useState(true);
//   const [showPin, setShowPin] = useState(false);
//   const [formData, setFormData] = useState({
//     userId: "",
//     pin: "",
//     referralCode: ""
//   });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
    
//     if (name === 'userId') {
//       setFormData({ ...formData, [name]: value.toUpperCase().replace(/[^A-Z0-9]/g, '') });
//     } else if (name === 'pin') {
//       setFormData({ ...formData, [name]: value.replace(/[^0-9]/g, '').slice(0, 6) });
//     } else {
//       setFormData({ ...formData, [name]: value.toUpperCase().replace(/[^A-Z0-9]/g, '') });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     // Validate
//     if (formData.userId.length < 4) {
//       setError("User ID must be at least 4 characters");
//       setLoading(false);
//       return;
//     }
//     if (formData.pin.length !== 6) {
//       setError("PIN must be 6 digits");
//       setLoading(false);
//       return;
//     }

//     try {
//       let response;
      
//       // First try user login
//       if (isLogin) {
//         // Try user login first
//         response = await userLogin(formData.userId, formData.pin);
        
//         // If user login fails, try admin login
//         if (!response.success) {
//           const adminResponse = await adminLogin(formData.userId, formData.pin);
//           if (adminResponse.success) {
//             response = adminResponse;
//           }
//         }
//       } else {
//         // Registration - always user
//         response = await register({
//           userId: formData.userId,
//           pin: formData.pin,
//           referralCode: formData.referralCode || undefined
//         });
//       }

//       if (response.success) {
//         localStorage.setItem("token", response.data.token);
//         localStorage.setItem("user", JSON.stringify(response.data.user));
//         toast.success(isLogin ? "Login successful!" : "Account created successfully!");
        
//         // ✅ ROLE-WISE REDIRECT
//         const userRole = response.data.user.role;
        
//         if (userRole === "admin") {
//           navigate("/admin-dashboard");
//         } else {
//           navigate("/dashboard");
//         }
//       } else {
//         setError(response.message || (isLogin ? "Login failed" : "Registration failed"));
//       }
//     } catch (err) {
//       console.error("Auth error:", err);
//       setError("Network error. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#051510] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
//       <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00F5A0]/10 rounded-full blur-[120px] -z-10"></div>
//       <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] -z-10"></div>

//       <Link to="/" className="absolute top-10 left-10 flex items-center gap-2 text-gray-500 hover:text-[#00F5A0] transition-colors font-bold text-sm uppercase tracking-widest group">
//         <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
//       </Link>

//       <div className="flex flex-col items-center mb-10 group">
//         <div className="bg-[#00F5A0] p-3 rounded-2xl shadow-[0_0_30px_rgba(0,245,160,0.3)] mb-4 transition-transform group-hover:scale-110">
//           <Zap size={32} className="text-[#051510] fill-current" />
//         </div>
//         <span className="text-3xl font-black tracking-tighter italic">CpayLink</span>
//       </div>

//       <div className="w-full max-w-[440px] relative">
//         <div className="absolute -inset-0.5 bg-gradient-to-br from-[#00F5A0]/20 to-transparent rounded-[2.5rem] blur-sm"></div>
        
//         <div className="relative bg-[#0A1F1A] border border-white/10 rounded-[2.5rem] shadow-2xl p-8 md:p-12 backdrop-blur-xl">
          
//           <div className="text-center mb-10">
//             <h2 className="text-4xl font-bold mb-3 tracking-tight">
//               {isLogin ? "Welcome Back" : "Create Account"}
//             </h2>
//             <p className="text-gray-500 font-medium text-sm">
//               {isLogin
//                 ? "Enter your ID and 6-digit PIN"
//                 : "Create your ID and 6-digit PIN"}
//             </p>
//           </div>

//           {error && (
//             <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-center mb-6 text-xs font-bold uppercase tracking-widest">
//               {error}
//             </div>
//           )}

//           <form className="space-y-5" onSubmit={handleSubmit}>
            
//             <div className="relative group">
//               <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00F5A0] transition-colors" size={20} />
//               <input
//                 type="text"
//                 name="userId"
//                 placeholder="ID (4-20 characters)"
//                 value={formData.userId}
//                 onChange={handleInputChange}
//                 required
//                 className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00F5A0]/50 transition-all font-bold placeholder:text-gray-700 text-white uppercase"
//               />
//             </div>

//             <div className="relative group">
//               <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00F5A0] transition-colors" size={20} />
//               <input
//                 type={showPin ? "text" : "password"}
//                 name="pin"
//                 placeholder="6-digit PIN"
//                 value={formData.pin}
//                 onChange={handleInputChange}
//                 maxLength="6"
//                 required
//                 className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:border-[#00F5A0]/50 transition-all font-bold placeholder:text-gray-700 text-white"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPin(!showPin)}
//                 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#00F5A0] transition-colors"
//               >
//                 {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
//               </button>
//             </div>

//             {!isLogin && (
//               <div className="relative group">
//                 <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00F5A0] transition-colors" size={20} />
//                 <input
//                   type="text"
//                   name="referralCode"
//                   placeholder="Referral Code (Optional)"
//                   value={formData.referralCode}
//                   onChange={handleInputChange}
//                   className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00F5A0]/50 transition-all font-bold placeholder:text-gray-700 text-white uppercase"
//                 />
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-[#00F5A0] text-[#051510] py-5 rounded-2xl font-black text-lg shadow-[0_10px_30px_rgba(0,245,160,0.2)] hover:shadow-[0_10px_40px_rgba(0,245,160,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-60 mt-4"
//             >
//               {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
//               {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
//             </button>
//           </form>

//           {/* Switch between Login and Register */}
//           <div className="mt-10 pt-6 border-t border-white/5 text-center">
//             <p className="text-gray-500 font-bold text-sm">
//               {isLogin ? "New to the platform?" : "Already have an account?"}
//               <button
//                 onClick={() => {
//                   setIsLogin(!isLogin);
//                   setError("");
//                   setFormData({ userId: "", pin: "", referralCode: "" });
//                 }}
//                 className="text-[#00F5A0] hover:underline ml-2 italic font-black"
//               >
//                 {isLogin ? "Create Account" : "Login Here"}
//               </button>
//             </p>
//           </div>
//         </div>

//         <div className="mt-10 flex flex-col items-center gap-4">
//           <div className="flex items-center gap-6 text-gray-600">
//             <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
//               <ShieldCheck size={14} className="text-[#00F5A0]" />
//               AES-256 Secure
//             </div>
//             <div className="w-1 h-1 bg-white/10 rounded-full"></div>
//             <div className="text-[10px] font-black uppercase tracking-widest">
//               One ID for All
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// pages/Auth.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Zap,
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  ChevronLeft,
  User,
  Key,
  Users
} from "lucide-react";
import { login, register } from "../services/authService";
import toast from 'react-hot-toast';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPin, setShowPin] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    pin: "",
    referralCode: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Allow only alphanumeric for userId, only digits for pin
    if (name === 'userId') {
      setFormData({ ...formData, [name]: value.toUpperCase().replace(/[^A-Z0-9]/g, '') });
    } else if (name === 'pin') {
      setFormData({ ...formData, [name]: value.replace(/[^0-9]/g, '').slice(0, 6) });
    } else {
      setFormData({ ...formData, [name]: value.toUpperCase().replace(/[^A-Z0-9]/g, '') });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate
    if (formData.userId.length < 4) {
      setError("User ID must be at least 4 characters");
      setLoading(false);
      return;
    }
    if (formData.pin.length !== 6) {
      setError("PIN must be 6 digits");
      setLoading(false);
      return;
    }

    try {
      let response;
      if (isLogin) {
        response = await login(formData.userId, formData.pin);
      } else {
        response = await register({
          userId: formData.userId,
          pin: formData.pin,
          referralCode: formData.referralCode || undefined
        });
      }

      if (response.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        toast.success(isLogin ? "Login successful!" : "Account created successfully!");
        
        if (response.data.user.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(response.message || (isLogin ? "Login failed" : "Registration failed"));
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#051510] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00F5A0]/10 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] -z-10"></div>

      <Link to="/" className="absolute top-10 left-10 flex items-center gap-2 text-gray-500 hover:text-[#00F5A0] transition-colors font-bold text-sm uppercase tracking-widest group">
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
      </Link>

      <div className="flex flex-col items-center mb-10 group">
        <div className="bg-[#00F5A0] p-3 rounded-2xl shadow-[0_0_30px_rgba(0,245,160,0.3)] mb-4 transition-transform group-hover:scale-110">
          <Zap size={32} className="text-[#051510] fill-current" />
        </div>
        <span className="text-3xl font-black tracking-tighter italic">CpayLink</span>
      </div>

      <div className="w-full max-w-[440px] relative">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#00F5A0]/20 to-transparent rounded-[2.5rem] blur-sm"></div>
        
        <div className="relative bg-[#0A1F1A] border border-white/10 rounded-[2.5rem] shadow-2xl p-8 md:p-12 backdrop-blur-xl">
          
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-3 tracking-tight">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-gray-500 font-medium text-sm">
              {isLogin
                ? "Enter your User ID and 6-digit PIN"
                : "Create your User ID and 6-digit PIN"}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-center mb-6 text-xs font-bold uppercase tracking-widest">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00F5A0] transition-colors" size={20} />
              <input
                type="text"
                name="userId"
                placeholder="User ID (4-20 characters)"
                value={formData.userId}
                onChange={handleInputChange}
                required
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00F5A0]/50 transition-all font-bold placeholder:text-gray-700 text-white uppercase"
              />
            </div>

            <div className="relative group">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00F5A0] transition-colors" size={20} />
              <input
                type={showPin ? "text" : "password"}
                name="pin"
                placeholder="6-digit PIN"
                value={formData.pin}
                onChange={handleInputChange}
                maxLength="6"
                required
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:border-[#00F5A0]/50 transition-all font-bold placeholder:text-gray-700 text-white"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#00F5A0] transition-colors"
              >
                {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {!isLogin && (
              <div className="relative group">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00F5A0] transition-colors" size={20} />
                <input
                  type="text"
                  name="referralCode"
                  placeholder="Referral Code (Optional)"
                  value={formData.referralCode}
                  onChange={handleInputChange}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00F5A0]/50 transition-all font-bold placeholder:text-gray-700 text-white uppercase"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00F5A0] text-[#051510] py-5 rounded-2xl font-black text-lg shadow-[0_10px_30px_rgba(0,245,160,0.2)] hover:shadow-[0_10px_40px_rgba(0,245,160,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-60 mt-4"
            >
              {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
              {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-white/5 text-center">
            <p className="text-gray-500 font-bold text-sm">
              {isLogin ? "New to the platform?" : "Already have an account?"}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setFormData({ userId: "", pin: "", referralCode: "" });
                }}
                className="text-[#00F5A0] hover:underline ml-2 italic font-black"
              >
                {isLogin ? "Create Account" : "Login Here"}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 text-gray-600">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck size={14} className="text-[#00F5A0]" />
              AES-256 Secure
            </div>
            <div className="w-1 h-1 bg-white/10 rounded-full"></div>
            <div className="text-[10px] font-black uppercase tracking-widest">
              Simple ID + PIN
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}