
import axios from 'axios';

export const getInfluencerApplies = async () => {
  const response = await axios.get('http://localhost:4000/influencer/apply/all');
  return response.data;
};

export const approveApplication = async (id: number) => {
  await axios.put(`http://localhost:4000/influencer/apply/${id}/approve`);
};

export const rejectApplication = async (id: number, reason: string) => {
  await axios.put(`http://localhost:4000/influencer/apply/${id}/reject`, { reason });
};