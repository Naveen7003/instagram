var express = require("express");
require("dotenv").config({ path: "./.env" });
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const storyModel = require("./story");
const passport = require("passport");
const localStrategy = require("passport-local");
const { upload, uploadFileToGridFS } = require("./multer");
const commentModel = require('./comment');
const utils = require("../utils/utils");
const fs = require('fs');
const path = require('path');
require("./dbconfig").dbconnection();

passport.use(new localStrategy(userModel.authenticate()));

router.get("/", function (req, res) {
  res.render("index", { footer: false });
});

router.get("/register", function (req, res) {
  res.render("index", { footer: false });
});

router.get("/login", function (req, res) {
  res.render("login", { footer: false });
});

router.get("/profile/:user", isLoggedIn, async function (req, res) {
  try {
    let user = await userModel.findOne({ username: req.session.passport.user });

    if (user.username === req.params.user) {
      return res.redirect("/profile");
    }

    let userprofile = await userModel
      .findOne({ username: req.params.user })
      .populate("posts");

    userprofile.posts.forEach(post => {
      post.mediaType = post.image.endsWith('.mp4') ? 'video' : 'image';
    });

    res.render("userprofile", { footer: true, userprofile, user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.redirect('/login');
  }
});

router.post('/comment/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const user = req.session.passport.user; // Assuming req.session.passport.user contains the user ID

    const post = await postModel.findById(postId);

    const comment = await commentModel.create({
      user: user._id,
      comments: req.body.comment,
      post: post._id
    });

    post.comments.push(comment._id); // Pushing the comment object, not just the user ID
    await post.save();

    res.status(200).send({ message: 'Comment added successfully' });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.redirect('/login');
  }
});

router.get("/follow/:id", isLoggedIn, async (req, res) => {
  try {
    const followkarnewala = await userModel.findOne({ username: req.session.passport.user });
    const followhonewala = await userModel.findOne({ _id: req.params.id });

    if (followkarnewala.followings.indexOf(followhonewala._id) !== -1) {
      let index = followkarnewala.followings.indexOf(followhonewala._id);
      followkarnewala.followings.splice(index, 1);

      let index2 = followhonewala.followers.indexOf(followkarnewala._id);
      followhonewala.followers.splice(index2, 1);
    } else {
      followkarnewala.followings.push(followhonewala._id);
      followhonewala.followers.push(followkarnewala._id);
    }
    await followkarnewala.save();
    await followhonewala.save();

    res.redirect("back");
  } catch (error) {
    console.error('Error following user:', error);
    res.redirect('/login');
  }
});

router.get("/feed", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    const posts = await postModel
      .find()
      .populate('user')
      .populate('comments');

    posts.forEach(post => {
      post.mediaType = post.image.endsWith('.mp4') ? 'video' : 'image';
    });

    const stories = await storyModel.find({ user: { $ne: user._id } })
      .populate('user');
    var obj = {};
    const packs = stories.filter(function (story) {
      if (!obj[story.user._id]) {
        obj[story.user._id] = "ascbvjanscm";
        return true;
      }
    });
    res.render("feed", { footer: true, posts, user, stories: packs, dater: utils.formatRelativeTime });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.redirect('/login');
  }
});

router.get("/profile", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel
      .findOne({ username: req.session.passport.user })
      .populate('posts');

    user.posts.forEach(post => {
      post.mediaType = post.image.endsWith('.mp4') ? 'video' : 'image';
    });

    res.render("profile", { footer: true, user: user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.redirect('/login');
  }
});

router.post("/upload/profilepic", isLoggedIn, upload.single("image"), async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    user.profilepicture = req.file.filename;
    await user.save();
    res.redirect("/profile");
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.redirect('/login');
  }
});

router.get("/search", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    res.render("search", { footer: true, user });
  } catch (error) {
    console.error('Error fetching search page:', error);
    res.redirect('/login');
  }
});

router.get('/username/:username', isLoggedIn, async function (req, res) {
  try {
    const regex = new RegExp(`^${req.params.username}`, 'i');
    const users = await userModel.find({ username: regex });
    res.json(users);
  } catch (error) {
    console.error('Error searching for users:', error);
    res.redirect('/login');
  }
});

