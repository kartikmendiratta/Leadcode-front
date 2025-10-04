import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './login.css';

const Login = () => {
    const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

    if (isLoading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
                <div className="loading-text">Loading...</div>
            </div>
        );
    }

    if (isAuthenticated) {
        return (
            <div className="redirecting-container">
                <div className="success-icon">✓</div>
                <div className="redirecting-text">Successfully logged in!</div>
                <div>Redirecting to your dashboard...</div>
            </div>
        );
    }

    return (
        <div className="login-container">
            {/* Floating Code Particles */}
            <div className="code-particle">{'{ coding: true }'}</div>
            <div className="code-particle">{'const app = () => {}'}</div>
            <div className="code-particle">{'git push origin main'}</div>
            <div className="code-particle">{'npm start'}</div>
            
            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-title">Leadcode</h1>
                    <p className="login-subtitle">
                        Track your coding journey across LeetCode and GitHub
                    </p>
                </div>

                <div className="login-features">
                    <div className="feature-item">
                        <span className="feature-icon">🏆</span>
                        <span>Compete in coding rooms</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">📊</span>
                        <span>Track LeetCode progress</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">⚡</span>
                        <span>Monitor GitHub activity</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">🎯</span>
                        <span>View detailed leaderboards</span>
                    </div>
                </div>

                <button 
                    className="login-button"
                    onClick={() => loginWithRedirect()}
                >
                    Get Started
                </button>
            </div>
        </div>
    );
};

export default Login;