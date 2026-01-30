const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin';
        const userFilter = isAdmin ? {} : { reportedBy: req.user._id };

        // Get counts by status
        const [pending, inProgress, resolved, closed] = await Promise.all([
            Issue.countDocuments({ ...userFilter, status: 'pending' }),
            Issue.countDocuments({ ...userFilter, status: 'in-progress' }),
            Issue.countDocuments({ ...userFilter, status: 'resolved' }),
            Issue.countDocuments({ ...userFilter, status: 'closed' })
        ]);

        // Get counts by category
        const categoryStats = await Issue.aggregate([
            { $match: userFilter },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        // Get counts by priority
        const priorityStats = await Issue.aggregate([
            { $match: userFilter },
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);

        // Get recent issues
        const recentIssues = await Issue.find(userFilter)
            .populate('reportedBy', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        // Average resolution time for resolved issues
        const resolvedIssues = await Issue.find({
            ...userFilter,
            status: { $in: ['resolved', 'closed'] },
            resolvedAt: { $exists: true }
        });

        let avgResolutionTime = 0;
        if (resolvedIssues.length > 0) {
            const totalTime = resolvedIssues.reduce((sum, issue) => {
                return sum + (issue.resolvedAt - issue.createdAt);
            }, 0);
            avgResolutionTime = Math.round(totalTime / resolvedIssues.length / (1000 * 60 * 60)); // in hours
        }

        // Monthly trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyTrend = await Issue.aggregate([
            {
                $match: {
                    ...userFilter,
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json({
            statusCounts: {
                pending,
                inProgress,
                resolved,
                closed,
                total: pending + inProgress + resolved + closed
            },
            categoryStats: categoryStats.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            priorityStats: priorityStats.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            recentIssues,
            avgResolutionTime,
            monthlyTrend
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/stats/admin
// @desc    Get admin-only statistics
// @access  Private/Admin
router.get('/admin', protect, admin, async (req, res) => {
    try {
        // Total users count
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });

        // Issues requiring attention (pending + high priority)
        const urgentIssues = await Issue.countDocuments({
            status: 'pending',
            priority: { $in: ['high', 'urgent'] }
        });

        // Top reporters
        const topReporters = await Issue.aggregate([
            { $group: { _id: '$reportedBy', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    name: '$user.name',
                    email: '$user.email',
                    count: 1
                }
            }
        ]);

        // Issues by building/location
        const locationStats = await Issue.aggregate([
            { $group: { _id: '$location.building', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            totalUsers,
            totalStudents,
            urgentIssues,
            topReporters,
            locationStats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
