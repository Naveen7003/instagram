const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: String,
  stories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "story"
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  }],
  followings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  }],
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "post",
  }],
  story: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "story",
  }],
  messages: {
    type: Array,
    default: [],
  },
  profilepicture: {
    type: String,
    default: "default.jpg",
  },
  bio: String,
  password: String,
  email: String,
  socketId: {
    type: String,
  },
  saved: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "post" 
  }],
  comment: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'comment'
  }]
});

mongoose.plugin(plm);

module.exports = mongoose.model("user", userSchema);
