import { HiOutlineMagnifyingGlass, HiOutlineFunnel } from 'react-icons/hi2';
import './FilterBar.css';

const FilterBar = ({ filters, onFilterChange }) => {
    const handleChange = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <div className="filter-bar">
            <div className="search-box">
                <HiOutlineMagnifyingGlass className="search-icon" />
                <input
                    type="text"
                    placeholder="Search issues..."
                    value={filters.search || ''}
                    onChange={(e) => handleChange('search', e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="filter-group">
                <HiOutlineFunnel className="filter-icon" />

                <select
                    value={filters.status || 'all'}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="filter-select"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </select>

                <select
                    value={filters.category || 'all'}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="filter-select"
                >
                    <option value="all">All Categories</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="cleanliness">Cleanliness</option>
                    <option value="network">Network/IT</option>
                    <option value="equipment">Equipment</option>
                    <option value="other">Other</option>
                </select>

                <select
                    value={filters.priority || 'all'}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    className="filter-select"
                >
                    <option value="all">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>
            </div>
        </div>
    );
};

export default FilterBar;
