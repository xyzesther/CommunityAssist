import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import '../style/navBar.css';

const Navbar = () => {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  const handleNavLinkClick = (e, path) => {
    if (!isAuthenticated) {
      e.preventDefault();
      loginWithRedirect({ appState: { returnTo: path } });
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <ul>
          <li>
            <NavLink to="/" exact="true" className={({ isActive }) => (isActive ? 'active-link' : '')}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/profile" exact="true"
              className={({ isActive }) => (isActive ? 'active-link' : '')}
              onClick={(e) => handleNavLinkClick(e, '/profile')}
            >
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/auth-debugger" exact="true"
              className={({ isActive }) => (isActive ? 'active-link' : '')}
              onClick={(e) => handleNavLinkClick(e, '/auth-debugger')}
            >
              Auth Debugger
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="auth-buttons">
        {isAuthenticated ? (
          <button onClick={() => logout({ returnTo: window.location.origin })}>
            Logout
          </button>
        ) : (
          <button onClick={loginWithRedirect}>Login / Sign up</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
