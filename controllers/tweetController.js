const Tweet = require('../models/tweetModel')
const { Types } = require('mongoose')


exports.createTweet = async (req, res, next) => {
	const body = { 
		...req.body,
		user: new Types.ObjectId("652580ce2ae5847a00eef5a6"),
	} 

	const tweet = await Tweet.create(body)
	// const populatedUser = await User.populate(tweet, { path: 'user' }) 

	res.status(200).json({
		status: 'success',
		data: tweet
	})
}


exports.getTweets = async (req, res) => {

	const tweets = await Tweet.find().populate('user')

	res.status(200).json({
		status: 'success',
		data: tweets
	})
}
