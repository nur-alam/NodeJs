const express = require('express');
const mongoose = require('mongoose');
const todoRouter = require('./routeHandler/todoRoute');

// express app initialization
const app = express();
app.use(express.json());

// database connection with mongoose
mongoose
	.connect('mongodb://localhost:27017/todos', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log('connection successful'))
	.catch((err) => console.log(err));

// application routes
app.use('/todo', todoRouter);

app.get('/', (req, res) => {
	console.log('root route');
	res.send();
});

// default error handler
function errorHandler(err, req, res, next) {
	if (res.headersSent) {
		return next(err);
	}
	res.status(500).json({ error: err });
}

app.listen(3000, () => {
	console.log('app listening at port 3000');
});
