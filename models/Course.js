const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Course title is required field'],
  },
  description: {
    type: String,
    required: [true, 'Description is required field'],
  },
  weeks: {
    type: String,
    required: [true, 'Number of weeks is required field'],
  },
  tuition: {
    type: Number,
    required: [true, 'Tuition cost is required field'],
  },
  minimumSkill: {
    type: String,
    required: [true, 'Skill level is required field'],
    enum: {
      values: ['beginner', 'intermediate', 'advanced'],
      message: 'Invalid skill level',
    },
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
});

// static method to calculate average cost of tution fees
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  // get average cost
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: { $avg: 'tuition' },
      },
    },
  ]);

  // update bootcamp
  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost),
    });
  } catch (error) {
    console.log(`${error}`.bgWhite.red);
  }
};

// call average cost after save
CourseSchema.post('save', async function () {
  await this.constructor.getAverageCost(this.bootcamp);
});

// call average cost before delete
CourseSchema.pre('remove', async function () {
  await this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);
