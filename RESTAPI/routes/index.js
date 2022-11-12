import express from 'express';
import {
	loginController,
	productController,
	refreshController,
	registerController,
	userController,
} from '../controllers';
import adminAuth from '../middlewares/adminAuth';
import auth from '../middlewares/auth';

const router = express.Router();

router.post('/register', registerController.register);
router.post('/login', loginController.login);
router.get('/me', auth, userController.me);
router.post('/refresh', refreshController.refresh);
router.post('/logout', loginController.logOut);
router.get('/products/all', auth, productController.all);
router.post('/products', [auth, adminAuth], productController.store);
router.put('/product/:id', [auth, adminAuth], productController.update);

export default router;
