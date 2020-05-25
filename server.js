const express = require('express');
const env = require('dotenv');
const morgan = require('morgan');

const bootcampRoutes = require('./routes/bootcamps.routes');

// Load configuration variables
env.config({ path: './config/config.env' });

const app = express();

if (process.env.NODE_ENV == 'development') {
    app.use(morgan('dev'));
}

// Routes
app.use('/api/bootcamps', bootcampRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Node server is running in ${process.env.NODE_ENV} mode at port ${PORT}`);
});