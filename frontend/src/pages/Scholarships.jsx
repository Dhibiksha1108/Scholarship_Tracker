import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL, useAuth } from '../context/AuthContext';
import ScholarshipCard from '../components/ScholarshipCard';
import Modal from '../components/Modal';
import { Search, Filter, RefreshCw, ArrowLeft, ArrowRight, ExternalLink, Calendar, DollarSign, Award, MapPin } from 'lucide-react';

const Scholarships = () => {
  const { user, triggerToast } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search & Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minAmount, setMinAmount] = useState(searchParams.get('minAmount') || '');
  const [level, setLevel] = useState(searchParams.get('level') || '');
  const [course, setCourse] = useState(searchParams.get('course') || '');
  const [eligibility, setEligibility] = useState(searchParams.get('eligibility') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [state, setState] = useState(searchParams.get('state') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

  // Data states
  const [scholarships, setScholarships] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [wishlistMap, setWishlistMap] = useState({}); // mapping: scholarshipId -> wishlistItemId

  // Details Modal state
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Sync state from query params
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || '');
    setMinAmount(searchParams.get('minAmount') || '');
    setLevel(searchParams.get('level') || '');
    setCourse(searchParams.get('course') || '');
    setEligibility(searchParams.get('eligibility') || '');
    setStatus(searchParams.get('status') || '');
    setState(searchParams.get('state') || '');
    setPage(parseInt(searchParams.get('page')) || 1);
  }, [searchParams]);

  // Fetch Wishlist map if student
  const fetchWishlist = async () => {
    if (user && user.role === 'Student') {
      try {
        const res = await axios.get(`${API_URL}/wishlist`);
        if (res.data.success) {
          const mapping = {};
          res.data.data.forEach((item) => {
            if (item.scholarshipId) {
              mapping[item.scholarshipId._id] = item._id;
            }
          });
          setWishlistMap(mapping);
        }
      } catch (err) {
        console.error('Error fetching wishlist:', err);
      }
    }
  };

  // Fetch Scholarships
  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (minAmount) params.minAmount = minAmount;
      if (level) params.level = level;
      if (course) params.course = course;
      if (eligibility) params.eligibility = eligibility;
      if (status) params.status = status;
      if (state) params.state = state;
      params.page = page;
      params.limit = 6;

      const res = await axios.get(`${API_URL}/scholarships`, { params });
      if (res.data.success) {
        setScholarships(res.data.data);
        setPagination(res.data.pagination);

        // Check deep linking
        const viewId = searchParams.get('id');
        if (viewId) {
          const matched = res.data.data.find((s) => s._id === viewId);
          if (matched) {
            setSelectedScholarship(matched);
            setIsDetailsOpen(true);
          } else {
            try {
              const detailsRes = await axios.get(`${API_URL}/scholarships/${viewId}`);
              if (detailsRes.data.success) {
                setSelectedScholarship(detailsRes.data.data);
                setIsDetailsOpen(true);
              }
            } catch (error) {
              console.error(error);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      triggerToast('Failed to fetch scholarships', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  useEffect(() => {
    fetchScholarships();
  }, [search, category, minAmount, level, eligibility, status, state, page, searchParams]);

  // Wishlist toggle
  const handleWishlistToggle = async (scholarshipId, isWishlisted, wishlistItemId) => {
    try {
      if (isWishlisted) {
        const idToDelete = wishlistItemId || scholarshipId;
        const res = await axios.delete(`${API_URL}/wishlist/${idToDelete}`);
        if (res.data.success) {
          setWishlistMap((prev) => {
            const updated = { ...prev };
            delete updated[scholarshipId];
            return updated;
          });
          triggerToast('Removed from wishlist', 'success');
        }
      } else {
        const res = await axios.post(`${API_URL}/wishlist`, { scholarshipId });
        if (res.data.success) {
          setWishlistMap((prev) => ({
            ...prev,
            [scholarshipId]: res.data.data._id,
          }));
          triggerToast('Saved to wishlist!', 'success');
        }
      }
    } catch (err) {
      console.error(err);
      triggerToast('Error updating wishlist', 'error');
    }
  };

  const handleApplyFilter = (e) => {
    e.preventDefault();
    const newParams = {};
    if (search) newParams.search = search;
    if (category) newParams.category = category;
    if (minAmount) newParams.minAmount = minAmount;
    if (level) newParams.level = level;
    if (course) newParams.course = course;
    if (eligibility) newParams.eligibility = eligibility;
    if (status) newParams.status = status;
    if (state) newParams.state = state;
    newParams.page = 1;
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setMinAmount('');
    setLevel('');
    setCourse('');
    setEligibility('');
    setStatus('');
    setState('');
    setPage(1);
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      const currentParams = Object.fromEntries(searchParams.entries());
      currentParams.page = newPage;
      setSearchParams(currentParams);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openDetails = (scholarship) => {
    setSelectedScholarship(scholarship);
    setIsDetailsOpen(true);
    const currentParams = Object.fromEntries(searchParams.entries());
    currentParams.id = scholarship._id;
    setSearchParams(currentParams);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedScholarship(null);
    const currentParams = Object.fromEntries(searchParams.entries());
    delete currentParams.id;
    setSearchParams(currentParams);
  };

  return (
    <div className="scholarships-page">
      <div className="page-header mb-6">
        <h1>Explore Scholarships</h1>
        <p className="text-secondary">Discover financial awards and filter by category or eligibility criteria.</p>
      </div>

      <div className="scholarships-layout">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <div className="sidebar-header">
            <h3>Filters</h3>
            <button type="button" onClick={handleResetFilters} className="reset-link">
              Reset all
            </button>
          </div>
          <form onSubmit={handleApplyFilter} className="filters-form">
            <div className="form-group">
              <label className="form-label">Search Keywords</label>
              <input
                type="text"
                placeholder="Title, provider..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-control"
              >
                <option value="">All Categories</option>
                <option value="Merit-based">Merit-based</option>
                <option value="Need-based">Need-based</option>
                <option value="STEM">STEM</option>
                <option value="Minority">Minority</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Min Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 20000"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Course / Major</label>
              <input
                type="text"
                placeholder="e.g. B.Tech, M.Sc, All Courses"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Eligibility Criteria</label>
              <input
                type="text"
                placeholder="e.g. Female, India"
                value={eligibility}
                onChange={(e) => setEligibility(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="form-control"
              >
                <option value="">All States</option>
                <option value="All India">All India</option>
                <option value="Assam">Assam</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Delhi">Delhi</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Application Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-control"
              >
                <option value="">All Statuses</option>
                <option value="Open">Open Only</option>
                <option value="Closed">Closed Only</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-2">
              Apply Filters
            </button>
          </form>
        </aside>

        {/* Results List */}
        <section className="results-container">
          {loading ? (
            <div className="spinner"></div>
          ) : scholarships.length > 0 ? (
            <>
              <div className="grid-2">
                {scholarships.map((scholarship) => {
                  const isWishlisted = !!wishlistMap[scholarship._id];
                  const wishlistItemId = wishlistMap[scholarship._id];
                  return (
                    <ScholarshipCard
                      key={scholarship._id}
                      scholarship={scholarship}
                      isWishlisted={isWishlisted}
                      wishlistItemId={wishlistItemId}
                      onWishlistToggle={handleWishlistToggle}
                      onViewDetails={openDetails}
                    />
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="pagination">
                  <button
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="pagination-btn"
                  >
                    <ArrowLeft size={14} /> Prev
                  </button>
                  <span className="pagination-text">
                    Page <strong>{page}</strong> of {pagination.pages}
                  </span>
                  <button
                    disabled={page === pagination.pages}
                    onClick={() => handlePageChange(page + 1)}
                    className="pagination-btn"
                  >
                    Next <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="card text-center py-12">
              <p className="text-secondary font-medium">No results found for your search filters.</p>
              <button onClick={handleResetFilters} className="btn btn-secondary btn-sm mt-4">
                Clear Filters
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={closeDetails} title={selectedScholarship?.title}>
        {selectedScholarship && (
          <div className="details-modal-inner">
            <div className="details-header mb-4">
              <p className="details-provider text-secondary">Provided by <strong>{selectedScholarship.provider}</strong></p>
              <div className="details-badges mt-2">
                <span className={`badge ${selectedScholarship.status === 'Open' ? 'badge-open' : 'badge-closed'} mr-2`}>
                  {selectedScholarship.status}
                </span>
                <span className="scholarship-level-badge mr-2">{selectedScholarship.level}</span>
                <span className="scholarship-category">{selectedScholarship.category}</span>
              </div>
            </div>

            <div className="details-info-table mb-4">
              <div className="info-table-row">
                <span className="info-table-label"><span className="rupee-span">₹</span> Amount:</span>
                <span className="info-table-value">₹{selectedScholarship.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="info-table-row">
                <span className="info-table-label"><Calendar size={14} /> Deadline:</span>
                <span className="info-table-value">
                  {new Date(selectedScholarship.deadline).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="info-table-row">
                <span className="info-table-label"><Award size={14} /> Eligible Course:</span>
                <span className="info-table-value">{selectedScholarship.course || selectedScholarship.level || 'All Courses'}</span>
              </div>
              <div className="info-table-row">
                <span className="info-table-label"><MapPin size={14} /> State Eligibility:</span>
                <span className="info-table-value">{selectedScholarship.state}</span>
              </div>
            </div>

            <div className="details-section mb-4">
              <h4>Description</h4>
              <p className="details-text text-secondary mt-1">{selectedScholarship.description}</p>
            </div>

            <div className="details-section mb-4">
              <h4>Eligibility Requirements</h4>
              <p className="details-text text-secondary mt-1">{selectedScholarship.eligibility}</p>
            </div>

            <div className="details-actions">
              <a
                href={selectedScholarship.website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary flex-1 text-center font-bold"
              >
                Go to Official Website <ExternalLink size={14} />
              </a>

              {user && user.role === 'Student' && (
                <button
                  onClick={() => {
                    const isWishlisted = !!wishlistMap[selectedScholarship._id];
                    const wishlistItemId = wishlistMap[selectedScholarship._id];
                    handleWishlistToggle(selectedScholarship._id, isWishlisted, wishlistItemId);
                  }}
                  className={`btn ${
                    wishlistMap[selectedScholarship._id] ? 'btn-success' : 'btn-secondary'
                  }`}
                >
                  {wishlistMap[selectedScholarship._id] ? 'Saved' : 'Save to Wishlist'}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .scholarships-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 2rem;
          margin-top: 1.5rem;
        }
        @media (max-width: 900px) {
          .scholarships-layout {
            grid-template-columns: 1fr;
          }
        }
        
        /* Filters Sidebar */
        .filters-sidebar {
          background-color: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          height: fit-content;
          box-shadow: var(--shadow-sm);
        }
        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }
        .sidebar-header h3 {
          font-size: 1rem;
          font-weight: 600;
        }
        .reset-link {
          background: none;
          border: none;
          color: var(--color-primary);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
        }
        .reset-link:hover {
          text-decoration: underline;
        }
        .filters-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        /* Results Grid */
        .results-container {
          flex: 1;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1rem;
        }
        
        /* Details Modal */
        .details-info-table {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 1.25rem;
        }
        .info-table-row {
          display: flex;
          justify-content: space-between;
          padding: 0.6rem 0.875rem;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.875rem;
        }
        .info-table-row:last-child {
          border-bottom: none;
        }
        .info-table-label {
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 550;
        }
        .info-table-value {
          font-weight: 600;
          color: var(--text-primary);
        }
        .rupee-span {
          font-weight: 700;
          color: var(--color-primary);
        }
        .details-section h4 {
          font-size: 0.9rem;
          color: var(--text-primary);
          border-bottom: 1px dashed var(--border-color);
          padding-bottom: 0.25rem;
        }
        .details-text {
          font-size: 0.875rem;
          line-height: 1.45;
        }
        .details-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
        }
        .pagination-text {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .mr-2 { margin-right: 0.5rem; }
        .w-full { width: 100%; }
        .flex-1 { flex: 1; }
      `}</style>
    </div>
  );
};

export default Scholarships;
