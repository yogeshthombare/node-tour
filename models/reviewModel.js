const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review is required']
  },
  rating: {
    type: Number,
    default: 4,
    min: [1, 'Rating should not be less than 1'],
    max: [5, 'Rating should not be more than 5']
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must be belongs to Tour']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must be belongs to User']
  }
},
  {
    toJson: { virtuals: true },
    toObject: { virtuals: true }
  });

// Indexes 

reviewSchema.index({ user: 1, tour: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // })
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
})

reviewSchema.statics.calcAverageRatings = async function (tourId) {

  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRatings: { $avg: '$rating' }
      }
    }
  ]);

  // update rating avg and qty in tour
  if (stats.length <= 0) {
    stats[0].nRatings = 0;
    stats[0].avgRatings = 4.5;
  }

  await Tour.findByIdAndUpdate(tourId, {
    ratingQuatity: stats[0].nRatings,
    ratingAverage: stats[0].avgRatings
  });
}

// This is post save
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});

/* This is a hack to deal with update and delete ratings
  In this scenario we are first add pre hook and get doc being updated for tourId
  in the post hook we are using this tourId to send to calculate avg
*/
// This is post save
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.rw = await this.findOne();
  next();
});

// This is post save
reviewSchema.post(/^findOneAnd/, async function () {
  await this.rw.constructor.calcAverageRatings(this.rw.tour);
});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;