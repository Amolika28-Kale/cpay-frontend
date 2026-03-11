import React from "react";
import { Link } from "react-router-dom";
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
  Timer,
  Award,
  TrendingUp,
  Copy,
  Layers,
  GitBranch,
  Clock,
  DollarSign,
  BadgeCheck,
  Infinity,
  Sparkles,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Mail,
  HeadphonesIcon,
  Rocket,
  CreditCard,
  BarChart3,
  AlertCircle,
  User,
  Key
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
            <span className="text-xl font-bold tracking-tight">CPayLink</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-[#00F5A0] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#00F5A0] transition-colors">How it Works</a>
            <a href="#referral" className="hover:text-[#00F5A0] transition-colors">Referral</a>
            <a href="#rewards" className="hover:text-[#00F5A0] transition-colors">Rewards</a>
            <a href="#help" className="hover:text-[#00F5A0] transition-colors">Help</a>
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
              21 Level Referral • 7 Legs • 7-Day Wallet
            </div>
            <h1 className="text-6xl md:text-8xl font-bold leading-[1.1] mb-8 tracking-tight">
              Activate, Pay & <br />
              Earn on <span className="text-[#00F5A0]">21 Levels</span>
            </h1>
            <p className="text-lg text-gray-400 mb-10 max-w-lg leading-relaxed">
              Activate your wallet for 7 days, make UPI payments, earn instant cashbacks, and build a team to earn commissions on 21 levels with 7 legs system.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/auth">
                <button className="bg-[#00F5A0] text-[#051510] px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 hover:scale-105 transition-transform">
                  Start Earning <ArrowRight size={20} />
                </button>
              </Link>
            </div>
          </div>
          
          {/* Dashboard Preview Mockup - Updated with 7-day limit and referral stats */}
          <div className="relative group">
            <div className="bg-[#0A1F1A] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative z-10">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Total Balance</p>
                  <h3 className="text-3xl font-bold text-[#00F5A0]">₹1,24,500.00</h3>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <BadgeCheck className="text-[#00F5A0]" size={20} />
                </div>
              </div>
              
              {/* 7-Day Limit Status */}
              <div className="bg-white/5 p-4 rounded-xl mb-6 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">7-Day Limit</span>
                  <span className="text-xs font-bold text-[#00F5A0]">₹35,000 / ₹50,000</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-[#00F5A0] w-[70%]"></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>Used: ₹35,000</span>
                  <span>Remaining: ₹15,000</span>
                  <span>Expires: 5 days</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#00F5A0]/10 p-2.5 rounded-xl"><ScanLine size={20} className="text-[#00F5A0]" /></div>
                    <div><p className="font-bold text-sm">Grocery Store</p><p className="text-xs text-gray-500">2 mins ago</p></div>
                  </div>
                  <div>
                    <p className="text-red-400 font-bold">- ₹450</p>
                    <p className="text-[8px] text-green-500 text-right">+₹45 cashback</p>
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="bg-purple-500/10 p-2.5 rounded-xl"><Users size={20} className="text-purple-400" /></div>
                    <div><p className="font-bold text-sm">Team Commission</p><p className="text-xs text-gray-500">Level 3 Referral</p></div>
                  </div>
                  <p className="text-green-400 font-bold">+ ₹1,250</p>
                </div>
              </div>
            </div>
            {/* Background Glow behind card */}
            <div className="absolute inset-0 bg-[#00F5A0]/20 blur-[60px] opacity-50"></div>
          </div>
        </div>
      </section>

      {/* ================= WALLET ACTIVATION FEATURE ================= */}
      <section className="py-24 px-6 bg-[#030D0A]">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#00F5A0]/10 border border-[#00F5A0]/20 text-[#00F5A0] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Zap size={14} /> 7-DAY WALLET ACTIVATION
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Activate Once, Earn for 7 Days</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Pay 10% activation amount in USDT and get 7 days of unlimited earning potential.</p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <ActivationCard 
            icon={<Timer className="text-[#00F5A0]" size={24} />}
            title="7-Day Validity"
            desc="Your wallet stays active for 7 full days after activation. No daily activation needed."
          />
          <ActivationCard 
            icon={<DollarSign className="text-[#00F5A0]" size={24} />}
            title="10% Activation Fee"
            desc="Pay only 10% of your desired limit in USDT (1 USDT = ₹95). Example: ₹35,000 limit = 36.84 USDT"
          />
          <ActivationCard 
            icon={<Infinity className="text-[#00F5A0]" size={24} />}
            title="Unlimited Earnings"
            desc="Accept unlimited payments within your 7-day limit and earn cashback on every transaction."
          />
        </div>

        {/* Activation Calculation Example */}
        <div className="max-w-3xl mx-auto mt-12 p-6 bg-[#0A1F1A] border border-white/10 rounded-2xl">
          <h4 className="text-sm font-bold text-[#00F5A0] mb-4 flex items-center gap-2">
            <Sparkles size={16} /> Activation Amount Calculation
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-[10px] text-gray-500">7-Day Limit</p>
              <p className="text-lg font-bold">₹35,000</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500">10% in INR</p>
              <p className="text-lg font-bold text-orange-400">₹3,500</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500">Rate</p>
              <p className="text-lg font-bold text-[#00F5A0]">1 USDT = ₹95</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500">Pay</p>
              <p className="text-lg font-bold text-green-400">36.84 USDT</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 21 LEVEL REFERRAL SYSTEM ================= */}
      <section id="referral" className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Users size={14} /> 21 LEVELS • 7 LEGS
          </div>
          <h2 className="text-5xl md:text-7xl font-bold mb-4">Build Your Team</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Earn commissions on 21 levels with our revolutionary 7-leg referral system.</p>
        </div>

        {/* 7 Legs Visualization */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid grid-cols-7 gap-2 mb-8">
            {[1,2,3,4,5,6,7].map(leg => (
              <div key={leg} className="text-center">
                <div className="bg-gradient-to-b from-[#00F5A0]/20 to-transparent p-3 rounded-t-2xl border border-[#00F5A0]/20">
                  <GitBranch className="text-[#00F5A0] mx-auto mb-1" size={20} />
                  <span className="text-xs font-bold">Leg {leg}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Commission Rates */}
          <div className="bg-[#0A1F1A] border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-6 text-center">Commission Structure (21 Levels)</h3>
            <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
              <LevelBadge level={1} rate="30%" color="from-yellow-500 to-orange-500" />
              <LevelBadge level={2} rate="15%" color="from-blue-500 to-cyan-500" />
              <LevelBadge level={3} rate="10%" color="from-green-500 to-emerald-500" />
              <LevelBadge level={4} rate="5%" color="from-purple-500 to-pink-500" />
              <LevelBadge level={5} rate="30%" color="from-red-500 to-rose-500" />
              <LevelBadge level={6} rate="3%" color="from-indigo-500 to-purple-500" />
              <LevelBadge level={7} rate="4%" color="from-pink-500 to-red-500" />
              <LevelBadge level={8} rate="3%" color="from-teal-500 to-green-500" />
              <LevelBadge level={9} rate="3%" color="from-cyan-500 to-blue-500" />
              <LevelBadge level={10} rate="30%" color="from-orange-500 to-red-500" />
              <LevelBadge level={11} rate="3%" color="from-lime-500 to-green-500" />
              <LevelBadge level={12} rate="3%" color="from-amber-500 to-orange-500" />
              <LevelBadge level={13} rate="3%" color="from-emerald-500 to-teal-500" />
              <LevelBadge level={14} rate="3%" color="from-sky-500 to-blue-500" />
              <LevelBadge level={15} rate="3%" color="from-violet-500 to-purple-500" />
              <LevelBadge level={16} rate="5%" color="from-fuchsia-500 to-pink-500" />
              <LevelBadge level={17} rate="10%" color="from-rose-500 to-red-500" />
              <LevelBadge level={18} rate="15%" color="from-amber-500 to-orange-500" />
              <LevelBadge level={19} rate="30%" color="from-emerald-500 to-teal-500" />
              <LevelBadge level={20} rate="30%" color="from-blue-500 to-indigo-500" />
              <LevelBadge level={21} rate="63%" color="from-purple-500 to-pink-500" />
            </div>
          </div>
        </div>

        {/* Leg Unlock Condition */}
        <div className="max-w-3xl mx-auto text-center p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20">
          <p className="text-sm text-blue-400">
            <span className="font-bold">🔓 Leg Unlock Condition:</span> To unlock next leg, add at least 1 member in the last level of current leg.
          </p>
        </div>
      </section>

      {/* ================= WHY CHOOSE CPAY ================= */}
      <section id="features" className="py-24 px-6 bg-[#030D0A]">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose CPayLink?</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">We make your payments rewarding with unlimited cashbacks and seamless UPI integration.</p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<ShieldCheck className="text-[#00F5A0]" />}
            title="Secure Payments"
            points={["End-to-end encrypted transactions", "Secure wallet storage", "Fraud protection algorithms"]}
          />
          <FeatureCard 
            icon={<Zap className="text-[#00F5A0]" />}
            title="Instant Cashbacks"
            points={["Real-time cashback crediting", "No minimum withdrawal", "Unlimited rewards on every payment"]}
          />
          <FeatureCard 
            icon={<Wallet className="text-[#00F5A0]" />}
            title="2-Min Verification"
            points={["Fast deposit verification", "Auto wallet activation", "Real-time status updates"]}
          />
        </div>
      </section>

      {/* ================= 5 STEPS TO FREEDOM ================= */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-bold mb-4">5 Steps to Start Earning</h2>
        </div>

        <div className="max-w-7xl mx-auto relative">
          {/* Connector Line */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-[2px] bg-white/5 -z-10"></div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">
            <StepItem number="1" title="Sign Up" desc="Create your account in under 30 seconds." />
            <StepItem number="2" title="Activate Wallet" desc="Pay 10% activation amount in USDT for 7-day access." />
            <StepItem number="3" title="Deposit Money" desc="Add funds to your CPayLink wallet securely." />
            <StepItem number="4" title="Scan & Pay" desc="Scan any UPI QR code and make payment." />
            <StepItem number="5" title="Earn Cashback" desc="Get instant cashback + referral commissions." />
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
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scan Any UPI QR</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                   <p className="text-[10px] text-gray-500 uppercase font-bold">Queue Status</p>
                   <span className="bg-[#00F5A0]/20 text-[#00F5A0] text-[10px] px-2 py-0.5 rounded-full font-bold">12 Active</span>
                </div>
                <p className="text-sm font-bold">Active Payments</p>
              </div>
              <button className="w-full bg-[#00F5A0] text-[#051510] py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(0,245,160,0.2)]">Pay & Earn Cashback</button>
            </div>
          </div>

          <div>
            <h2 className="text-4xl md:text-6xl font-bold mb-8">Smart Payment Queue</h2>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed font-medium">
              Our "first-come-first-serve" payment system ensures maximum efficiency. Upload any UPI QR code, and our system processes your payment instantly with guaranteed cashbacks.
            </p>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="bg-white/5 p-4 rounded-xl h-fit border border-white/10"><Clock className="text-[#00F5A0]" /></div>
                <div>
                  <h4 className="text-xl font-bold mb-2">10-Minute Validity</h4>
                  <p className="text-gray-500">Each payment request stays active for 10 minutes. Accept or create requests quickly.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="bg-white/5 p-4 rounded-xl h-fit border border-white/10"><RefreshCcw className="text-[#00F5A0]" /></div>
                <div>
                  <h4 className="text-xl font-bold mb-2">24/7 Availability</h4>
                  <p className="text-gray-500">Make payments anytime, anywhere with our round-the-clock service.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= REWARDS SECTION ================= */}
      <section id="rewards" className="py-24 px-6 text-center">
        <h2 className="text-5xl md:text-7xl font-bold mb-4 italic">
          Earn Unlimited Cashbacks
        </h2>
        <p className="text-gray-500 mb-16">
          Every payment you make earns you real money — instantly credited to your wallet.
        </p>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          
          {/* Normal Payments */}
          <div className="bg-white/5 border border-[#00F5A0]/20 p-12 rounded-[2.5rem] relative group hover:bg-[#00F5A0]/5 transition-all">
            <h3 className="text-[#00F5A0] text-6xl font-bold mb-4 tracking-tighter">
              5–10%
            </h3>
            <h4 className="text-2xl font-bold mb-4">
              Every Payment Cashback
            </h4>
            <p className="text-gray-400 mb-8">
              Get between 5% to 10% cashback on every UPI payment you make.
              The reward is credited instantly to your wallet
              as real withdrawable money.
            </p>
            <button className="bg-[#00F5A0]/10 text-[#00F5A0] border border-[#00F5A0]/30 px-6 py-2 rounded-lg text-xs font-black uppercase tracking-[0.2em]">
              Instant Credit
            </button>
          </div>

          {/* Self Pay */}
          <div className="bg-white/5 border border-white/10 p-12 rounded-[2.5rem] hover:bg-white/10 transition-all">
            <h3 className="text-white text-6xl font-bold mb-4 tracking-tighter">
              4%
            </h3>
            <h4 className="text-2xl font-bold mb-4">
              Self Payment Reward
            </h4>
            <p className="text-gray-400 mb-8">
              Even when you pay yourself, you still earn 4% cashback credited to your wallet.
            </p>
            <button className="bg-white/5 text-gray-400 border border-white/10 px-6 py-2 rounded-lg text-xs font-black uppercase tracking-[0.2em]">
              Always Rewarded
            </button>
          </div>
        </div>
      </section>
{/* ================= HELP SECTION ================= */}
<section id="help" className="py-24 px-6 bg-[#030D0A]">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <div className="inline-flex items-center gap-2 bg-[#00F5A0]/10 border border-[#00F5A0]/20 text-[#00F5A0] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
        <HelpCircle size={14} /> 24/7 SUPPORT
      </div>
      <h2 className="text-5xl md:text-7xl font-bold mb-4">Need Help?</h2>
      <p className="text-gray-500 max-w-2xl mx-auto">We're here to assist you with everything from wallet activation to referral commissions.</p>
    </div>

    {/* Help Cards Grid - 3 cards */}
    <div className="grid md:grid-cols-3 gap-8 mb-12">
      {/* FAQ Card */}
      <div className="bg-[#0A1F1A] border border-white/10 p-8 rounded-[2rem] hover:border-[#00F5A0]/20 transition-all">
        <div className="bg-[#00F5A0]/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
          <MessageCircle size={28} className="text-[#00F5A0]" />
        </div>
        <h3 className="text-xl font-bold mb-3">Frequently Asked Questions</h3>
        <p className="text-sm text-gray-400 mb-6">Find quick answers to common questions about wallet activation, payments, and referrals.</p>
        <ul className="space-y-3 text-xs text-gray-500">
          <li className="flex items-center gap-2">
            <CheckCircle2 size={12} className="text-[#00F5A0]" />
            How to activate wallet?
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={12} className="text-[#00F5A0]" />
            What is 7-day limit?
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={12} className="text-[#00F5A0]" />
            How do referrals work?
          </li>
        </ul>
      </div>

      {/* Guide Card */}
      <div className="bg-[#0A1F1A] border border-white/10 p-8 rounded-[2rem] hover:border-[#00F5A0]/20 transition-all">
        <div className="bg-[#00F5A0]/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
          <BookOpen size={28} className="text-[#00F5A0]" />
        </div>
        <h3 className="text-xl font-bold mb-3">Quick Start Guides</h3>
        <p className="text-sm text-gray-400 mb-6">Step-by-step tutorials to help you get started and maximize your earnings.</p>
        <ul className="space-y-3 text-xs text-gray-500">
          <li className="flex items-center gap-2">
            <CheckCircle2 size={12} className="text-[#00F5A0]" />
            Wallet Activation Guide
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={12} className="text-[#00F5A0]" />
            How to Make Payments
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={12} className="text-[#00F5A0]" />
            Referral System Explained
          </li>
        </ul>
      </div>

      {/* Contact Support Card */}
      <div className="bg-[#0A1F1A] border border-white/10 p-8 rounded-[2rem] hover:border-[#00F5A0]/20 transition-all">
        <div className="bg-[#00F5A0]/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
          <HeadphonesIcon size={28} className="text-[#00F5A0]" />
        </div>
        <h3 className="text-xl font-bold mb-3">Contact Support</h3>
        <p className="text-sm text-gray-400 mb-6">Get in touch with our support team for personalized assistance.</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs">
            <Mail size={14} className="text-blue-400" />
            <span className="text-gray-300">support@cpaylink.com</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <MessageCircle size={14} className="text-purple-400" />
            <span className="text-gray-300">@CpayLinkSupport</span>
          </div>
        </div>
      </div>
    </div>

    {/* ✅ Find Account Section - हा नवीन सेक्शन आहे */}
    <div className="max-w-3xl mx-auto mb-8">
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-8 rounded-[2rem] border border-blue-500/20 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-blue-500/20 p-3 rounded-xl">
            <User size={24} className="text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold">Lost Access to Your Account?</h3>
        </div>
        
        <p className="text-gray-300 mb-6 max-w-lg mx-auto">
          Can't remember your User ID or PIN? Don't worry! We'll help you recover your account instantly.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/find-account"
            className="inline-flex items-center gap-2 bg-[#00F5A0] text-[#051510] px-8 py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_30px_rgba(0,245,160,0.3)] transition-all group"
          >
            Find My Account
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
          >
            Login Instead
          </Link>
        </div>

        {/* Quick Info Points */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Mail size={14} className="text-[#00F5A0]" />
            <span>Email Verification</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Key size={14} className="text-[#00F5A0]" />
            <span>OTP Security</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Lock size={14} className="text-[#00F5A0]" />
            <span>PIN Reset</span>
          </div>
        </div>
      </div>
    </div>

    {/* Support Response Time */}
    <div className="max-w-2xl mx-auto text-center p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
      <p className="text-xs text-yellow-500 flex items-center justify-center gap-2">
        <AlertCircle size={14} />
        Support response time: 24-48 hours. Please share your User ID when contacting.
      </p>
    </div>
  </div>
</section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-24 px-6 flex justify-center">
        <div className="bg-[#0A1F1A] border border-white/10 rounded-[3rem] p-12 md:p-20 text-center max-w-5xl w-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00F5A0]/10 blur-[80px]"></div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Ready to start earning?</h2>
          <p className="text-gray-400 mb-12 text-lg max-w-2xl mx-auto">Join thousands of users who are already earning unlimited cashbacks on every UPI payment.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <button className="bg-[#00F5A0] text-[#051510] px-8 py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(0,245,160,0.3)]">
                Get Started Now
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-12 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
             <div className="bg-white/5 p-1.5 rounded-lg border border-white/10"><Zap size={16} className="text-[#00F5A0]" /></div>
             <span className="font-bold">CPayLink</span>
          </div>
          <div className="flex gap-8 text-xs text-gray-500 font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#help" className="hover:text-white transition-colors">Help</a>
            <a href="#" className="hover:text-white transition-colors">Telegram</a>
          </div>
          <p className="text-[10px] text-gray-600 font-bold tracking-widest uppercase">© 2024 CPayLink. All rights reserved.</p>
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

const ActivationCard = ({ icon, title, desc }) => (
  <div className="bg-[#0A1F1A] border border-white/10 p-8 rounded-2xl text-center hover:border-[#00F5A0]/30 transition-all">
    <div className="bg-[#00F5A0]/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-sm text-gray-400">{desc}</p>
  </div>
);

const LevelBadge = ({ level, rate, color }) => (
  <div className="text-center">
    <div className={`bg-gradient-to-r ${color} p-2 rounded-lg text-[10px] font-bold text-white mb-1`}>
      L{level}
    </div>
    <span className="text-[10px] text-gray-500">{rate}</span>
  </div>
);