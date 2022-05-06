const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const asyncHandler = require('../middlewares/async');
const { User } = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { generateAccess } = require('../utils/generateAccessToken');

const handleLogin = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	// find user
	const user = await User.findOne({ email: email });

	if (!user) {
		return next(new ErrorResponse('invalid email or password', 401));
	}

	// compare passwords
	if (!(await bcrypt.compare(password, user.password))) {
		return next(new ErrorResponse('invalid email or password', 401));
	}

	const access_token = generateAccess({ user_id: user.user_id });

	return res.status(200).json({
		status: true,
		message: 'login successful',
		data: {
			access_token,
		},
	});
});

const handleSignup = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	// verify user with email doesn't exist
	const user_exists = await User.findOne({ email });

	if (user_exists) {
		return next(new ErrorResponse('user with email already exists', 400));
	}

	// hash user password
	const hashedPassword = await bcrypt.hash(password, 10);

	const new_user_data = {
		...req.body,
		user_id: uuidv4(),
	};

	new_user_data.password = hashedPassword;

	console.log('new user object: ', new_user_data);

	// create new user
	const new_user = await User.create(new_user_data);

	const response = { ...new_user._doc };

	delete response.password;
	delete response.__v;

	return res.status(200).json({
		status: true,
		message: 'new user created successfully',
		data: response,
	});
});

module.exports = {
	handleLogin,
	handleSignup,
};
