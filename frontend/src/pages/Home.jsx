import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';
import ScholarshipCard from '../components/ScholarshipCard';
import { Search, Compass, GraduationCap, Laptop, Users, FileText, ArrowRight } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [recent, setRecent] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, closed: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch scholarships (to get stats and recently added)
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await axios.get(`${API_URL}/scholarships?limit=3`);
        if (res.data.success) {
          setRecent(res.data.data);
          setStats(res.data.stats || { total: 0, open: 0, closed: 0 });
        }
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/scholarships?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/scholarships');
    }
  };

  const categories = [
    { name: 'Merit-based', icon: <GraduationCap size={18} />, count: 'Merit-based awards' },
    { name: 'STEM', icon: <Laptop size={18} />, count: 'Science, Tech, Engineering & Math' },
    { name: 'Need-based', icon: <Users size={18} />, count: 'Financial aid assistance' },
    { name: 'Minority', icon: <Compass size={18} />, count: 'Underrepresented student support' },
    { name: 'General', icon: <FileText size={18} />, count: 'Open to all majors' },
  ];

  return (
    <div className="home-page">
      {/* NSP/Coursera Styled Search Hero */}
      <section className="hero-section">
        <h1 className="hero-title">National Scholarship Discovery & Tracking Portal</h1>
        <p className="hero-subtitle">
          Explore official scholarship opportunities, verify course eligibility, manage application deadlines, and monitor your tracking checklist.
        </p>

        <form onSubmit={handleSearchSubmit} className="search-form-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search by keyword, university, or provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button type="submit" className="btn btn-primary search-btn">
            Search
          </button>
        </form>
      </section>

      {/* Platform Statistics */}
      <section className="stats-section mb-8">
        <h2 className="section-title mb-4">Platform Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total Scholarships</span>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Open Opportunities</span>
            <div className="stat-value text-success-color">{stats.open}</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Closed Applications</span>
            <div className="stat-value text-muted-color">{stats.closed}</div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section mb-8">
        <h2 className="section-title mb-4">Browse by Category</h2>
        <div className="categories-grid">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => navigate(`/scholarships?category=${cat.name}`)}
              className="category-card"
            >
              <div className="category-icon-wrapper">{cat.icon}</div>
              <div>
                <h3 className="category-name">{cat.name}</h3>
                <p className="category-description">{cat.count}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recently Added Section */}
      <section className="recent-section">
        <div className="section-header mb-4">
          <h2 className="section-title">Recently Added</h2>
          <button onClick={() => navigate('/scholarships')} className="btn btn-secondary btn-sm flex-center">
            View All <ArrowRight size={14} className="ml-1" />
          </button>
        </div>

        {loading ? (
          <div className="spinner"></div>
        ) : recent.length > 0 ? (
          <div className="grid-3">
            {recent.map((scholarship) => (
              <ScholarshipCard
                key={scholarship._id}
                scholarship={scholarship}
                onViewDetails={() => navigate(`/scholarships?id=${scholarship._id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="card text-center py-8">
            <p className="text-secondary">No scholarships available in the database.</p>
          </div>
        )}
      </section>

      <style>{`
        .home-page {
          padding-bottom: 3rem;
        }
        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .text-success-color {
          color: var(--color-success) !important;
        }
        .text-muted-color {
          color: var(--text-muted) !important;
        }
        
        .search-form-container {
          display: flex;
          max-width: 550px;
          margin: 0 auto;
          gap: 0.5rem;
          background-color: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.35rem;
          box-shadow: var(--shadow-sm);
        }
        @media (max-width: 500px) {
          .search-form-container {
            flex-direction: column;
            border: none;
            box-shadow: none;
            padding: 0;
          }
        }
        .search-input-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          padding-left: 0.5rem;
          border: 1px solid transparent;
        }
        .search-icon {
          color: var(--text-muted);
        }
        .search-input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 0.875rem;
          padding: 0.5rem 0;
          width: 100%;
        }
        
        /* Categories list */
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
        }
        .category-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background-color: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1rem;
          cursor: pointer;
          transition: border-color var(--transition-fast), background-color var(--transition-fast);
        }
        .category-card:hover {
          border-color: var(--border-hover);
          background-color: var(--bg-tertiary);
        }
        .category-icon-wrapper {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: var(--radius-sm);
          background-color: var(--bg-tertiary);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .category-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .category-description {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .flex-center {
          display: inline-flex;
          align-items: center;
        }
        .ml-1 {
          margin-left: 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default Home;
