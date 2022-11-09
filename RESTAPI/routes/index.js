import express from 'express';
import {
	loginController,
	productController,
	refreshController,
	registerController,
	userController,
} from '../controllers';
import auth from '../middlewares/auth';

const router = express.Router();

router.post('/register', registerController.register);
router.post('/login', loginController.login);
router.get('/me', auth, userController.me);
router.post('/refresh', refreshController.refresh);
router.post('/logout', loginController.logOut);
router.post('/products', productController.store);

export default router;
