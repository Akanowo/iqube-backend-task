const router = require('express').Router();

const { handleLogin, handleSignup } = require('../controllers/auth');
const { signUpReqValidator } = require('../middlewares/request_validators');

router.route('/login').post(handleLogin);

router.route('/signup').post(signUpReqValidator, handleSignup);

module.exports = router;
