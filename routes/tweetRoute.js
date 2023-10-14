const { Router } = require('express')
const tweetController = require('../controllers/tweetController')

const router = Router()

router.route('/')
	.get(tweetController.getTweets)
	.post(tweetController.createTweet)

module.exports = router