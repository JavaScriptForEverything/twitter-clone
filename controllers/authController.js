const Tweet = require('../models/tweetModel')
const { timeSince } = require('../utils')

exports.protect = (req, res, next) => {
	if(req.session.user ) return next()

	res.redirect('/login')
}



exports.userProfilePage = (req, res, next) => {

	// return next(new Error('my error'))

	const payload = {
		pageTitle: 'Profile'
	}

	res.render('user/profile', payload)
}

exports.tweetDetailsPage = async(req, res, next) => {
	try {
		const tweetId = req.params.id
		const isValidTweetId = true
		if(!isValidTweetId) console.log('redirect to 404 page: tweetId is not valied')

		const tweet = await Tweet.findById(tweetId)
		if(!tweet) throw new Error('Tweet not found')

		const payload = {
			pageTitle: 'Tweet Details',
			timeSince,
			user: req.session.user,
			tweetId,
			tweet
		}

		res.render('tweet/tweetDetails', payload)

	} catch (error) {
		const payload = {
			pageTitle: 'Error',
			errorMessage: error.message
		}
		
		res.render('error', payload)
	}
}