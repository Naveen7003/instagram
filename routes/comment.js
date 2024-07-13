const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required:true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'post',
    required:true,
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
