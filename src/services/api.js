// const API_BASE = "http://localhost:5000/api";
const API_BASE = "https://cpay-backend.onrender.com/api";


export const jsonHeaders = {
  "Content-Type": "application/json",
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export default API_BASE;
