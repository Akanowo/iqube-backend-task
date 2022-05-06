const Joi = require('joi');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('./async');

const signUpReqSchema = Joi.object({
	firstname: Joi.string().required().max(200),
	lastname: Joi.string().required().max(200),
	email: Joi.string().email().required(),
	password: Joi.string().required().max(16),
});

const signUpReqValidator = asyncHandler(async (req, res, next) => {
	await signUpReqSchema.validateAsync(req.body);
	next();
});

module.exports = {
	signUpReqValidator,
};
