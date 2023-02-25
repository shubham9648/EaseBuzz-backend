const router = require('express').Router();

// const {
//     signUpSchema
// } = require('../validators/user.validator'); // Validation Schema

const {
    initiatePayment,
    checkStatus,
    mongoConnect
} = require('../controllers/payment.js'); // Controllers


// Routes
router.route('/initiate').post(
    // validate(signUpSchema), 
    initiatePayment
);
router.route('/checkStatus').post(checkStatus);
router.route('/mongoConnect').post(mongoConnect);



module.exports = router;