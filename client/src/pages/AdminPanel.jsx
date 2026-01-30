import { useState, useEffect } from 'react';
import { statsApi, issueApi } from '../services/api';
import StatsCard from '../components/StatsCard';
import IssueCard from '../components/IssueCard';
import toast from 'react-hot-toast';
import {
    HiOutlineUsers,
    HiOutlineExclamationTriangle,
    HiOutlineClipboardDocumentList,
    HiOutlineBuildingOffice,
    HiOutlineCheckCircle,
    HiOutlineClock
} from 'react-icons/hi2';
import './AdminPanel.css';

const AdminPanel = () => {
    const [stats, setStats] = useState(null);
    const [adminStats, setAdminStats] = useState(null);
    const [urgentIssues, setUrgentIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, adminRes, urgentRes] = await Promise.all([
                    statsApi.getDashboard(),
                    statsApi.getAdmin(),
                    issueApi.getAll({ status: 'pending', priority: 'urgent', limit: 5 })
                ]);
                setStats(statsRes.data);
                setAdminStats(adminRes.data);
                setUrgentIssues(urgentRes.data.issues);
            } catch (error) {
                toast.error('Failed to load admin data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="page">
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading admin panel...</p>
                    </div>
                </div>
            </div>
        );
    }

    const statusCounts = stats?.statusCounts || {};

    return (
        <div className="page admin-panel">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Admin Dashboard</h1>
                    <p className="page-subtitle">Manage and monitor all campus issues</p>
                </div>

                {/* Overview Stats */}
                <div className="admin-stats-grid">
                    <StatsCard
                        title="Total Users"
                        value={adminStats?.totalUsers || 0}
                        icon={HiOutlineUsers}
                        color="primary"
                    />
                    <StatsCard
                        title="Total Issues"
                        value={statusCounts.total || 0}
                        icon={HiOutlineClipboardDocumentList}
                        color="info"
                    />
                    <StatsCard
                        title="Urgent Issues"
                        value={adminStats?.urgentIssues || 0}
                        icon={HiOutlineExclamationTriangle}
                        color="warning"
                    />
                    <StatsCard
                        title="Resolved"
                        value={statusCounts.resolved || 0}
                        icon={HiOutlineCheckCircle}
                        color="success"
                    />
                </div>

                <div className="admin-content-grid">
                    {/* Urgent Issues */}
                    <div className="admin-section">
                        <h2>
                            <HiOutlineExclamationTriangle />
                            Urgent Issues Requiring Attention
                        </h2>
                        {urgentIssues.length > 0 ? (
                            <div className="urgent-issues-list">
                                {urgentIssues.map((issue) => (
                                    <IssueCard key={issue._id} issue={issue} />
                                ))}
                            </div>
                        ) : (
                            <div className="no-urgent">
                                <HiOutlineCheckCircle className="no-urgent-icon" />
                                <p>No urgent issues pending!</p>
                            </div>
                        )}
                    </div>

                    {/* Location Stats */}
                    <div className="admin-section">
                        <h2>
                            <HiOutlineBuildingOffice />
                            Issues by Location
                        </h2>
                        <div className="location-stats">
                            {adminStats?.locationStats?.length > 0 ? (
                                adminStats.locationStats.map((loc, index) => (
                                    <div key={index} className="location-item">
                                        <span className="location-name">{loc._id || 'Unknown'}</span>
                                        <div className="location-bar-wrapper">
                                            <div
                                                className="location-bar"
                                                style={{
                                                    width: `${(loc.count / Math.max(...adminStats.locationStats.map(l => l.count))) * 100}%`
                                                }}
                                            ></div>
                                        </div>
                                        <span className="location-count">{loc.count}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted">No location data available</p>
                            )}
                        </div>
                    </div>

                    {/* Top Reporters */}
                    <div className="admin-section">
                        <h2>
                            <HiOutlineUsers />
                            Top Reporters
                        </h2>
                        <div className="top-reporters">
                            {adminStats?.topReporters?.length > 0 ? (
                                adminStats.topReporters.map((reporter, index) => (
                                    <div key={index} className="reporter-item">
                                        <div className="reporter-rank">{index + 1}</div>
                                        <div className="reporter-info">
                                            <span className="reporter-name">{reporter.name}</span>
                                            <span className="reporter-email">{reporter.email}</span>
                                        </div>
                                        <span className="reporter-count">{reporter.count} issues</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted">No reporter data available</p>
                            )}
                        </div>
                    </div>

                    {/* Resolution Stats */}
                    <div className="admin-section">
                        <h2>
                            <HiOutlineClock />
                            Resolution Metrics
                        </h2>
                        <div className="resolution-stats">
                            <div className="resolution-stat">
                                <span className="resolution-label">Avg. Resolution Time</span>
                                <span className="resolution-value">{stats?.avgResolutionTime || 0}h</span>
                            </div>
                            <div className="resolution-stat">
                                <span className="resolution-label">Pending Issues</span>
                                <span className="resolution-value">{statusCounts.pending || 0}</span>
                            </div>
                            <div className="resolution-stat">
                                <span className="resolution-label">In Progress</span>
                                <span className="resolution-value">{statusCounts.inProgress || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
