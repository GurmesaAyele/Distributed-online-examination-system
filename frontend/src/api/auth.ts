import axios from "axios";

const API = "http://localhost:8000/api/";

export const login = (data: any) => axios.post(`${API}login/`, data);
export const register = (data: any) => axios.post(`${API}register/`, data);
export const resetPassword = (data: any) => axios.post(`${API}reset-password/`, data);
