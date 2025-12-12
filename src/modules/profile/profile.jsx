import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from "../../contexts/useUser";
import UserInfoCard from "../../components/UserInfoCard";
import LeetCodeStats from "../../components/LeetCodeStats";
import GitHubStats from "../../components/GitHubStats";

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
  <div className="min-h-screen p-4 md:p-8 bg-[#e0e0e1] box-border">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Profile</h1>
          <p className="mt-3 text-slate-600 text-lg">{user.displayName || user.email}</p>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="p-4 rounded-lg mb-5 text-white font-medium bg-red-600 flex justify-between items-center">
            {error}
            <button 
              onClick={() => setError(null)}
              className="bg-transparent border-none text-white cursor-pointer text-lg font-bold hover:opacity-80"
            >
              ×
            </button>
          </div>
        )}
        
        {saving && (
          <div className="p-4 rounded-lg mb-5 text-white font-medium bg-green-600">
            Saving profile...
          </div>
        )}

        {/* Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-7">
          {/* User Info Card - Dark Theme */}
          <div className="flex flex-col bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden h-full">
            <div className="p-4 bg-gray-900/85 border-b border-white/10 text-white font-semibold text-lg flex items-center gap-2">
              <span className="text-xl">👤</span>
              Account Details
            </div>
            <div className="p-6 bg-transparent text-slate-50">
              <UserInfoCard 
                user={user} 
                onEdit={handleUserEdit}
                disabled={saving}
              />
            </div>
          </div>

          {/* LeetCode Stats Card */}
          <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden h-full">
            <div className="p-4 bg-slate-900 text-white font-semibold text-lg flex items-center gap-2">
              <span className="text-xl">🏆</span>
              LeetCode Progress
            </div>
            <div className="p-6 bg-white text-gray-800">
              <LeetCodeStats 
                stats={leetcodeStats}
                loading={loading}
                error={error}
                username={user.leetcodeUsername}
              />
            </div>
          </div>

          {/* GitHub Stats Card */}
          <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden h-full">
            <div className="p-4 bg-slate-900 text-white font-semibold text-lg flex items-center gap-2">
              <span className="text-xl">⚡</span>
              GitHub Activity
            </div>
            <div className="p-6 bg-white text-gray-800">
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