const mongoose = require('mongoose');


const options = {
  useUnifiedTopology: true,
  connectTimeoutMS: 200000,
  socketTimeoutMS: 2000000,
  keepAlive: true,
  useNewUrlParser: true,
  dbName: process.env.DB_NAME
};

exports.connectToDatabase = async (req, res, next) => mongoose.connect(process.env.DB_STRING, options)
  .then(db => next(),
    err => {
      console.log('----DB----ERROR-CONNECTION----------------');
      console.log(err);
      return res.send({
        status_code: 409,
        success: false,
        message: 'DB connection failure'
      });
    }
  );