const mongoose = require('mongoose');

const connectDB = () => {
	mongoose
		.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		.then((db) => {
			console.log('DB connection established');
		})
		.catch((err) => {
			console.log('error establishing DB connection: ', err);
		});
};

module.exports = connectDB;
