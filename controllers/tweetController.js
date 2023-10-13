const Tweet = require('../models/tweetModel')


exports.createTweet = async (req, res, next) => {
	const body = { 
		...req.body,
		user: '23433f23453432234134234'
	} 

	// const tweet = await Tweet.create(body)
	// const populatedUser = await User.populate(tweet, { path: 'user' }) 


	console.log(req.body)

	res.status(200).json({
		status: 'success',
		// data: tweet
		data: req.body
	})
}

