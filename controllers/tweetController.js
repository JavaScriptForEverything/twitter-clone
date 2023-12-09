const { Types } = require('mongoose')
const Tweet = require('../models/tweetModel')
const User = require('../models/userModel')
const Notification = require('../models/notificationModel')
const { catchAsync, appError } = require('./errorController')
const { apiFeatures, filterObjectByArray, encodeHTML } = require('../utils')



// GET /api/tweets
exports.getTweets = catchAsync(async (req, res, next) => {
	// console.log(req.query)
	// const tweets = await Tweet.find().populate('user retweetData replyTo')
	// await User.populate(tweets, 'retweetData.user replyTo.user')
	const filter = {}
	if(req.query.mine) filter.user = req.query.mine

	const tweets = await apiFeatures(Tweet, req.query, filter).populate('user retweet replyTo')
	// await User.populate(tweets, 'retweetData.user replyTo.user')
	await User.populate(tweets, 'retweet.user replyTo.user')

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

	const userId = req.session.user._id

	if(req.body.tweet) {
		filteredBody.tweet = encodeHTML(filteredBody.tweet)
	}

	const body = { 
		...filteredBody,
		user: userId
	} 

	const tweet = await Tweet.create( body )
	if(!tweet) return next(appError('Can not create tweet', 204, 'TweetError'))
	await User.populate(tweet, 'replyTo.user')
	
	if(req.body.replyTo) {
		await Notification.insertNotification({
			entityId: tweet._id, 						// on which notification user liked ?
			userFrom: userId, 											// Who liked it ?
			userTo: tweet.user._id, 					// which user create this tweet ?
			type: 'replyTo', 												// ['like', 'retweet', 'replyTo', 'follow']
			kind: 'tweet', 													// ['tweet', 'message' ]
		})
	}

	res.status(201).json({
		status: 'success',
		data: tweet
	})
})

// GET /api/tweets/:id
exports.getTweetById = catchAsync(async (req, res, next) => {
	/* 	Step-1: We need tweet it self by tweet id
	 		Step-2: We need all the replies from replyTo field
	 		Step-3: We also need all retweets from tweet.user.retweets + with there user details
	*/


	const tweet = await Tweet.findById(req.params.id).populate('user retweet replyTo')
	if( !tweet ) return next(appError('no tweet found by id'))

	// // Method-1: mixed up multiple query, but mongoose run one by one untill it found true one
	// const unknown = await User.populate(tweet, 'retweet.user replyTo.user user.retweets')
	// await User.populate(unknown, 'user.retweets.user')

	// Method-2: Populate user from tweetDoc => populate tweet from nested tweet => populated user from retweet
	await User.populate(tweet, 'retweet.user replyTo.user') 
	const retweets = await Tweet.populate(tweet, 'user.retweets')
	await User.populate(retweets, 'user.retweets.user')


	res.status(200).json({
		status: 'success',
		data: tweet
	})
})



// PATCH /api/tweets/:id
exports.updateTweetById = catchAsync( async(req, res, next) => {
	const tweetId = req.params.id
	const userId = req.session.user._id
	
	const allowedFields = ['pinned']
	const filteredBody = filterObjectByArray(req.body, allowedFields)

	// Step-1: Reset other tweets pinned
	if(req.body.pinned) {
		await Tweet.updateMany({ user: userId, pinned: false })
	}

	// Step-2: Now update to only current tweet.pinned
	const tweet = await Tweet.findByIdAndUpdate(tweetId, filteredBody, { new: true })
	await User.populate(tweet, 'user')
	if(!tweet) return next(appError('Update Twite is failed', 400))

	// console.log(filteredBody)

	res.status(201).json({
		status: 'success',
		data: tweet
	})

})

// DELETE /api/tweets/:tweetId
exports.deleteTweetById = catchAsync( async(req, res, next) => {
	const tweetId = req.params.id 
	const userId = req.session.user._id

	// Step-1: Delete the tweet of self user
	const tweet = await Tweet.deleteOne({
		_id: tweetId,
		user: userId,
	})
	if(!tweet) return next(appError('deleting Twite is failed', 400))

	// Step-2: Remove tweet._id form users.likes or users.retweets array 
	await User.findByIdAndUpdate( userId, { 
		$pull: { 
			likes: tweetId, 
			retweets: tweetId 
		} 
	})


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
		await retweet.populate('retweet')
		await User.populate(retweet, 'retweet.user')
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

	if(!deletedTweet) {
		await Notification.insertNotification({
			entityId: updatedTweet._id, 						// on which notification user liked ?
			userFrom: userId, 											// Who liked it ?
			userTo: updatedTweet.user._id, 					// which user create this tweet ?
			type: 'retweet', 												// ['like', 'retweet', 'replyTo', 'follow']
			kind: 'tweet', 													// ['tweet', 'message' ]
		})
	}

	res.status(200).json({
		status: 'success',
		updatedUser,
		data: { 
			retweet,
			updatedTweet 	
		}
	})
})



// GET /api/tweets/:tweetId/like
exports.updateTweetLike = catchAsync(async (req, res, next) => {
	const tweetId = req.params.id
	const user = req.session.user
	const userId = user._id


	const isLiked = user.likes?.includes(tweetId)

	const operator = isLiked ? '$pull' : '$addToSet'
	const updatedUser = await User.findByIdAndUpdate(userId, { [operator]: { likes: tweetId }}, { new: true, }) 	
	const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, { [operator]: { likes: userId }}, { new: true, }) 	
	req.session.user = updatedUser

	if( !isLiked ) { 														// Show notification only when liked, skip unlike senerio
		await Notification.insertNotification({
			entityId: updatedTweet._id, 						// on which notification user liked ?
			userFrom: userId, 											// Who liked it ?
			userTo: updatedTweet.user._id, 					// which user create this tweet ?
			type: 'like', 													// ['like', 'retweet', 'replyTo', 'follow']
			kind: 'tweet', 													// ['tweet', 'message' ]
		})
	}

	res.status(201).json({
		status: 'success',
		data: updatedTweet
	})
})


// // GET /api/tweets/user/:username
// exports.getAllProfileUserTweets = async (req, res, next) => {
// 	const username = req.params.username

// 	const tweets = await apiFeatures(Tweet, req.query)

// 	res.status(200).json({
// 		status: 'success',
// 		data: tweets
// 	})
// }

