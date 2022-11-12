import Joi from 'joi';

const productSchema = Joi.object({
	name: Joi.string().min(3).max(30).required(),
	price: Joi.number().required(),
	size: Joi.string().required(),
	image: Joi.string(),
});

export default productSchema;
