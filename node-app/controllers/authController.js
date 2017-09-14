const passport = require('passport');
const crypto = require('crypto'); // native node module
const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.login = passport.authenticate('local', { // pass in strategy (local is for username/pw) and config object
 failureRedirect: '/login', // if failure, where should they go?
 failureFlash: 'Failed Login!', // if failure, flash message
 successRedirect: '/',
 successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out!');
  res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
  // first check if the user is authenticated
  if (req.isAuthenticated()) {  // checks with passport if user is there
    next(); // continue -- they are logged in
    return;
  }
  req.flash('error', 'Oops! You must be logged in to do that!');
  res.redirect('/login');
}

exports.forgot = async (req, res) => {
  // 1. Check if user with that email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash('error', 'No account with that email exists.');
    return res.redirect('/login');
  }

  // 2. Set reset tokens and expiry on account
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
  await user.save();

  // 3. Send them an email with the token
  const resetUrl = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  req.flash('success', `You have been emailed a password reset link. ${resetUrl}`);

  // 4. Redirect to login page after redirect token has been sent
  res.redirect('/login');
}
