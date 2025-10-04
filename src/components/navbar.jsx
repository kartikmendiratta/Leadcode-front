import React from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import "./navbar.css";

const Navbar = () => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  const handleAuthAction = () => {
    if (isAuthenticated) {
      logout({
        logoutParams: {
          returnTo: window.location.origin
        }
      });
    } else {
      loginWithRedirect();
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">LeadCode</div>
      <ul className="navbar-links">
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
       
        <li>
          <Link to="/rooms">Rooms</Link>
        </li>
        <li>
          {isAuthenticated ? (
            <Link to="/profile">Profile</Link>
          ) : (
            <button 
              onClick={handleAuthAction}
              className="navbar-auth-btn login-btn"
            >
              Login/signup
            </button>
          )}
        </li>
        {isAuthenticated && (
          <li>
            <button 
              onClick={handleAuthAction}
              className="navbar-auth-btn logout-btn"
            >
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
