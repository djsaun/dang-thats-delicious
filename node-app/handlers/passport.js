// handler to configure passport

const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

passport.use(User.createStrategy()); // we can use .createStrategy() because of module imported in User.js

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
