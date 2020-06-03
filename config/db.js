const mongoose = require('mongoose');

const connectDb = async () => {
  const result = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });

  console.log(
    `MongoDb connected: ${result.connection.client.s.url}`.yellow.underline
  );
};

module.exports = connectDb;
