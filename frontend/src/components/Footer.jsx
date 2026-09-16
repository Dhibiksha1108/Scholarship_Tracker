import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section brand">
          <div className="footer-logo">
            <span className="logo-icon">🎓</span>
            <span className="logo-text">Schl<span className="blue-accent">Tracker</span></span>
          </div>
          <p className="footer-desc">
            Simplifying scholarship discovery, tracking, and applications for students globally.
          </p>
        </div>

        <div className="footer-section links">
          <h4>Explore</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/scholarships">Browse Scholarships</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
          </ul>
        </div>

        <div className="footer-section contact">
          <h4>Contact & Support</h4>
          <ul>
            <li>support@scholarshiptracker.com</li>
            <li>+1 (555) 019-2834</li>
            <li>100 Innovation Way, Tech City</li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} SchlTracker. All rights reserved.</p>
        <p className="credit-text">Built for Students</p>
      </div>

      <style>{`
        .footer {
          background-color: #ffffff;
          border-top: 1px solid var(--border-color);
          padding: 3rem 1.5rem 1.5rem;
          margin-top: auto;
        }
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr;
          gap: 3rem;
          margin-bottom: 2.5rem;
        }
        @media (max-width: 768px) {
          .footer-container {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 1.15rem;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }
        .blue-accent {
          color: var(--color-primary);
        }
        .footer-desc {
          color: var(--text-secondary);
          font-size: 0.875rem;
          max-width: 320px;
          line-height: 1.5;
        }
        .footer-section h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
        }
        .footer-section ul {
          list-style: none;
        }
        .footer-section ul li {
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
        .footer-section ul li a {
          color: var(--text-secondary);
          transition: color var(--transition-fast);
        }
        .footer-section ul li a:hover {
          color: var(--color-primary);
        }
        .footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          border-top: 1px solid var(--border-color);
          padding-top: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        @media (max-width: 600px) {
          .footer-bottom {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
