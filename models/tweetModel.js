const { Schema, models, model } = require('mongoose');
const User = require('./userModel');

const tweetSchema = new Schema({
	tweet: {
		type: String,
		trim: true,
		// required: true,
		maxlength: 500,
	},
	user: { 														// <= postedBy
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	replyTo: { 										 			// tweet._id
		type: Schema.Types.ObjectId,
		ref: 'Tweet',
	},
	retweet: { 										 			// tweet._id
		type: Schema.Types.ObjectId,
		ref: 'Tweet',
	},
	retweetUsers: [{ 										// user._id
		type: Schema.Types.ObjectId,
		ref: 'User',
	}],
	pinned: {
		type: Boolean,
		default: false
	},
	likes: [{ 													// all the users likes the tweet: by clicking the heart of the tweet 
		type: Schema.Types.ObjectId,
		ref: 'User',
	}],



}, { timestamps: true })


tweetSchema.post('save', async function (doc) {
	await this.populate('user replyTo')

	// --- Why not it work here, but works on POST handler
	// await User.populate(doc, 'replayTo.user')
})

const Tweet = models.Tweet || model('Tweet', tweetSchema)
module.exports = Tweet