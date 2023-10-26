const Tweet = require('../models/tweetModel')
const User = require('../models/userModel')
const { Types } = require('mongoose')
const { catchAsync, appError } = require('./errorController')


// GET /api/tweets
exports.getTweets = catchAsync(async (req, res, next) => {

	const tweets = await Tweet.find().populate('user retweetData replyTo')
	await User.populate(tweets, 'retweetData.user replyTo.user')


	res.status(200).json({
		status: 'success',
		data: tweets
	})
})

// GET /api/tweets/id
exports.getTweetById = catchAsync(async (req, res, next) => {

	const tweet = await Tweet.findById(req.params.id).populate('user retweetData')
	await User.populate(tweet, 'retweetData.user')

	res.status(200).json({
		status: 'success',
		data: tweet
	})
})

// POST /api/tweets
exports.createTweet = catchAsync( async (req, res, next) => {
	const body = { 
		...req.body,
		user: req.session.user._id
		// user: new Types.ObjectId("652ad9ce8faff3b8cf3ff261"),
	} 

	const tweet = await Tweet.create(body)
	await tweet.populate('user replyTo')

	if(!tweet) return next(appError('Can not create tweet', 204, 'TweetError'))
	
	res.status(201).json({
		status: 'success',
		data: tweet
	})
})


// // PATCH /api/tweets/:tweetId
// exports.updateTweetById = catchAsync( async(req, res, next) => {

// 	const filteredBody = req.body
// 	const tweetId = req.params.id 

// 	const tweet = await Tweet.findByIdAndUpdate(req.id, { $addToSet: { replyTo: tweetId }})
	
// 	if(!tweet) return next(appError('Update Twite is failed', 400))

// 	res.status(201).json({
// 		status: 'success',
// 		data: tweet
// 	})
// })




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
	const updatedUser = await User.findByIdAndUpdate(userId, { [operator]: { likes: tweetId }}, { new: true, }) 	
	const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, { [operator]: { likes: userId }}, { new: true, }) 	
	req.session.user = updatedUser

	res.status(201).json({
		status: 'success',
		data: updatedTweet
	})
})




// POST /api/tweets/:id/retweet
exports.retweet = catchAsync(async (req, res, next) => {
	const tweetId = req.params.id
	const userId = req.session.user._id

	const deletedTweet = await Tweet.findOneAndDelete({ user: userId, retweetData: tweetId })
	let retweet = null
	if( !deletedTweet ) {
		retweet = await Tweet.create({ user: userId, retweetData: tweetId })
		if(!retweet) return next(appError('retweet failed', '404'))
	}

	// Error: => here throw errors
	const operator = deletedTweet ? '$pull' : '$addToSet'
	const updatedUser = await User.findByIdAndUpdate(userId, { [operator]: { retweets: retweet.id }}, { new: true })
	req.session.user = updatedUser

	const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, { [operator]: { retweetUsers: userId }}, { new: true})
	if(!updatedTweet) return next(appError('update retweet failed', '404'))


	res.status(201).json({
		status: 'success',
		data: updatedTweet
	})
})
