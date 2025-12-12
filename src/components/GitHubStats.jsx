import React from 'react';

const GitHubStats = ({ stats, loading, error, username, method }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md mt-5 border border-gray-200">
        <h3 className="text-center mb-6 pb-4 border-b-2 border-gray-100 text-gray-800 text-2xl font-semibold">GitHub Statistics</h3>
        <div className="text-center text-gray-500 py-5">Loading stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md mt-5 border border-gray-200">
        <h3 className="text-center mb-6 pb-4 border-b-2 border-gray-100 text-gray-800 text-2xl font-semibold">GitHub Statistics</h3>
        <div className="text-center text-red-500 py-5">Error: {error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md mt-5 border border-gray-200">
        <h3 className="text-center mb-6 pb-4 border-b-2 border-gray-100 text-gray-800 text-2xl font-semibold">GitHub Statistics</h3>
        <div className="text-center text-gray-500 py-5">No GitHub username provided</div>
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
    <div className="bg-white rounded-xl p-6 shadow-md mt-5 border border-gray-200">
      <div className="text-center mb-6 pb-4 border-b-2 border-gray-100">
        <h3 className="m-0 mb-2 text-gray-800 text-2xl font-semibold">GitHub Statistics</h3>
        <p className="m-0 text-gray-500 text-base">@{username}</p>
        {method && (
          <span className={`inline-block px-2 py-1 rounded-xl text-xs font-medium mt-2 ${method === 'graphql' ? 'bg-green-500 text-white' : 'bg-yellow-400 text-black'}`}>
            {method === 'graphql' ? '📡 Accurate' : '📊 Estimated'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5 mb-8">
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 text-white">
          <h4 className="text-2xl font-bold m-0 mb-1">{totalCommits || 0}</h4>
          <p className="text-sm opacity-90 m-0">Total Commits</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <h4 className="text-2xl font-bold m-0 mb-1">{publicRepos || 0}</h4>
          <p className="text-sm opacity-90 m-0">Public Repos</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between py-2 border-b border-gray-200 last:border-0">
          <span className="text-gray-600">Weekly Commits:</span>
          <span className="font-semibold text-gray-800">{weeklyCommits || 0}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-200 last:border-0">
          <span className="text-gray-600">Monthly Commits:</span>
          <span className="font-semibold text-gray-800">{monthlyCommits || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default GitHubStats;
