const Tweet = require('../models/tweetModel')
const User = require('../models/userModel')
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
exports.createTweet = catchAsync( async (req, res, next) => {
	const body = { 
		...req.body,
		// user: req.session.user._id
		user: new Types.ObjectId("652ad9ce8faff3b8cf3ff261"),
	} 

	// const tweet = await Tweet.create(body)
	const tweet = await Tweet.create(body).populate('user')
	if(!tweet) return next(appError('Can not create tweet', 204, 'TweetError'))
	
	res.status(201).json({
		status: 'success',
		data: tweet
	})
})


// PATCH /api/tweets/:tweetId/like
exports.updateTweetLike = catchAsync(async (req, res, next) => {

	const user = req.session.user
	const userId = user._id
	if(!userId) return next(appError('You are not authenticated user', 401))

	const tweetId = req.params.id
	if(!tweetId) return next(appError('tweetId is missing', 401))


	// const id = req.params.tweetId
	// const body = req.body
	// 	body.id = undefined
	// 	body.user = undefined

	// const tweet = Tweet.findByIdAndUpdate(id, body, { new: true, runValidators: true })
	

	// Tweet.findByIdAndUpdate(tweetId, { $addToSet: { likes: tweetId }}) 	// MongoDB: to add into array
	// Tweet.findByIdAndUpdate(tweetId, { $pull: { likes: tweetId }}) 			// MongoDB: to remove from array




	const isLiked = user.likes?.includes(tweetId)
	const operator = isLiked ? '$pull' : '$addToSet'
	const updatedUser = await User.findByIdAndUpdate(userId, { [operator]: { likes: userId }}, { new: true, }) 	
	const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, { [operator]: { likes: tweetId }}, { new: true, }) 	
	req.session.user = updatedUser

	res.status(201).json({
		status: 'success',
		data: updatedTweet
	})
})