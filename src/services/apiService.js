import API_BASE, { getAuthHeaders } from "./api";

/* ================= WALLET ================= */

export const getWallets = async () => {
  const res = await fetch(`${API_BASE}/wallet`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const transferCashback = async (amount) => {
  const res = await fetch(`${API_BASE}/wallet/transfer-cashback`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ amount }),
  });
  return res.json();
};

/* ================= DEPOSIT ================= */

/* ================= PAYMENT METHODS ================= */

export const getActivePaymentMethods = async () => {
  const res = await fetch(`${API_BASE}/payment-methods`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};


/* ================= DEPOSIT ================= */

export const createDeposit = async (amount, txHash, paymentMethodId, screenshotFile) => {
  const formData = new FormData();
  formData.append("amount", amount);
  formData.append("txHash", txHash);
  formData.append("paymentMethodId", paymentMethodId);
  formData.append("paymentScreenshot", screenshotFile);

  const res = await fetch(`${API_BASE}/deposit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
      // ⚠️ DO NOT SET Content-Type when using FormData
    },
    body: formData,
  });

  return res.json();
};



/* ================= WITHDRAW ================= */

export const createWithdraw = async (amount) => {
  const res = await fetch(`${API_BASE}/withdraw`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ amount }),
  });
  return res.json();
};

/* ================= CONVERSION (NEW) ================= */

export const convertUsdtToInr = async (amount) => {
  const res = await fetch(`${API_BASE}/conversion/usdt-to-inr`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ amount }),
  });
  return res.json();
};

/* ================= TRANSACTIONS ================= */

export const getTransactions = async () => {
  const res = await fetch(`${API_BASE}/transactions/my`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};


/* ================= SCANNER ================= */

/* ================= SCANNER ================= */

/* 1️⃣ REQUEST TO PAY (User A) */
export const requestToPay = async (amount, imageFile, upiLink = "") => {
  const formData = new FormData();
  formData.append("amount", amount);
  formData.append("image", imageFile);
  formData.append("upiLink", upiLink);

  const res = await fetch(`${API_BASE}/scanner/request`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: formData,
  });

  return res.json();
};


/* 2️⃣ GET ACTIVE REQUESTS */
export const getActiveRequests = async () => {
  const res = await fetch(`${API_BASE}/scanner/active`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};


/* 3️⃣ ACCEPT REQUEST (User B) */
export const acceptRequest = async (scannerId) => {
  const res = await fetch(`${API_BASE}/scanner/accept`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ scannerId }),
  });
  return res.json();
};


/* 4️⃣ SUBMIT PAYMENT SCREENSHOT (User B) */
export const submitPayment = async (scannerId, screenshotFile) => {
  const formData = new FormData();
  formData.append("scannerId", scannerId);
  formData.append("screenshot", screenshotFile);

  const res = await fetch(`${API_BASE}/scanner/submit-payment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  return res.json();
};


/* 5️⃣ FINAL CONFIRM (User A clicks Done) */
export const confirmRequest = async (scannerId) => {
  const res = await fetch(`${API_BASE}/scanner/confirm`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ scannerId }),
  });

  return res.json();
};


/* 6️⃣ SELF PAY (1% Cashback) */
export const selfPay = async (amount) => {
  const res = await fetch(`${API_BASE}/scanner/self-pay`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ amount }),
  });
  return res.json();
};


export const getCurrentRate = async () => {
  const res = await fetch(`${API_BASE}/wallet/rate`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getBalance = async (type) => {
  const res = await fetch(`${API_BASE}/wallet/balance?type=${type}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  return data?.balance || 0;  
};

