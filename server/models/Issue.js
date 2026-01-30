const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide issue title'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide issue description'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['infrastructure', 'cleanliness', 'network', 'equipment', 'other']
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'resolved', 'closed'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    location: {
        building: {
            type: String,
            required: [true, 'Please specify the building']
        },
        floor: {
            type: String
        },
        room: {
            type: String
        },
        description: {
            type: String
        }
    },
    images: [{
        type: String
    }],
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    statusHistory: [{
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'resolved', 'closed']
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        changedAt: {
            type: Date,
            default: Date.now
        },
        note: String
    }],
    resolvedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Add to status history when status changes
issueSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this.statusHistory.push({
            status: this.status,
            changedAt: new Date()
        });

        if (this.status === 'resolved') {
            this.resolvedAt = new Date();
        }
    }
    next();
});

// Virtual for comments count
issueSchema.virtual('commentsCount', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'issue',
    count: true
});

issueSchema.set('toJSON', { virtuals: true });
issueSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Issue', issueSchema);
