const mongoose = require('mongoose');

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
}

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
}

exports.validateRegister = (req, res, next) => {
  // Sanitize the name
  req.sanitizeBody('name'); // Uses express-validator module

  // Check the name and email content is supplied
  req.checkBody('name', 'You must supply a name!').notEmpty();
  req.checkBody('email', 'That email is not valid!').isEmail();

  // Normalize the email address
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  }); // normalizeEmail standardizes the email address' appearance (always displays as name@email.com even if the email address is name+test@email.com or NaMe@email.com)

  // check that password isn't blank
  req.checkBody('password', 'Password cannot be blank!').notEmpty();
  req.checkBody('confirm-password', 'Confirmed password cannot be blank!').notEmpty();

  // check that password and confirm password are the same
  req.checkBody('confirm-password', 'Oops! Your passwords do not match.').equals(req.body.password);

  const errors = req.validationErrors(); // checks errors and puts them into errors object
  if (errors) {
    // handle the error itself rather than passing it along
    req.flash('error', errors.map(err => err.msg));
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash() }); // pass in req.body so form doesn't completely reset; pass in flashes because we're not calling next -- they need to be present on the same request
    return; // stop the function from running
  }
  next(); // there were no errors
};
