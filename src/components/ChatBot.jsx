import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, ChevronDown, ChevronUp } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hello! I'm CpayLink AI Assistant. How can I help you today?",
      sender: 'bot',
      options: [
        "How to activate wallet?",
        "How does referral system work?",
        "What is daily limit?",
        "How to create payment request?",
        "Payment issues"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // FAQ Database
  const faqResponses = {
    "how to activate wallet": {
      text: " **Wallet Activation Process:**\n\n1. Go to Scanner Tab\n2. Click 'Activate Wallet' button\n3. Enter your 7-day limit (e.g., ₹35000)\n4. Pay activation amount (10% of limit in USDT)\n5. Complete deposit and wait 2 minutes\n\n✅ After activation, you can accept payments.",
      options: ["How much activation amount?", "How to increase limit?", "Back to Menu"]
    },
    "how much activation amount": {
      text: "**Activation Amount Calculation:**\n\n• 10% of 7-day limit in INR\n• Convert to USDT (1 USDT = ₹95)\n\n**Example:**\nLimit ₹35000:\n10% = ₹3500\n₹3500 ÷ 95 = **36.84 USDT**\n\nDeposit this amount to activate.",
      options: ["How to activate wallet?", "What is daily limit?", "Back to Menu"]
    },
    "how does referral system work": {
      text: "**Referral System (21 Levels)**\n\n• Level 1: 30% Commission\n• Level 2: 15%\n• Level 3: 10%\n• Level 4: 5%\n• Level 5: 30%\n• Level 6-15: 3% each\n• Level 16: 5%\n• Level 17: 10%\n• Level 18: 15%\n• Level 19-20: 30% each\n• Level 21: 63%\n\n✅ **7 Legs System:** Unlock legs by adding members.",
      options: ["How to unlock legs?", "When do I get commission?", "Back to Menu"]
    },
    "what is daily limit": {
      text: " **Daily Limit Information:**\n\n• 7-day limit set during activation\n• Daily Average = 7-day limit ÷ 7\n• Example: ₹35000 limit = ₹5000/day\n\nYou can accept payments up to your remaining 7-day limit.",
      options: ["How to increase limit?", "How to activate wallet?", "Back to Menu"]
    },
    "how to create payment request": {
      text: " **Create Pay Request:**\n\n1. Go to Scanner Tab\n2. Enter amount in 'Pay My Bill' section\n3. Take photo of QR code\n4. Accept Terms & Conditions\n5. Click 'POST TO BILL PAYMENTS'\n\n✅ Request stays active for 10 minutes",
      options: ["How to accept request?", "Payment issues", "Back to Menu"]
    },
    "how to accept request": {
      text: "**Accept Pay Request:**\n\n1. Choose from available requests\n2. Accept Terms & Conditions\n3. Click 'ACCEPT & PAY'\n4. Download QR code\n5. Make payment and upload screenshot\n\n⏱️ You get 10 minutes to complete payment",
      options: ["How to upload screenshot?", "Payment issues", "Back to Menu"]
    },
    "payment issues": {
      text: " **Payment Issues - Solutions:**\n\n**1. Request expired?** → Create new request\n**2. Can't download QR?** → Use 'DOWNLOAD QR' button\n**3. Payment not confirming?** → Contact support\n**4. Wallet not activating?** → Check 2-min timer",
      options: ["Contact Support", "How to create request?", "Back to Menu"]
    },
    "back to menu": {
      text: " How can I help you?\n\nSelect an option below:",
      options: [
        "How to activate wallet?",
        "How does referral system work?",
        "What is daily limit?",
        "How to create payment request?",
        "Payment issues"
      ]
    },
    "contact support": {
      text: "**Contact Support:**\n\n• Email: support@cpaylink.com\n• Telegram: @CpayLinkSupport\n• Response Time: 24-48 hours\n\nPlease share your User ID when contacting support.",
      options: ["Back to Menu"]
    }
  };

  const handleSendMessage = (customMessage = null) => {
    const messageText = customMessage || inputMessage;
    if (!messageText.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: messageText,
      sender: 'user'
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Find response
    setTimeout(() => {
      let response = null;
      const lowerMessage = messageText.toLowerCase();

      // Check for matches in FAQ
      for (const [key, value] of Object.entries(faqResponses)) {
        if (lowerMessage.includes(key)) {
          response = value;
          break;
        }
      }

      // Default response if no match
      if (!response) {
        response = {
          text: " I didn't understand that. Please select an option below:",
          options: [
            "How to activate wallet?",
            "How does referral system work?",
            "What is daily limit?",
            "Payment issues",
            "Contact Support"
          ]
        };
      }

      // Add bot response
      const botMessage = {
        id: messages.length + 2,
        text: response.text,
        sender: 'bot',
        options: response.options
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleOptionClick = (option) => {
    handleSendMessage(option);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 bg-gradient-to-r from-[#00F5A0] to-[#00d88c] text-black p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 ${
          isOpen ? 'rotate-90' : ''
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-[#0A1F1A] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-5">
          
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#00F5A0]/10 to-transparent rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00F5A0] flex items-center justify-center">
                <Bot size={20} className="text-black" />
              </div>
              <div>
                <h3 className="font-black text-[#00F5A0]">CpayLink Assistant</h3>
                <p className="text-[8px] text-gray-500">Online • 24/7 Support</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-[#00F5A0] text-black rounded-br-none'
                        : 'bg-white/10 text-white rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
                
                {/* Quick Options */}
                {msg.options && msg.sender === 'bot' && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(option)}
                        className="text-[10px] bg-white/5 hover:bg-[#00F5A0]/20 border border-white/10 px-3 py-2 rounded-full transition-all text-left"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/10 p-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your question..."
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#00F5A0] transition-all"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
                className={`p-3 rounded-xl transition-all ${
                  inputMessage.trim()
                    ? 'bg-[#00F5A0] text-black hover:bg-[#00d88c]'
                    : 'bg-white/5 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;