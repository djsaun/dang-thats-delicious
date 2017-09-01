const mongoose = require('mongoose');
const Store = mongoose.model('Store'); // Referencing Store mongoose model that's being exported in ../models/Store.js

exports.homePage = (req, res) => {
  res.render('index');
}

exports.addStore = (req, res) => {
  res.render('editStore', {
    title: 'Add Store'
  });
}

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save(); // Immediately save store and await it. This will give us access to the autogenerated slug value for the redirect
  req.flash('success', `Successfully Created ${store.name}. Care to leave a review`); // makes use of flash middleware
  res.redirect(`/store/${store.slug}`);
}
