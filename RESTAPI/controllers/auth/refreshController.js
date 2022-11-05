import Joi from 'joi';
import { REFRESH_TOKEN } from '../../config';
import { RefreshToken, User } from '../../models';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import JwtService from '../../services/JwtService';

const refreshController = {
	async refresh(req, res, next) {
		//validation
		const refreshSchema = Joi.object({
			refresh_token: Joi.string().required(),
		});

		const { error } = refreshSchema.validate(req.body);
		if (error) {
			return next(error);
		}
		let refreshToken;
		try {
			// verify refresh token
			refreshToken = await RefreshToken.findOne({ token: req.body.refresh_token });
			if (!refreshToken) {
				return next(CustomErrorHandler.unAuthorized('Invalid refresh token'));
			}
			let userId;
			try {
				const { _id } = await JwtService.verify(refreshToken.token, REFRESH_TOKEN);
				userId = _id;
			} catch (err) {
				return next(CustomErrorHandler.unAuthorized('Invalid refresh token'));
			}
			const user = await User.findOne({ _id: userId });
			if (!user) {
				return next(CustomErrorHandler.unAuthorized('No user found!'));
			}
			//generate token & refresh token
			const newAccessToken = JwtService.sign({ _id: user._id, name: user.name, role: user.role });
			const newRefreshToken = JwtService.sign(
				{ _id: user._id, name: user.name, role: user.role },
				'300s',
				REFRESH_TOKEN
			);
			res.json({ newAccessToken, newRefreshToken });
		} catch (err) {
			return next(err);
		}
	},
};

export default refreshController;
