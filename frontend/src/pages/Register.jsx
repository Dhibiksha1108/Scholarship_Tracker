import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Building, BookOpen, Shield } from 'lucide-react';

const Register = () => {
  const { register, user, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    course: '',
    role: 'Student',
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
    const { name, email, password, college, course } = formData;

    if (!name || !email || !password || !college || !course) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    const result = await register(formData);
    if (!result.success) {
      setFormError(result.error || 'Registration failed');
    }
  };

  return (
    <div className="register-page">
      <div className="card auth-card">
        <div className="auth-header">
          <span className="auth-logo">🎓</span>
          <h2>Create Account</h2>
          <p>Join SchlTracker to explore and save scholarships</p>
        </div>

        {formError && (
          <div className="alert alert-error">
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name
            </label>
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={onChange}
                className="form-control"
                placeholder="Jane Doe"
                required
              />
            </div>
          </div>

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
                placeholder="jane@university.edu"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password (min. 6 characters)
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

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="college">
                College/University
              </label>
              <div className="input-with-icon">
                <Building size={16} className="input-icon" />
                <input
                  type="text"
                  id="college"
                  name="college"
                  value={formData.college}
                  onChange={onChange}
                  className="form-control"
                  placeholder="State College"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="course">
                Course/Major
              </label>
              <div className="input-with-icon">
                <BookOpen size={16} className="input-icon" />
                <input
                  type="text"
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={onChange}
                  className="form-control"
                  placeholder="B.Sc Computer Science"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">
              Account Role
            </label>
            <div className="input-with-icon">
              <Shield size={16} className="input-icon" />
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={onChange}
                className="form-control select-control"
              >
                <option value="Student">Student (Discover & Track)</option>
                <option value="Admin">Admin (Add & Manage Scholarships)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className={`btn btn-primary w-full mt-2 ${loading ? 'btn-disabled' : ''}`}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer mt-6">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .register-page {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 3rem 1.5rem;
          min-height: calc(100vh - 180px);
        }
        .auth-card {
          width: 100%;
          max-width: 500px;
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
        .select-control {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 0.85em;
          padding-right: 2rem;
        }
        .input-icon {
          position: absolute;
          left: 0.875rem;
          color: var(--text-muted);
          pointer-events: none;
          z-index: 5;
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

export default Register;
