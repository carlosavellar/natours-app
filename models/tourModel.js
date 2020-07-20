console.log('Model');
const mongoose = require('mongoose');
const slugfy = require('slugify');
const validator = require('validator');
const User = require('./userModel');
const Review = require('./../models/reviewsModule');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'Choose a name'],
      maxlength: 19,
      minlength: 5,
    },
    slug: String,
    duration: {
      type: Number,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    maxGroupSize: {
      type: Number,
    },
    difficulty: {
      type: 'String',
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: 'The  value must be easy, medium or hard',
      },
      required: [true, 'Choose one level of difficulty'],
    },
    ratingsAverage: {
      type: Number,
      min: [2, 'Ratings must be more that 2'],
      max: [5, 'Ratings must be less that 5'],
    },
    ratingsQuantity: {
      type: Number,
    },
    price: {
      type: Number,
      required: [true, 'Choose a price'],
    },
    discount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val <= this.price;
        },
        message: 'Discount must be lesser or equal the price',
      },
    },
    summary: { type: String },
    description: { type: String },
    imageCover: String,
    images: [String],
    startDates: [Date],
    createdAt: Date,
    // NOW I CAN IMPORT JSON DATA WITH THIS DATASET
    startLocations: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: ['Number'],
      address: String,
      description: String,
      locations: {
        type: String,
        default: 'Point',
        enum: ['Point'],
        coordinates: ['Number'],
        address: String,
        description: String,
      },
    },
    // guides: [String],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// tourSchema.pre(/ˆfind/, async function (next) {
//   const guidesTour = this.guides.forEach(async (id) => await User.find(id));
//   this.guides = await Promise.all(guidesTour);
//   next();
// });

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.pre(/ˆfind/, function (next) {
  this.populate({
    path: 'guide',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: false } } });
  next();
});

tourSchema.pre('find', function (next) {
  this.find({ sercretTour: { $eq: null } });
  this.start = Date.now();
  console.log(`*Begin: ${this.start}`);
  next();
});

tourSchema.post('find', function (doc, next) {
  console.log(`**End request: ${Date(Date.now() - this.start)}`);
  next();
});

tourSchema.virtual('durationWeeks').get(function (next) {
  return this.duration / 7;
  next();
});

tourSchema.pre('save', function (next) {
  this.slug = slugfy(this.name, { lower: true });
  next();
});

// tourSchema.pre('find', function () {
//   console.log(this);
// });

// tourSchema.pre(/ˆfind/, function (next) {
//   this.find({ sercretTour: { $ne: false } });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
