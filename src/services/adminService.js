// const API = "http://localhost:5000/api";
const API = "https://cpay-backend.onrender.com/api";

const getToken = () => localStorage.getItem("token");
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`
});

export const getAllUsers = async () => (await fetch(`${API}/admin/users`, { headers: headers() })).json();
export const getAllDeposits = async () => (await fetch(`${API}/admin/deposits`, { headers: headers() })).json();
export const getAllWithdraws = async () => (await fetch(`${API}/admin/withdraws`, { headers: headers() })).json();

// Note: Using the specific approval/rejection endpoints defined in your backend
export const updateDepositStatus = async (id, action) => {
  const res = await fetch(`${API}/admin/deposits/${id}/${action}`, {
    method: "PUT", // Matches your backend router.put
    headers: headers(),
  });
  return res.json();
};

export const updateWithdrawStatus = async (id, action) => {
  const res = await fetch(`${API}/admin/withdraws/${id}/${action}`, {
    method: "PUT",
    headers: headers(),
  });
  return res.json();
};

export const updateExchangeRate = async (rate) => {
  const res = await fetch(`${API}/admin/rate`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ usdtToInr: rate }) // FIXED
  });
  return res.json();
};
