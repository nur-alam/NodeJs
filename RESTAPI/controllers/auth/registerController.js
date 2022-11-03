import Joi, { ValidationError } from 'joi';
import { User } from '../../models';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import bcrypt from 'bcrypt';
import JwtService from '../../services/JwtService';

const registerController = {
	async register(req, res, next) {
		// validation
		const registerSchema = Joi.object({
			name: Joi.string().min(3).max(30).required(),
			email: Joi.string().email().required(),
			password: Joi.string().pattern(new RegExp(`^[a-zA-Z0-9]{3,30}$$`)).required(),
		});

		const { error } = registerSchema.validate(req.body);

		if (error) {
			return next(error);
		}

		// check if user already exists in the database
		try {
			const exist = await User.exists({ email: req.body.email });
			if (exist) {
				return next(CustomErrorHandler.alreadyExist('This email is already taken.'));
			}
		} catch (err) {
			return next(err);
		}

		const { name, email, password } = req.body;
		const hashedPassword = await bcrypt.hash(password, 10);

		// prepare user model
		const user = new User({
			name,
			email,
			password: hashedPassword,
		});

		let access_token;

		try {
			const insertedUser = await user.save();
			// Token
			access_token = JwtService.sign({ _id: insertedUser._id, name: insertedUser.name, role: insertedUser.role });
		} catch (err) {
			return next(err);
		}

		res.json({ access_token });
	},
};

export default registerController;
