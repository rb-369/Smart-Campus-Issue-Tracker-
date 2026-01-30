import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue reporting campus issues</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div className="input-wrapper">
                            <HiOutlineEnvelope className="input-icon" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@college.edu"
                                className="form-input with-icon"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-wrapper">
                            <HiOutlineLockClosed className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="form-input with-icon"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg btn-block"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="loading-spinner" style={{ width: '20px', height: '20px' }}></span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
                </div>

                <div className="auth-demo">
                    <p>Demo accounts:</p>
                    <div className="demo-accounts">
                        <button
                            type="button"
                            onClick={() => { setEmail('student@college.edu'); setPassword('password123'); }}
                            className="demo-btn"
                        >
                            Student
                        </button>
                        <button
                            type="button"
                            onClick={() => { setEmail('admin@college.edu'); setPassword('admin123'); }}
                            className="demo-btn"
                        >
                            Admin
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
