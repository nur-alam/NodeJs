import { User } from '../models';
import CustomErrorHandler from '../services/CustomErrorHandler';

const adminAuth = async (req, res, next) => {
	try {
		const user = await User.findOne({ _id: req.user._id });
		if (user.role === 'admin') {
			next();
		} else {
			next(CustomErrorHandler.unAuthorized());
		}
	} catch (err) {
		next(CustomErrorHandler.serverError());
	}
};

export default adminAuth;
