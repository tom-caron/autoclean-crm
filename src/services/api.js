import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// L'intercepteur qui va chercher le crm_token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token') // ➔ Nom spécifique au CRM
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

export default api