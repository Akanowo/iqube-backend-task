const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const appartmentSchema = new Schema({
	appartment_id: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: [1, 'appartment name is required'],
		max: 200,
	},
	landlord: {
		type: String,
		required: [1, 'landlord name is required'],
		max: 200,
	},
	location: {
		type: String,
		required: [1, 'appartment location is required'],
		max: 500,
	},
	amenities: [String],
	images: [String],
	created_date: {
		type: Date,
		default: Date.now,
	},
});

const Appartment = model('Appartment', appartmentSchema);

module.exports = { Appartment };
