const mongoose = require('mogoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String
    },
    body: {
        type: String
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    date: {
        type: Date,
        default: Date.now
    },

    status: {
        type: String,
        default: 'public'
    },
    allowComments: {
        type: Boolean,
        default: true
    },
    comments: [{
        commentBody: {
            type: String
        },
        commmentUser: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        commentDate: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = mongoose.model('post', postSchema);