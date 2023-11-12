const { Router } = require('express')
const chatController = require('../controllers/chatController')
const authController = require('../controllers/authController')

const router = Router()

// /api/chats
router
	.use(authController.protect)
	.post('/', chatController.createChat)


module.exports = router