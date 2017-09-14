const passport = require('passport');
const crypto = require('crypto'); // native node module
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

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

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() } // look for expires that's greater than right now; if token is expired, then it would be in the past and we can't access it anymore
  });

  if (!user) {
    req.flash('error', 'Password reset token is invalid or has expired.');
    return res.redirect('/login');
  }

  // if there is a user, show the reset password form
  res.render('reset', {title: 'Reset Your Password'});
}

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body['confirm-password']) {
    next(); // keep it going
    return;
  }
  req.flash('error', 'Passwords do not match');
  res.redirect('back');
}

exports.update = async (req, res) => {
  // Find the user and make sure they're still within the token expiration period
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash('error', 'Password reset token is invalid or has expired.');
    return res.redirect('/login');
  }

  const setPassword = promisify(user.setPassword, user); // setPassword function is a callback, not a promise. Need to promisify it
  await setPassword(req.body.password);

  // Delete token and expire fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  const updatedUser = await user.save();

  // automatically log the user in
  await req.login(updatedUser);

  req.flash('success', 'Your password has been reset! You are now logged in.');
  res.redirect('/');
}