router.get("/edit", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    res.render("edit", { footer: true, user });
  } catch (error) {
    console.error('Error fetching edit page:', error);
    res.redirect('/login');
  }
});

router.post("/update", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOneAndUpdate(
      { username: req.session.passport.user },
      { username: req.body.username, name: req.body.name, bio: req.body.bio },
      { new: true }
    );

    req.logIn(user, function (err) {
      if (err) throw err;
      res.redirect("/profile");
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.redirect('/login');
  }
});

router.get("/upload", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    res.render("upload", { footer: true, user });
  } catch (error) {
    console.error('Error fetching upload page:', error);
    res.redirect('/login');
  }
});

router.get("/like/:postid", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    const post = await postModel.findOne({ _id: req.params.postid });
    if (post.likes.indexOf(user._id) === -1) {
      post.likes.push(user._id);
    } else {
      post.likes.splice(post.likes.indexOf(user._id), 1);
    }
    await post.save();
    res.json(post);
  } catch (error) {
    console.error('Error liking post:', error);
    res.redirect('/login');
  }
});

router.get("/save/:postid", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    if (user.saved.indexOf(req.params.postid) === -1) {
      user.saved.push(req.params.postid);
    } else {
      user.saved.splice(user.saved.indexOf(req.params.postid), 1);
    }
    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error saving post:', error);
    res.redirect('/login');
  }
});

router.post("/upload", isLoggedIn, upload.single('image'), async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });

    const filePath = path.join('./public/images/uploads', req.file.filename);

    await uploadFileToGridFS(req.file.filename, filePath);

    if (req.body.type === "post") {
      const post = await postModel.create({
        caption: req.body.caption,
        image: req.file.filename,
        user: user._id
      });
      user.posts.push(post._id);
    } else {
      const story = await storyModel.create({
        image: req.file.filename,
        user: user._id
      });
      user.stories.push(story._id);
    }

    await user.save();
    res.redirect("/feed");
  } catch (error) {
    console.error('Error uploading file:', error);
    res.redirect('/login');
  }
});

router.post("/register", async function (req, res) {
  try {
    var userDets = new userModel({
      username: req.body.username,
      name: req.body.name,
      email: req.body.email
    });

    userModel.register(userDets, req.body.password)
      .then(function (reg) {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/feed");
        });
      });
  } catch (error) {
    console.error('Error registering user:', error);
    res.redirect('/login');
  }
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/feed",
  failureRedirect: "/login"
}), function (req, res) { });

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  }
}

router.get("/story/:number", isLoggedIn, async function (req, res) {
  try {
    const storyuser = await userModel.findOne({ username: req.session.passport.user })
      .populate("stories");

    const image = storyuser.stories[req.params.number];

    if (storyuser.stories.length > req.params.number) {
      res.render("story", { footer: false, storyuser: storyuser, storyimage: image, number: req.params.number });
    } else {
      res.redirect("/feed");
    }
  } catch (error) {
    console.error('Error fetching story:', error);
    res.redirect('/login');
  }
});

router.get("/story/:id/:number", isLoggedIn, async function (req, res) {
  try {
    const storyuser = await userModel.findOne({ _id: req.params.id })
      .populate("stories");

    const image = storyuser.stories[req.params.number];

    if (storyuser.stories.length > req.params.number) {
      res.render("story", { footer: false, storyuser: storyuser, storyimage: image, number: req.params.number });
    } else {
      res.redirect("/feed");
    }
  } catch (error) {
    console.error('Error fetching story:', error);
    res.redirect('/login');
  }
});

router.get("/chat", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user }).populate('followers');
    const followers = user.followers;
    res.render("chat", { footer: true, user, followers });
  } catch (error) {
    console.error('Error fetching chat page:', error);
    res.redirect('/login');
  }
});

router.get("/chatpage", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    res.render("chatpage", { footer: true, user });
  } catch (error) {
    console.error('Error fetching chat page:', error);
    res.redirect('/login');
  }
});

router.get("/chatpage/:username", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    const username = await userModel.findOne({ username: req.params.username });
    res.render("chatpage", { footer: true, username, user });
  } catch (error) {
    console.error('Error fetching chat page:', error);
    res.redirect('/login');
  }
});

module.exports = router;
