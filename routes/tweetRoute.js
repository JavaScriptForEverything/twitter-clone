const { Router } = require('express')
const tweetController = require('../controllers/tweetController')
const authController = require('../controllers/authController')

// /api/tweets
const router = Router()

router
	.use(authController.protect)

router.route('/')
	.get(tweetController.getTweets)
	.post(tweetController.createTweet)

router
	.route('/:id')
	.get(tweetController.getTweetById)
	.patch(tweetController.updateTweetById)
	.delete(tweetController.deleteTweetById)

router
	.get('/:id/retweet', tweetController.retweet)
	.get('/:id/like', tweetController.updateTweetLike)

module.exports = router