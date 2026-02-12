// const API_BASE = "http://localhost:5000/api";
const API_BASE = "https://cpay-backend.onrender.com/api";


const jsonHeaders = {
  "Content-Type": "application/json",
};

/* ================= USER AUTH ================= */

export const userLogin = async (email, password) => {
  const res = await fetch(`${API_BASE}/user/login`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email, password }),
  });

  return res.json().then(data => ({
    ok: res.ok,
    data
  }));
};

export const userRegister = async (payload) => {
  const res = await fetch(`${API_BASE}/user/register`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });

  return res.json().then(data => ({
    ok: res.ok,
    data
  }));
};

/* ================= ADMIN LOGIN ================= */

export const adminLogin = async (email, password) => {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email, password }),
  });

  return res.json().then(data => ({
    ok: res.ok,
    data
  }));
};
