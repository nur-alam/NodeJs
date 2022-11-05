import CustomErrorHandler from '../services/CustomErrorHandler';
import JwtService from '../services/JwtService';

const auth = async (req, res, next) => {
	let authHeader = req.headers.authorization;
	if (!authHeader) {
		return next(CustomErrorHandler.unAuthorized());
	}
	const token = authHeader.split(' ')[1];
	try {
		const { _id, name, role } = await JwtService.verify(token);
		const user = {
			_id,
			name,
			role,
		};
		req.user = user;
		next();
	} catch (err) {
		next(CustomErrorHandler.unAuthorized());
	}
};

export default auth;
