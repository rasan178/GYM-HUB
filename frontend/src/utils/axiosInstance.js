import axios from 'axios';
import { BASE_URL } from '@/utils/apiPaths';

const api = axios.create({
  baseURL: BASE_URL //'http://localhost:8000', // point to your backend port
});

export default api;
