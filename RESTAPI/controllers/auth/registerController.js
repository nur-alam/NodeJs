import Joi, { ValidationError } from 'joi';
import { User, RefreshToken } from '../../models';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import bcrypt from 'bcrypt';
import JwtService from '../../services/JwtService';
import { REFRESH_TOKEN } from '../../config';

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
		let refresh_token;
		try {
			const newUser = await user.save();
			// Token
			access_token = JwtService.sign({ _id: newUser._id, name: newUser.name, role: newUser.role });
			refresh_token = JwtService.sign(
				{ _id: newUser._id, name: newUser.name, role: newUser.role },
				'1y',
				REFRESH_TOKEN
			);
			//database whitelist
			await refreshToken.create({ token: refresh_token });
		} catch (err) {
			return next(err);
		}

		res.json({ access_token, refresh_token });
	},
};

export default registerController;
