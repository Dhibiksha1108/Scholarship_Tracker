import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock } from 'lucide-react';

const Login = () => {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    const result = await login(email, password);
    if (!result.success) {
      setFormError(result.error || 'Invalid credentials');
    }
  };

  return (
    <div className="login-page">
      <div className="card auth-card">
        <div className="auth-header">
          <span className="auth-logo">🎓</span>
          <h2>Sign In to SchlTracker</h2>
          <p>Enter your credentials to manage your wishlisted scholarships</p>
        </div>

        {formError && (
          <div className="alert alert-error">
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                className="form-control"
                placeholder="you@university.edu"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={onChange}
                className="form-control"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className={`btn btn-primary w-full mt-2 ${loading ? 'btn-disabled' : ''}`}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer mt-6">
          <p>
            New to SchlTracker?{' '}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .login-page {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 3rem 1.5rem;
          min-height: calc(100vh - 180px);
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
          padding: 2rem;
          background-color: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
        }
        .auth-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .auth-logo {
          font-size: 2rem;
          display: block;
          margin-bottom: 0.5rem;
        }
        .auth-header h2 {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .auth-header p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-with-icon .form-control {
          padding-left: 2.5rem;
          width: 100%;
        }
        .input-icon {
          position: absolute;
          left: 0.875rem;
          color: var(--text-muted);
          pointer-events: none;
        }
        .alert {
          padding: 0.6rem 0.875rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }
        .alert-error {
          background-color: var(--color-danger-bg);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--color-danger);
        }
        .auth-footer {
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-secondary);
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
        }
        .auth-link {
          color: var(--color-primary);
          font-weight: 600;
        }
        .auth-link:hover {
          text-decoration: underline;
        }
        .w-full {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default Login;
