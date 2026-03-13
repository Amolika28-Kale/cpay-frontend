// services/authService.js
// const API_BASE = "http://localhost:5000/api";
const API_BASE = "https://cpay-backend.onrender.com/api";


const jsonHeaders = {
  "Content-Type": "application/json",
};

// export const login = async (userId, pin) => {
//   try {
//     const response = await fetch(`${API_BASE}/auth/login`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({ userId, pin }),
//     });
    
//     const data = await response.json();
//     return { success: response.ok, data: response.ok ? data : null, message: data.message };
//   } catch (error) {
//     return { success: false, message: error.message };
//   }
// };

// // export const adminLogin = async (adminId, pin) => {
// //   try {
// //     const response = await fetch(`${API_BASE}/admin/login`, {
// //       method: "POST",
// //       headers: jsonHeaders,
// //       body: JSON.stringify({ adminId, pin }),
// //     });
    
// //     const data = await response.json();
// //     return { 
// //       success: response.ok, 
// //       data: response.ok ? data : null,
// //       message: response.ok ? null : data.message 
// //     };
// //   } catch (error) {
// //     return { success: false, message: error.message };
// //   }
// // };



// // Add admin login function
// export const adminLogin = async (adminId, pin) => {
//   try {
//     const res = await fetch(`${API_BASE}/admin/login`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ adminId, pin })
//     });
    
//     const data = await res.json();
    
//     if (res.ok) {
//       return { success: true, data: data.data || data };
//     } else {
//       return { success: false, message: data.message };
//     }
//   } catch (error) {
//     console.error("Admin login error:", error);
//     return { success: false, message: "Network error" };
//   }
// };
// export const register = async (userData) => {
//   try {
//     const response = await fetch(`${API_BASE}/auth/register`, {
//       method: 'POST',
//       headers: jsonHeaders,
//       body: JSON.stringify(userData)
//     });
//     const data = await response.json();
//     return { success: response.ok, data: response.ok ? data : null, message: data.message };
//   } catch (error) {
//     return { success: false, message: error.message };
//   }
// };


export const login = async (userId, pin) => {
  try {
    // console.log("🔐 Login attempt:", { userId, pin }); // Debug log

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ userId, pin }),
    });
    
    const data = await response.json();
    // console.log("📥 Login response:", { status: response.status, data }); // Debug log
    
    if (response.ok) {
      return { 
        success: true, 
        data: data,
        message: null 
      };
    } else {
      return { 
        success: false, 
        data: null, 
        message: data.message || "Login failed" 
      };
    }
  } catch (error) {
    console.error("❌ Login error:", error);
    return { 
      success: false, 
      message: error.message || "Network error" 
    };
  }
};

export const adminLogin = async (adminId, pin) => {
  try {
    // console.log("🔐 Admin login attempt:", { adminId, pin }); // Debug log

    const response = await fetch(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ adminId, pin }),
    });
    
    const data = await response.json();
    // console.log("📥 Admin login response:", { status: response.status, data }); // Debug log
    
    if (response.ok) {
      // Handle both response formats
      const responseData = data.data || data;
      return { 
        success: true, 
        data: responseData,
        message: null 
      };
    } else {
      return { 
        success: false, 
        data: null, 
        message: data.message || "Admin login failed" 
      };
    }
  } catch (error) {
    // console.error("❌ Admin login error:", error);
    return { 
      success: false, 
      message: error.message || "Network error" 
    };
  }
};

export const register = async (userData) => {
  try {
    // console.log("📝 Register attempt:", userData); // Debug log

    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    // console.log("📥 Register response:", { status: response.status, data }); // Debug log
    
    if (response.ok) {
      // ✅ Store token and user data in localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      
      // ✅ Show welcome bonus toast (without JSX)
      if (data.bonus) {
        setTimeout(() => {
          import('react-hot-toast').then(({ default: toast }) => {
            toast.success(
              `🎉 Welcome Bonus! You received $${data.bonus.usdt} USDT (₹${data.bonus.inr})`,
              { 
                duration: 8000,
                style: {
                  background: '#0A1F1A',
                  color: 'white',
                  border: '1px solid #00F5A0',
                }
              }
            );
          });
        }, 1000);
      }
      
      return { 
        success: true, 
        data: data,
        message: null 
      };
    } else {
      return { 
        success: false, 
        data: null, 
        message: data.message || "Registration failed" 
      };
    }
  } catch (error) {
    // console.error("❌ Register error:", error);
    return { 
      success: false, 
      message: error.message || "Network error" 
    };
  }
};

export const getReferralStats = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/auth/referral`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` },
    });
    return await res.json();
  } catch (error) {
    // console.error("Fetch error:", error);

    return { message: "Network error" };
  }
};

export const getTeamCashbackSummary = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/wallet/team-cashback`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    return await res.json();
  } catch (error) {
    // console.error("Error fetching team cashback:", error);
    return null;
  }
};

export const activateWallet = async (token, dailyLimit) => {
  try {
    const res = await fetch(`${API_BASE}/scanner/activate-wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ dailyLimit })
    });
    return await res.json();
  } catch (error) {
    // console.error("Error activating wallet:", error);
    return { message: "Network error" };
  }
};

export const getActivationStatus = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/scanner/activation-status`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    return await res.json();
  } catch (error) {
    // console.error("Error fetching activation status:", error);
    return { activated: false };
  }
};


// services/authService.js - यामध्ये add करा

export const getTodayTeamStats = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/transactions/today-team-stats`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    return data;
  } catch (error) {
    // console.error("Error fetching today's team stats:", error);
    return { 
      success: false, 
      teamBusiness: 0, 
      yourCommission: 0, 
      teamMembers: 0 
    };
  }
};