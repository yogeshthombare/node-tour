const mongoose = require('mongoose');
const slugify = require('slugify');


const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    unique: true,
    minlength: ['5', 'Tour name must have more than 5 characters'],
    maxlength: ['40', 'Tour name must have less than 40 characters']
    // validate: [validator.isAlpha, 'Tour must have only alphabeticals']
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, 'Tour must have a duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'Tour must have a group size']
  },
  difficulty: {
    type: String,
    required: [true, 'Tour must have a dificulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficult must be either easy, medium, difficult'
    }
  },
  ratingAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1'],
    max: [5, 'Rating must be below 5'],
    set: val => Math.round(val * 10) / 10
  },
  ratingQuatity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'Price is required.']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        return val < this.price;
      },
      message: 'Discout price ({VALUE}) should below tour price'
    }
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'Summary is required.']
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'Cover image is required.']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: [Date],
  secreteTour: {
    type: Boolean,
    default: false
  },
  startLocation: {
    type: {
      type: String,
      defaut: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  locations: [
    {
      type: {
        type: String,
        defaut: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number
    }
  ],
  guides: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'

  }]
},
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// indexes
// tourSchema.index({ price: 1 })
// Compund index 1: asc ,-1: desc 
tourSchema.index({ price: 1, ratingAverage: -1 })
tourSchema.index({ slug: 1 })
tourSchema.index({ startLocation: '2dsphere' })

// Virtual column in document
tourSchema.virtual('durationWeek').get(function () {
  return Math.round(this.duration / 7)
});

// virtual field for reviews
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
})

// Document middleware runs before save and create only and not on insertMany
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Query middlewate / hook

tourSchema.pre(/^find/, function (next) {
  this.find({ secreteTour: { $ne: true } })
  next();
});

// Aggregation middleware

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secreteTour: { $ne: true } } });
//   next();
// });


const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
