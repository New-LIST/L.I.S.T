import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // prispôsob podľa tvojho backendu
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
