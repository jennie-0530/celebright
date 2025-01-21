import { tryParseJson } from '../../util/tryParseJson';
import axiosInstance from '../client';

export const getFeeds = async () => {
  try {
    const response = await axiosInstance.get('/feed/admin/all'); // 피드 전체를 가져오는 요청

    return response.data; // 피드 목록 반환
  } catch (error) {
    console.error('Error fetching feeds:', error);
    throw error; // 오류를 상위로 던져서 처리할 수 있도록 함
  }
};
export const feedGet = async (id: string) => {
  try {
    const res = await axiosInstance.get(`/feed/${id}`);
    const newRes = {
      ...res.data,
      images:
        typeof res.data.images === 'string'
          ? tryParseJson(res.data.images) // tryParseJson을 통해 처리
          : res.data.images,
      likes:
        typeof res.data.likes === 'string'
          ? tryParseJson(res.data.likes)
          : res.data.likes,
      products:
        typeof res.data.products === 'string'
          ? tryParseJson(res.data.products)
          : res.data.products,
    };
    console.log(newRes, 'newRes');

    return newRes;
  } catch (error) {
    console.error('Error getting feed data:', error);
    alert('Failed to get feed data');
    return null; // 에러 발생 시 null을 반환하거나 적절한 값을 반환하도록 처리
  }
};
export const feedUpdate = async (id: string, formData: FormData) => {
  try {
    const res = await axiosInstance.patch(`/feed/admin/${id}`, formData);
    return res;
  } catch (error) {
    console.error('Error uploading product', error);
    alert('Failed to upload product');
  }
};
export const feedDelete = async (id: string) => {
  try {
    const res = await axiosInstance.delete(`/feed/admin/${id}`);
    return res;
  } catch (err) {
    console.error(err);
  }
};
