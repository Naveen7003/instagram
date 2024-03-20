const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'post',
  },
  date: {
    type: Date,
    default: Date.now
  },
  comments: {
    type:String
  }
})

module.exports = mongoose.model('comment', commentSchema);
