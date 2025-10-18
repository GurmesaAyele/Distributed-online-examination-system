import axios from "axios";

const API = "http://localhost:8000/api/users/";

export const getUsers = () => axios.get(API);
export const createUser = (data: any) => axios.post(API, data);
export const updateUser = (id: number, data: any) => axios.put(`${API}${id}/`, data);
export const deleteUser = (id: number) => axios.delete(`${API}${id}/`);
export const resetUserPassword = (id: number, new_password: string) =>
  axios.post(`${API}${id}/reset_password/`, { new_password });
