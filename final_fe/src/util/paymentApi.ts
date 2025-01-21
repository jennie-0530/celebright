import axios from "axios";

const API_BASE_URL = "http://localhost:4000/payments";

export const createPayment = async (userId: string, productId: string, amount: number) => {
  const response = await axios.post(`${API_BASE_URL}/create`, {
    userId,
    productId,
    amount,
  });
  return response.data;
};