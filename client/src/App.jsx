import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import AllIssues from './pages/AllIssues';
import IssueDetail from './pages/IssueDetail';
import AdminPanel from './pages/AdminPanel';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="page">
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                    </div>
                </div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
    const { isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="page">
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                    </div>
                </div>
            </div>
        );
    }

    return isAdmin ? children : <Navigate to="/dashboard" />;
};

// Public Route (redirects if authenticated)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return null;

    return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

function App() {
    return (
        <>
            <Navbar />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    }
                />

                {/* Protected Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/report"
                    element={
                        <ProtectedRoute>
                            <ReportIssue />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/issues"
                    element={
                        <ProtectedRoute>
                            <AllIssues />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/issues/:id"
                    element={
                        <ProtectedRoute>
                            <IssueDetail />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Routes */}
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminPanel />
                        </AdminRoute>
                    }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    );
}

export default App;
