const { Schema, model, models } = require('mongoose');
/*
	{
		"review": "this was an awesome review 1",
		"user" : "652ad9ce8faff3b8cf3ff261",
		"tweet": "654e3b144a642dd2573d102f"
	}
*/
const reviewSchema = new Schema({
	review: {
		type: String,
		trim: true
	},
	user: { 
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	tweet: { 
		type: Schema.Types.ObjectId,
		ref: 'Tweet',
		required: true
	},

}, {
	timestamps: true
})

module.exports = models.Review || model('Review', reviewSchema)