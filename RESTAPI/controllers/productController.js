import multer from 'multer';
import Joi from 'joi';
import path, { join } from 'path';
import fs from 'fs';
import CustomErrorHandler from '../services/CustomErrorHandler';
import Product from '../models/product';
import productSchema from '../validators/productValidator';

const fsPromise = fs.promises;

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
	async single(req, res, next) {
		let product;
		try {
			product = await Product.findOne({ _id: req.params.id }).select('');
		} catch (error) {
			next(CustomErrorHandler.serverError());
		}
		return res.json(product);
	},
	async all(req, res, next) {
		let products;
		try {
			products = await Product.find().select('-updatedAt -__v').sort({ _id: -1 });
		} catch (err) {
			return next(err);
		}
		res.status(201).json(products);
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
				const prevDocument = await Product.findOne({ _id: req.params.id });
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
	async destroy(req, res, next) {
		const document = await Product.findOneAndRemove({ _id: req.params.id });
		if (!document) {
			return next(new Error('Nothing to delete'));
		}
		// image delete
		const imagePath = document._doc.image;
		fs.unlink(`${appRoot}/${imagePath}`, (err) => {
			if (err) {
				return next(CustomErrorHandler.serverError(err));
			}
			res.json(document);
		});
	},
};

export default productController;
