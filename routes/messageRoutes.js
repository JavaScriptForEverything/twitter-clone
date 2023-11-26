const { Router } = require('express')
const messageController = require('../controllers/messageController')
const authController = require('../controllers/authController')

// /api/messages
// /api/chat/chatId/messages
const router = Router({ mergeParams: true })

router
	.use(authController.protect)
	.get('/', messageController.getAllMessages)
	.post('/', messageController.createMessage)

router
	.get('/:userId', messageController.getAllMessagesOfSingleUser)

module.exports = router