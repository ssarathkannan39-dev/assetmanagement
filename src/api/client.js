import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  withCredentials: true, // send the httpOnly refresh cookie
});

let accessToken = null;
let refreshingPromise = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

client.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && !original._retry && !original.url.includes('/auth/login')) {
      original._retry = true;
      try {
        if (!refreshingPromise) {
          refreshingPromise = client.post('/auth/refresh').finally(() => {
            refreshingPromise = null;
          });
        }
        const { data } = await refreshingPromise;
        setAccessToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return client(original);
      } catch (refreshErr) {
        setAccessToken(null);
        window.dispatchEvent(new CustomEvent('auth:expired'));
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default client;
