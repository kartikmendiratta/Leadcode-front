import React from 'react';
import './GitHubStats.css';

const GitHubStats = ({ stats, loading, error, username, method }) => {
  if (loading) {
    return (
      <div className="github-stats-card">
        <h3>GitHub Statistics</h3>
        <div className="loading">Loading stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="github-stats-card">
        <h3>GitHub Statistics</h3>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="github-stats-card">
        <h3>GitHub Statistics</h3>
        <div className="no-data">No GitHub username provided</div>
      </div>
    );
  }

  const { 
    totalCommits, 
    weeklyCommits, 
    monthlyCommits, 
    publicRepos 
  } = stats;

  return (
    <div className="github-stats-card">
      <div className="stats-header">
        <h3>GitHub Statistics</h3>
        <p className="username">@{username}</p>
        {method && (
          <span className={`method-badge ${method}`}>
            {method === 'graphql' ? '📡 Accurate' : '📊 Estimated'}
          </span>
        )}
      </div>

      <div className="stats-overview">
        <div className="stat-item total">
          <h4>{totalCommits || 0}</h4>
          <p>Total Commits</p>
        </div>
        <div className="stat-item repos">
          <h4>{publicRepos || 0}</h4>
          <p>Public Repos</p>
        </div>
      </div>

      <div className="additional-stats">
        <div className="stat-row">
          <span>Weekly Commits:</span>
          <span>{weeklyCommits || 0}</span>
        </div>
        <div className="stat-row">
          <span>Monthly Commits:</span>
          <span>{monthlyCommits || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default GitHubStats;