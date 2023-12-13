const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review must have a text.'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },

    // Parent MODEL referencing
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
///////////////////////////////////////////////////////////////////////////////
// INDEX
// Each combination of (tour + user) has always to be unique
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
///////////////////////////////////////////////////////////////////////////////
// STATIC METHODs on model
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // this -> current model || using middleware each time a new rv is created
  // only Model can call static method
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }, // Select all reviews matched current tourId
    },
    {
      $group: {
        _id: '$tour', // Group by tour
        nRating: { $sum: 1 }, // Add 1 for each tour matched in the prev step
        avgRating: { $avg: '$rating' }, // 'rating' field of review
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      // Save statistic to current tour
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
///////////////////////////////////////////////////////////////////////////////
reviewSchema.pre(/^find/, function (next) {
  this // -> current query
    //   .populate({
    //   path: 'tour',
    //   select: 'name',
    // })
    .populate({
      path: 'user',
      select: 'name photo',
    });

  next();
});

reviewSchema.post('save', function () {
  // Fn was called after a new review has been created
  // this -> doc, constructor -> model who created that doc
  this.constructor.calcAverageRatings(this.tour);
  // POST fn not have 'next'
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  // this -> query
  this.curReview = await this.clone().findOne(); // get doc from db
  // Data will be update in POST middleware after saved in DB
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // Get UP-TO-DATE saved data from DB
  await this.curReview.constructor.calcAverageRatings(this.curReview.tour);
});

///////////////////////////////////////////////////////////////////////////////
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
