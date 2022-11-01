const express = require('express');
const userRouter = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userSchema = require('../schema/userSchema');
const User = new mongoose.model('User', userSchema);

// GET ALL USERS
userRouter.get('/all', async (req, res) => {
	try {
		const users = await User.find().populate('todos');
		res.status(200).json({
			users,
		});
	} catch (error) {
		// it's will transfer error to our custom error handler in inde.js file (errorHandler)
		// req.next(error);
		res.status(500).json({
			error: `There was server side error! ${error}`,
		});
	}
});

// LOGIN
userRouter.post('/signin', async (req, res) => {
	try {
		const user = await User.find({ username: req.body.username });
		if (user && user.length > 0) {
			const isValidPassword = await bcrypt.compare(req.body.password, user[0].password);
			if (isValidPassword) {
				const token = jwt.sign(
					{
						username: user[0].username,
						userId: user[0]._id,
					},
					process.env.JWT_SECRET,
					{
						expiresIn: '1h',
					}
				);
				res.status(200).json({
					access_token: token,
					message: 'Login success',
				});
			} else {
				res.status(401).json({
					error: 'Authentication failed!',
				});
			}
		}
	} catch (error) {
		res.status(401).json({
			error: 'Authetication failed!',
		});
	}
});

// SIGNUP
userRouter.post('/signup', async (req, res) => {
	try {
		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		const newUser = new User({
			name: req.body.name,
			username: req.body.username,
			password: hashedPassword,
		});
		await newUser.save();
		res.status(200).json({
			message: 'Signup was successfully!',
		});
	} catch (error) {
		res.status(500).json({
			message: 'Signup failed!',
			error,
		});
	}
});

module.exports = userRouter;
