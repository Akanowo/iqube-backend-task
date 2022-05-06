const mongoose = require('mongoose');

const { Schema, Types, model } = mongoose;

const reviewSchema = new Schema({
	review_id: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		enum: ['appartment', 'landlord', 'amenities'],
		required: [1, 'review type is required'],
	},
	review: {
		type: String,
		required: [1, 'review comment is required'],
		max: [500, 'max characters for review exceeded'],
	},
	images: [String],
	videos: [String],
	posted_by: {
		type: Types.ObjectId,
		ref: 'User',
		required: true,
	},
	posted_date: {
		type: Date,
		default: Date.now,
	},
	helpful_counts: {
		type: Number,
		default: 0,
	},
	marked_helpful_by: {
		type: [Types.ObjectId],
		ref: 'User',
	},
	marked_helpful_by_guests: [String],
	appartment: {
		type: Types.ObjectId,
		ref: 'Appartment',
		required: [1, 'Appartment id is required'],
	},
});

const Review = model('Review', reviewSchema);

module.exports = { Review };
