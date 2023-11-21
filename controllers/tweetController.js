const { Types } = require('mongoose')
const Tweet = require('../models/tweetModel')
const User = require('../models/userModel')
const { catchAsync, appError } = require('./errorController')
const { apiFeatures, filterObjectByArray, encodeHTML } = require('../utils')


// GET /api/tweets
exports.getTweets = catchAsync(async (req, res, next) => {
	// console.log(req.query)
	// const tweets = await Tweet.find().populate('user retweetData replyTo')
	// await User.populate(tweets, 'retweetData.user replyTo.user')

	const tweets = await apiFeatures(Tweet, req.query).populate('user retweetData replyTo')
	await User.populate(tweets, 'retweetData.user replyTo.user')

	res.status(200).json({
		status: 'success',
		count: tweets.length,
		data: tweets
	})
})

// POST /api/tweets
exports.createTweet = catchAsync( async (req, res, next) => {
	const allowedFields = ['tweet', 'replyTo']
	const filteredBody = filterObjectByArray(req.body, allowedFields)

	if(req.body.tweet) {
		filteredBody.tweet = encodeHTML(filteredBody.tweet)
	}

	const body = { 
		...filteredBody,
		user: req.session.user._id
	} 

	const tweet = await Tweet.create( body )
	if(!tweet) return next(appError('Can not create tweet', 204, 'TweetError'))
	await User.populate(tweet, 'replyTo.user')
	
	res.status(201).json({
		status: 'success',
		data: tweet
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



// PATCH /api/tweets/:id
exports.updateTweetById = catchAsync( async(req, res, next) => {
	const tweetId = req.params.id
	
	const allowedFields = ['pinned']
	const filteredBody = filterObjectByArray(req.body, allowedFields)

	console.log(filteredBody)

	const tweet = await Tweet.findByIdAndUpdate(tweetId, filteredBody, { new: true })
	if(!tweet) return next(appError('Update Twite is failed', 400))

	res.status(201).json({
		status: 'success',
		data: tweet
	})

})

// DELETE /api/tweets/:tweetId
exports.deleteTweetById = catchAsync( async(req, res, next) => {
	const tweetId = req.params.id 

	const tweet = await Tweet.findByIdAndDelete(tweetId, { new: true })
	if(!tweet) return next(appError('deleting Twite is failed', 400))

	res.status(201).json({
		status: 'success',
		data: tweet
	})
})





// GET /api/tweets/:id/retweet
exports.retweet = catchAsync(async (req, res, next) => {
	const tweetId = req.params.id
	const userId = req.session.user._id

	let retweet = null

	// Step-1: 
	const deletedTweet = await Tweet.findOneAndDelete({ user: userId, retweet: tweetId })

	// Step-2: 
	if(!deletedTweet) {
		retweet = await Tweet.create({ user: userId, retweet: tweetId })
		// await retweet.populate('user retweet')
		if(!retweet) return next(appError('retweet failed', '404'))
	}

	const operator = deletedTweet ? '$pull' : '$addToSet'

	// Step-3: 
	const updatedTweet = await Tweet.findByIdAndUpdate(
		tweetId, 
		{ [operator]: { retweetUsers: userId } }, 
		{ new: true}
	)
	if(!updatedTweet) return next(appError('update retweet in Tweet collection, failed', '404'))

	// Step-4: 
	const updatedUser = await User.findByIdAndUpdate(
			userId, 
			{ [operator]: { retweets: tweetId }},  	// can't be retweet._id : on delete senerio retweet === null
			{ new: true }
		)
	if(!updatedUser) return next(appError('update retweet in User collection, failed', '404'))

	req.session.user = updatedUser

	res.status(200).json({
		status: 'success',
		updatedUser,
		data: updatedTweet 	// updatedTweet, which has updated user details
	})
})



// GET /api/tweets/:tweetId/like
exports.updateTweetLike = catchAsync(async (req, res, next) => {
	const tweetId = req.params.id
	const user = req.session.user
	const userId = user._id

	// const tweet = await Tweet.findById(tweetId)
	// if(!tweet) return next(appError(`No tweet found by tweetId: ${tweetId}`))
	

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


