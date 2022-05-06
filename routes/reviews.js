const router = require('express').Router({ mergeParams: true });
const authenticate = require('../middlewares/auth');
const multer = require('multer');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, __dirname + '/../public/media/uploads');
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(
			null,
			file.fieldname +
				'-' +
				uniqueSuffix +
				`.${
					file.originalname.split('.')[file.originalname.split('.').length - 1]
				}`
		);
	},
});

const upload = multer({ storage });

const file_fields = [
	{ name: 'images', maxCount: 3 },
	{ name: 'videos', maxCount: 2 },
];

const {
	handleGetAllReviews,
	handleCreateReview,
	handleMarkHelpful,
	handleMarkHelpfulAsGuest,
	handleGetSingleReview,
} = require('../controllers/review');

router.route('/:id/mark/guest').put(handleMarkHelpfulAsGuest);
router.route('/:id/mark').put(authenticate, handleMarkHelpful);

router.route('/:id').get(handleGetSingleReview);

router
	.route('/')
	.get(handleGetAllReviews)
	.post(authenticate, upload.fields(file_fields), handleCreateReview);

module.exports = router;
