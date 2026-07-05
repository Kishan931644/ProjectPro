import api from '@/lib/api';

export const listTimeLogsForTask = async (taskId) => {
  const { data } = await api.get(`/timelogs/task/${taskId}`);
  return data;
};

export const createTimeLog = async (payload) => {
  const { data } = await api.post('/timelogs', payload);
  return data;
};

export const updateTimeLog = async (id, payload) => {
  const { data } = await api.put(`/timelogs/${id}`, payload);
  return data;
};

export const deleteTimeLog = async (id) => {
  const { data } = await api.delete(`/timelogs/${id}`);
  return data;
};
