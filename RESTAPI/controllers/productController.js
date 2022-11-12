import multer from 'multer';
import Joi from 'joi';
import path, { join } from 'path';
import fs from 'fs';
import CustomErrorHandler from '../services/CustomErrorHandler';
import Product from '../models/product';
import productSchema from '../validators/productValidator';

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		fs.mkdir('uploads/', (err) => {
			cb(null, 'uploads');
		});
	},
	filename: (req, file, cb) => {
		const fileExt = path.extname(file.originalname);
		const fileName = file.originalname.replace(fileExt, '').toLowerCase().split(' ').join('-') + '-' + Date.now();
		cb(null, fileName + fileExt);
	},
});

const handleMultipartData = multer({
	storage,
	limits: { fileSize: 1000000 * 5 },
	// fileFilter: (req, file, cb) => {
	// 	if (file.fieldname === 'avatar') {
	// 		if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
	// 			cb(null, true);
	// 		} else {
	// 			cb(new Error('Only .jpg, .png or .jpeg format allowed!'));
	// 		}
	// 	} else if (file.fieldname === 'doc') {
	// 		if (file.mimetype === 'application/pdf') {
	// 			cb(null, true);
	// 		} else {
	// 			cb(new Error('Only .pdf format allowed!'));
	// 		}
	// 	} else {
	// 		cb(new Error('There was an unknown error!'));
	// 	}
	// },
}).single('image');
// .fields([
// 	{ name: 'image', maxCount: 1 },
// 	{ name: 'image1', maxCount: 1 },
// ]); // 5mb

const productController = {
	async all(req, res, next) {
		try {
			const products = await Product.find();
			res.json(products);
		} catch (err) {
			return next(err);
		}
	},
	store(req, res, next) {
		handleMultipartData(req, res, async (err) => {
			if (err) {
				next(err);
			}
			const filePath = req.file.path;

			const { error } = productSchema.validate(req.body);
			if (error) {
				// delete the uploaded file
				fs.unlink(`${appRoot}/${filePath}`, (err) => {
					if (err) {
						return next(CustomErrorHandler.serverError(err.message));
					}
				});
				return next(error);
			}

			const { name, price, size } = req.body;
			let document;
			try {
				document = await Product.create({
					name,
					price,
					size,
					image: filePath,
				});
			} catch (err) {
				return next(err);
			}
			res.status(201).json(document);
		});
	},
	update(req, res, next) {
		handleMultipartData(req, res, async (err) => {
			if (err) {
				return next(CustomErrorHandler.serverError(err.message));
			}
			let filePath;
			if (req.file) {
				filePath = req.file.path;
			}
			// validation
			const { error } = productSchema.validate(req.body);
			if (error) {
				// Delete the uploaded file
				if (req.file) {
					fs.unlink(`${appRoot}/${filePath}`, (err) => {
						if (err) {
							return next(CustomErrorHandler.serverError(err.message));
						}
					});
				}
				return next(error);
			}
			const { name, price, size } = req.body;
			let document;
			try {
				let prevDocument = await Product.findOne({ _id: req.params.id });
				document = await Product.findOneAndUpdate(
					{ _id: req.params.id },
					{
						name,
						price,
						size,
						...(req.file && { image: filePath }),
					}
				);
				if (document) {
					fs.unlink(`${appRoot}/${prevDocument.image}`, () => {});
				}
			} catch (err) {
				return next(err);
			}
			res.status(201).json(document);
		});
	},
};

export default productController;
