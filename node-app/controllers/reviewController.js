const mongoose = require('mongoose');
const Review = mongoose.model('Review');

exports.addReview = async (req, res) => {
  req.body.author = req.user._id; // id comes in from logged in user
  req.body.store = req.params.id; // id comes in from url
  const newReview = new Review(req.body);
  await newReview.save();
  req.flash('success', 'Review saved!');
  res.redirect('back');
}
