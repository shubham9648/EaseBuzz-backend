const app = require('express')();
const payment = require('./payment.route.js');


app.use('/payment', payment);


module.exports = app;