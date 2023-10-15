const { Schema, models, model } = require('mongoose');

const tweetSchema = new Schema({
	tweet: {
		type: String,
		trim: true,
		required: true,
		maxlength: 500,
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	pinned: {
		type: Boolean,
		default: false
	}

}, { timestamps: true })



const Tweet = models.Tweet || model('Tweet', tweetSchema)
module.exports = Tweet