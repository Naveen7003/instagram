const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required:true,
  },
  date: {
    type: Date,
    default: Date.now
  },
  image: String,
  likes: [
    {type: mongoose.Schema.Types.ObjectId, ref: 'user'}
  ]
})

module.exports = mongoose.model("story", storySchema);
