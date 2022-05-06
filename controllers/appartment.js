const asyncHandler = require('../middlewares/async');
const { Appartment } = require('../models/Appartment');
const { v4: uuidv4 } = require('uuid');
const { cloudinary } = require('../configs/cloudinary');

const handleGetAllAppartments = asyncHandler(async (req, res, next) => {
	const appartments = await Appartment.find();

	return res.status(200).json({
		status: true,
		count: appartments.length,
		data: appartments,
	});
});

const handleCreateAppartment = asyncHandler(async (req, res, next) => {
	const appartment_data = {
		...req.body,
		appartment_id: uuidv4(),
	};

	const new_appartment = await Appartment.create(appartment_data);

	return res.status(201).json({
		status: true,
		message: 'appartment created successfully',
		data: new_appartment,
	});
});

module.exports = {
	handleGetAllAppartments,
	handleCreateAppartment,
};
