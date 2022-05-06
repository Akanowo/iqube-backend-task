const router = require('express').Router();
const reviewRouter = require('./reviews');

const {
	handleCreateAppartment,
	handleGetAllAppartments,
} = require('../controllers/appartment');

router.use('/:appartment_id/reviews', reviewRouter);

router.route('/').get(handleGetAllAppartments).post(handleCreateAppartment);

module.exports = router;
