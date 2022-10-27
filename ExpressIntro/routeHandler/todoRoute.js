const express = require('express');
const mongoose = require('mongoose');
const todoRouter = express.Router();
const todoSchema = require('../schema/todoSchema');
const Todo = new mongoose.model('Todo', todoSchema);

// GET ALL THE TODOS
todoRouter.get('/', async (req, res) => {
	await Todo.find().exec((err, data) => {
		if (err) {
			res.status(500).json({
				error: 'There is server side error',
			});
		} else {
			res.status(200).json({
				result: data,
				message: 'Success',
			});
		}
	});
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

module.exports = todoRouter;
