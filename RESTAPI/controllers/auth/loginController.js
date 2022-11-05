import Joi from 'joi';
import { RefreshToken, User } from '../../models';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import bcrypt from 'bcrypt';
import JwtService from '../../services/JwtService';
import { REFRESH_TOKEN } from '../../config';

const loginController = {
	async login(req, res, next) {
		//validation
		const loginSchema = Joi.object({
			email: Joi.string().email().required(),
			password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
		});
		const { error } = loginSchema.validate(req.body);
		if (error) {
			next(error);
		}
		try {
			const user = await User.findOne({ email: req.body.email });
			if (!user) {
				return next(CustomErrorHandler.wrongCredentials());
			}
			// compare the password
			const passwordMatch = await bcrypt.compare(req.body.password, user.password);
			if (!passwordMatch) {
				return next(CustomErrorHandler.wrongCredentials());
			}
			//Token
			const access_token = JwtService.sign({ _id: user._id, name: user.name, role: user.role });
			const refresh_token = JwtService.sign(
				{ _id: user._id, name: user.name, role: user.role },
				'1y',
				REFRESH_TOKEN
			);
			//database whitelist
			await RefreshToken.create({ token: refresh_token });
			res.json({ access_token, refresh_token });
		} catch (err) {
			next(err);
		}
	},
};

export default loginController;
