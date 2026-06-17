import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {'Content-Type': 'application/json'}
});

api.interceptors.request.use((config) => {
     const token = localStorage.getItem('token');
     if(token) config.headers.Authorization = `Bearer ${token}`;
     return config;
})

api.interceptors.response.use((res)=> res, (err)=> {
     if(err.response?.status === 401){
        console.log("Error Occurred:", err);
     }
})

export default api;