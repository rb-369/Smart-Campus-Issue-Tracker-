const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Comment text is required'],
        maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    issue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue',
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isStatusUpdate: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);
