import CustomErrorHandler from '../services/CustomErrorHandler';
import JwtService from '../services/JwtService';

const auth = async (req, res, next) => {
	let authHeader = req.headers.authorization;
	if (!authHeader) {
		return next(CustomErrorHandler.unAuthorized());
	}
	const token = authHeader.split(' ')[1];
	const { _id, name, role } = await JwtService.verify(token);
	const user = {
		_id,
		name,
		role,
	};
	req.user = user;
	console.log('from auth ', req.user);
	next();
};

export default auth;
