import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, LayoutDashboard, Bookmark, User, Compass } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const toggleMenu = () => setIsOpen(!isOpen);

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <nav className="nav-header">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={() => setIsOpen(false)}>
          <span className="logo-icon">🎓</span>
          <span className="logo-text">Schl<span className="blue-accent">Tracker</span></span>
        </Link>

        {/* Center Links */}
        <div className="nav-menu-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/scholarships" className={`nav-link ${isActive('/scholarships') ? 'active' : ''}`}>
            Explore
          </Link>

          {user && user.role === 'Student' && (
            <Link to="/wishlist" className={`nav-link ${isActive('/wishlist') ? 'active' : ''}`}>
              Wishlist
            </Link>
          )}

          {user && (
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
              Dashboard
            </Link>
          )}
        </div>

        {/* Right Auth Section */}
        <div className="nav-auth-desktop">
          {user ? (
            <div className="nav-auth-wrapper">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="avatar-btn" 
                title={`${user.name} (${user.role})`}
              >
                {getInitials(user.name)}
              </button>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm nav-logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="nav-auth-wrapper">
              <Link to="/login" className="nav-login-link">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <button onClick={toggleMenu} className="nav-mobile-toggle" aria-label="Toggle Navigation Menu">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="nav-menu-mobile">
          <Link to="/" className={`nav-mobile-link ${isActive('/') ? 'active' : ''}`} onClick={toggleMenu}>
            Home
          </Link>
          <Link to="/scholarships" className={`nav-mobile-link ${isActive('/scholarships') ? 'active' : ''}`} onClick={toggleMenu}>
            Explore Scholarships
          </Link>

          {user && user.role === 'Student' && (
            <Link to="/wishlist" className={`nav-mobile-link ${isActive('/wishlist') ? 'active' : ''}`} onClick={toggleMenu}>
              Wishlist
            </Link>
          )}

          {user && (
            <Link to="/dashboard" className={`nav-mobile-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={toggleMenu}>
              Dashboard
            </Link>
          )}

          <div className="nav-mobile-divider"></div>

          {user ? (
            <div className="nav-mobile-auth">
              <div className="user-info-mobile mb-4">
                <div className="avatar-circle">{getInitials(user.name)}</div>
                <div>
                  <div className="user-name-mobile">{user.name}</div>
                  <div className="user-role-mobile">{user.role}</div>
                </div>
              </div>
              <button onClick={handleLogout} className="btn btn-danger btn-sm w-full">
                Logout
              </button>
            </div>
          ) : (
            <div className="nav-mobile-auth">
              <Link to="/login" className="btn btn-secondary btn-sm mb-2" onClick={toggleMenu}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={toggleMenu}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
      
      <style>{`
        .nav-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background-color: #ffffff;
          border-bottom: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
        }
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0.875rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .logo-icon {
          font-size: 1.35rem;
        }
        .blue-accent {
          color: var(--color-primary);
        }
        .nav-menu-links {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-left: auto;
          margin-right: auto;
        }
        .nav-auth-desktop {
          display: flex;
          align-items: center;
        }
        .nav-auth-wrapper {
          display: flex;
          align-items: center;
          gap: 0.875rem;
        }
        @media (max-width: 768px) {
          .nav-menu-links, .nav-auth-desktop {
            display: none;
          }
        }
        .nav-link {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
          padding: 0.4rem 0.875rem;
          border-radius: var(--radius-sm);
        }
        .nav-link:hover {
          color: var(--color-primary);
          background-color: var(--bg-tertiary);
        }
        .nav-link.active {
          color: var(--color-primary);
          background-color: #e6f0fa; /* soft primary accent background */
          font-weight: 600;
        }
        
        /* Avatar Circle */
        .avatar-btn {
          width: 2.25rem;
          height: 2.25rem;
          background-color: #e6f0fa;
          border: 1px solid rgba(15, 76, 129, 0.2);
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .avatar-btn:hover {
          border-color: var(--color-primary);
          background-color: #dbeafe;
          transform: translateY(-1px);
        }
        .nav-logout-btn {
          font-weight: 550;
        }
        .nav-login-link {
          font-size: 0.875rem;
          font-weight: 550;
          color: var(--text-secondary);
          padding: 0.4rem 0.875rem;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }
        .nav-login-link:hover {
          color: var(--color-primary);
          background-color: var(--bg-tertiary);
        }

        .nav-mobile-toggle {
          display: none;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: var(--radius-sm);
          transition: background var(--transition-fast);
        }
        .nav-mobile-toggle:hover {
          background-color: var(--bg-tertiary);
        }
        @media (max-width: 768px) {
          .nav-mobile-toggle {
            display: block;
          }
        }
        
        /* Mobile Dropdown */
        .nav-menu-mobile {
          display: flex;
          flex-direction: column;
          background-color: #ffffff;
          border-bottom: 1px solid var(--border-color);
          padding: 1rem 1.5rem;
          position: absolute;
          width: 100%;
          left: 0;
          top: 100%;
          box-shadow: var(--shadow-lg);
          animation: slideDown 0.2s ease-out;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .nav-mobile-link {
          padding: 0.6rem 0.75rem;
          font-weight: 500;
          font-size: 0.9rem;
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }
        .nav-mobile-link:hover {
          background-color: var(--bg-tertiary);
          color: var(--color-primary);
        }
        .nav-mobile-link.active {
          color: var(--color-primary);
          background-color: #e6f0fa;
          font-weight: 600;
        }
        .nav-mobile-divider {
          height: 1px;
          background-color: var(--border-color);
          margin: 0.75rem 0;
        }
        .nav-mobile-auth {
          display: flex;
          flex-direction: column;
          padding: 0.25rem 0.75rem;
        }
        .user-info-mobile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .avatar-circle {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: var(--radius-full);
          background-color: #e6f0fa;
          border: 1px solid rgba(15, 76, 129, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-primary);
        }
        .user-name-mobile {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .user-role-mobile {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .w-full {
          width: 100%;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
