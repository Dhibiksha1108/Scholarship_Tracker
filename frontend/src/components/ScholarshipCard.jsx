import React from 'react';
import { Calendar, DollarSign, ExternalLink, Bookmark, Check, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ScholarshipCard = ({
  scholarship,
  isWishlisted = false,
  wishlistItemId = null,
  onWishlistToggle = null,
  onViewDetails = null,
  onEdit = null,
  onDelete = null,
}) => {
  const { user } = useAuth();
  const {
    _id,
    title,
    provider,
    description,
    eligibility,
    amount,
    deadline,
    website,
    category,
    course,
    state,
    status,
  } = scholarship;

  // Format date cleanly
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isClosed = status === 'Closed' || new Date(deadline) < new Date();

  // Helper to get provider initials for logo icon
  const getProviderInitials = (name) => {
    if (!name) return 'S';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Generate a soft background color for the logo avatar based on provider name hash
  const getAvatarBg = (name) => {
    const colors = [
      { bg: '#EFF6FF', text: '#0F4C81' }, // Blue
      { bg: '#ECFDF5', text: '#059669' }, // Green
      { bg: '#FDF2F8', text: '#DB2777' }, // Pink
      { bg: '#F5F3FF', text: '#7C3AED' }, // Purple
      { bg: '#FFF7ED', text: '#EA580C' }, // Orange
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const avatarColor = getAvatarBg(provider);

  return (
    <div className={`card scholarship-card ${isClosed ? 'closed-card' : ''}`}>
      <div className="card-top">
        {/* Provider Initials Logo */}
        <div 
          className="provider-avatar"
          style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}
        >
          {getProviderInitials(provider)}
        </div>
        <div className="card-top-info">
          <div>
            <span className="scholarship-category">{category}</span>
            {course && <span className="scholarship-course-tag">{course}</span>}
            <span className="scholarship-state-tag">{state}</span>
          </div>
          <span className={`badge ${isClosed ? 'badge-closed' : 'badge-open'}`}>
            {isClosed ? 'Closed' : 'Open'}
          </span>
        </div>
      </div>

      <h3 className="scholarship-name" onClick={() => onViewDetails && onViewDetails(scholarship)}>
        {title}
      </h3>
      <p className="scholarship-provider">by {provider}</p>

      {/* Eligibility Info */}
      <div className="eligibility-container">
        <span className="eligibility-label">Eligibility Criteria:</span>
        <p className="eligibility-text">{eligibility && eligibility.length > 90 ? `${eligibility.substring(0, 90)}...` : eligibility || description}</p>
      </div>

      {/* Stats row */}
      <div className="scholarship-details-row">
        <div className="sch-detail-item">
          <span className="rupee-symbol">₹</span>
          <span>{amount.toLocaleString('en-IN')}</span>
        </div>
        <div className="sch-detail-item">
          <Calendar size={14} className="detail-icon" />
          <span>{formatDate(deadline)}</span>
        </div>
      </div>

      <div className="card-actions-wrapper">
        <div className="actions-left">
          <button
            onClick={() => onViewDetails && onViewDetails(scholarship)}
            className="btn btn-secondary btn-sm"
          >
            Details
          </button>
          
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm ext-apply-btn"
            title="Go to official scholarship website"
          >
            Official Website <ExternalLink size={12} />
          </a>
        </div>

        <div className="actions-right">
          {/* Save Button for Student or Guest */}
          {(!user || user.role === 'Student') && onWishlistToggle && (
            <button
              onClick={() => {
                if (!user) {
                  window.location.href = '/login';
                } else {
                  onWishlistToggle(_id, isWishlisted, wishlistItemId);
                }
              }}
              className={`btn btn-sm bookmark-btn ${isWishlisted ? 'btn-success' : 'btn-secondary'}`}
              title={isWishlisted ? 'Saved' : 'Save to Wishlist'}
              disabled={isClosed && !isWishlisted}
            >
              {isWishlisted ? <Check size={14} /> : <Bookmark size={14} />}
            </button>
          )}

          {/* Admin Edit/Delete */}
          {user && user.role === 'Admin' && (
            <div className="admin-quick-actions">
              {onEdit && (
                <button
                  onClick={() => onEdit(scholarship)}
                  className="btn btn-secondary btn-sm edit-action-btn"
                  title="Edit"
                >
                  <Edit2 size={12} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(_id)}
                  className="btn btn-danger btn-sm delete-action-btn"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .scholarship-card {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 1.25rem;
          box-shadow: var(--shadow-sm);
          transition: border-color var(--transition-fast), transform var(--transition-fast);
          height: 100%;
          min-height: 320px;
          position: relative;
        }
        .scholarship-card:hover {
          border-color: #cbd5e1; /* Slate 300 */
          transform: translateY(-2px);
        }
        .closed-card {
          background-color: #f8fafc;
          border-left: 3px solid #ef4444; /* Red border for closed status */
        }
        .closed-card .scholarship-name {
          color: var(--text-muted);
        }
        .card-top {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .provider-avatar {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
          flex-shrink: 0;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .card-top-info {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .scholarship-category {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--color-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .scholarship-state-tag {
          font-size: 0.7rem;
          background-color: #f1f5f9;
          color: #475569;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          margin-left: 0.4rem;
          font-weight: 550;
          border: 1px solid var(--border-color);
        }
        .scholarship-course-tag {
          font-size: 0.7rem;
          background-color: #e6f0fa;
          color: var(--color-primary);
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          margin-left: 0.4rem;
          font-weight: 600;
          border: 1px solid rgba(15, 76, 129, 0.15);
        }
        .rupee-symbol {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-primary);
          margin-right: 0.15rem;
        }
        .scholarship-name {
          font-size: 1.05rem;
          font-weight: 600;
          line-height: 1.4;
          margin-top: 0.25rem;
          margin-bottom: 0.25rem;
          color: var(--text-primary);
          cursor: pointer;
          transition: color var(--transition-fast);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 2.8rem;
        }
        .scholarship-name:hover {
          color: var(--color-primary);
        }
        .scholarship-provider {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 0.875rem;
          font-weight: 500;
        }
        .eligibility-container {
          flex: 1;
          margin-bottom: 1rem;
        }
        .eligibility-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-primary);
          display: block;
        }
        .eligibility-text {
          font-size: 0.825rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-top: 0.15rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .scholarship-details-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-color);
        }
        .sch-detail-item {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .detail-icon {
          color: var(--text-muted);
        }
        .card-actions-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          gap: 0.5rem;
        }
        .actions-left {
          display: flex;
          gap: 0.4rem;
          flex: 1;
        }
        .ext-apply-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background-color: var(--bg-secondary);
          color: var(--color-primary);
          border: 1px solid var(--color-primary);
          font-weight: 600;
          flex: 1;
        }
        .ext-apply-btn:hover {
          background-color: #f0f7ff;
          color: var(--color-primary-hover);
          border-color: var(--color-primary-hover);
        }
        .bookmark-btn {
          width: 2.2rem;
          height: 2.2rem;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
        }
        .admin-quick-actions {
          display: flex;
          gap: 0.35rem;
        }
        .edit-action-btn, .delete-action-btn {
          width: 2.2rem;
          height: 2.2rem;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
};

export default ScholarshipCard;
