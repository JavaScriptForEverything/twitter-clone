const { Router } = require('express')
const tweetController = require('../controllers/tweetController')
const authController = require('../controllers/authController')

const router = Router()

router.route('/')
	.get(tweetController.getTweets)
	.post(tweetController.createTweet)

router.route('/:id/like')
	.patch(
		authController.protect,
		tweetController.updateTweetLike
	)

module.exports = router