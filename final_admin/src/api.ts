import axios from "axios";
import { User, MembershipProduct } from "./interfaces";

export const fetchAllUsers = async (): Promise<User[]> => {
  const response = await axios.get("http://localhost:4000/user/all");
  return response.data;
};

export const updateUser = async (userId: number, updatedUser: User): Promise<void> => {
  await axios.put(`http://localhost:4000/user/${userId}`, updatedUser);
};

export const updateProduct = async (productId: number, updatedProduct: MembershipProduct): Promise<void> => {
  await axios.patch(`http://localhost:4000/membership/products/${productId}`, updatedProduct);
};

export const toggleProductStatusApi = async (productId: number): Promise<MembershipProduct> => {
  const response = await axios.patch(`http://localhost:4000/membership/product/${productId}`);
  return response.data;
};