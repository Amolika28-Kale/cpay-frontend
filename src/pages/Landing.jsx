import React from "react";
import { 
  Wallet, 
  ScanLine, 
  IndianRupee, 
  Gift, 
  ShieldCheck, 
  Users, 
  Zap,
  ArrowRight,
  CheckCircle2,
  Lock,
  Smartphone,
  MousePointer2,
  RefreshCcw,
  PlusCircle
} from "lucide-react";

export default function Landing() {
  return (
    <div className="w-full overflow-x-hidden font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* ================= NAVIGATION ================= */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-[100] border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <Zap size={24} className="text-white fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">CPAY</span>
          </div>
          <div className="hidden md:flex gap-10 text-sm font-bold text-slate-600">
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</a>
            <a href="#scanner" className="hover:text-indigo-600 transition-colors">Scanner</a>
            <a href="#rewards" className="hover:text-indigo-600 transition-colors">Rewards</a>
          </div>
          <div className="flex items-center gap-4">
             <a href="/auth" className="hidden sm:block text-sm font-bold text-slate-700 hover:text-indigo-600 px-4">Login</a>
             <a href="/auth" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                Get Started
             </a>
          </div>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-32 pb-20 lg:pt-52 lg:pb-40 px-6 bg-white overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-3xl opacity-50 -z-10"></div>
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-left animate-in fade-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-8">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
              The Future of P2P is here
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.95] mb-8 tracking-tight">
              Crypto to INR <br />
              <span className="text-indigo-600">Made Simple.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-lg leading-relaxed font-medium">
              Deposit USDT, convert to INR instantly, and pay anyone using scanners. Earn <span className="text-indigo-600 font-bold">Upto 10% cash backs in real money on every payment.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 active:scale-95">
                Get Started <ArrowRight size={22} />
              </button>
              <a href="#how-it-works" className="flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white hover:border-indigo-600 transition-all">
                How It Works
              </a>
            </div>
          </div>
          
          {/* Hero Visual */}
          <div className="relative">
            <div className="relative z-10 bg-white border-8 border-slate-900 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] aspect-[9/16] max-w-[320px] mx-auto overflow-hidden">
              <div className="bg-slate-900 h-8 w-full flex justify-center items-end pb-1">
                <div className="h-1 w-12 bg-slate-800 rounded-full"></div>
              </div>
              <div className="p-6">
                <div className="flex justify-between mb-8">
                  <div className="h-4 w-4 bg-indigo-100 rounded-full"></div>
                  <div className="h-4 w-12 bg-slate-100 rounded-full"></div>
                </div>
                <div className="bg-indigo-600 rounded-3xl p-6 text-white mb-6">
                  <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">INR Balance</p>
                  <p className="text-3xl font-black">₹ 82,450</p>
                </div>
                <div className="space-y-4">
                  <div className="h-12 w-full bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold uppercase">
                    Scan any QR Code
                  </div>
                  {[1,2].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                      <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><PlusCircle size={18}/></div>
                      <div className="flex-1">
                        <div className="h-2 w-16 bg-slate-200 rounded"></div>
                        <div className="h-2 w-10 bg-slate-100 rounded mt-2"></div>
                      </div>
                      <div className="text-green-500 font-bold text-xs">+₹50</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Floating Badges */}
            <div className="absolute top-10 -right-4 md:-right-10 z-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-bounce">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg text-green-600"><Gift size={20}/></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Cashback</p>
                  <p className="text-sm font-bold">+ ₹450.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHAT IS CPAY ================= */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                What is CPay?
              </h2>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium">
                CPay is a <span className="text-indigo-600 font-bold">crypto-funded payment platform</span>. 
                Instead of dealing with complex exchanges, you deposit USDT and use its INR value 
                to make instant payments within a secure ecosystem.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <FeatureCheck text="No direct crypto payments" />
                <FeatureCheck text="INR-based transactions" />
                <FeatureCheck text="Admin-controlled & secure" />
                <FeatureCheck text="Cashback rewards" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <StatCard color="bg-indigo-600" title="Security" val="Escrow" />
                <StatCard color="bg-slate-900" title="Fee" val="Low" />
              </div>
              <div className="space-y-4 pt-8">
                <StatCard color="bg-purple-600" title="Settlement" val="Instant" />
                <StatCard color="bg-indigo-400" title="Rewards" val="5%" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h3 className="text-indigo-600 font-black uppercase tracking-[0.2em] text-sm mb-4">Workflow</h3>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900">How CPay Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          <StepCard 
            step="1"
            icon={<Users className="text-indigo-600" size={32} />} 
            title="Signup" 
            desc="Create account in 30s" 
          />
          <StepCard 
            step="2"
            icon={<Wallet className="text-indigo-600" size={32} />} 
            title="Deposit" 
            desc="USDT (TRC20/BEP20)" 
          />
          <StepCard 
            step="3"
            icon={<RefreshCcw className="text-indigo-600" size={32} />} 
            title="Convert" 
            desc="Instant INR value" 
          />
          <StepCard 
            step="4"
            icon={<ScanLine className="text-indigo-600" size={32} />} 
            title="Pay" 
            desc="Use any Scanner" 
          />
          <StepCard 
            step="5"
            icon={<Gift className="text-indigo-600" size={32} />} 
            title="Earn" 
            desc="5% Back Instantly" 
          />
        </div>
      </section>

      {/* ================= SCANNER EXPLAINED ================= */}
      <section id="scanner" className="py-24 px-6 bg-slate-900 text-white rounded-[3rem] mx-4 mb-24 overflow-hidden relative">
        <div className="absolute bottom-0 right-0 opacity-10"><ScanLine size={400} /></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                Scanner Payment <br /><span className="text-indigo-400">Simplified</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 font-medium">
                Our unique chat-based payment system ensures fast, fair, and secure settlements.
              </p>
              <div className="space-y-6">
                <ScannerFeature title="First-Come-First-Serve" desc="The first user to pay the uploaded scanner secures the deal." />
                <ScannerFeature title="One-Time Use" desc="Once a scanner is paid, it automatically disappears from the feed." />
                <ScannerFeature title="Instant Settlement" desc="No waiting. Your payment is verified and processed in real-time." />
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <span className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></span>
                <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Live Chat Feed</span>
              </div>
              <div className="space-y-4">
                <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 rounded-full bg-slate-700"></div>
                     <span className="text-sm font-bold text-slate-300">Merchant #04</span>
                   </div>
                   <div className="aspect-square bg-white rounded-xl mb-4 flex items-center justify-center">
                      <ScanLine size={100} className="text-slate-900 opacity-20" />
                   </div>
                   <button className="w-full bg-indigo-600 py-4 rounded-xl font-black hover:bg-indigo-500 transition-all flex items-center justify-center gap-2">
                     PAY ₹1,500 <MousePointer2 size={18} />
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= REWARDS ================= */}
      <section id="rewards" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Cashback & Referrals</h2>
          <p className="text-lg text-slate-600 font-medium">Maximize your crypto value with our multi-tier reward system.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="group bg-indigo-50 p-10 rounded-[3rem] border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all duration-500">
            <Gift className="mb-6 text-indigo-600 group-hover:text-white transition-colors" size={48} />
            <h3 className="text-3xl font-black mb-4">5% Paying Cashback</h3>
            <p className="opacity-80 font-medium mb-6 leading-relaxed">Every time you pay a scanner, 5% of the total INR value is instantly credited back to your reward wallet.</p>
            <div className="text-sm font-black uppercase tracking-widest bg-white/20 inline-block px-4 py-2 rounded-lg">Example: Pay ₹10,000 → Get ₹500 Back</div>
          </div>
          
          <div className="group bg-slate-900 p-10 rounded-[3rem] text-white hover:bg-indigo-600 transition-all duration-500">
            <Users className="mb-6 text-indigo-400 group-hover:text-white transition-colors" size={48} />
            <h3 className="text-3xl font-black mb-4">1% Referral Bonus</h3>
            <p className="text-slate-400 group-hover:text-indigo-100 font-medium mb-6 leading-relaxed">Invite your network and earn 1% of every USDT conversion they make. Passive income on every deposit.</p>
            <div className="text-sm font-black uppercase tracking-widest bg-white/10 inline-block px-4 py-2 rounded-lg">Reusable & Withdraw-friendly</div>
          </div>
        </div>
      </section>

      {/* ================= WHY CPAY ================= */}
      <section className="py-24 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-16">Why Users Trust CPay</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <WhyCard icon={<ShieldCheck size={32}/>} title="Secure Admin Escrow" />
            <WhyCard icon={<Zap size={32}/>} title="Instant INR Liquidity" />
            <WhyCard icon={<IndianRupee size={32}/>} title="Zero Complexity" />
            <WhyCard icon={<Lock size={32}/>} title="USDT Asset Backing" />
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-tight">
            Start using your crypto <br /><span className="text-indigo-600 underline decoration-indigo-200 decoration-8 underline-offset-8">the smart way.</span>
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button className="bg-indigo-600 text-white px-12 py-6 rounded-[2rem] font-black text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 active:scale-95">
              Create Free Account
            </button>
            <button className="bg-white border-2 border-slate-200 text-slate-900 px-12 py-6 rounded-[2rem] font-black text-xl hover:border-slate-900 transition-all">
              Login to CPay
            </button>
          </div>
          <p className="mt-10 text-slate-400 font-bold flex items-center justify-center gap-2">
            <CheckCircle2 size={18} className="text-green-500" /> Trusted by 5,000+ Active Users
          </p>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white border-t border-slate-100 py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white"><Zap size={20} /></div>
            <span className="text-xl font-black tracking-tighter">CPAY</span>
          </div>
          <div className="flex gap-8 text-sm font-bold text-slate-500">
            <a href="#" className="hover:text-indigo-600">Privacy</a>
            <a href="#" className="hover:text-indigo-600">Terms</a>
            <a href="#" className="hover:text-indigo-600">Support</a>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            © 2026 CPay Ecosystem. Secure Payments.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ================= HELPER COMPONENTS ================= */

