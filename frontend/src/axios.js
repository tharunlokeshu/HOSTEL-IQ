import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/register/', // change if deployed
});

export default instance;
