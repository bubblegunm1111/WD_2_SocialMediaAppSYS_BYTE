import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Post services
export const postService = {
  getPosts: async (params = {}) => {
    const { page = 1, limit = 20, userId, isArchived } = params;
    let url = `/posts?page=${page}&limit=${limit}`;
    if (userId) url += `&userId=${userId}`;
    if (isArchived !== undefined) url += `&isArchived=${isArchived}`;
    const response = await api.get(url);
    return response.data;
  },

  getPost: async (postId) => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  createPost: async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  updatePost: async (postId, postData) => {
    const response = await api.put(`/posts/${postId}`, postData);
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },

  likePost: async (postId) => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  unlikePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}/like`);
    return response.data;
  },

  savePost: async (postId) => {
    const response = await api.post(`/posts/${postId}/save`);
    return response.data;
  },

  unsavePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}/save`);
    return response.data;
  },

  getComments: async (postId) => {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
  },

  addComment: async (postId, content) => {
    const response = await api.post(`/posts/${postId}/comments`, { content });
    return response.data;
  }
};

// User services
export const userService = {
  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  getUserPosts: async (userId) => {
    const response = await api.get(`/users/${userId}/posts`);
    return response.data;
  },
  
  getUserSavedPosts: async (userId) => {
    const response = await api.get(`/users/${userId}/saved-posts`);
    return response.data;
  },
  
  followUser: async (userId) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  unfollowUser: async (userId) => {
    const response = await api.post(`/users/${userId}/unfollow`);
    return response.data;
  }
};

// Message services
export const messageService = {
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },
  getMessages: async (userId) => {
    const response = await api.get(`/messages/${userId}`);
    return response.data;
  },
  sendMessage: async (userId, content) => {
    const response = await api.post(`/messages/${userId}`, { content });
    return response.data;
  },
  searchUsers: async (query) => {
    const response = await api.get(`/messages/users/search?q=${query}`);
    return response.data;
  }
};

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  }
};

export default api;
