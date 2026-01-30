import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { issueApi } from '../services/api';
import FilterBar from '../components/FilterBar';
import IssueCard from '../components/IssueCard';
import toast from 'react-hot-toast';
import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import './AllIssues.css';

const AllIssues = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    const [filters, setFilters] = useState({
        status: searchParams.get('status') || 'all',
        category: searchParams.get('category') || 'all',
        priority: searchParams.get('priority') || 'all',
        search: searchParams.get('search') || '',
        my: searchParams.get('my') || ''
    });

    useEffect(() => {
        const fetchIssues = async () => {
            setLoading(true);
            try {
                const params = {
                    page: pagination.page,
                    limit: 12,
                    ...Object.fromEntries(
                        Object.entries(filters).filter(([_, v]) => v && v !== 'all')
                    )
                };

                const response = await issueApi.getAll(params);
                setIssues(response.data.issues);
                setPagination({
                    page: response.data.page,
                    pages: response.data.pages,
                    total: response.data.total
                });
            } catch (error) {
                toast.error('Failed to load issues');
            } finally {
                setLoading(false);
            }
        };

        fetchIssues();
    }, [filters, pagination.page]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination({ ...pagination, page: 1 });

        // Update URL params
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value && value !== 'all') params.set(key, value);
        });
        setSearchParams(params);
    };

    return (
        <div className="page all-issues">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">
                        {filters.my === 'true' ? 'My Issues' : 'All Issues'}
                    </h1>
                    <p className="page-subtitle">
                        {pagination.total} {pagination.total === 1 ? 'issue' : 'issues'} found
                    </p>
                </div>

                <FilterBar filters={filters} onFilterChange={handleFilterChange} />

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading issues...</p>
                    </div>
                ) : issues.length > 0 ? (
                    <>
                        <div className="issues-grid-3">
                            {issues.map((issue, index) => (
                                <div key={issue._id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                                    <IssueCard issue={issue} />
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="pagination">
                                <button
                                    className="btn btn-secondary btn-sm"
                                    disabled={pagination.page === 1}
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                >
                                    Previous
                                </button>
                                <span className="pagination-info">
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    disabled={pagination.page === pagination.pages}
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state">
                        <HiOutlineClipboardDocumentList className="empty-icon" />
                        <h3>No issues found</h3>
                        <p>Try adjusting your filters or search terms</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllIssues;
