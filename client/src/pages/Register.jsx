import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    HiOutlineEnvelope,
    HiOutlineLockClosed,
    HiOutlineUser,
    HiOutlineBuildingOffice,
    HiOutlineEye,
    HiOutlineEyeSlash
} from 'react-icons/hi2';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        department: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { name, email, password, confirmPassword, department } = formData;

        if (!name || !email || !password) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await register(name, email, password, department);
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Join us in making our campus better</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <div className="input-wrapper">
                            <HiOutlineUser className="input-icon" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your full name"
                                className="form-input with-icon"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address *</label>
                        <div className="input-wrapper">
                            <HiOutlineEnvelope className="input-icon" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@college.edu"
                                className="form-input with-icon"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Department</label>
                        <div className="input-wrapper">
                            <HiOutlineBuildingOffice className="input-icon" />
                            <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                placeholder="e.g., Computer Science"
                                className="form-input with-icon"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Password *</label>
                            <div className="input-wrapper">
                                <HiOutlineLockClosed className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create password"
                                    className="form-input with-icon"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password *</label>
                            <div className="input-wrapper">
                                <HiOutlineLockClosed className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm password"
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
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg btn-block"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="loading-spinner" style={{ width: '20px', height: '20px' }}></span>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Sign In</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
