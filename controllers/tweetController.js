const Tweet = require('../models/tweetModel')
const { Types } = require('mongoose')
const { catchAsync, appError } = require('./errorController')


// GET /api/tweets
exports.getTweets = catchAsync(async (req, res, next) => {

	const tweets = await Tweet.find().populate('user')

	res.status(200).json({
		status: 'success',
		data: tweets
	})
})

// POST /api/tweets
exports.createTweet = async (req, res, next) => {
	const body = { 
		...req.body,
		// user: req.session.user._id
		user: new Types.ObjectId("652ad9ce8faff3b8cf3ff261"),
	} 

	const tweet = await Tweet.create(body)
	if(!tweet) return next(appError('Can not create tweet', 204, 'TweetError'))
	
	// const populatedUser = await User.populate(tweet, { path: 'user' }) 

	res.status(200).json({
		status: 'success',
		data: tweet
	})
}

