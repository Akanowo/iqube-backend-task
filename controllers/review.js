const asyncHandler = require('../middlewares/async');
const { Review } = require('../models/Review');
const ErrorResponse = require('../utils/errorResponse');
const { v4: uuidv4 } = require('uuid');
const ip = require('ip');
const { cloudinary } = require('../configs/cloudinary');

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
		query = query.sort('-created_date');
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

const handleGetSingleReview = asyncHandler(async (req, res, next) => {
	const { id } = req.params;

	const review = await Review.findById(id);

	return res.status(200).json({
		status: !!review,
		message: review ? 'review fetched successfully' : 'review not found',
		data: review,
	});
});

const handleCreateReview = asyncHandler(async (req, res, next) => {
	console.log(req.files);

	// video file extensions
	const allowedVideoExtensions = [
		'video/mp4',
		'video/3gpp',
		'video/x-msvideo',
		'video/quicktime',
		'video/x-ms-wmv',
		'video/x-flv',
	];

	// image file extensions
	const allowedImageExtensions = ['image/jpeg', 'image/png'];

	const uploaded_videos = [];
	const uploaded_images = [];

	if (req.files.videos) {
		// validate file extension
		req.files.videos.forEach((video) => {
			if (!allowedVideoExtensions.includes(video.mimetype)) {
				return next(new ErrorResponse('unsuportted video format', 400));
			}
		});

		for (let video of req.files.videos) {
			// upload to cloudinary
			const cloudinary_upload = await cloudinary.uploader.upload(video.path, {
				public_id: `iquotes/${video.filename}`,
				upload_preset: 'iquotes',
				resource_type: 'video',
			});
			uploaded_videos.push(cloudinary_upload.secure_url);
		}
	}

	if (req.files.images) {
		// validate file extension
		req.files.images.forEach((image) => {
			if (!allowedImageExtensions.includes(image.mimetype)) {
				return next(new ErrorResponse('unsuportted image format', 400));
			}
		});

		for (let image of req.files.images) {
			// upload to cloudinary
			const cloudinary_upload = await cloudinary.uploader.upload(image.path, {
				public_id: `iquotes/${image.filename}`,
				upload_preset: 'iquotes',
				resource_type: 'image',
			});
			uploaded_images.push(cloudinary_upload.secure_url);
		}
	}

	console.log(uploaded_images, uploaded_videos);

	const review_data = {
		...req.body,
		review_id: uuidv4(),
		appartment: req.params.appartment_id,
		posted_by: req.user._id,
		images: req.files.images ? uploaded_images : undefined,
		videos: req.files.videos ? uploaded_videos : undefined,
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
			}
		);
	} else {
		review_update = await Review.updateOne(
			{ _id: id },
			{
				$inc: { helpful_counts: 1 },
				$push: { marked_helpful_by: req.user._id },
			}
		);
	}

	return res.status(200).json({
		status: true,
		message: 'update successful',
		data: {},
	});
});

const handleMarkHelpfulAsGuest = asyncHandler(async (req, res, next) => {
	const { id } = req.params;

	console.log(ip.address());

	// find review and update
	const guest_has_marked = await Review.findOne({
		_id: id,
		marked_helpful_by_guests: {
			$in: [ip.address()],
		},
	});

	let review_update;

	if (guest_has_marked) {
		review_update = await Review.updateOne(
			{ _id: id },
			{
				$inc: { helpful_counts: -1 },
				$pull: { marked_helpful_by_guests: ip.address() },
			}
		);
	} else {
		review_update = await Review.updateOne(
			{ _id: id },
			{
				$inc: { helpful_counts: 1 },
				$push: { marked_helpful_by_guests: ip.address() },
			}
		);
	}

	return res.status(200).json({
		status: true,
		message: 'update successful',
		data: {},
	});
});

module.exports = {
	handleGetAllReviews,
	handleGetSingleReview,
	handleCreateReview,
	handleMarkHelpful,
	handleMarkHelpfulAsGuest,
};
