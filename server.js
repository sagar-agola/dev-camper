const express = require('express');
const env = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');

const connectDb = require('./config/db');
const bootcampRoutes = require('./routes/bootcamps.routes');

// Load configuration variables
env.config({ path: './config/config.env' });

const app = express();

// connect to mongodb
connectDb();

// enable logging in developmet environment
if (process.env.NODE_ENV == 'development') {
    app.use(morgan('dev'));
}

// body parser
app.use(express.json());

// Routes
app.use('/api/bootcamps', bootcampRoutes);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Node server is running in ${process.env.NODE_ENV} mode at port ${PORT}`.cyan.bold.underline));

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.bgWhite.red);
    server.close(() => process.exit(1));
});