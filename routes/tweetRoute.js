const { Router } = require('express')
const tweetController = require('../controllers/tweetController')

const router = Router()

router.post('/', tweetController.createTweet)

module.exports = router