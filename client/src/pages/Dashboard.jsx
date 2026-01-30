import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { statsApi, issueApi } from '../services/api';
import StatsCard from '../components/StatsCard';
import IssueCard from '../components/IssueCard';
import toast from 'react-hot-toast';
import {
    HiOutlineClipboardDocumentList,
    HiOutlineClock,
    HiOutlineArrowPath,
    HiOutlineCheckCircle,
    HiOutlineArchiveBox,
    HiOutlinePlusCircle
} from 'react-icons/hi2';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentIssues, setRecentIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, issuesRes] = await Promise.all([
                    statsApi.getDashboard(),
                    issueApi.getAll({ my: 'true', limit: 4 })
                ]);
                setStats(statsRes.data);
                setRecentIssues(issuesRes.data.issues);
            } catch (error) {
                toast.error('Failed to load dashboard data');
                console.error(error);
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
                        <p>Loading dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    const statusCounts = stats?.statusCounts || {};

    return (
        <div className="page dashboard">
            <div className="container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                        <p className="page-subtitle">Here's an overview of your reported issues</p>
                    </div>
                    <Link to="/report" className="btn btn-primary">
                        <HiOutlinePlusCircle />
                        Report New Issue
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <StatsCard
                        title="Total Issues"
                        value={statusCounts.total || 0}
                        icon={HiOutlineClipboardDocumentList}
                        color="primary"
                    />
                    <StatsCard
                        title="Pending"
                        value={statusCounts.pending || 0}
                        icon={HiOutlineClock}
                        color="warning"
                    />
                    <StatsCard
                        title="In Progress"
                        value={statusCounts.inProgress || 0}
                        icon={HiOutlineArrowPath}
                        color="info"
                    />
                    <StatsCard
                        title="Resolved"
                        value={statusCounts.resolved || 0}
                        icon={HiOutlineCheckCircle}
                        color="success"
                    />
                </div>

                {/* Quick Stats */}
                {stats?.avgResolutionTime > 0 && (
                    <div className="quick-stats">
                        <div className="quick-stat">
                            <span className="quick-stat-value">{stats.avgResolutionTime}h</span>
                            <span className="quick-stat-label">Avg. Resolution Time</span>
                        </div>
                    </div>
                )}

                {/* Recent Issues */}
                <div className="section">
                    <div className="section-header">
                        <h2>Your Recent Issues</h2>
                        <Link to="/issues?my=true" className="btn btn-ghost btn-sm">
                            View All
                        </Link>
                    </div>

                    {recentIssues.length > 0 ? (
                        <div className="issues-grid">
                            {recentIssues.map((issue) => (
                                <IssueCard key={issue._id} issue={issue} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <HiOutlineClipboardDocumentList className="empty-icon" />
                            <h3>No issues reported yet</h3>
                            <p>Start by reporting your first campus issue</p>
                            <Link to="/report" className="btn btn-primary">
                                Report Issue
                            </Link>
                        </div>
                    )}
                </div>

                {/* Category Stats */}
                {stats?.categoryStats && Object.keys(stats.categoryStats).length > 0 && (
                    <div className="section">
                        <h2>Issues by Category</h2>
                        <div className="category-stats">
                            {Object.entries(stats.categoryStats).map(([category, count]) => (
                                <div key={category} className={`category-stat badge-${category}`}>
                                    <span className="category-name">{category}</span>
                                    <span className="category-count">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
