const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/issues
// @desc    Get all issues (with filters)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { status, category, priority, my, search, page = 1, limit = 10 } = req.query;

        let query = {};

        // Filter by user's own issues
        if (my === 'true') {
            query.reportedBy = req.user._id;
        }

        // Filter by status
        if (status && status !== 'all') {
            query.status = status;
        }

        // Filter by category
        if (category && category !== 'all') {
            query.category = category;
        }

        // Filter by priority
        if (priority && priority !== 'all') {
            query.priority = priority;
        }

        // Search in title and description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Issue.countDocuments(query);
        const issues = await Issue.find(query)
            .populate('reportedBy', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            issues,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/issues/:id
// @desc    Get single issue by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id)
            .populate('reportedBy', 'name email department')
            .populate('assignedTo', 'name email')
            .populate({
                path: 'statusHistory.changedBy',
                select: 'name'
            });

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        // Get comments for this issue
        const comments = await Comment.find({ issue: req.params.id })
            .populate('author', 'name email role')
            .sort({ createdAt: 1 });

        res.json({ issue, comments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/issues
// @desc    Create new issue
// @access  Private
router.post('/', protect, [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').isIn(['infrastructure', 'cleanliness', 'network', 'equipment', 'other']).withMessage('Invalid category'),
    body('location.building').trim().notEmpty().withMessage('Building location is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, category, priority, location, images } = req.body;

        const issue = await Issue.create({
            title,
            description,
            category,
            priority: priority || 'medium',
            location,
            images: images || [],
            reportedBy: req.user._id,
            statusHistory: [{
                status: 'pending',
                changedBy: req.user._id,
                changedAt: new Date(),
                note: 'Issue reported'
            }]
        });

        await issue.populate('reportedBy', 'name email');

        res.status(201).json(issue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/issues/:id
// @desc    Update issue
// @access  Private (owner or admin)
router.put('/:id', protect, async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        // Check ownership or admin
        if (issue.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this issue' });
        }

        const { title, description, category, priority, location, images } = req.body;

        // Only allow certain updates based on role
        if (req.user.role !== 'admin') {
            // Students can only update title, description, location if status is pending
            if (issue.status !== 'pending') {
                return res.status(400).json({ message: 'Cannot edit issue after it has been processed' });
            }
        }

        issue.title = title || issue.title;
        issue.description = description || issue.description;
        issue.category = category || issue.category;
        issue.priority = priority || issue.priority;
        issue.location = location || issue.location;
        issue.images = images || issue.images;

        const updatedIssue = await issue.save();
        await updatedIssue.populate('reportedBy', 'name email');

        res.json(updatedIssue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/issues/:id/status
// @desc    Update issue status (admin only)
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        const { status, note } = req.body;

        if (!['pending', 'in-progress', 'resolved', 'closed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        issue.status = status;
        issue.statusHistory.push({
            status,
            changedBy: req.user._id,
            changedAt: new Date(),
            note: note || `Status changed to ${status}`
        });

        if (status === 'resolved') {
            issue.resolvedAt = new Date();
        }

        const updatedIssue = await issue.save();
        await updatedIssue.populate('reportedBy', 'name email');
        await updatedIssue.populate('statusHistory.changedBy', 'name');

        // Create automatic comment for status change
        await Comment.create({
            text: note || `Status updated to ${status}`,
            issue: issue._id,
            author: req.user._id,
            isStatusUpdate: true
        });

        res.json(updatedIssue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/issues/:id
// @desc    Delete issue
// @access  Private (owner or admin)
router.delete('/:id', protect, async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        // Check ownership or admin
        if (issue.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this issue' });
        }

        // Delete associated comments
        await Comment.deleteMany({ issue: req.params.id });

        await issue.deleteOne();

        res.json({ message: 'Issue deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/issues/:id/comments
// @desc    Add comment to issue
// @access  Private
router.post('/:id/comments', protect, [
    body('text').trim().notEmpty().withMessage('Comment text is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        const comment = await Comment.create({
            text: req.body.text,
            issue: req.params.id,
            author: req.user._id
        });

        await comment.populate('author', 'name email role');

        res.status(201).json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
