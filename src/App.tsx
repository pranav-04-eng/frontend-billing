import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { InvoiceProvider } from './contexts/InvoiceContext';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import LoadingSpinner from './components/LoadingSpinner';

function AppContent() {
  const { user, loading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Simulate initialization delay
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading || !isInitialized) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/customer'} /> : <LoginPage />} 
        />
        <Route 
          path="/admin/*" 
          element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/customer/*" 
          element={user?.role === 'customer' ? <CustomerDashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/customer') : '/login'} />} 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <InvoiceProvider>
          <AppContent />
        </InvoiceProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;