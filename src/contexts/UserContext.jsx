import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { usersAPI } from '../services/api';
import { UserContext } from './UserContextProvider';

export const UserProvider = ({ children }) => {
  const { user: auth0User, isAuthenticated, isLoading: auth0Loading } = useAuth0();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const syncUserWithBackend = async () => {
      if (!isAuthenticated || !auth0User) {
        setUserData(null);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const userPayload = {
          auth0Id: auth0User.sub,
          email: auth0User.email,
          name: auth0User.name,
          picture: auth0User.picture || ''
        };

        console.log('🔄 Syncing user with backend:', userPayload);

        const response = await usersAPI.createOrUpdateUser(userPayload);
        
        if (response.success) {
          setUserData(response.user);
          console.log('✅ User synced successfully:', response.user);
        } else {
          throw new Error(response.message || 'Failed to sync user');
        }
      } catch (err) {
        console.error('❌ Error syncing user with backend:', err);
        setError(err.message);
        
        setUserData({
          auth0Id: auth0User.sub,
          email: auth0User.email,
          name: auth0User.name,
          picture: auth0User.picture || '',
          leetcodeUsername: '',
          githubUsername: '',
          preferences: {
            language: 'Any',
            difficulty: 'Mixed'
          },
          stats: {
            totalRoomsCreated: 0,
            totalRoomsJoined: 0,
            totalProblemsCompleted: 0
          }
        });
      } finally {
        setLoading(false);
      }
    };

    if (!auth0Loading) {
      syncUserWithBackend();
    }
  }, [isAuthenticated, auth0User, auth0Loading]);

  // Update user profile
  const updateUserProfile = async (updates) => {
    if (!userData) return;

    try {
      setLoading(true);
      const response = await usersAPI.updateUser(userData.auth0Id, updates);
      
      if (response.success) {
        setUserData(response.user);
        return { success: true, user: response.user };
      } else {
        throw new Error(response.message || 'Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Get user statistics
  const getUserStats = async () => {
    if (!userData) return null;

    try {
      const response = await usersAPI.getUserStats(userData.auth0Id);
      return response.success ? response.stats : null;
    } catch (err) {
      console.error('Error fetching user stats:', err);
      return null;
    }
  };

  const value = {
    userData,
    loading,
    error,
    updateUserProfile,
    getUserStats,
    auth0User,
    isAuthenticated
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};