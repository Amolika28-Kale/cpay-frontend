import React, { useState } from 'react';
import {
  HelpCircle, BookOpen, MessageCircle, FileText,
  Mail, Youtube, ChevronDown, ChevronUp, Copy,
  Wallet, ScanLine, Users, Zap, AlertCircle, CheckCircle, Clock,
  Rocket, CreditCard, Smartphone, BarChart3, Shield, HeadphonesIcon,
  User,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import ChatBot from './ChatBot'; // ✅ Import ChatBot
import { Link } from 'react-router-dom';

const HelpPage = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [activeGuide, setActiveGuide] = useState('getting-started');

  const faqCategories = [
    {
      title: "Getting Started",
      icon: <Rocket size={18} />,
      faqs: [
        {
          q: "What is CpayLink?",
          a: "CpayLink is a peer-to-peer payment platform where you can pay bills using QR codes and earn cashback. You can build a team through the 21-level referral system and earn extra income."
        },
        {
          q: "How to create an account?",
          a: "1. Go to Login page\n2. Click 'Register'\n3. Enter your details (Name, Email, Password)\n4. Enter referral code if you have one\n5. Click Submit\n\n✅ After verification, you can login to your dashboard."
        }
      ]
    },
    {
      title: "Wallet & Activation",
      icon: <CreditCard size={18} />,
      faqs: [
        {
          q: "How to activate wallet?",
          a: "1. Go to Scanner Tab\n2. Click 'Activate Wallet'\n3. Enter your 7-day limit (e.g., ₹35000)\n4. Pay activation amount (10% of limit in USDT)\n5. Wait 2 minutes for verification\n\n✅ After activation, you can accept payments."
        },
        {
          q: "How to calculate activation amount?",
          a: "Formula: (Limit × 0.1) ÷ 95 = USDT Amount\n\nExample for ₹35000 limit:\n10% = ₹3500\n₹3500 ÷ 95 = 36.84 USDT\n\nDeposit this amount to activate."
        },
        {
          q: "What is daily limit?",
          a: "Your 7-day limit is set during activation. Daily average = 7-day limit ÷ 7.\nExample: ₹35000 limit = ₹5000/day average.\nYou need wallet activation to accept payments."
        }
      ]
    },
    {
      title: "Payments",
      icon: <Smartphone size={18} />,
      faqs: [
        {
          q: "How to create a pay request?",
          a: "1. Go to Scanner Tab\n2. Enter amount in 'Pay My Bill' section\n3. Take photo of QR code (Camera/Gallery)\n4. Accept Terms\n5. Click 'POST TO BILL PAYMENTS'\n\n⏱️ Request stays active for 10 minutes."
        },
        {
          q: "How to accept a request?",
          a: "1. Select from available requests\n2. Accept Terms\n3. Click 'ACCEPT & PAY'\n4. Download QR code and make payment\n5. Upload screenshot\n\n⏱️ You have 10 minutes to complete payment."
        },
        {
          q: "How long after payment does it confirm?",
          a: "After uploading screenshot, the request creator will see the proof. They need to click 'CONFIRM RECEIPT' to complete payment. This usually takes a few minutes."
        }
      ]
    },
    {
      title: "Referral System",
      icon: <BarChart3 size={18} />,
      faqs: [
        {
          q: "How does referral system work?",
          a: "21 Levels Commission Structure:\n\nLevel 1: 30%\nLevel 2: 15%\nLevel 3: 10%\nLevel 4: 5%\nLevel 5: 30%\nLevel 6-15: 3% each\nLevel 16: 5%\nLevel 17: 10%\nLevel 18: 15%\nLevel 19-20: 30% each\nLevel 21: 63%\n\nYou earn commission on your team's cashback."
        },
        {
          q: "What are Legs?",
          a: "7 Legs System:\nLeg 1: Levels 1-3\nLeg 2: Levels 4-6\nLeg 3: Levels 7-9\nLeg 4: Levels 10-12\nLeg 5: Levels 13-15\nLeg 6: Levels 16-18\nLeg 7: Levels 19-21\n\nTo unlock next leg, add at least 1 member in the last level of current leg."
        }
      ]
    },
    {
      title: "Troubleshooting",
      icon: <Shield size={18} />,
      faqs: [
        {
          q: "What if request expires?",
          a: "Requests expire after 10 minutes automatically. Create a new request.\n\nOnce timer ends, the request disappears and you need to try again."
        },
        {
          q: "Payment made but no confirmation?",
          a: "1. Check if screenshot was uploaded\n2. Request creator may not have confirmed yet\n3. If 10 minutes passed, create new request\n4. Contact support"
        },
        {
          q: "Wallet activated but can't accept?",
          a: "1. Check if 7-day limit is exhausted\n2. Check today's usage\n3. Use 'Change Limit' option to increase limit\n4. Contact support"
        }
      ]
    }
  ];

  const guides = [
    {
      id: 'getting-started',
      title: 'Getting Started Guide',
      icon: <Rocket size={20} />,
      steps: [
        '✅ Create account',
        '✅ Login to dashboard',
        '✅ Activate wallet (required)',
        '✅ Share referral code',
        '✅ Start accepting payments'
      ]
    },
    {
      id: 'wallet-activation',
      title: 'Wallet Activation Guide',
      icon: <CreditCard size={20} />,
      steps: [
        '1️⃣ Go to Scanner Tab',
        '2️⃣ Click "Activate Wallet"',
        '3️⃣ Enter 7-day limit (e.g., ₹35000)',
        '4️⃣ Calculate activation amount: (Limit × 0.1) ÷ 95',
        '5️⃣ Deposit USDT amount',
        '6️⃣ Wait 2 minutes for verification',
        '7️⃣ Start accepting payments'
      ]
    },
    {
      id: 'make-payment',
      title: 'Make a Payment Guide',
      icon: <Smartphone size={20} />,
      steps: [
        '1️⃣ Go to Scanner Tab',
        '2️⃣ Enter amount in "Pay My Bill"',
        '3️⃣ Take photo of QR code',
        '4️⃣ Accept Terms',
        '5️⃣ Post request',
        '6️⃣ Wait for someone to accept (10 min max)',
        '7️⃣ Make payment after acceptance',
        '8️⃣ Upload screenshot',
        '9️⃣ Wait for confirmation'
      ]
    },
    {
      id: 'referral',
      title: 'Referral System Guide',
      icon: <BarChart3 size={20} />,
      steps: [
        '1️⃣ Copy your referral code',
        '2️⃣ Share with friends',
        '3️⃣ They register using your code',
        '4️⃣ They join your team',
        '5️⃣ Earn commission on their cashback',
        '6️⃣ Commission up to 21 levels',
        '7️⃣ More referrals = More income'
      ]
    }
  ];

  const copyUserId = () => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    navigator.clipboard.writeText(user.userId || user._id || '');
    toast.success('User ID copied!', { duration: 2000 });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-20">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-[#00F5A0] to-[#00d88c] p-8 rounded-[2.5rem] text-[#051510] shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-black italic flex items-center gap-3">
            <HelpCircle size={32} />
            Help Center
          </h2>
          <BookOpen size={28} className="opacity-60" />
        </div>
        
        <p className="text-lg font-bold mb-4">
          How can we help you today?
        </p>
        
        {/* Quick User ID Copy */}
        <div className="bg-black/20 p-4 rounded-xl backdrop-blur-sm flex items-center justify-between">
          <div>
            <p className="text-xs opacity-70">Your User ID</p>
            <p className="font-mono font-bold text-lg">
              {JSON.parse(localStorage.getItem("user"))?.userId || 'User'}
            </p>
          </div>
          <button
            onClick={copyUserId}
            className="bg-black text-[#00F5A0] p-3 rounded-xl hover:bg-black/80 transition-all"
          >
            <Copy size={18} />
          </button>
        </div>
      </div>

<div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-xl border border-blue-500/20">
    <p className="text-sm mb-4">
      Can't remember your User ID or PIN? We'll help you recover your account.
    </p>
    
    <Link
      to="/find-account"
      className="inline-flex items-center gap-2 bg-[#00F5A0] text-[#051510] px-6 py-3 rounded-xl font-bold text-sm hover:shadow-[0_0_30px_rgba(0,245,160,0.3)] transition-all"
    >
      Find My Account
      <ArrowRight size={16} />
    </Link>
  </div>
      {/* Quick Guides */}
      <div className="bg-[#0A1F1A] border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-black italic mb-4 flex items-center gap-2">
          <BookOpen size={20} className="text-[#00F5A0]" />
          Quick Start Guides
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {guides.map(guide => (
            <button
              key={guide.id}
              onClick={() => setActiveGuide(guide.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                activeGuide === guide.id
                  ? 'bg-[#00F5A0]/10 border-[#00F5A0]'
                  : 'bg-black/40 border-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#00F5A0]/10 flex items-center justify-center text-[#00F5A0]">
                  {guide.icon}
                </div>
                <span className="font-bold text-sm">{guide.title}</span>
              </div>
              <p className="text-[10px] text-gray-400 line-clamp-2">
                {guide.steps[0]}
              </p>
            </button>
          ))}
        </div>

        {/* Active Guide Content */}
        {activeGuide && (
          <div className="mt-4 p-4 bg-black/40 rounded-xl border border-white/10">
            <h4 className="text-sm font-bold text-[#00F5A0] mb-3">
              {guides.find(g => g.id === activeGuide)?.title}
            </h4>
            <div className="space-y-2">
              {guides.find(g => g.id === activeGuide)?.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <span className="text-[#00F5A0] font-bold">{idx+1}.</span>
                  <span className="text-gray-300">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FAQ Categories */}
      <div className="bg-[#0A1F1A] border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-black italic mb-4 flex items-center gap-2">
          <MessageCircle size={20} className="text-[#00F5A0]" />
          Frequently Asked Questions
        </h3>

        <div className="space-y-4">
          {faqCategories.map((category, catIdx) => (
            <div key={catIdx} className="border border-white/10 rounded-xl overflow-hidden">
              <div className="bg-white/5 p-4 flex items-center gap-2">
                <span className="text-[#00F5A0]">{category.icon}</span>
                <h4 className="font-bold text-sm">{category.title}</h4>
              </div>
              
              <div className="divide-y divide-white/5">
                {category.faqs.map((faq, faqIdx) => (
                  <div key={faqIdx} className="p-4">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === `${catIdx}-${faqIdx}` ? null : `${catIdx}-${faqIdx}`)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <span className="text-xs font-bold flex-1 pr-4">{faq.q}</span>
                      {expandedFaq === `${catIdx}-${faqIdx}` ? (
                        <ChevronUp size={16} className="text-[#00F5A0]" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-500" />
                      )}
                    </button>
                    
                    {expandedFaq === `${catIdx}-${faqIdx}` && (
                      <div className="mt-3 text-xs text-gray-400 whitespace-pre-line bg-black/40 p-3 rounded-lg">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

<div className="bg-[#0A1F1A] border border-white/10 rounded-2xl p-6">
  <h3 className="text-lg font-black italic mb-4 flex items-center gap-2">
    <User size={20} className="text-[#00F5A0]" />
    Lost Access?
  </h3>
  
  
</div>

      {/* ✅ ChatBot Section at the bottom */}
      <div className="bg-[#0A1F1A] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#00F5A0]/10 flex items-center justify-center">
            <span className="text-[#00F5A0] text-lg">🤖</span>
          </div>
          <h3 className="text-lg font-black text-white">AI Assistant</h3>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Get instant answers to your questions. Our AI assistant is here to help 24/7.
        </p>
        <ChatBot />
      </div>
    </div>
  );
};

export default HelpPage;