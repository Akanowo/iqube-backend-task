const router = require('express').Router();
const reviewRouter = require('./reviews');

const {
	handleCreateAppartment,
	handleGetSingleApartment,
	handleGetAllAppartments,
} = require('../controllers/appartment');

router.use('/:appartment_id/reviews', reviewRouter);

router.route('/:id/').get(handleGetSingleApartment);

router.route('/').get(handleGetAllAppartments).post(handleCreateAppartment);

module.exports = router;
