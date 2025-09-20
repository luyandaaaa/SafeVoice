import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

class AuthService {
  async register(username: string, email: string, password: string) {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password,
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.msg || 'Registration failed');
      }
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.msg || 'Login failed');
      }
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('token');
  }

  getCurrentUser() {
    const token = localStorage.getItem('token');
    return token;
  }
}

export default new AuthService();