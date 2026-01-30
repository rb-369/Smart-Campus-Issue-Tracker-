import './StatsCard.css';

const StatsCard = ({ title, value, icon: Icon, color, subtitle }) => {
    return (
        <div className={`stats-card stats-card-${color}`}>
            <div className="stats-icon-wrapper">
                <Icon className="stats-icon" />
            </div>
            <div className="stats-content">
                <span className="stats-value">{value}</span>
                <span className="stats-title">{title}</span>
                {subtitle && <span className="stats-subtitle">{subtitle}</span>}
            </div>
        </div>
    );
};

export default StatsCard;
