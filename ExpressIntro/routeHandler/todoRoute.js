const express = require('express');
const mongoose = require('mongoose');
const checkLogin = require('../middlewares/checkLogin');
const todoRouter = express.Router();
const todoSchema = require('../schema/todoSchema');
const userSchema = require('../schema/userSchema');
const Todo = new mongoose.model('Todo', todoSchema);
const User = new mongoose.model('User', userSchema);

// GET ALL THE TODOS
todoRouter.get('/', checkLogin, (req, res) => {
	const handleCallBackFn = (err, data) => {
		if (err) {
			res.status(500).json({
				error: 'There was a server side error!',
			});
		} else {
			res.status(200).json({
				result: data,
				message: 'Fetching todos',
			});
		}
	};
	Todo.find()
		.populate('user')
		.select({
			// _id: 0,
			__v: 0,
			date: 0,
		})
		.limit(10)
		.exec((err, data) => handleCallBackFn(err, data));
	// without method chaining
	// await Todo.find({}, (err, data) => handleCallBackFn(err, data));
});

// GET ACTIVE TODO
todoRouter.get('/active', async (req, res) => {
	try {
		const todo = new Todo();
		const data = await todo.findActive();
		res.status(200).json({
			data,
		});
	} catch (err) {
		res.status(500).json({
			message: 'There is server side error!',
		});
	}
});

// GET ACTIVE TODO BY CALLBACK
todoRouter.get('/active-callback', (req, res) => {
	const todo = new Todo();
	todo.findActiveCallback((err, data) => {
		if (err) {
			res.status(500).json({
				message: 'There is server side error!',
			});
		}
		res.status(200).json({
			data,
		});
	});
});

// GET TODOS BY STATIC METHOD
todoRouter.get('/byStatic', async (req, res) => {
	try {
		const data = await Todo.findByJS();
		res.status(200).json({
			data,
		});
	} catch (error) {
		res.status(500).json({
			error,
		});
	}
});

// GET TODOS BY QUERY METHOD
todoRouter.get('/byQuery', async (req, res) => {
	try {
		const data = await Todo.find().byQuery('js');
		res.status(200).json({
			data,
		});
	} catch (error) {
		res.status(500).json({
			error,
		});
	}
});

// GET TODO BY ID
todoRouter.get('/:id', async (req, res) => {
	// ASYNC WAY
	try {
		const data = await Todo.find({ _id: req.params.id });
		res.status(200).json({
			result: data,
			message: 'Success',
		});
	} catch (err) {
		res.status(500).json({
			error: 'There was a server side error!',
		});
	}
	// CALLBACK WAY
	// Todo.find({ _id: req.params.id }, (err, data) => {
	// 	if (err) {
	// 		res.status(500).json({
	// 			error: 'There was a server side error!',
	// 		});
	// 	} else {
	// 		res.status(200).json({
	// 			result: data,
	// 			message: 'Success',
	// 		});
	// 	}
	// });
});

// POST A TODO
todoRouter.post('/', checkLogin, async (req, res) => {
	const newTodo = new Todo({ ...req.body, user: req.userId });
	try {
		await newTodo.save();
		await User.updateOne(
			{
				_id: req.userId,
			},
			{
				$push: {
					todos: [newTodo._id],
				},
			}
		);
		res.status(200).json({
			message: 'Todo was inserted successfully!',
		});
	} catch (error) {
		res.status(500).json({ error: `There was a server side error! ${error}` });
	}
});

// POST MULTIPLE TODO
todoRouter.post('/all', checkLogin, (req, res) => {
	const newBody = req.body.map((element) => {
		return { ...element, user: req.userId };
	});
	Todo.insertMany(newBody, async (err, data) => {
		if (err) {
			res.status(500).json({ error: 'There was a server side error!' });
		} else {
			$todoIds = [...data].map((element) => element._id);
			await User.updateOne(
				{
					_id: req.userId,
				},
				{
					$push: {
						todos: [...$todoIds],
					},
				}
			);
			res.status(200).json({
				data,
				message: 'Todos were inserted successfully!',
			});
		}
	});
});

// UPDATE TODO
todoRouter.put('/:id', (req, res) => {
	// Todo.updateOne(
	Todo.findByIdAndUpdate(
		{ _id: req.params.id },
		{
			$set: req.body,
			// $set: { status: req.body.status },
			// $set: {
			// 	title: req.body.title,
			// 	description: req.body.description,
			// 	status: req.body.status,
			// },
		},
		(err) => {
			if (err) {
				res.status(500).json({ error: 'There was a server side error!' });
			} else {
				res.status(200).json({
					message: 'Todo was updated successfully!',
				});
			}
		}
	);
});

// UPDATE MULTIPLE TODO
todoRouter.patch('/updateAll', (req, res) => {
	Todo.updateMany(
		{ status: 'inactive' },
		{
			status: req.body.status,
		},
		(err) => {
			if (err) {
				res.status(500).json({ error: 'There was a server side error!' });
			} else {
				res.status(200).json({
					message: 'Todos updated successfully!',
				});
			}
		}
	);
});

// DELETE ALL
todoRouter.delete('/deleteAll', (req, res) => {
	Todo.deleteMany({}, (err) => {
		if (err) {
			res.status(500).json({
				error: `There was a server side errorsdfdf! ${err}`,
			});
		} else {
			res.status(200).json({
				message: 'All Todo was deleted successfully!',
			});
		}
	});
});

// DELETE TODO
todoRouter.delete('/:id', (req, res) => {
	Todo.deleteOne({ _id: req.params.id }, (err) => {
		if (err) {
			res.status(500).json({
				error: `There was a server side error! ${err}`,
			});
		} else {
			res.status(200).json({
				message: 'Todo was deleted successfully!',
			});
		}
	});
});

module.exports = todoRouter;
