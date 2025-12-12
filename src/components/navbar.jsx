import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const Navbar = () => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="flex justify-between items-center bg-[#0e1d3f] px-6 py-3 text-white sticky top-0 z-50">
      <div className="text-2xl font-bold text-[#2e97d0d8]">LeadCode</div>
      
      {/* Mobile Menu Button */}
      <button 
        className="md:hidden text-white focus:outline-none"
        onClick={toggleMenu}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
        </svg>
      </button>

      {/* Desktop Menu */}
      <ul className="hidden md:flex gap-6 items-center">
        <li>
          <Link to="/dashboard" className="text-white hover:text-[#3f5e57] transition-colors duration-200">Dashboard</Link>
        </li>
        <li>
          <Link to="/rooms" className="text-white hover:text-[#3f5e57] transition-colors duration-200">Rooms</Link>
        </li>
        <li>
          {isAuthenticated ? (
            <Link to="/profile" className="text-white hover:text-[#3f5e57] transition-colors duration-200">Profile</Link>
          ) : (
            <button 
              onClick={handleAuthAction}
              className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 bg-[#2e97d0] text-white hover:bg-[#1976a3] hover:-translate-y-px"
            >
              Login/signup
            </button>
          )}
        </li>
        {isAuthenticated && (
          <li>
            <button 
              onClick={handleAuthAction}
              className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 bg-white text-[#bc9f9f] hover:bg-[#fbfbfb] hover:-translate-y-px"
            >
              Logout
            </button>
          </li>
        )}
      </ul>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#0e1d3f] flex flex-col items-center py-4 md:hidden shadow-lg">
          <Link to="/dashboard" className="py-2 text-white hover:text-[#3f5e57] transition-colors duration-200" onClick={toggleMenu}>Dashboard</Link>
          <Link to="/rooms" className="py-2 text-white hover:text-[#3f5e57] transition-colors duration-200" onClick={toggleMenu}>Rooms</Link>
          {isAuthenticated ? (
            <Link to="/profile" className="py-2 text-white hover:text-[#3f5e57] transition-colors duration-200" onClick={toggleMenu}>Profile</Link>
          ) : (
            <button 
              onClick={() => { handleAuthAction(); toggleMenu(); }}
              className="mt-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 bg-[#2e97d0] text-white hover:bg-[#1976a3]"
            >
              Login/signup
            </button>
          )}
          {isAuthenticated && (
            <button 
              onClick={() => { handleAuthAction(); toggleMenu(); }}
              className="mt-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 bg-white text-[#bc9f9f] hover:bg-[#fbfbfb]"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
