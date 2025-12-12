import React from 'react';

const LeetCodeStats = ({ stats, loading, error, username }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md mt-5 border border-gray-200">
        <h3 className="text-center mb-6 pb-4 border-b-2 border-gray-100 text-gray-800 text-2xl font-semibold">LeetCode Statistics</h3>
        <div className="text-center text-gray-500 py-5">Loading stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md mt-5 border border-gray-200">
        <h3 className="text-center mb-6 pb-4 border-b-2 border-gray-100 text-gray-800 text-2xl font-semibold">LeetCode Statistics</h3>
        <div className="text-center text-red-500 py-5">Error: {error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md mt-5 border border-gray-200">
        <h3 className="text-center mb-6 pb-4 border-b-2 border-gray-100 text-gray-800 text-2xl font-semibold">LeetCode Statistics</h3>
        <div className="text-center text-gray-500 py-5">No LeetCode username provided</div>
      </div>
    );
  }

  const { totalSolved, acceptanceRate, ranking } = stats;

  return (
    <div className="bg-white rounded-xl p-6 shadow-md mt-5 border border-gray-200">
      <div className="text-center mb-6 pb-4 border-b-2 border-gray-100">
        <h3 className="m-0 mb-2 text-gray-800 text-2xl font-semibold">LeetCode Statistics</h3>
        <p className="m-0 text-gray-500 text-base">@{username}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <h4 className="text-2xl font-bold m-0 mb-1">{totalSolved}</h4>
          <p className="text-sm opacity-90 m-0">Total Solved</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-pink-400 to-red-500 text-white">
          <h4 className="text-2xl font-bold m-0 mb-1">{acceptanceRate}%</h4>
          <p className="text-sm opacity-90 m-0">Acceptance Rate</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
          <h4 className="text-2xl font-bold m-0 mb-1">{ranking ? ranking.toLocaleString() : 'N/A'}</h4>
          <p className="text-sm opacity-90 m-0">Global Ranking</p>
        </div>
      </div>
    </div>
  );
};

export default LeetCodeStats;
