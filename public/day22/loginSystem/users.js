var express = require('express');
var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Hero = require('./models/hero');

// Register
router.get('/register', function(req, res){
  res.render('./login/register.hbs');
});

// Login
router.get('/login', function(req, res){
  res.render('./login/login.hbs');
});

// Post handling
router.post('/register', function(req, res){
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  // Validation
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Password is not matched').equals(req.body.password);

  var errors = req.validationErrors();

  if(errors){
    res.render('./login/register.hbs', {
      errors: errors
    });
  }else{
    var newUser = new Hero({
      name: name,
      email: email,
      username: username,
      password: password
    });

    Hero.createUser(newUser, function(err, user){
      if(err) throw err;
      console.log(user);
    });

    req.flash('success_msg', 'You are registered and can now login');
    res.redirect('./login');
  }

});


//login handling


passport.use(new LocalStrategy(
  function(username, password, done) {
    Hero.getUserByUsername(username, function(err, user){
      if(err) throw err;
      if(!user){
        return done(null, false, {message: 'Unknown User'});
      }

      Hero.comparePassword(password, user.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
          return done(null, user);
        }else{
          return done(null, false, {message: 'Invalid password'});
        }
      });


    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Hero.getUserById(id, function(err, user) {
    done(err, user);
  });
});



router.post('/login',
  passport.authenticate('local', {successRedirect:'../', failureRedirect:'./login', failureFlash: true}),

  // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.   the local strategy above return the user data and store it to 'req.user'
  function(req, res) {
    res.redirect('../');

  });

router.get('/logout', function(req, res){
  req.logout();

  req.flash('success_msg', 'You are logged out');

  res.redirect('./login');
});


module.exports = router;