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
  PlusCircle,
  Shield,
 
} from "lucide-react";

export default function Landing() {
  return (
    <div className="w-full bg-[#051510] font-sans text-white selection:bg-[#00F5A0] selection:text-[#051510]">
      
      {/* ================= NAVIGATION ================= */}
      <nav className="fixed top-0 w-full bg-[#051510]/80 backdrop-blur-md z-[100] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#00F5A0] p-2 rounded-lg shadow-[0_0_20px_rgba(0,245,160,0.3)]">
              <Zap size={20} className="text-[#051510] fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight">CPay</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-[#00F5A0] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#00F5A0] transition-colors">How it Works</a>
            <a href="#rewards" className="hover:text-[#00F5A0] transition-colors">Rewards</a>
          </div>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#00F5A0]/10 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-[#00F5A0] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8">
              <span className="h-2 w-2 rounded-full bg-[#00F5A0] animate-pulse"></span>
              Next-Gen Crypto Payments
            </div>
            <h1 className="text-6xl md:text-8xl font-bold leading-[1.1] mb-8 tracking-tight">
              Crypto to INR <br />
              Payments <span className="text-[#00F5A0]">Made Simple</span>
            </h1>
            <p className="text-lg text-gray-400 mb-10 max-w-lg leading-relaxed">
              Deposit USDT and pay any UPI or Merchant scanner in seconds. Secure, liquid, and decentralized transactions for the modern economy.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-[#00F5A0] text-[#051510] px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 hover:scale-105 transition-transform">
                Get Started <ArrowRight size={20} />
              </button>
          
            </div>
          </div>
          
          {/* Dashboard Preview Mockup */}
          <div className="relative group">
            <div className="bg-[#0A1F1A] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative z-10">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Current Balance</p>
                  <h3 className="text-4xl font-bold text-[#00F5A0]">₹1,24,500.00</h3>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <PlusCircle className="text-[#00F5A0]" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#00F5A0]/10 p-2.5 rounded-xl"><ScanLine size={20} className="text-[#00F5A0]" /></div>
                    <div><p className="font-bold text-sm">Grocery Merchant</p><p className="text-xs text-gray-500">2 mins ago</p></div>
                  </div>
                  <p className="text-red-400 font-bold">- ₹450</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500/10 p-2.5 rounded-xl"><PlusCircle size={20} className="text-blue-400" /></div>
                    <div><p className="font-bold text-sm">USDT Deposit</p><p className="text-xs text-gray-500">1 hour ago</p></div>
                  </div>
                  <p className="text-green-400 font-bold">+ $500.00</p>
                </div>
              </div>
            </div>
            {/* Background Glow behind card */}
            <div className="absolute inset-0 bg-[#00F5A0]/20 blur-[60px] opacity-50"></div>
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE CPAY ================= */}
      <section id="features" className="py-24 px-6 bg-[#030D0A]">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose CPay?</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">We bridge the gap between your digital assets and real-world spending with a focus on security and efficiency.</p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<ShieldCheck className="text-[#00F5A0]" />}
            title="Secure Transactions"
            points={["End-to-end encrypted payment tunnels", "Multi-sig USDT deposit wallets", "Fraud detection algorithms"]}
          />
          <FeatureCard 
            icon={<Zap className="text-[#00F5A0]" />}
            title="Instant Conversion"
            points={["Real-time USDT to INR rates", "Zero slippage on small trades", "Immediate settlement to scanner"]}
          />
          <FeatureCard 
            icon={<Wallet className="text-[#00F5A0]" />}
            title="Managed Liquidity"
            points={["Admin-controlled P2P pools", "Guaranteed INR payout for scans", "24/7 liquidity availability"]}
          />
        </div>
      </section>

      {/* ================= 5 STEPS TO FREEDOM ================= */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-bold mb-4">5 Steps to Freedom</h2>
        </div>

        <div className="max-w-7xl mx-auto relative">
          {/* Connector Line */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-[2px] bg-white/5 -z-10"></div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">
            <StepItem number="1" title="Signup" desc="Create an account in under 30 seconds with minimal KYC." />
            <StepItem number="2" title="Deposit USDT" desc="Send USDT to your personal CPay secure wallet." />
            <StepItem number="3" title="Convert" desc="Convert your USDT balance to INR instantly." />
            <StepItem number="4" title="Pay Scanner" desc="Scan any merchant QR code and pay with INR." />
            <StepItem number="5" title="Earn Cashback" desc="Get rewarded for every successful transaction." />
          </div>
        </div>
      </section>

      {/* ================= SMART SCANNER QUEUE ================= */}
      <section className="py-24 px-6 bg-[#030D0A]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          {/* Scanner Mockup */}
          <div className="flex justify-center">
            <div className="bg-[#0A1F1A] border border-white/10 rounded-[2.5rem] p-6 w-full max-w-[320px] shadow-2xl relative">
              <div className="border-2 border-dashed border-[#00F5A0]/30 rounded-2xl aspect-square flex flex-col items-center justify-center mb-6">
                 <div className="bg-[#00F5A0]/10 p-4 rounded-full mb-3"><Smartphone className="text-[#00F5A0]" /></div>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Upload Screenshot</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                   <p className="text-[10px] text-gray-500 uppercase font-bold">Queue Status</p>
                   <span className="bg-[#00F5A0]/20 text-[#00F5A0] text-[10px] px-2 py-0.5 rounded-full font-bold">12 Active</span>
                </div>
                <p className="text-sm font-bold">Active Scanners</p>
              </div>
              <button className="w-full bg-[#00F5A0] text-[#051510] py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(0,245,160,0.2)]">Confirm & Pay</button>
            </div>
          </div>

          <div>
            <h2 className="text-4xl md:text-6xl font-bold mb-8">Smart Scanner Queue</h2>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed font-medium">
              Our proprietary "first-come-first-serve" scanner payment system ensures maximum efficiency. Upload your QR, and our automated P2P matching engine connects you with the fastest available INR liquidity.
            </p>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="bg-white/5 p-4 rounded-xl h-fit border border-white/10"><Users className="text-[#00F5A0]" /></div>
                <div>
                  <h4 className="text-xl font-bold mb-2">High-Speed Matching</h4>
                  <p className="text-gray-500">Automated matching with peer-to-peer liquidity providers for instant payouts.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="bg-white/5 p-4 rounded-xl h-fit border border-white/10"><RefreshCcw className="text-[#00F5A0]" /></div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Zero Waiting Time</h4>
                  <p className="text-gray-500">The queue system processes transactions in real-time, 24 hours a day.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= REWARDS SECTION ================= */}
      <section id="rewards" className="py-24 px-6 text-center">
        <h2 className="text-5xl md:text-7xl font-bold mb-4 italic">Earn While You Spend</h2>
        <p className="text-gray-500 mb-16">Maximize your crypto value with our unique cashback program.</p>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-[#00F5A0]/20 p-12 rounded-[2.5rem] relative group hover:bg-[#00F5A0]/5 transition-all">
            <h3 className="text-[#00F5A0] text-7xl font-bold mb-4 tracking-tighter">5%</h3>
            <h4 className="text-2xl font-bold mb-4">Transaction Cashback</h4>
            <p className="text-gray-500 mb-8">Receive 5% back on every single scanner payment you make. Credited instantly to your CPay wallet.</p>
            <button className="bg-[#00F5A0]/10 text-[#00F5A0] border border-[#00F5A0]/30 px-6 py-2 rounded-lg text-xs font-black uppercase tracking-[0.2em]">Standard Reward</button>
          </div>

          <div className="bg-white/5 border border-white/10 p-12 rounded-[2.5rem] hover:bg-white/10 transition-all">
            <h3 className="text-white text-7xl font-bold mb-4 tracking-tighter">1%</h3>
            <h4 className="text-2xl font-bold mb-4">Referral Cashback</h4>
            <p className="text-gray-500 mb-8">Invite your friends and earn 1% on every transaction they make—forever. Build your passive income stream.</p>
            <button className="bg-white/5 text-gray-400 border border-white/10 px-6 py-2 rounded-lg text-xs font-black uppercase tracking-[0.2em]">Referral Bonus</button>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-24 px-6 flex justify-center">
        <div className="bg-[#0A1F1A] border border-white/10 rounded-[3rem] p-12 md:p-20 text-center max-w-5xl w-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00F5A0]/10 blur-[80px]"></div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Ready to spend your crypto?</h2>
          <p className="text-gray-400 mb-12 text-lg max-w-2xl mx-auto">Join 10,000+ users who are already using CPay to bridge their digital assets with the Indian economy.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input type="email" placeholder="Enter your email" className="bg-black/20 border border-white/10 rounded-xl px-6 py-4 w-full max-w-xs focus:outline-none focus:border-[#00F5A0]/50" />
            <button className="bg-[#00F5A0] text-[#051510] px-8 py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(0,245,160,0.3)]">Get Early Access</button>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-12 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
             <div className="bg-white/5 p-1.5 rounded-lg border border-white/10"><Zap size={16} className="text-[#00F5A0]" /></div>
             <span className="font-bold">CPay</span>
          </div>
          <div className="flex gap-8 text-xs text-gray-500 font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
            <a href="#" className="hover:text-white transition-colors">Telegram</a>
          </div>
          <p className="text-[10px] text-gray-600 font-bold tracking-widest uppercase">© 2024 CPay Technologies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

/* ================= HELPER COMPONENTS ================= */

const FeatureCard = ({ icon, title, points }) => (
  <div className="bg-[#0A1F1A] border border-white/5 p-8 rounded-[2rem] text-left hover:border-[#00F5A0]/20 transition-all group">
    <div className="bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#00F5A0]/10 transition-colors">
      {icon}
    </div>
    <h4 className="text-xl font-bold mb-6">{title}</h4>
    <ul className="space-y-4">
      {points.map((p, i) => (
        <li key={i} className="flex items-center gap-3 text-sm text-gray-400 font-medium">
          <div className="bg-[#00F5A0]/20 rounded-full p-1"><CheckCircle2 size={12} className="text-[#00F5A0]" /></div>
          {p}
        </li>
      ))}
    </ul>
  </div>
);

const StepItem = ({ number, title, desc }) => (
  <div className="flex flex-col items-center text-center relative group">
    <div className="w-20 h-20 rounded-full bg-[#051510] border-[3px] border-white/10 flex items-center justify-center mb-6 group-hover:border-[#00F5A0] shadow-xl group-hover:shadow-[0_0_30px_rgba(0,245,160,0.2)] transition-all">
      <span className="text-2xl font-black text-white group-hover:text-[#00F5A0]">{number}</span>
    </div>
    <h4 className="text-lg font-bold mb-2">{title}</h4>
    <p className="text-xs text-gray-500 font-bold leading-relaxed">{desc}</p>
  </div>
);