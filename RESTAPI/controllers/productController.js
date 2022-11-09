import multer from 'multer';
import path from 'path';
import fs from 'fs';

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
}).fields([
	{ name: 'image', maxCount: 1 },
	{ name: 'image1', maxCount: 1 },
]); // 5mb

const productController = {
	store(req, res, next) {
		handleMultipartData(req, res, (err) => {
			if (err) {
				next(err);
			} else {
				console.log(req.files);
				res.json({ ...req.body, file: req.files });
			}
		});
	},
};

export default productController;
