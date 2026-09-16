import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Scholarships from './pages/Scholarships';
import Wishlist from './pages/Wishlist';
import Dashboard from './pages/Dashboard';
import { CheckCircle, AlertCircle } from 'lucide-react';

const AppContent = () => {
  const { toast } = useAuth();

  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/scholarships" element={<Scholarships />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer />

      {/* Global Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert" aria-live="assertive">
          {toast.type === 'success' ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
