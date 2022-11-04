import { User } from '../../models';
import CustomErrorHandler from '../../services/CustomErrorHandler';

const userController = {
	async me(req, res, next) {
		// console.log('from userController ', req.user);
		// if (!req.user) {
		// 	req.user._id = 'asdfasdf asdf';
		// }
		try {
			const user = await User.findOne({ _id: req.user._id }).select('-password -updatedAt -__v');
			if (!user) {
				return next(CustomErrorHandler.notFound());
			}
			res.json(user);
		} catch (err) {
			next(err);
		}
	},
};

export default userController;
