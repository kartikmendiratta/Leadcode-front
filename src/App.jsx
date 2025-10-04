import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import './App.css'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'
import { UserProvider } from './contexts/UserContext'
import Login from './modules/login/login'
import Navbar from './components/navbar'
import Rooms from './modules/rooms/rooms'
import Profile from './modules/profile/profile'
import Dashboard from './modules/dashboard/dashboard'

// Auth0 configuration - consider moving to environment variables for production
const domain = "dev-ibqrxmw4sbqd01ni.us.auth0.com";
const clientId = "9pbiIyaFvjbNOXHF018gDqVogqL9dgEW";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Main App Routes Component
const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Navbar />
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/rooms" 
          element={
            <ProtectedRoute>
              <Navbar />
              <Rooms />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Navbar />
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        scope: "openid profile email"
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </Auth0Provider>
  )
}

export default App
