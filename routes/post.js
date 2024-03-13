const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  image: String,
  date: {
    type: Date,
    default: Date.now
  },
  
  likes: [
    {type: mongoose.Schema.Types.ObjectId, ref: 'user'}
  ],
  comments: {
    type: Array,
    default: []
  },
  caption: String,
})

module.exports = mongoose.model('post', postSchema);
