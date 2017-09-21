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
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId, // relationship between store and user
    ref: 'User', // tell mongodb that the author is going to be referenced to our user
    required: 'You must supply an author'
  }
});

// Define our indexes
storeSchema.index({ // Say which fields we want to index
  name: 'text', // Tell MongoDB what the fields should be indexed as
  description: 'text'
});

storeSchema.index({
  location: '2dsphere' // field is indexed as geospatial data
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

storeSchema.statics.getTagsList = function() { // static methods are bound to the model; using proper function so we have access to "this"
  return this.aggregate([
    { $unwind: '$tags' }, // get instance of item for each tag
    { $group: { _id: '$tags', count: {$sum: 1} }}, // group everything based on the tag field and create a new field in each of those groups called count. Each time we group an item, the sum will increase by one.
    { $sort: { count: -1 }} // sort by most popular
  ]);
}

module.exports = mongoose.model('Store', storeSchema);
