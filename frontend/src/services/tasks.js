import api from '@/lib/api';

export const listTasks = async (projectId) => {
  const { data } = await api.get('/tasks', { params: projectId ? { projectId } : {} });
  return data;
};

export const getTask = async (id) => {
  const { data } = await api.get(`/tasks/${id}`);
  return data;
};

export const createTask = async (payload) => {
  const { data } = await api.post('/tasks', payload);
  return data;
};

export const updateTask = async (id, payload) => {
  const { data } = await api.put(`/tasks/${id}`, payload);
  return data;
};

export const deleteTask = async (id) => {
  const { data } = await api.delete(`/tasks/${id}`);
  return data;
};

export const listTaskStatuses = async () => {
  const { data } = await api.get('/tasks/statuses');
  return data;
};
