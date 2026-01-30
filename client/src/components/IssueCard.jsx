import { Link } from 'react-router-dom';
import {
    HiOutlineWrenchScrewdriver,
    HiOutlineSparkles,
    HiOutlineWifi,
    HiOutlineCog,
    HiOutlineQuestionMarkCircle,
    HiOutlineClock,
    HiOutlineMapPin
} from 'react-icons/hi2';
import './IssueCard.css';

const categoryIcons = {
    infrastructure: HiOutlineWrenchScrewdriver,
    cleanliness: HiOutlineSparkles,
    network: HiOutlineWifi,
    equipment: HiOutlineCog,
    other: HiOutlineQuestionMarkCircle
};

const IssueCard = ({ issue }) => {
    const CategoryIcon = categoryIcons[issue.category] || HiOutlineQuestionMarkCircle;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <Link to={`/issues/${issue._id}`} className="issue-card">
            <div className="issue-card-header">
                <div className={`issue-category-icon badge-${issue.category}`}>
                    <CategoryIcon />
                </div>
                <div className="issue-badges">
                    <span className={`badge badge-${issue.status.replace('-', '')}`}>
                        {issue.status.replace('-', ' ')}
                    </span>
                    <span className={`badge badge-${issue.priority}`}>
                        {issue.priority}
                    </span>
                </div>
            </div>

            <h3 className="issue-title">{issue.title}</h3>
            <p className="issue-description">{issue.description}</p>

            <div className="issue-meta">
                <div className="meta-item">
                    <HiOutlineMapPin />
                    <span>{issue.location?.building}</span>
                </div>
                <div className="meta-item">
                    <HiOutlineClock />
                    <span>{formatDate(issue.createdAt)}</span>
                </div>
            </div>

            <div className="issue-footer">
                <div className="issue-reporter">
                    <div className="reporter-avatar">
                        {issue.reportedBy?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span>{issue.reportedBy?.name}</span>
                </div>
            </div>
        </Link>
    );
};

export default IssueCard;
