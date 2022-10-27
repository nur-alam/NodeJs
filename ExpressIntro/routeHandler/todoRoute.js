const express = require('express');
const mongoose = require('mongoose');
const todoRouter = express.Router();
const todoSchema = require('../schema/todoSchema');
const Todo = new mongoose.model('Todo', todoSchema);

// GET ALL THE TODOS
todoRouter.get('/', async (req, res) => {
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
	await Todo.find({ status: 'active' })
		.select({
			_id: 0,
			__v: 0,
			date: 0,
		})
		.limit(10)
		.exec((err, data) => handleCallBackFn(err, data));
	// without method chaining
	// await Todo.find({}, (err, data) => handleCallBackFn(err, data));
});

// POST A TODO
todoRouter.post('/', async (req, res) => {
	const newTodo = new Todo(req.body);
	newTodo = await newTodo.save((err) => {
		if (err) {
			res.status(500).json({ error: 'There was a server side error!' });
		} else {
			res.status(200).json({
				message: 'Todo was inserted successfully!',
			});
		}
	});
});

// POST MULTIPLE TODO
todoRouter.post('/all', async (req, res) => {
	await Todo.insertMany(req.body, (err) => {
		if (err) {
			res.status(500).json({ error: 'There was a server side error!' });
		} else {
			res.status(200).json({
				message: 'Todos were inserted successfully!',
			});
		}
	});
});

// UPDATE TODO
todoRouter.put('/:id', async (req, res) => {
	// await Todo.updateOne(
	await Todo.findByIdAndUpdate(
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
todoRouter.patch('/updateAll', async (req, res) => {
	await Todo.updateMany(
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

// DELETE TODO
todoRouter.delete('/:id', async (req, res) => {
	await Todo.deleteOne({ _id: req.params.id }, (err) => {
		if (err) {
			res.status(500).json({
				error: 'There was a server side error!',
			});
		} else {
			res.status(200).json({
				message: 'Todo was deleted successfully!',
			});
		}
	});
});

module.exports = todoRouter;
