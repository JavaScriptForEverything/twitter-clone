const { Router } = require('express')
const tweetController = require('../controllers/tweetController')
const authController = require('../controllers/authController')

const router = Router()

router.route('/')
	.get(tweetController.getTweets)
	.post(tweetController.createTweet)

router
	.use(authController.protect)
	.route('/:id')
	.get(tweetController.getTweetById)
	// .patch(tweetController.updateTweetById)
	.delete(tweetController.deleteTweetById)

router
	.use(authController.protect)
	.patch('/:id/like', tweetController.updateTweetLike)
	.post('/:id/retweet', tweetController.retweet)

module.exports = router