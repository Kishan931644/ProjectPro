import api from '@/lib/api';

export const listClients = async () => {
  const { data } = await api.get('/clients');
  return data;
};

export const createClient = async (payload) => {
  const { data } = await api.post('/clients', payload);
  return data;
};
