import axios from 'axios';
import { fetchItem } from './cache.service';

const instance = axios.create();

instance.interceptors.request.use(
  (config) => {
    const authToken = fetchItem<string>('jwt');
    if (authToken === undefined) {
      return config;
    }

    config.headers.Authorization = `Bearer ${authToken}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
