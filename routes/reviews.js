const router = require('express').Router({ mergeParams: true });
const authenticate = require('../middlewares/auth');

const {
	handleGetAllReviews,
	handleCreateReview,
	handleMarkHelpful,
} = require('../controllers/review');

router.route('/:id/mark').put(authenticate, handleMarkHelpful);

// router.route('/:id')
//   .get()

router
	.route('/')
	.get(handleGetAllReviews)
	.post(authenticate, handleCreateReview);

module.exports = router;
