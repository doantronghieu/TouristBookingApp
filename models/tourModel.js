const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');
////////////////////////////////////////////////////////////////////////////////
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name.'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have <= 40 characters.'],
      minlength: [10, 'A tour name must have >= 10 characters.'],
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      require: [true, 'A tour must have a duration.'],
    },
    maxGroupSize: {
      type: Number,
      require: [true, 'A tour must have a group size.'],
    },
    difficulty: {
      type: String,
      require: [true, 'A tour must have a difficulty.'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.666666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price.'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // has access to the inputted value
          // "this" points to the current doc when creating new doc
          return val < this.price;
        },
        message:
          'The discounted price ({VALUE}) should be below the regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      require: [true, 'A tour must have a description.'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      require: [true, 'A tour must have a cover image.'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // hide this to user
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId, // contains references
        ref: 'User', // User model
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
////////////////////////////////////////////////////////////////////////////////
// Set indexes for most-query fields
tourSchema.index({ slug: 1 }); // single-field index | 1: asc order
tourSchema.index({ price: 1, ratingsAverage: -1 }); // compound index
tourSchema.index({ startLocation: '2dsphere' });
////////////////////////////////////////////////////////////////////////////////
tourSchema.virtual('durationWeeks').get(function () {
  // virtual field
  return this.duration / 7;
});

// Virtual populate, reference to other model
tourSchema.virtual('reviews', {
  ref: 'Review', // Model name
  foreignField: 'tour', // Field of other model stores ref to the current model
  localField: '_id', // 'Tour' in the foreign model
});
////////////////////////////////////////////////////////////////////////////////

// Document Middleware runs before .save() and .create()
tourSchema.pre('save', function (next) {
  // .this points to the current doc
  // tourSchema.post('save', function (doc, next)
  this.slug = slugify(this.name, { lower: true });
  next();
});

/* Embedding
tourSchema.pre('save', async function (next) {
  const guidesPromises = this.guides.map(async (id) => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});
*/

// Query Middleware
tourSchema.pre(/^find/, function (next) {
  // str starts with find
  // this -> current query obj
  this.start = Date.now();

  this.find({ secretTour: { $ne: true } });

  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

tourSchema.post(/^find/, function (docs, next) {
  next();
});

// Aggregation Middleware
tourSchema.pre('aggregate', function (next) {
  // .this points to the current aggregation obj
  // this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});
////////////////////////////////////////////////////////////////////////////////
const Tour = mongoose.model('Tour', tourSchema); // collection

module.exports = Tour;
