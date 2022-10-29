const mongoose = require('mongoose');

const todoSchema = mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	description: String,
	status: {
		type: String,
		enum: ['active', 'inactive'],
	},
	date: {
		type: Date,
		default: Date.now,
	},
});

// instance methods
todoSchema.methods = {
	findActive: function () {
		return mongoose.model('Todo').find({ status: 'active' });
	},
	findActiveCallback: function (cb) {
		return mongoose.model('Todo').find({ status: 'active' }, cb);
	},
};

// static methods
todoSchema.statics = {
	findByJS: function () {
		return this.find({ title: /js/i });
	},
};

// query handlers
todoSchema.query = {
	byQuery: function (language) {
		return this.find({ title: new RegExp(language, 'i') });
	},
};

module.exports = todoSchema;
