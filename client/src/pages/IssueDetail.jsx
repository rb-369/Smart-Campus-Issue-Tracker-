import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issueApi } from '../services/api';
import toast from 'react-hot-toast';
import {
    HiOutlineArrowLeft,
    HiOutlineMapPin,
    HiOutlineClock,
    HiOutlineUser,
    HiOutlinePaperAirplane,
    HiOutlineTrash,
    HiOutlinePencil
} from 'react-icons/hi2';
import './IssueDetail.css';

const IssueDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const [issue, setIssue] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchIssue = async () => {
            try {
                const response = await issueApi.getById(id);
                setIssue(response.data.issue);
                setComments(response.data.comments);
            } catch (error) {
                toast.error('Issue not found');
                navigate('/issues');
            } finally {
                setLoading(false);
            }
        };

        fetchIssue();
    }, [id, navigate]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const response = await issueApi.addComment(id, newComment);
            setComments([...comments, response.data]);
            setNewComment('');
            toast.success('Comment added');
        } catch (error) {
            toast.error('Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const response = await issueApi.updateStatus(id, {
                status: newStatus,
                note: `Status changed to ${newStatus}`
            });
            setIssue(response.data);
            toast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this issue?')) return;

        try {
            await issueApi.delete(id);
            toast.success('Issue deleted');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Failed to delete issue');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="page">
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading issue details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!issue) return null;

    const isOwner = user?._id === issue.reportedBy?._id;
    const canEdit = isOwner && issue.status === 'pending';
    const canDelete = isOwner || isAdmin;

    return (
        <div className="page issue-detail">
            <div className="container">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <HiOutlineArrowLeft />
                    Back
                </button>

                <div className="issue-detail-grid">
                    {/* Main Content */}
                    <div className="issue-main">
                        <div className="issue-header-card">
                            <div className="issue-header-top">
                                <div className="issue-badges-row">
                                    <span className={`badge badge-${issue.status.replace('-', '')}`}>
                                        {issue.status.replace('-', ' ')}
                                    </span>
                                    <span className={`badge badge-${issue.priority}`}>
                                        {issue.priority} priority
                                    </span>
                                    <span className={`badge badge-${issue.category}`}>
                                        {issue.category}
                                    </span>
                                </div>
                                {(canEdit || canDelete) && (
                                    <div className="issue-actions">
                                        {canEdit && (
                                            <button className="btn btn-secondary btn-sm">
                                                <HiOutlinePencil />
                                                Edit
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={handleDelete}
                                            >
                                                <HiOutlineTrash />
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <h1 className="issue-title-large">{issue.title}</h1>
                            <p className="issue-description-full">{issue.description}</p>

                            <div className="issue-meta-row">
                                <div className="meta-item-large">
                                    <HiOutlineUser />
                                    <span>Reported by {issue.reportedBy?.name}</span>
                                </div>
                                <div className="meta-item-large">
                                    <HiOutlineClock />
                                    <span>{formatDate(issue.createdAt)}</span>
                                </div>
                                <div className="meta-item-large">
                                    <HiOutlineMapPin />
                                    <span>
                                        {issue.location?.building}
                                        {issue.location?.floor && `, ${issue.location.floor}`}
                                        {issue.location?.room && `, ${issue.location.room}`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="comments-section">
                            <h2>Comments & Updates ({comments.length})</h2>

                            <div className="comments-list">
                                {comments.length === 0 ? (
                                    <p className="no-comments">No comments yet. Be the first to comment!</p>
                                ) : (
                                    comments.map((comment) => (
                                        <div
                                            key={comment._id}
                                            className={`comment ${comment.isStatusUpdate ? 'status-update' : ''}`}
                                        >
                                            <div className="comment-avatar">
                                                {comment.author?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="comment-content">
                                                <div className="comment-header">
                                                    <span className="comment-author">
                                                        {comment.author?.name}
                                                        {comment.author?.role === 'admin' && (
                                                            <span className="admin-badge">Admin</span>
                                                        )}
                                                    </span>
                                                    <span className="comment-time">
                                                        {formatDate(comment.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="comment-text">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <form onSubmit={handleAddComment} className="comment-form">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment or update..."
                                    className="form-textarea"
                                    rows={3}
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting || !newComment.trim()}
                                >
                                    <HiOutlinePaperAirplane />
                                    {submitting ? 'Sending...' : 'Send'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="issue-sidebar">
                        {/* Status Timeline */}
                        <div className="sidebar-card">
                            <h3>Status Timeline</h3>
                            <div className="timeline">
                                {issue.statusHistory?.map((history, index) => (
                                    <div key={index} className="timeline-item">
                                        <div className={`timeline-dot status-${history.status.replace('-', '')}`}></div>
                                        <div className="timeline-content">
                                            <span className="timeline-status">{history.status.replace('-', ' ')}</span>
                                            <span className="timeline-time">
                                                {formatDate(history.changedAt)}
                                            </span>
                                            {history.note && (
                                                <span className="timeline-note">{history.note}</span>
                                            )}
                                        </div>
                                    </div>
                                )) || (
                                        <p className="text-muted">No status history</p>
                                    )}
                            </div>
                        </div>

                        {/* Admin Actions */}
                        {isAdmin && (
                            <div className="sidebar-card">
                                <h3>Admin Actions</h3>
                                <div className="status-buttons">
                                    {['pending', 'in-progress', 'resolved', 'closed'].map((status) => (
                                        <button
                                            key={status}
                                            className={`status-btn status-btn-${status.replace('-', '')} ${issue.status === status ? 'active' : ''}`}
                                            onClick={() => handleStatusChange(status)}
                                            disabled={issue.status === status}
                                        >
                                            {status.replace('-', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IssueDetail;
