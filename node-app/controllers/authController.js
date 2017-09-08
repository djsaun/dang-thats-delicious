const passport = require('passport');

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
