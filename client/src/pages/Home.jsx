import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HiOutlineClipboardDocumentCheck,
    HiOutlineChartBar,
    HiOutlineBell,
    HiOutlineCheckBadge,
    HiOutlineArrowRight,
    HiOutlineWrenchScrewdriver,
    HiOutlineSparkles,
    HiOutlineWifi,
    HiOutlineCog
} from 'react-icons/hi2';
import './Home.css';

const Home = () => {
    const { isAuthenticated } = useAuth();

    const features = [
        {
            icon: HiOutlineClipboardDocumentCheck,
            title: 'Easy Reporting',
            description: 'Report campus issues in seconds with our intuitive form. Add photos, location, and priority.',
            color: 'primary'
        },
        {
            icon: HiOutlineBell,
            title: 'Real-time Updates',
            description: 'Get instant notifications when your issue status changes. Never miss an update.',
            color: 'info'
        },
        {
            icon: HiOutlineChartBar,
            title: 'Track Progress',
            description: 'Monitor all your reported issues with our comprehensive dashboard and statistics.',
            color: 'success'
        },
        {
            icon: HiOutlineCheckBadge,
            title: 'Transparent Resolution',
            description: 'See exactly who is working on your issue and expected resolution timelines.',
            color: 'warning'
        }
    ];

    const categories = [
        { icon: HiOutlineWrenchScrewdriver, name: 'Infrastructure', description: 'Benches, lights, doors' },
        { icon: HiOutlineSparkles, name: 'Cleanliness', description: 'Washrooms, corridors' },
        { icon: HiOutlineWifi, name: 'Network/IT', description: 'Wi-Fi, computers' },
        { icon: HiOutlineCog, name: 'Equipment', description: 'Lab & classroom equipment' }
    ];

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span>🎓</span> Smart Campus Solution
                    </div>
                    <h1 className="hero-title">
                        Report Campus Issues<br />
                        <span className="gradient-text">Hassle-Free</span>
                    </h1>
                    <p className="hero-subtitle">
                        No more verbal complaints or forgotten issues. Report, track, and resolve
                        campus problems all in one place with complete transparency.
                    </p>
                    <div className="hero-cta">
                        {isAuthenticated ? (
                            <>
                                <Link to="/report" className="btn btn-primary btn-lg">
                                    Report an Issue
                                    <HiOutlineArrowRight />
                                </Link>
                                <Link to="/dashboard" className="btn btn-secondary btn-lg">
                                    View Dashboard
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/register" className="btn btn-primary btn-lg">
                                    Get Started
                                    <HiOutlineArrowRight />
                                </Link>
                                <Link to="/login" className="btn btn-secondary btn-lg">
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-card hero-card-1">
                        <div className="mini-card-icon pending">⏳</div>
                        <span>Issue Reported</span>
                    </div>
                    <div className="hero-card hero-card-2">
                        <div className="mini-card-icon progress">🔧</div>
                        <span>In Progress</span>
                    </div>
                    <div className="hero-card hero-card-3">
                        <div className="mini-card-icon resolved">✅</div>
                        <span>Resolved!</span>
                    </div>
                </div>
            </section>

            {/* Problem Section */}
            <section className="problem-section">
                <div className="container">
                    <h2 className="section-title">The Problem We Solve</h2>
                    <div className="problem-grid">
                        <div className="problem-card">
                            <span className="problem-icon">🗣️</span>
                            <h3>Verbal Complaints</h3>
                            <p>Issues reported verbally get lost and forgotten</p>
                        </div>
                        <div className="problem-card">
                            <span className="problem-icon">⏰</span>
                            <h3>Delayed Resolution</h3>
                            <p>No tracking means issues take forever to fix</p>
                        </div>
                        <div className="problem-card">
                            <span className="problem-icon">🙈</span>
                            <h3>No Transparency</h3>
                            <p>Students never know the status of their complaints</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title">Everything You Need</h2>
                    <p className="section-subtitle">A complete solution for campus issue management</p>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className={`feature-card feature-${feature.color}`}>
                                <div className="feature-icon">
                                    <feature.icon />
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories-section">
                <div className="container">
                    <h2 className="section-title">Report Any Type of Issue</h2>
                    <div className="categories-grid">
                        {categories.map((cat, index) => (
                            <div key={index} className="category-card">
                                <cat.icon className="category-icon" />
                                <h3>{cat.name}</h3>
                                <p>{cat.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Ready to Make Your Campus Better?</h2>
                    <p>Join thousands of students already using CampusIssues</p>
                    {!isAuthenticated && (
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Start Reporting Now
                            <HiOutlineArrowRight />
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
