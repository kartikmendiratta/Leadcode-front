const API_BASE_URL = 'http://localhost:5000/api';

// Generic API call function with better error handling
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Room API functions
export const roomsAPI = {
  // Get all public rooms with filtering
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/rooms${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get room by ID
  getById: async (roomId) => {
    return apiCall(`/rooms/${roomId}`);
  },
  
  // Get room by room code
  getByCode: async (roomCode) => {
    return apiCall(`/rooms/code/${roomCode}`);
  },
  
  // Create new room
  create: async (roomData) => {
    return apiCall('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData)
    });
  },
  
  // Join room
  join: async (roomId, participant) => {
    return apiCall(`/rooms/${roomId}/join`, {
      method: 'POST',
      body: JSON.stringify({ participant })
    });
  },
  
  // Leave room
  leave: async (roomId, auth0Id) => {
    return apiCall(`/rooms/${roomId}/leave`, {
      method: 'PUT',
      body: JSON.stringify({ auth0Id })
    });
  },
  
  // Update room settings
  update: async (roomId, auth0Id, settings) => {
    return apiCall(`/rooms/${roomId}`, {
      method: 'PUT',
      body: JSON.stringify({ auth0Id, settings })
    });
  },
  
  // Start room session
  start: async (roomId, auth0Id, problemData = null) => {
    return apiCall(`/rooms/${roomId}/start`, {
      method: 'PUT',
      body: JSON.stringify({ auth0Id, problemData })
    });
  },
  
  // Delete room
  delete: async (roomId, auth0Id) => {
    return apiCall(`/rooms/${roomId}`, {
      method: 'DELETE',
      body: JSON.stringify({ auth0Id })
    });
  },
  
  // Get user's rooms
  getUserRooms: async (auth0Id, type = 'all') => {
    return apiCall(`/rooms/user/${auth0Id}?type=${type}`);
  }
};

// User API functions
export const usersAPI = {
  // Create or update user
  createOrUpdateUser: async (userData) => {
    return apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  // Get user by Auth0 ID
  getUser: async (auth0Id) => {
    return apiCall(`/users/${auth0Id}`);
  },
  
  // Update user profile
  updateUser: async (auth0Id, updateData) => {
    return apiCall(`/users/${auth0Id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  },
  
  // Get user statistics
  getUserStats: async (auth0Id) => {
    return apiCall(`/users/${auth0Id}/stats`);
  }
};

// Utility functions
export const apiUtils = {
  // Test API connectivity
  testConnection: async () => {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      return response.ok;
    } catch {
      return false;
    }
  },
  
  // Get server info
  getServerInfo: async () => {
    try {
      const response = await fetch(API_BASE_URL.replace('/api', ''));
      return response.json();
    } catch (error) {
      console.error('Error getting server info:', error);
      return null;
    }
  }
};

export default { roomsAPI, usersAPI, apiUtils };