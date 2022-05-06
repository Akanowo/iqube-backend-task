const jwt = require('jsonwebtoken');

/**
 *
 * @param {{ user_id: string }} payload
 * @returns {string} token
 */
const generateAccess = (payload) => {
	const token = jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: '2h',
	});
	return token;
};

module.exports = { generateAccess };
