const mongoose = require('mongoose');
const colors = require('colors');

const ReviewSchema = mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Review title is required field'],
    maxlength: [100, 'Review title can not be more than 100 characters'],
  },
  message: {
    type: String,
    required: [true, 'Review message is required field'],
    maxlength: [500, 'Review message can not be more than 500 characters'],
  },
  rating: {
    type: Number,
    min: [1, 'Invalid rating'],
    max: [10, 'Invalid rating'],
    required: [true, 'Rating is required field'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: [true, 'Bootcamp is required field'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'User is required field'],
  },
});

// prevent user from submitting more than one review per bootcamp
ReviewSchema.index(
  { bootcamp: 1, user: 1 },
  { unique: [true, 'You can add only one review per boocamp'] }
);

// static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating,
    });
  } catch (err) {
    console.error(error);
  }
};

// call getAverageCost after save
ReviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.bootcamp);
});

// call getAverageCost before remove
ReviewSchema.pre('remove', function () {
  this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Review', ReviewSchema);
