import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from "../../contexts/useUser";
import UserInfoCard from "../../components/UserInfoCard";
import LeetCodeStats from "../../components/LeetCodeStats";
import GitHubStats from "../../components/GitHubStats";
import './profile.css';

export default function Profile() {
  const { user: auth0User } = useAuth0();
  const { userData, updateUserProfile } = useUser();
  
  const [user, setUser] = useState({
    displayName: auth0User?.name || "Demo User",
    email: auth0User?.email || "",
    leetcodeUsername: "",
    githubUsername: "",
    profilePicture: auth0User?.picture || null,
    joinedDate: new Date()
  });

  const [leetcodeStats, setLeetcodeStats] = useState(null);
  const [githubStats, setGithubStats] = useState(null);
  const [githubMethod, setGithubMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [githubError, setGithubError] = useState(null);

  // Load user data from backend when userData is available
  useEffect(() => {
    if (userData) {
      setUser(prev => ({
        ...prev,
        displayName: userData.name || prev.displayName,
        email: userData.email || prev.email,
        leetcodeUsername: userData.leetcodeUsername || "",
        githubUsername: userData.githubUsername || "",
        profilePicture: userData.picture || prev.profilePicture
      }));
    }
  }, [userData]);

  const fetchLeetCodeStats = async (username) => {
    if (!username) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
      if (!response.ok) {
        throw new Error('Failed to fetch LeetCode stats');
      }
      const data = await response.json();
      setLeetcodeStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGitHubStats = async (username) => {
    if (!username) return;
    setGithubLoading(true);
    setGithubError(null);
    try {
      const response = await fetch(`/api/github/${username}/stats`);
      if (!response.ok) throw new Error('Failed to fetch GitHub stats');
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'GitHub stats error');
      setGithubStats(data.stats);
      setGithubMethod(data.method);
    } catch (err) {
      setGithubError(err.message);
    } finally {
      setGithubLoading(false);
    }
  };

  useEffect(() => {
    if (user.leetcodeUsername) {
      fetchLeetCodeStats(user.leetcodeUsername);
    }
  }, [user.leetcodeUsername]);

  useEffect(() => {
    if (user.githubUsername) {
      fetchGitHubStats(user.githubUsername);
    }
  }, [user.githubUsername]);

  const handleUserEdit = async (editData) => {
    // Update local state immediately for responsive UI
    const newUserData = {
      ...user,
      ...editData
    };
    setUser(newUserData);

    // Save to backend if leetcode or github username changed
    if (editData.leetcodeUsername !== undefined || editData.githubUsername !== undefined) {
      setSaving(true);
      setError(null);
      
      try {
        const result = await updateUserProfile({
          leetcodeUsername: newUserData.leetcodeUsername,
          githubUsername: newUserData.githubUsername
        });
        
        if (!result.success) {
          setError(result.error || 'Failed to save profile');
        }
      } catch (err) {
        setError('Failed to save profile');
        console.error('Error saving profile:', err);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
  <div className="profile-page">
      <div className="profile-content">
        {/* Header */}
        <div className="profile-header">
          <h1 className="profile-title">Profile</h1>
          <p className="profile-subtitle">{user.displayName || user.email}</p>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="error-message">
            {error}
            <button 
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                float: 'right',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
          </div>
        )}
        
        {saving && (
          <div className="success-message">
            Saving profile...
          </div>
        )}

        {/* Profile Grid */}
        <div className="profile-grid">
          {/* User Info Card */}
          <div className="profile-card">
            <div className="card-title">
              <span className="card-icon">👤</span>
              Account Details
            </div>
            <div className="card-content">
              <UserInfoCard 
                user={user} 
                onEdit={handleUserEdit}
                disabled={saving}
              />
            </div>
          </div>

          {/* LeetCode Stats Card */}
          <div className="profile-card">
            <div className="card-title">
              <span className="card-icon">🏆</span>
              LeetCode Progress
            </div>
            <div className="card-content">
              <LeetCodeStats 
                stats={leetcodeStats}
                loading={loading}
                error={error}
                username={user.leetcodeUsername}
              />
            </div>
          </div>

          {/* GitHub Stats Card */}
          <div className="profile-card">
            <div className="card-title">
              <span className="card-icon">⚡</span>
              GitHub Activity
            </div>
            <div className="card-content">
              <GitHubStats 
                stats={githubStats}
                loading={githubLoading}
                error={githubError}
                username={user.githubUsername}
                method={githubMethod}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}