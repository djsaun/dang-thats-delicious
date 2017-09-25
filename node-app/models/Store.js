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
}, {
  toJSON: { virtuals: true }, // anytime a document is converted to JSON, it will display virtuals
  toObject: { virtuals: true} // anytime a document is converted to an object, it will display virtuals
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

storeSchema.statics.getTopStores = function() {
  return this.aggregate([ // aggregate allows us to do complex queries
    // Lookup Stores and populate their reviews
    // $lookup populates a field
    {
      $lookup: {
        from: 'reviews', // where we get the field from -- mongodb lowercases model and adds an 's' onto end of from field
        localField: '_id',
        foreignField: 'store',
        as: 'reviews' // name of the field
      }
    },

    // filter for only items that have two or more reviews
    { $match: // match documents
      {
        'reviews.1': {$exists: true} // where second item in reviews exists is true
      }
    },

    // add the average reviews field -- mongodb v 3.4 has $addFields which replaces $project; $project makes you add fields you need back in
    { $project: { // add a field called averageRating -- $ means it's a field from the data being piped in (from our match)
      photo: '$$ROOT.photo', // $$ROOT is equal to the original document
      name: '$$ROOT.name',
      reviews: '$$ROOT.reviews',
      slug: '$$ROOT.slug',
      averageRating: { $avg: '$reviews.rating'} // set the value of averageRating to the average of each of the review's rating field
      }
    },

    // sort it by our new field, highest reviews first
    {
      $sort: {
        averageRating: -1
      }
    },

    // limit to at most 10
    {
      $limit: 10
    }

  ]);
}

// find reviews where the stores _id property === Review's store property -- similar to a join but not saving any relationship
storeSchema.virtual('reviews', {
  ref: 'Review', // go to Review model -- what model to link
  localField: '_id', // which field on our store needs to match up with which field on our Review
  foreignField: 'store' // which field on the Review?
});

module.exports = mongoose.model('Store', storeSchema);
