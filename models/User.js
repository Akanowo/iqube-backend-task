const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const emailRegex =
	/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const userSchema = new Schema({
	user_id: {
		type: String,
		required: [1, 'user id not passed'],
	},
	firstname: {
		type: String,
		required: [1, 'firstname is required'],
		max: 200,
	},
	lastname: {
		type: String,
		required: [1, 'lastname is required'],
		max: 200,
	},
	email: {
		type: String,
		required: [1, 'email is required'],
		match: [emailRegex, 'Email entered is not a valid email'],
		max: 200,
	},
	password: {
		type: String,
		required: [1, 'password is required'],
		max: [16, 'maximum length is 16 characters'],
	},
	created_date: {
		type: Date,
		default: Date.now,
	},
});

const User = model('User', userSchema);

module.exports = { User };
