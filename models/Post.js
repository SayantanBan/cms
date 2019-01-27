const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    title:{
        type: String,
        required: true
    },
    status:{
        type: String,
        default: 'public'
    },
    allowComments:{
        type: Boolean,
        required: true
    },
    body:{
        type: String,
        require: true
    },
    file:{
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt:{
        type: Date
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'categories'
    },
    slug: {
        type: String
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'comments'
    }]

}, {usePushEach: true})

PostSchema.plugin(URLSlugs('title', {field: 'slug'}));

module.exports = mongoose.model('posts', PostSchema);
