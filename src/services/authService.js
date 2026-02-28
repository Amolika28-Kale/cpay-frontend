// services/authService.js
// const API_BASE = "http://localhost:5000/api";
const API_BASE = "https://cpay-backend.onrender.com/api";


const jsonHeaders = {
  "Content-Type": "application/json",
};

export const login = async (userId, pin) => {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ userId, pin }),
    });
    
    const data = await response.json();
    return { success: response.ok, data: response.ok ? data : null, message: data.message };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const adminLogin = async (adminId, pin) => {
  try {
    const response = await fetch(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ adminId, pin }),
    });
    
    const data = await response.json();
    return { 
      success: response.ok, 
      data: response.ok ? data : null,
      message: response.ok ? null : data.message 
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    return { success: response.ok, data: response.ok ? data : null, message: data.message };
  } catch (error) {
    return { success: false, message: error.message };
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
    console.error("Fetch error:", error);
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
    console.error("Error fetching team cashback:", error);
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
    console.error("Error activating wallet:", error);
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
    console.error("Error fetching activation status:", error);
    return { activated: false };
  }
};