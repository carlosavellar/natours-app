const mongoose = require('mongoose');
const validator = require('validator');
const slugify = require('slugify');

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: ['true', 'Prease put a name'],
      minlength: 5,
      maxlength: 16,
      // validate: [validator.isAlpha, 'The name must be only text'],
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
    },
    maxGroupSize: {
      type: Number,
    },
    difficulty: {
      type: String,
      required: ['true', 'Choose a difficulty'],
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: 'Difficulty must be easy, medium or hard',
      },
    },
    ratingsAverage: {
      type: Number,
      max: 5,
      min: 2,
    },
    ratingsQuantity: {
      type: Number,
    },
    price: {
      type: Number,
      validade: [validator.isNum],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val <= this.price;
        },
        message: 'Descount must be lesser than the price',
      },
    },
    summary: {
      type: String,
    },
    description: {
      type: String,
    },
    imageCover: {
      type: String,
    },
    images: [String],
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationHours').get(function (req, res) {
  return this.duration * 60;
});

tourSchema.pre(/^find/, function (next) {
  this.start = Date.now();
  next();
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`The request ${this.start - Date.now()} mileseconds`);
  // console.log(docs);
  next();
});

tourSchema.pre('aggregate', function (next) {
  console.log(this.pipeline());
  this.pipeline().unshift({ $match: { secreteTour: { $ne: true } } });
  console.log('Estruturas');
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
6;