const StepCard = ({ step, icon, title, desc }) => (
  <div className="relative group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col items-center text-center transition-all hover:-translate-y-2">
    <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
      {icon}
    </div>
    <div className="absolute top-4 right-4 text-4xl font-black text-slate-100 group-hover:text-indigo-50 transition-colors">
      0{step}
    </div>
    <h4 className="text-lg font-black text-slate-900 mb-2">{title}</h4>
    <p className="text-slate-500 font-medium text-sm leading-relaxed">{desc}</p>
  </div>
);

const FeatureCheck = ({ text }) => (
  <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
    <CheckCircle2 size={20} className="text-green-500 shrink-0" />
    <span className="font-bold text-slate-700 text-sm">{text}</span>
  </div>
);

const StatCard = ({ color, title, val }) => (
  <div className={`${color} p-6 rounded-[2.5rem] text-white shadow-lg`}>
    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">{title}</p>
    <p className="text-2xl font-black">{val}</p>
  </div>
);

const ScannerFeature = ({ title, desc }) => (
  <div className="flex gap-5">
    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
      <CheckCircle2 size={14} className="text-white" />
    </div>
    <div>
      <h5 className="font-black text-xl mb-1">{title}</h5>
      <p className="text-slate-400 font-medium">{desc}</p>
    </div>
  </div>
);

const WhyCard = ({ icon, title }) => (
  <div className="flex flex-col items-center gap-4 group">
    <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <p className="font-black text-sm text-slate-900 uppercase tracking-tight">{title}</p>
  </div>
);