import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { 
  LayoutDashboard, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  ExternalLink, 
  GraduationCap, 
  List, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Bookmark, 
  Clock, 
  CheckCircle2, 
  Circle, 
  SlidersHorizontal,
  Info
} from 'lucide-react';

const Dashboard = () => {
  const { user, triggerToast } = useAuth();
  const navigate = useNavigate();

  // Loading state
  const [loading, setLoading] = useState(true);

  // Student specific data
  const [wishlist, setWishlist] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);

  // Admin specific data
  const [adminScholarships, setAdminScholarships] = useState([]);
  const [adminStats, setAdminStats] = useState({ total: 0, open: 0, closed: 0, students: 0, wishlists: 0 });
  const [adminPage, setAdminPage] = useState(1);
  const [adminPages, setAdminPages] = useState(1);
  const [students, setStudents] = useState([]);
  
  // Admin Sidebar Active Tab: 'overview' or 'scholarships' or 'students'
  const [activeTab, setActiveTab] = useState('overview');

  // Collapsible Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Admin Filters
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCategory, setAdminCategory] = useState('');
  const [adminStatus, setAdminStatus] = useState('');
  const [adminState, setAdminState] = useState('');

  // CRUD / Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    provider: '',
    description: '',
    eligibility: '',
    amount: '',
    deadline: '',
    website: '',
    category: 'Merit-based',
    country: 'India',
    state: 'All India',
    level: 'Undergraduate',
    course: '',
    status: 'Open',
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Load Dashboard Data
  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (user.role === 'Student') {
        const wishlistRes = await axios.get(`${API_URL}/wishlist`);
        if (wishlistRes.data.success) {
          const validWishlist = wishlistRes.data.data.filter(item => item.scholarshipId != null);
          setWishlist(validWishlist);
        }

        // Fetch 3 most recently added open scholarships
        const scholarshipsRes = await axios.get(`${API_URL}/scholarships?status=Open&limit=3`);
        if (scholarshipsRes.data.success) {
          setRecentlyAdded(scholarshipsRes.data.data);
        }
      } else if (user.role === 'Admin') {
        const params = {
          page: adminPage,
          limit: 5,
        };
        if (adminSearch) params.search = adminSearch;
        if (adminCategory) params.category = adminCategory;
        if (adminStatus) params.status = adminStatus;
        if (adminState) params.state = adminState;

        const res = await axios.get(`${API_URL}/scholarships`, { params });
        if (res.data.success) {
          setAdminScholarships(res.data.data);
          setAdminStats(res.data.stats);
          setAdminPages(res.data.pagination.pages);
        }

        // Fetch students
        const studentsRes = await axios.get(`${API_URL}/auth/students`);
        if (studentsRes.data.success) {
          setStudents(studentsRes.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      triggerToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user, adminPage, adminSearch, adminCategory, adminStatus, adminState]);

  // Form input handler
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Open Form Modal (Add mode)
  const openAddModal = () => {
    setFormMode('add');
    setEditId(null);
    setFormData({
      title: '',
      provider: '',
      description: '',
      eligibility: '',
      amount: '',
      deadline: '',
      website: '',
      category: 'Merit-based',
      country: 'India',
      state: 'All India',
      level: 'Undergraduate',
      course: '',
      status: 'Open',
    });
    setIsFormOpen(true);
  };

  // Open Form Modal (Edit mode)
  const openEditModal = (scholarship) => {
    setFormMode('edit');
    setEditId(scholarship._id);
    const formattedDate = scholarship.deadline ? new Date(scholarship.deadline).toISOString().split('T')[0] : '';
    setFormData({
      title: scholarship.title,
      provider: scholarship.provider,
      description: scholarship.description,
      eligibility: scholarship.eligibility,
      amount: scholarship.amount,
      deadline: formattedDate,
      website: scholarship.website,
      category: scholarship.category,
      country: scholarship.country || 'India',
      state: scholarship.state || 'All India',
      level: scholarship.level || 'Undergraduate',
      course: scholarship.course || '',
      status: scholarship.status,
    });
    setIsFormOpen(true);
  };

  // Handle Form Submit (Add / Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formMode === 'add') {
        const res = await axios.post(`${API_URL}/scholarships`, formData);
        if (res.data.success) {
          triggerToast('Scholarship created successfully!', 'success');
          setIsFormOpen(false);
          loadDashboardData();
        }
      } else {
        const res = await axios.put(`${API_URL}/scholarships/${editId}`, formData);
        if (res.data.success) {
          triggerToast('Scholarship updated successfully!', 'success');
          setIsFormOpen(false);
          loadDashboardData();
        }
      }
    } catch (err) {
      console.error(err);
      triggerToast(err.response?.data?.message || 'Failed to save scholarship', 'error');
    }
  };

  // Delete scholarship handler
  const handleDeleteScholarship = async (id) => {
    if (window.confirm('Delete this scholarship listing permanently?')) {
      try {
        const res = await axios.delete(`${API_URL}/scholarships/${id}`);
        if (res.data.success) {
          triggerToast('Scholarship deleted successfully', 'success');
          loadDashboardData();
        }
      } catch (err) {
        console.error(err);
        triggerToast('Failed to delete scholarship', 'error');
      }
    }
  };

  // Toggle status handler
  const handleToggleStatus = async (scholarship) => {
    try {
      const newStatus = scholarship.status === 'Open' ? 'Closed' : 'Open';
      const res = await axios.put(`${API_URL}/scholarships/${scholarship._id}`, {
        ...scholarship,
        status: newStatus
      });
      if (res.data.success) {
        triggerToast(`Scholarship status set to ${newStatus}`, 'success');
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
      triggerToast('Failed to update status', 'error');
    }
  };

  // Student toggle wishlist item applied status
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
          !currentApplied ? 'Marked scholarship as Applied!' : 'Reverted status to Saved',
          'success'
        );
      }
    } catch (err) {
      console.error(err);
      triggerToast('Failed to update status', 'error');
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

  const getNextUpcomingDeadline = () => {
    const pendingItems = wishlist.filter((item) => !item.applied);
    if (pendingItems.length === 0) return 'No pending deadlines';
    const sorted = [...pendingItems].sort(
      (a, b) => new Date(a.scholarshipId.deadline) - new Date(b.scholarshipId.deadline)
    );
    const daysLeft = getDaysLeft(sorted[0].scholarshipId.deadline);
    if (daysLeft < 0) return 'Expired';
    return `${daysLeft} days left (${sorted[0].scholarshipId.title.substring(0, 15)}...)`;
  };

  const getDeadlineUrgencyLabel = (deadlineDate) => {
    const days = getDaysLeft(deadlineDate);
    if (days < 0) return { text: 'Expired', class: 'urgency-expired' };
    if (days <= 7) return { text: `${days} days left`, class: 'urgency-urgent' };
    if (days <= 30) return { text: `${days} days left`, class: 'urgency-soon' };
    return { text: `${days} days left`, class: 'urgency-safe' };
  };

  const handleResetFilters = () => {
    setAdminSearch('');
    setAdminCategory('');
    setAdminStatus('');
    setAdminState('');
    setAdminPage(1);
  };

  if (!user) return null;

  return (
    <div className="dashboard-page">
      {loading ? (
        <div className="spinner"></div>
      ) : user.role === 'Student' ? (
        /* ================= STUDENT DASHBOARD (Notion style) ================= */
        <div className="student-dashboard">
          <div className="dashboard-header-block mb-6">
            <h1>Student Dashboard</h1>
            <p className="subtitle-text">Welcome back, {user.name}. Track your saved scholarships and monitor your deadlines.</p>
          </div>

          {/* Stats Row */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Saved in Wishlist</span>
              <div className="stat-value">{wishlist.length}</div>
            </div>
            <div className="stat-card">
              <span className="stat-label">Applications Logged</span>
              <div className="stat-value text-blue-color">
                {wishlist.filter((w) => w.applied).length}
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-label">Next Deadline Alert</span>
              <div className="stat-value deadline-val text-warning-color">
                {getNextUpcomingDeadline().split(' (')[0]}
              </div>
              <p className="stat-subtext mt-1">
                {getNextUpcomingDeadline().includes('(')
                  ? getNextUpcomingDeadline().split('(')[1].replace(')', '')
                  : 'All deadlines tracked!'}
              </p>
            </div>
          </div>

          <div className="student-dashboard-content mt-6">
            {/* Wishlist Tracking Summary */}
            <div className="dashboard-main-col">
              <div className="card list-summary-card mb-6">
                <div className="section-title-row mb-4">
                  <h3>My Saved Scholarships</h3>
                  <button onClick={() => navigate('/wishlist')} className="btn btn-secondary btn-sm">
                    Open Full Wishlist
                  </button>
                </div>

                {wishlist.length > 0 ? (
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th style={{ width: '50px' }}>Apply Status</th>
                          <th>Scholarship</th>
                          <th>Deadline Tracker</th>
                          <th>Official Website</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wishlist.slice(0, 4).map((item) => {
                          const s = item.scholarshipId;
                          const urgency = getDeadlineUrgencyLabel(s.deadline);
                          return (
                            <tr key={item._id} className={item.applied ? 'row-applied' : ''}>
                              <td className="text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleApplied(item._id, item.applied)}
                                  className="toggle-apply-icon-btn"
                                  title={item.applied ? 'Mark as saved only' : 'Mark as applied'}
                                >
                                  {item.applied ? (
                                    <CheckCircle2 size={18} className="icon-applied-success" />
                                  ) : (
                                    <Circle size={18} className="icon-saved-muted" />
                                  )}
                                </button>
                              </td>
                              <td>
                                <div className="sch-cell">
                                  <span
                                    onClick={() => navigate(`/scholarships?id=${s._id}`)}
                                    className="sch-title-link"
                                  >
                                    {s.title}
                                  </span>
                                  <span className="sch-provider">{s.provider} • ₹{s.amount.toLocaleString('en-IN')}</span>
                                </div>
                              </td>
                              <td>
                                <span className={`urgency-badge ${urgency.class}`}>
                                  {urgency.text}
                                </span>
                              </td>
                              <td>
                                <a href={s.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm icon-link-btn">
                                  Visit Website <ExternalLink size={12} />
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bookmark size={28} className="text-muted mb-2" />
                    <p className="text-secondary text-sm">No scholarships saved yet.</p>
                    <button onClick={() => navigate('/scholarships')} className="btn btn-primary btn-sm mt-3">
                      Browse Opportunities
                    </button>
                  </div>
                )}
              </div>

              {/* Recently Added Scholarships */}
              <div className="card recent-listings-card">
                <div className="section-title-row mb-4">
                  <h3>Recently Added Scholarships</h3>
                  <button onClick={() => navigate('/scholarships')} className="btn btn-secondary btn-sm">
                    View All
                  </button>
                </div>
                
                {recentlyAdded.length > 0 ? (
                  <div className="recent-list-items">
                    {recentlyAdded.map((s) => (
                      <div key={s._id} className="recent-item-row">
                        <div className="recent-item-main">
                          <div className="recent-item-meta">
                            <span className="recent-item-cat">{s.category}</span>
                            <span className="recent-item-state">{s.state}</span>
                          </div>
                          <h4 className="recent-item-title" onClick={() => navigate(`/scholarships?id=${s._id}`)}>
                            {s.title}
                          </h4>
                          <p className="recent-item-provider">Provider: {s.provider}</p>
                        </div>
                        <div className="recent-item-footer">
                          <div className="recent-item-amount">₹{s.amount.toLocaleString('en-IN')}</div>
                          <div className="recent-item-actions">
                            <button onClick={() => navigate(`/scholarships?id=${s._id}`)} className="btn btn-secondary btn-sm">
                              Details
                            </button>
                            <a href={s.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm border-primary-btn">
                              Website <ExternalLink size={11} />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary text-sm py-4 text-center">No scholarships currently open.</p>
                )}
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="dashboard-side-col">
              {/* Profile Card */}
              <div className="card profile-overview-card mb-6">
                <h3>Academic Profile</h3>
                <div className="profile-details mt-3">
                  <div className="profile-row">
                    <span className="p-label">Full Name</span>
                    <span className="p-val">{user.name}</span>
                  </div>
                  <div className="profile-row">
                    <span className="p-label">College/Univ.</span>
                    <span className="p-val">{user.college}</span>
                  </div>
                  <div className="profile-row">
                    <span className="p-label">Course/Major</span>
                    <span className="p-val">{user.course}</span>
                  </div>
                  <div className="profile-row">
                    <span className="p-label">Email Address</span>
                    <span className="p-val text-xs text-right truncate-text">{user.email}</span>
                  </div>
                </div>
              </div>

              {/* Upcoming Deadlines Tracker */}
              <div className="card deadlines-tracker-card">
                <h3>Upcoming Deadlines</h3>
                <p className="card-subtext mb-3">Monitor days remaining on saved portals</p>
                <div className="deadlines-list">
                  {wishlist.filter(item => !item.applied).length > 0 ? (
                    wishlist
                      .filter(item => !item.applied)
                      .sort((a, b) => new Date(a.scholarshipId.deadline) - new Date(b.scholarshipId.deadline))
                      .slice(0, 4)
                      .map((item) => {
                        const s = item.scholarshipId;
                        const urgency = getDeadlineUrgencyLabel(s.deadline);
                        return (
                          <div key={item._id} className="deadline-timeline-item">
                            <div className="timeline-bullet-wrapper">
                              <div className={`timeline-bullet ${urgency.class}-bullet`}></div>
                            </div>
                            <div className="timeline-content">
                              <span className="timeline-title" onClick={() => navigate(`/scholarships?id=${s._id}`)}>
                                {s.title}
                              </span>
                              <div className="timeline-meta mt-1">
                                <span className={`timeline-badge ${urgency.class}`}>
                                  {urgency.text}
                                </span>
                                <span className="timeline-date">
                                  {new Date(s.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-secondary text-xs text-center py-4">No pending deadlines in your wishlist.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= ADMIN DASHBOARD (Collapsible Sidebar layout) ================= */
        <div className="admin-dashboard-layout" style={{ gridTemplateColumns: isSidebarCollapsed ? '72px 1fr' : '240px 1fr' }}>
          {/* Admin Sidebar */}
          <aside className={`admin-sidebar ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <div className="sidebar-profile">
              <div className="avatar-circle" title={user.name}>{user.name.substring(0, 2).toUpperCase()}</div>
              {!isSidebarCollapsed && (
                <div className="profile-details-fade">
                  <h4 className="sidebar-name">{user.name}</h4>
                  <span className="sidebar-badge">{user.role}</span>
                </div>
              )}
            </div>

            <nav className="sidebar-nav">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                title={isSidebarCollapsed ? "Overview" : ""}
              >
                <LayoutDashboard size={18} />
                {!isSidebarCollapsed && <span>Overview</span>}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('scholarships')}
                className={`sidebar-nav-item ${activeTab === 'scholarships' ? 'active' : ''}`}
                title={isSidebarCollapsed ? "Manage Listings" : ""}
              >
                <List size={18} />
                {!isSidebarCollapsed && <span>Manage Listings</span>}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('students')}
                className={`sidebar-nav-item ${activeTab === 'students' ? 'active' : ''}`}
                title={isSidebarCollapsed ? "View Students" : ""}
              >
                <Users size={18} />
                {!isSidebarCollapsed && <span>View Students</span>}
              </button>
              
              <div className="sidebar-nav-divider"></div>
              
              <button onClick={openAddModal} className="sidebar-nav-item add-listing-item" title={isSidebarCollapsed ? "Add Scholarship" : ""}>
                <Plus size={18} />
                {!isSidebarCollapsed && <span>Add Scholarship</span>}
              </button>
            </nav>

            {/* Collapse Sidebar Toggle */}
            <button 
              type="button" 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
              className="sidebar-collapse-toggle-btn"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </aside>

          {/* Admin Content Area */}
          <main className="admin-main-content">
            {activeTab === 'overview' ? (
              <div className="tab-panel animate-fade">
                <div className="tab-header mb-6">
                  <h2>Admin Overview</h2>
                  <p className="subtitle-text">System statistics and overview counts of registered scholarships.</p>
                </div>
                
                {/* Stats cards */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-label">Total Scholarships</span>
                    <div className="stat-value text-blue-color">{adminStats.total}</div>
                    <p className="stat-subtext mt-1">Opportunities in database</p>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Total Students</span>
                    <div className="stat-value">{adminStats.students || students.length}</div>
                    <p className="stat-subtext mt-1">Registered student profiles</p>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Wishlist Count</span>
                    <div className="stat-value text-warning-color">{adminStats.wishlists}</div>
                    <p className="stat-subtext mt-1">Total scholarships saved by students</p>
                  </div>
                </div>

                {/* System Status Details card */}
                <div className="card status-guide-card mt-6">
                  <div className="guide-card-header">
                    <Info size={18} className="text-blue-color" />
                    <h3>Portal Management Instructions</h3>
                  </div>
                  <p className="text-secondary text-sm mt-3">
                    As an Administrator, you are responsible for maintaining listing accuracy. Ensure deadline limits are updated periodically. All applications are hosted on official exterior sites; check links periodically to ensure students do not run into expired endpoints.
                  </p>
                  <div className="guide-actions mt-4">
                    <button onClick={() => setActiveTab('scholarships')} className="btn btn-primary btn-sm">
                      Manage Listings
                    </button>
                    <button onClick={openAddModal} className="btn btn-secondary btn-sm">
                      Create New Scholarship
                    </button>
                  </div>
                </div>
              </div>
            ) : activeTab === 'scholarships' ? (
              <div className="tab-panel animate-fade">
                <div className="tab-header mb-6">
                  <h2>Manage Listings</h2>
                  <p className="subtitle-text">Search, edit, delete, or toggle availability status of existing programs.</p>
                </div>

                {/* Filter and Search Box for Listings */}
                <div className="card filter-bar-card mb-6">
                  <div className="filter-grid">
                    <div className="form-group search-group">
                      <label className="form-label font-semibold text-xs">Search Keywords</label>
                      <div className="search-input-wrapper">
                        <Search size={14} className="search-icon" />
                        <input
                          type="text"
                          placeholder="Search title, provider, major..."
                          value={adminSearch}
                          onChange={(e) => setAdminSearch(e.target.value)}
                          className="form-control filter-control"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label font-semibold text-xs">Category</label>
                      <select
                        value={adminCategory}
                        onChange={(e) => setAdminCategory(e.target.value)}
                        className="form-control filter-control"
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
                      <label className="form-label font-semibold text-xs">Status</label>
                      <select
                        value={adminStatus}
                        onChange={(e) => setAdminStatus(e.target.value)}
                        className="form-control filter-control"
                      >
                        <option value="">All Statuses</option>
                        <option value="Open">Open</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label font-semibold text-xs">State</label>
                      <select
                        value={adminState}
                        onChange={(e) => setAdminState(e.target.value)}
                        className="form-control filter-control"
                      >
                        <option value="">All States</option>
                        <option value="All India">All India</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Assam">Assam</option>
                        <option value="Delhi">Delhi</option>
                      </select>
                    </div>
                  </div>

                  <div className="filter-actions-row">
                    <button 
                      type="button"
                      onClick={handleResetFilters} 
                      className="btn btn-secondary btn-sm"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                {adminScholarships.length > 0 ? (
                  <>
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Scholarship Details</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Deadline</th>
                            <th>Status Toggle</th>
                            <th style={{ width: '100px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminScholarships.map((s) => (
                            <tr key={s._id}>
                              <td>
                                <div className="sch-cell">
                                  <span
                                    onClick={() => navigate(`/scholarships?id=${s._id}`)}
                                    className="sch-title-link"
                                  >
                                    {s.title}
                                  </span>
                                  <span className="sch-provider">by {s.provider} • State: {s.state}</span>
                                </div>
                              </td>
                              <td>{s.category}</td>
                              <td>
                                <strong className="amount-val">₹{s.amount.toLocaleString('en-IN')}</strong>
                              </td>
                              <td>
                                {new Date(s.deadline).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </td>
                              <td>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(s)}
                                  className={`btn-status-toggle badge ${s.status === 'Open' ? 'badge-open' : 'badge-closed'}`}
                                  title="Click to toggle availability"
                                >
                                  {s.status}
                                </button>
                              </td>
                              <td>
                                <div className="admin-actions-cell">
                                  <button
                                    onClick={() => openEditModal(s)}
                                    className="btn btn-secondary btn-sm icon-btn"
                                    title="Edit Details"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteScholarship(s._id)}
                                    className="btn btn-danger btn-sm icon-btn"
                                    title="Delete Program"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {adminPages > 1 && (
                      <div className="pagination">
                        <button
                          disabled={adminPage === 1}
                          onClick={() => setAdminPage(adminPage - 1)}
                          className="pagination-btn"
                        >
                          Prev
                        </button>
                        <span className="pagination-text text-sm">
                          Page {adminPage} of {adminPages}
                        </span>
                        <button
                          disabled={adminPage === adminPages}
                          onClick={() => setAdminPage(adminPage + 1)}
                          className="pagination-btn"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="card text-center py-10">
                    <GraduationCap size={32} className="text-muted mb-3" />
                    <p className="text-secondary text-sm">No scholarships match your filters.</p>
                    <button onClick={openAddModal} className="btn btn-primary btn-sm mt-3">
                      Add New Scholarship
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="tab-panel animate-fade">
                <div className="tab-header mb-6">
                  <h2>Student Directory</h2>
                  <p className="subtitle-text">Browse registered students tracking their educational goals.</p>
                </div>
                
                {students.length > 0 ? (
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Email Address</th>
                          <th>College/University</th>
                          <th>Course/Major</th>
                          <th>Registration Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((stud) => (
                          <tr key={stud._id}>
                            <td><strong>{stud.name}</strong></td>
                            <td>{stud.email}</td>
                            <td>{stud.college}</td>
                            <td>{stud.course}</td>
                            <td>{new Date(stud.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="card text-center py-10">
                    <p className="text-secondary">No registered students found.</p>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      )}

      {/* Add / Edit Form Modal (Admin Only) */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={formMode === 'add' ? 'Add Scholarship' : 'Edit Scholarship'}
      >
        <form onSubmit={handleFormSubmit} className="admin-scholarship-form">
          <div className="form-group">
            <label className="form-label">Scholarship Name</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-control"
              placeholder="e.g. Google Generation Scholarship"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Provider Name</label>
              <input
                type="text"
                name="provider"
                value={formData.provider}
                onChange={handleInputChange}
                className="form-control"
                placeholder="e.g. Adobe Inc."
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Scholarship Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="form-control"
                placeholder="e.g. 50000"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-control textarea-control"
              placeholder="Provide a detailed description of the program..."
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Eligibility Criteria</label>
            <textarea
              name="eligibility"
              value={formData.eligibility}
              onChange={handleInputChange}
              className="form-control textarea-control"
              placeholder="Who is eligible to apply for this scholarship?"
              rows={2}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Application Deadline</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Official Website URL</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="form-control"
                placeholder="https://example.com/scholarship"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="Merit-based">Merit-based</option>
                <option value="Need-based">Need-based</option>
                <option value="STEM">STEM</option>
                <option value="Minority">Minority</option>
                <option value="General">General</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Course Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Course / Major Eligibility</label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                className="form-control"
                placeholder="e.g. B.Tech, M.Sc, All Courses"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="form-control"
                required
              >
                <option value="All India">All India</option>
                <option value="Assam">Assam</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Delhi">Delhi</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status (Open / Closed)</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Country Target</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="form-control"
                placeholder="e.g. India"
              />
            </div>
          </div>

          <div className="form-actions mt-5">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              {formMode === 'add' ? 'Create Listing' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        /* Global & helper colors */
        .text-blue-color { color: var(--color-primary); }
        .text-warning-color { color: var(--color-accent); }
        .text-success-color { color: var(--color-success) !important; }
        .text-danger-color { color: var(--color-danger) !important; }
        .subtitle-text {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }
        .stat-subtext {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .amount-val {
          color: var(--text-primary);
        }
        .truncate-text {
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Student Dashboard styling */
        .student-dashboard-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 992px) {
          .student-dashboard-content {
            grid-template-columns: 1fr;
          }
        }
        .section-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .sch-cell {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .sch-title-link {
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
          transition: color var(--transition-fast);
        }
        .sch-title-link:hover {
          color: var(--color-primary);
        }
        .sch-provider {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .toggle-apply-icon-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: transform var(--transition-fast), color var(--transition-fast);
        }
        .toggle-apply-icon-btn:hover {
          transform: scale(1.1);
        }
        .icon-applied-success {
          color: var(--color-success);
        }
        .icon-saved-muted {
          color: var(--text-muted);
        }
        .row-applied td {
          background-color: #f8fafc;
          color: var(--text-muted);
        }
        .row-applied .sch-title-link {
          color: var(--text-muted);
          text-decoration: line-through;
        }
        .icon-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }

        /* Deadline urgency tags */
        .urgency-badge {
          display: inline-flex;
          padding: 0.2rem 0.5rem;
          font-size: 0.7rem;
          font-weight: 600;
          border-radius: 4px;
          border: 1px solid transparent;
        }
        .urgency-expired {
          background-color: var(--color-danger-bg);
          color: var(--color-danger);
          border-color: rgba(185, 28, 28, 0.15);
        }
        .urgency-urgent {
          background-color: #fee2e2; /* light red */
          color: #b91c1c;
          border-color: rgba(185, 28, 28, 0.2);
        }
        .urgency-soon {
          background-color: #fef3c7; /* light amber */
          color: #b45309;
          border-color: rgba(180, 83, 9, 0.2);
        }
        .urgency-safe {
          background-color: var(--color-success-bg);
          color: var(--color-success);
          border-color: rgba(21, 128, 61, 0.15);
        }

        /* Profile details list */
        .profile-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .profile-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          padding-bottom: 0.4rem;
          border-bottom: 1px solid var(--border-color);
        }
        .profile-row:last-child {
          border-bottom: none;
        }
        .p-label {
          color: var(--text-secondary);
          font-weight: 500;
        }
        .p-val {
          font-weight: 600;
          color: var(--text-primary);
        }

        /* Deadline Timeline Tracker */
        .deadlines-list {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }
        .deadline-timeline-item {
          display: flex;
          gap: 0.75rem;
          position: relative;
        }
        .timeline-bullet-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .timeline-bullet {
          width: 0.6rem;
          height: 0.6rem;
          border-radius: 50%;
          margin-top: 0.35rem;
        }
        .timeline-bullet.urgency-expired-bullet { background-color: var(--color-danger); }
        .timeline-bullet.urgency-urgent-bullet { background-color: #dc2626; }
        .timeline-bullet.urgency-soon-bullet { background-color: var(--color-accent); }
        .timeline-bullet.urgency-safe-bullet { background-color: var(--color-success); }
        
        .timeline-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .timeline-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
          line-height: 1.3;
          transition: color var(--transition-fast);
        }
        .timeline-title:hover {
          color: var(--color-primary);
        }
        .timeline-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .timeline-badge {
          font-size: 0.65rem;
          padding: 0.1rem 0.35rem;
          font-weight: 600;
          border-radius: 3px;
        }
        .timeline-date {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        /* Recently Added block */
        .recent-list-items {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }
        .recent-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.875rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background-color: #ffffff;
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        }
        .recent-item-row:hover {
          border-color: #cbd5e1;
          box-shadow: var(--shadow-sm);
        }
        @media (max-width: 600px) {
          .recent-item-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
        }
        .recent-item-main {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          flex: 1;
        }
        .recent-item-meta {
          display: flex;
          gap: 0.4rem;
        }
        .recent-item-cat {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--color-primary);
          text-transform: uppercase;
        }
        .recent-item-state {
          font-size: 0.65rem;
          background-color: #f1f5f9;
          color: #475569;
          padding: 0.05rem 0.3rem;
          border-radius: 3px;
          font-weight: 600;
        }
        .recent-item-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
          transition: color var(--transition-fast);
        }
        .recent-item-title:hover {
          color: var(--color-primary);
        }
        .recent-item-provider {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .recent-item-footer {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        @media (max-width: 600px) {
          .recent-item-footer {
            width: 100%;
            justify-content: space-between;
            border-top: 1px solid var(--border-color);
            padding-top: 0.5rem;
          }
        }
        .recent-item-amount {
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-primary);
        }
        .recent-item-actions {
          display: flex;
          gap: 0.35rem;
        }
        .border-primary-btn {
          border: 1px solid var(--color-primary);
          color: var(--color-primary);
          background-color: #ffffff;
        }
        .border-primary-btn:hover {
          background-color: #e6f0fa;
        }

        /* ================= Admin Dashboard Sidebar layout ================= */
        .admin-dashboard-layout {
          display: grid;
          gap: 1.5rem;
          min-height: 75vh;
          transition: grid-template-columns 0.25s ease;
        }
        @media (max-width: 900px) {
          .admin-dashboard-layout {
            grid-template-columns: 1fr !important;
          }
        }
        
        .admin-sidebar {
          background-color: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 1.25rem 0.875rem;
          height: fit-content;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          position: relative;
          min-height: 480px;
          transition: all 0.25s ease;
        }
        .sidebar-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1rem;
          padding-left: 0.35rem;
        }
        .sidebar-profile .avatar-circle {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: var(--radius-full);
          background-color: #e6f0fa;
          border: 1px solid rgba(15, 76, 129, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: var(--color-primary);
          font-size: 0.85rem;
          flex-shrink: 0;
        }
        .profile-details-fade {
          animation: fadeIn 0.2s ease-in-out;
          overflow: hidden;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .sidebar-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
        }
        .sidebar-badge {
          font-size: 0.7rem;
          background-color: #e6f0fa;
          color: var(--color-primary);
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          font-weight: 600;
        }
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: transparent;
          border: none;
          padding: 0.6rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 550;
          text-align: left;
          width: 100%;
          transition: all var(--transition-fast);
        }
        .sidebar-nav-item:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }
        .sidebar-nav-item.active {
          background-color: #e6f0fa;
          color: var(--color-primary);
        }
        .sidebar-nav-divider {
          height: 1px;
          background-color: var(--border-color);
          margin: 0.5rem 0;
        }
        .add-listing-item {
          color: var(--color-primary);
          font-weight: 600;
        }
        .add-listing-item:hover {
          background-color: #e6f0fa;
        }
        
        .sidebar-collapsed {
          align-items: center;
          padding: 1.25rem 0.5rem;
        }
        .sidebar-collapsed .sidebar-profile {
          padding-left: 0;
          border-bottom: none;
          margin-bottom: 1rem;
        }
        .sidebar-collapsed .sidebar-nav-item {
          justify-content: center;
          padding: 0.6rem 0;
        }

        .sidebar-collapse-toggle-btn {
          position: absolute;
          bottom: 1.25rem;
          right: -12px;
          width: 24px;
          height: 24px;
          border-radius: var(--radius-full);
          background-color: #ffffff;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-fast);
          z-index: 10;
        }
        .sidebar-collapse-toggle-btn:hover {
          border-color: var(--border-hover);
          color: var(--color-primary);
        }
        @media (max-width: 900px) {
          .sidebar-collapse-toggle-btn {
            display: none;
          }
        }

        /* Admin Content styles */
        .admin-main-content {
          flex: 1;
          min-width: 0; /* fixes table overflow in flexbox */
        }
        .status-guide-card {
          border-left: 4px solid var(--color-primary);
        }
        .guide-card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .guide-actions {
          display: flex;
          gap: 0.75rem;
        }

        /* Admin listings filter bar */
        .filter-bar-card {
          padding: 1.25rem;
        }
        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }
        @media (min-width: 900px) {
          .filter-grid {
            grid-template-columns: 2fr 1fr 1fr 1fr;
          }
        }
        .search-group {
          margin-bottom: 0;
        }
        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .search-input-wrapper .search-icon {
          position: absolute;
          left: 0.75rem;
          color: var(--text-muted);
          pointer-events: none;
        }
        .search-input-wrapper .filter-control {
          padding-left: 2rem;
        }
        .filter-control {
          font-size: 0.85rem;
          padding: 0.45rem 0.75rem;
          border-radius: 6px;
        }
        .filter-actions-row {
          display: flex;
          justify-content: flex-end;
          margin-top: 1rem;
          border-top: 1px dashed var(--border-color);
          padding-top: 0.75rem;
        }

        .btn-status-toggle {
          border: none;
          cursor: pointer;
          transition: transform 0.1s ease;
        }
        .btn-status-toggle:hover {
          transform: scale(1.05);
        }
        .admin-actions-cell {
          display: flex;
          gap: 0.35rem;
        }
        .admin-scholarship-form {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .textarea-control {
          resize: vertical;
        }
        .form-actions {
          display: flex;
          gap: 1rem;
        }
        .icon-btn {
          width: 2rem;
          height: 2rem;
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

export default Dashboard;
