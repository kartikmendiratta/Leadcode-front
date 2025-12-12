import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth0();

  if (!isAuthenticated) {
    return <div className="flex justify-center items-center min-h-screen text-xl text-white">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-[calc(100vh-80px)]">
      <div className="text-center mb-12 py-10">
        <h1 className="text-3xl md:text-4xl font-bold text-[#ffb6b6] mb-3"> {user?.name || 'User'}</h1>
        <p className="text-lg md:text-xl text-[#ffafaf]">Are You Ready to track your coding progress?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#ddd4d4] rounded-2xl p-8 shadow-md border border-[#85c2ff] text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
          <div className="text-5xl mb-4 block">👤</div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">Profile</h3>
          <p className="text-gray-600 leading-relaxed mb-6">View and edit your profile information, connect your LeetCode account</p>
          <Link to="/profile" className="inline-block bg-black text-white px-7 py-3 rounded-lg font-medium transition-all duration-200 hover:-translate-y-px hover:shadow-lg">Go to Profile</Link>
        </div>

        <div className="bg-[#ddd4d4] rounded-2xl p-8 shadow-md border border-[#85c2ff] text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
          <div className="text-5xl mb-4 block">🏠</div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">Rooms</h3>
          <p className="text-gray-600 leading-relaxed mb-6">Join coding rooms, collaborate with others, and practice together</p>
          <Link to="/rooms" className="inline-block bg-black text-white px-7 py-3 rounded-lg font-medium transition-all duration-200 hover:-translate-y-px hover:shadow-lg">View Rooms</Link>
        </div>

        {/* <div className="bg-[#ddd4d4] rounded-2xl p-8 shadow-md border border-[#85c2ff] text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
          <div className="text-5xl mb-4 block">🏆</div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">Leaderboard</h3>
          <p className="text-gray-600 leading-relaxed mb-6">Check your ranking among peers and see top performers</p>
          <Link to="/leaderboard" className="inline-block bg-black text-white px-7 py-3 rounded-lg font-medium transition-all duration-200 hover:-translate-y-px hover:shadow-lg">View Rankings</Link>
        </div> */}

        <div className="bg-[#ddd4d4] rounded-2xl p-8 shadow-md border border-[#85c2ff] text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
          <div className="text-5xl mb-4 block">📊</div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">Statistics</h3>
          <p className="text-gray-600 leading-relaxed mb-6">Track your progress, view your coding statistics and achievements</p>
          <Link to="/profile" className="inline-block bg-black text-white px-7 py-3 rounded-lg font-medium transition-all duration-200 hover:-translate-y-px hover:shadow-lg">View Stats</Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gray-200">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100 transition-colors duration-200 hover:border-[#667eea]">
            <span className="text-2xl mr-4">🔗</span>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-800 mb-1">Connect LeetCode</h4>
              <p className="text-gray-500 text-sm">Link your LeetCode account to start tracking</p>
            </div>
            <Link to="/profile" className="text-[#667eea] font-medium hover:text-[#764ba2] transition-colors">Connect</Link>
          </div>
          
          <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100 transition-colors duration-200 hover:border-[#667eea]">
            <span className="text-2xl mr-4">👥</span>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-800 mb-1">Join a Room</h4>
              <p className="text-gray-500 text-sm">Find active coding rooms to join</p>
            </div>
            <Link to="/rooms" className="text-[#667eea] font-medium hover:text-[#764ba2] transition-colors">Join</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;