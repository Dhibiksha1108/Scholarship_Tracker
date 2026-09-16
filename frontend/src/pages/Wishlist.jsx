import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, useAuth } from '../context/AuthContext';
import { Bookmark, Calendar, Trash2, ExternalLink, ArrowRight, Clock, AlertTriangle, CheckCircle2, Circle } from 'lucide-react';

const Wishlist = () => {
  const { user, triggerToast } = useAuth();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/wishlist`);
      if (res.data.success) {
        const validItems = res.data.data.filter(item => item.scholarshipId != null);
        setWishlist(validItems);
      }
    } catch (err) {
      console.error(err);
      triggerToast('Failed to load wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'Student') {
      navigate('/dashboard');
      return;
    }
    fetchWishlist();
  }, [user, navigate]);

  const handleToggleApplied = async (itemId, currentApplied) => {
    try {
      const res = await axios.put(`${API_URL}/wishlist/${itemId}`, {
        applied: !currentApplied,
      });
      if (res.data.success) {
        setWishlist((prev) =>
          prev.map((item) => (item._id === itemId ? res.data.data : item))
        );
        triggerToast(
          !currentApplied
            ? 'Marked scholarship as Applied!'
            : 'Reverted status to Saved',
          'success'
        );
      }
    } catch (err) {
      console.error(err);
      triggerToast('Failed to update status', 'error');
    }
  };

  const handleRemove = async (itemId) => {
    if (window.confirm('Remove this scholarship from your wishlist?')) {
      try {
        const res = await axios.delete(`${API_URL}/wishlist/${itemId}`);
        if (res.data.success) {
          setWishlist((prev) => prev.filter((item) => item._id !== itemId));
          triggerToast('Scholarship removed from wishlist', 'success');
        }
      } catch (err) {
        console.error(err);
        triggerToast('Failed to remove scholarship', 'error');
      }
    }
  };

  const getDaysLeft = (deadlineDate) => {
    const today = new Date();
    const deadline = new Date(deadlineDate);
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderDeadlineBadge = (deadlineDate) => {
    const daysLeft = getDaysLeft(deadlineDate);

    if (daysLeft < 0) {
      return (
        <span className="badge badge-closed gap-1">
          Expired
        </span>
      );
    } else if (daysLeft <= 7) {
      return (
        <span className="badge urgency-danger gap-1">
          <Clock size={11} /> {daysLeft} days left
        </span>
      );
    } else if (daysLeft <= 30) {
      return (
        <span className="badge urgency-warning gap-1">
          <Clock size={11} /> {daysLeft} days left
        </span>
      );
    } else {
      return (
        <span className="badge urgency-safe gap-1">
          <Clock size={11} /> {daysLeft} days left
        </span>
      );
    }
  };

  return (
    <div className="wishlist-page">
      <div className="page-header mb-6">
        <h1>My Wishlist</h1>
        <p className="text-secondary">Track saved scholarships, log your application submissions, and monitor deadlines.</p>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : wishlist.length > 0 ? (
        <div className="wishlist-container">
          {/* Wishlist summary stats card */}
          <div className="card wishlist-summary-card mb-6">
            <div className="summary-left">
              <h3>Tracking Summary</h3>
              <p className="text-secondary">Quick overview of your active applications</p>
            </div>
            <div className="wishlist-summary-stats">
              <div className="w-stat">
                <span className="w-stat-num">{wishlist.length}</span>
                <span className="w-stat-lbl">Total saved</span>
              </div>
              <div className="w-stat">
                <span className="w-stat-num text-blue-color">
                  {wishlist.filter((w) => w.applied).length}
                </span>
                <span className="w-stat-lbl">Applied</span>
              </div>
              <div className="w-stat">
                <span className="w-stat-num text-warning-color">
                  {wishlist.filter((w) => !w.applied).length}
                </span>
                <span className="w-stat-lbl">Pending</span>
              </div>
            </div>
          </div>

          {/* Table List */}
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Status</th>
                  <th>Scholarship Name</th>
                  <th>Amount</th>
                  <th>Deadline Tracker</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {wishlist.map((item) => {
                  const s = item.scholarshipId;
                  return (
                    <tr key={item._id} className={item.applied ? 'row-applied' : ''}>
                      <td>
                        <button
                          onClick={() => handleToggleApplied(item._id, item.applied)}
                          className="status-toggle-btn"
                          title={item.applied ? 'Mark as Not Applied' : 'Mark as Applied'}
                        >
                          {item.applied ? (
                            <CheckCircle2 className="text-success-icon" size={20} />
                          ) : (
                            <Circle className="text-muted-icon" size={20} />
                          )}
                        </button>
                      </td>
                      <td>
                        <div className="wishlist-sch-info">
                          <span
                            onClick={() => navigate(`/scholarships?id=${s._id}`)}
                            className="wishlist-sch-title"
                          >
                            {s.title}
                          </span>
                          <span className="wishlist-sch-provider">{s.provider}</span>
                        </div>
                      </td>
                      <td>
                        <strong className="amount-val">₹{s.amount.toLocaleString('en-IN')}</strong>
                      </td>
                      <td>
                        <div className="deadline-cell">
                          <span className="date-text">
                            {new Date(s.deadline).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          {renderDeadlineBadge(s.deadline)}
                        </div>
                      </td>
                      <td>
                        <div className="wishlist-actions">
                          <a
                            href={s.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm ext-apply-link"
                          >
                            Apply Official <ExternalLink size={12} />
                          </a>
                          <button
                            onClick={() => handleRemove(item._id)}
                            className="btn btn-danger btn-sm delete-btn"
                            title="Remove"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12 empty-wishlist-card">
          <Bookmark size={40} className="text-muted mb-3" />
          <h3>Your Wishlist is Empty</h3>
          <p className="text-secondary max-w-sm mx-auto mt-1">
            Explore scholarships and click the bookmark icon on any card to track them here.
          </p>
          <button onClick={() => navigate('/scholarships')} className="btn btn-primary mt-4">
            Find Scholarships <ArrowRight size={14} className="ml-1" />
          </button>
        </div>
      )}

      <style>{`
        .wishlist-summary-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #ffffff;
          padding: 1.25rem;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
        }
        @media (max-width: 600px) {
          .wishlist-summary-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
        .wishlist-summary-stats {
          display: flex;
          gap: 2rem;
        }
        .w-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .w-stat-num {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .w-stat-lbl {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }
        .text-blue-color { color: var(--color-primary); }
        .text-warning-color { color: var(--color-warning); }
        
        .status-toggle-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        .text-success-icon {
          color: var(--color-success);
        }
        .text-muted-icon {
          color: var(--text-muted);
        }
        
        .row-applied td {
          opacity: 0.6;
        }
        .row-applied .wishlist-sch-title {
          text-decoration: line-through;
        }
        .wishlist-sch-info {
          display: flex;
          flex-direction: column;
        }
        .wishlist-sch-title {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-primary);
          cursor: pointer;
        }
        .wishlist-sch-title:hover {
          color: var(--color-primary);
        }
        .wishlist-sch-provider {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .amount-val {
          color: var(--text-primary);
        }
        .deadline-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .date-text {
          font-size: 0.85rem;
        }
        .urgency-danger {
          background-color: var(--color-danger-bg);
          color: var(--color-danger);
        }
        .urgency-warning {
          background-color: var(--color-warning-bg);
          color: var(--color-warning);
        }
        .urgency-safe {
          background-color: var(--color-success-bg);
          color: var(--color-success);
        }
        .gap-1 { gap: 0.25rem; }
        
        .wishlist-actions {
          display: flex;
          gap: 0.35rem;
        }
        .ext-apply-link {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .empty-wishlist-card {
          padding: 3rem 1.5rem;
        }
        .max-w-sm { max-width: 24rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .ml-1 { margin-left: 0.25rem; }
      `}</style>
    </div>
  );
};

export default Wishlist;
