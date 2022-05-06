const asyncHandler = require('../middlewares/async');
const { Review } = require('../models/Review');
const ErrorResponse = require('../utils/errorResponse');
const { v4: uuidv4 } = require('uuid');

const handleGetAllReviews = asyncHandler(async (req, res, next) => {
	const { appartment_id } = req.params;

	// if (!appartment_id) {
	// 	return next(new ErrorResponse('missing appartment id', 400));
	// }

	let query;

	// Copy req.query
	const reqQuery = { ...req.query };

	// Fields to exculde
	const removeFields = ['select', 'sort', 'page', 'limit'];

	// Loop over removeFields and delete them from reqQuery
	removeFields.forEach((param) => delete reqQuery[param]);

	// Create query string
	let queryStr = JSON.stringify(reqQuery);

	// Create operators ($gt, $lt, etc)
	queryStr = queryStr.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

	console.log(queryStr);

	// Find resource
	if (appartment_id) {
		query = Review.find({ appartment: appartment_id }).populate([
			{
				path: 'appartment',
			},
			{
				path: 'posted_by',
				select: 'firstname lastname user_id',
			},
			{
				path: 'marked_helpful_by',
				select: 'firstname lastname user_id',
			},
		]);
	} else {
		query = Review.find().populate([
			{
				path: 'appartment',
			},
			{
				path: 'posted_by',
				select: 'firstname lastname user_id',
			},
			{
				path: 'marked_helpful_by',
				select: 'firstname lastname user_id',
			},
		]);
	}

	// Select Fields
	if (req.query.select) {
		const fields = req.query.select.split(',').join(' ');
		query = query.select(fields);
	}

	// Sort
	if (req.query.sort) {
		const sortBy = req.query.sort.split(',').join(' ');
		query = query.sort(sortBy);
	} else {
		query = query.sort('-createdAt');
	}

	// Pagination
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 10;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await Review.countDocuments();

	query = query.skip(startIndex).limit(limit);

	// Execute query
	const reviews = await query.exec();

	// Pagination result
	const pagination = {};

	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit,
		};
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}

	return res.status(200).json({
		success: true,
		count: reviews.length,
		pagination,
		data: reviews,
	});
});

const handleCreateReview = asyncHandler(async (req, res, next) => {
	const review_data = {
		...req.body,
		review_id: uuidv4(),
		appartment: req.params.appartment_id,
		posted_by: req.user._id,
	};
	const new_review = await Review.create(review_data);

	return res.status(201).json({
		status: true,
		data: new_review,
	});
});

const handleMarkHelpful = asyncHandler(async (req, res, next) => {
	const { id } = req.params;

	// find review and update
	const user_has_marked = await Review.findOne({
		_id: id,
		marked_helpful_by: {
			$in: [req.user._id],
		},
	});

	let review_update;

	if (user_has_marked) {
		review_update = await Review.updateOne(
			{ _id: id },
			{
				$inc: { helpful_counts: -1 },
				$pull: { marked_helpful_by: req.user._id },
			},
			{ new: true }
		);
	} else {
		review_update = await Review.updateOne(
			{ _id: id },
			{
				$inc: { helpful_counts: 1 },
				$push: { marked_helpful_by: req.user._id },
			},
			{ new: true }
		);
	}

	return res.status(200).json({
		status: true,
		message: 'update successful',
		data: review_update,
	});
});

module.exports = {
	handleGetAllReviews,
	handleCreateReview,
	handleMarkHelpful,
};
