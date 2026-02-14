// const API_BASE = "http://localhost:5000/api";
const API_BASE = "https://cpay-backend.onrender.com/api";

const jsonHeaders = {
  "Content-Type": "application/json",
};

/* ================= AUTH ================= */

export const login = async (email, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email, password }),
  });

  return res.json().then(data => ({
    ok: res.ok,
    data
  }));
};

export const register = async (payload) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });

  return res.json().then(data => ({
    ok: res.ok,
    data
  }));
};

// services/authService.js
export const getReferralStats = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/auth/referral`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (res.status === 404) {
       console.error("Endpoint not found. Check backend route registration.");
       return { message: "Route not found" };
    }

    return await res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return { message: "Network error" };
  }
};
