

var express = require('express');
var jwt = require('express-jwt');
var mongoose = require('mongoose');
var passport = require('passport');
var Post = mongoose.model('Post');
var User = mongoose.model('User');
var router = express.Router();

var debug = require('debug')('MyBlog:server');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/posts', function(req, res, next){
  Post.find(function(err, posts){
    if(err){ return next(err); }

    res.json(posts);
  });
});


router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();
  user.username = req.body.username;
  user.setPassword(req.body.password);

  user.save(function (err){
    if(err){
      debug('Failed to save user: ' + err);
      return next(err); 
    }

    debug('New user saved! : ' + user.username);
    return res.json({token: user.generateJWT()})
  });
});


router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(!user){ return res.status(401).json(info); }

    return res.json({token: user.generateJWT()});
  })(req, res, next);
});

router.post('/posts', auth, function(req, res, next) {
  var post = new Post(req.body);

  post.author = req.payload.username;

  post.save(function(err, post){
    if(err){ return next(err); }

    res.json(post);
  });
});

router.param('post', function(req, res, next, id){
  var query = Post.findById(id);

  query.exec(function (err, post){
    if(err) { return next(err); }
    if(!post) { return next(new Error('can\'t find post')); }

    req.post = post;
    return next();
  });
});

router.get('/posts/:post', function(req, res) {
    res.json(req.post);
});

router.put('/posts/:post', function(req, res){
 var item={
   title:req.body.title,
   body: req.body.body};
   var id = req.body.id;
 Post.updateOne({_id: req.params.post}, {$set: item}, function(err, post) {
   res.send(post);
 })
 });


router.delete('/posts/:post', function(req, res) {
	Post.remove({
		_id: req.params.post
	}, function(err, post) {
		if (err) { return next(err); }
		Post.find(function(err, posts) {
			if (err) { return next(err); }
			
			res.json(posts);
		});
	});
});


module.exports = router;
