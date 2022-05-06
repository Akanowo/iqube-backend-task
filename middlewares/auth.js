const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('./async');
const { User } = require('../models/User');

const authenticate = asyncHandler(async (req, res, next) => {
	const { authorization } = req.headers;

	if (!authorization)
		return next(new ErrorResponse('authentication token required', 401));

	const token = authorization.split(' ')[1];

	if (!token) return next(new ErrorResponse('missing token', 401));
	// verify token
	const payload = jwt.verify(token, process.env.JWT_SECRET);

	const { user_id } = payload;

	// find user
	const user = await User.findOne({ user_id: user_id });

	if (!user) return next(new ErrorResponse('unauthorized', 401));

	req.user = user;
	next();
});

module.exports = authenticate;
