import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import './dashboard.css';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth0();

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || 'User'}!</h1>
        <p className="dashboard-subtitle">Ready to track your coding progress?</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-icon">👤</div>
          <h3>Profile</h3>
          <p>View and edit your profile information, connect your LeetCode account</p>
          <Link to="/profile" className="card-button">Go to Profile</Link>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">🏠</div>
          <h3>Rooms</h3>
          <p>Join coding rooms, collaborate with others, and practice together</p>
          <Link to="/rooms" className="card-button">View Rooms</Link>
        </div>

        {/* <div className="dashboard-card">
          <div className="card-icon">🏆</div>
          <h3>Leaderboard</h3>
          <p>Check your ranking among peers and see top performers</p>
          <Link to="/leaderboard" className="card-button">View Rankings</Link>
        </div> */}

        <div className="dashboard-card">
          <div className="card-icon">📊</div>
          <h3>Statistics</h3>
          <p>Track your progress, view your coding statistics and achievements</p>
          <Link to="/profile" className="card-button">View Stats</Link>
        </div>
      </div>

      <div className="dashboard-recent">
        <h2>Quick Actions</h2>
        <div className="recent-grid">
          <div className="recent-item">
            <span className="recent-icon">🔗</span>
            <div className="recent-content">
              <h4>Connect LeetCode</h4>
              <p>Link your LeetCode account to start tracking</p>
            </div>
            <Link to="/profile" className="recent-action">Connect</Link>
          </div>
          
          <div className="recent-item">
            <span className="recent-icon">👥</span>
            <div className="recent-content">
              <h4>Join a Room</h4>
              <p>Find active coding rooms to join</p>
            </div>
            <Link to="/rooms" className="recent-action">Join</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;