import { useState } from 'react'
import Login from './components/login'
import Signup from './components/signup'
import Dashboard from './components/dashboard'
import './App.css'

function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setShowLogin(true);
  };

  // If user is logged in, show dashboard
  if (isLoggedIn) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  // Otherwise show login/signup
  return (
    <div>
        {showLogin ? (
          <Login 
            onToggle={() => setShowLogin(false)} 
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          <Signup onToggle={() => setShowLogin(true)} />
        )}
    </div>
  )
}

export default App
