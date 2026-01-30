import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HiOutlineHome,
    HiOutlineClipboardDocumentList,
    HiOutlinePlusCircle,
    HiOutlineChartBar,
    HiOutlineUser,
    HiOutlineArrowRightOnRectangle,
    HiOutlineBell
} from 'react-icons/hi2';
import './Navbar.css';

const Navbar = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <div className="brand-icon">
                        <HiOutlineBell />
                    </div>
                    <span className="brand-text">Campus<span className="brand-highlight">Issues</span></span>
                </Link>

                <div className="navbar-menu">
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="nav-link">
                                <HiOutlineHome />
                                <span>Dashboard</span>
                            </Link>
                            <Link to="/issues" className="nav-link">
                                <HiOutlineClipboardDocumentList />
                                <span>All Issues</span>
                            </Link>
                            <Link to="/report" className="nav-link nav-link-primary">
                                <HiOutlinePlusCircle />
                                <span>Report Issue</span>
                            </Link>
                            {isAdmin && (
                                <Link to="/admin" className="nav-link">
                                    <HiOutlineChartBar />
                                    <span>Admin</span>
                                </Link>
                            )}

                            <div className="nav-user">
                                <div className="user-avatar">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="user-dropdown">
                                    <div className="dropdown-header">
                                        <span className="user-name">{user?.name}</span>
                                        <span className="user-role">{user?.role}</span>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <Link to="/profile" className="dropdown-item">
                                        <HiOutlineUser />
                                        Profile
                                    </Link>
                                    <button onClick={handleLogout} className="dropdown-item dropdown-item-danger">
                                        <HiOutlineArrowRightOnRectangle />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
