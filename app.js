const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './configs/.env' });

const dbConnect = require('./configs/dbConfig');
const errorHandler = require('./middlewares/errorHandler');
const apiRouter = require('./routes/index');

const app = express();

const PORT = process.env.PORT || 3000;

// app configs
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());

dbConnect();

app.use('/api/v1', apiRouter);

app.get('**', (_, res) => {
	return res.status(404).json({
		status: true,
		message: 'NOT FOUND',
	});
});

app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`listening on port ${PORT}`);
});
