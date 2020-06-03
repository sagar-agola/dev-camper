const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const env = require('dotenv');

// Load configuration variables
env.config({ path: './config/config.env' });

const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');

// connect to mongodb
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// read json data file
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
);

// import data
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);

    console.log('Data Imported...'.green.inverse);
    process.exit();
  } catch (error) {
    console.log(`${error}.bgWhite.red`);
  }
};

// delete data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();

    console.log('Data deleted...'.bgWhite.red);
    process.exit();
  } catch (error) {
    console.log(`${error}.bgWhite.red`);
  }
};

// read arguments
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
