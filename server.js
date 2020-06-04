const express = require('express');
const path = require('path');
const env = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileUpload = require('express-fileupload');

// Load configuration variables
env.config({ path: './config/config.env' });

const connectDb = require('./config/db');
const bootcampRoutes = require('./routes/bootcamps.routes');
const courseRoutes = require('./routes/courses.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// connect to mongodb
connectDb();

// enable logging in developmet environment
if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}

// body parser
app.use(express.json());

// express file uploader
app.use(fileUpload());

// set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/bootcamps', bootcampRoutes);
app.use('/api/courses', courseRoutes);

// mongo error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Node server is running in ${process.env.NODE_ENV} mode at port ${PORT}`
      .cyan.bold.underline
  )
);

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.bgWhite.red);
  server.close(() => process.exit(1));
});
