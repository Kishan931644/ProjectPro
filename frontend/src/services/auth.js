import api from '@/lib/api';

export const inviteUser = async (payload) => {
  const { data } = await api.post('/auth/invite', payload);
  return data;
};

export const getInviteDetails = async (token) => {
  const { data } = await api.get(`/auth/invite/${token}`);
  return data;
};
