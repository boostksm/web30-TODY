import axiosBackend from '../instances/axiosBackend';

export default () => {
  return axiosBackend.get(`/user/silent-login`, { withCredentials: true });
};
