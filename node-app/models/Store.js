const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates!'
    }],
    address: {
      type: String,
      required: 'You must supply an address!'
    }
  },
  photo: String
});

storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next(); // skip it
    return; // stop function from running
  }
  this.slug = slug(this.name);

  // find other stores that have identical slugs
  // create regex that will search for stores
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i'); // i means case-insensitive

  // pass regex into query
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx }); // Trying to access store model before new store is created; this.constructor will equal Store by the time it runs

  if (storesWithSlug.length) { // if slug already exists
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`; // create a new slug and with number value at the end
  }

  next();
});

module.exports = mongoose.model('Store', storeSchema);
