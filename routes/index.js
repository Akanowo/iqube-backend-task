const router = require('express').Router();
const authRouter = require('./auth');
const reviewRouter = require('./reviews');
const appartmentRouter = require('./appartment');

router.use('/auth', authRouter);
router.use('/reviews', reviewRouter);
router.use('/appartments', appartmentRouter);

module.exports = router;
