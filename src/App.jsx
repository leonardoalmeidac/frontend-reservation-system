import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import Reservations from './pages/Reservations';
import ReservationFormPage from './pages/ReservationFormPage';
import Calendar from './pages/Calendar';
import PendingApprovals from './pages/PendingApprovals';
import AdminUsers from './pages/AdminUsers';
import AdminDashboard from './pages/AdminDashboard';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" />} />
        
        {/* Applicant routes */}
        <Route path="dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        <Route path="rooms" element={
          <PrivateRoute>
            <Rooms />
          </PrivateRoute>
        } />
        
        <Route path="rooms/:id" element={
          <PrivateRoute>
            <RoomDetail />
          </PrivateRoute>
        } />
        
        <Route path="reservations" element={
          <PrivateRoute>
            <Reservations />
          </PrivateRoute>
        } />
        
        <Route path="reservations/new" element={
          <PrivateRoute>
            <ReservationFormPage />
          </PrivateRoute>
        } />
        
        <Route path="calendar" element={
          <PrivateRoute>
            <Calendar />
          </PrivateRoute>
        } />
        
        {/* Director/Admin routes */}
        <Route path="pending-approvals" element={
          <PrivateRoute roles={['ADMIN', 'DIRECTOR_LEVEL_1', 'DIRECTOR_LEVEL_2']}>
            <PendingApprovals />
          </PrivateRoute>
        } />
        
        {/* Admin routes */}
        <Route path="admin/users" element={
          <PrivateRoute roles={['ADMIN']}>
            <AdminUsers />
          </PrivateRoute>
        } />
        
        <Route path="admin/dashboard" element={
          <PrivateRoute roles={['ADMIN']}>
            <AdminDashboard />
          </PrivateRoute>
        } />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;